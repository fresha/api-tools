import assert from 'assert';

import { addFunction, addImportDeclaration } from '@fresha/code-morph-ts';
import {
  camelCase,
  getOperationIdOrThrow,
  RelationshipCardinality,
} from '@fresha/openapi-codegen-utils';
import { CodeBlockWriter, FunctionDeclaration, SyntaxKind } from 'ts-morph';

import { objectPropertyName, propertyName, schemaToType } from './utils';

import type { DocumentType } from './DocumentType';
import type { ActionContext } from '../context';
import type { OperationModel } from '@fresha/openapi-model/build/3.0.3';

const requestFormatterName = (operation: OperationModel) => {
  const operationId = getOperationIdOrThrow(operation);
  return camelCase(`format_${operationId}_request`);
};

export class RequestFormatterFunc {
  readonly context: ActionContext;
  readonly name: string;
  readonly resultType: DocumentType;

  constructor(resultType: DocumentType) {
    this.context = resultType.context;
    this.name = requestFormatterName(this.context.operation);
    this.resultType = resultType;
  }

  collectData(): void {
    this.context.logger.info(`Collecting data for request formatter ${this.name}`);
    // const primaryResource = this.resultType.primaryResourceType();
    // for (const prop of primaryResource.schema
    //   .getPropertyDeepOrThrow('attributes')
    //   .getProperties()) {
    //   global.console.log(prop.name, prop.schema.type);
    // }
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for request formatter: ${this.name}`);

    if (this.resultType) {
      addImportDeclaration(this.context.formattersFile, './types', `t:${this.resultType.name}`);
    }

    const primaryResource = this.resultType.primaryResourceType();
    const funcHasArgs =
      primaryResource.attributesSchema?.hasPropertiesDeep() || !!primaryResource.relationships.size;

    const func = addFunction(
      this.context.formattersFile,
      this.name,
      funcHasArgs
        ? {
            params: '{}',
          }
        : {},
      this.resultType.name,
      true,
    );

    this.generateParameters(func);

    func.addStatements((writer: CodeBlockWriter) => {
      writer.write('return ');
      writer.inlineBlock(() => {
        writer.write("jsonapi: { version: '1.0' },");

        writer.writeLine('data: ');
        writer.inlineBlock(() => {
          writer.writeLine(`type: '${String(primaryResource.resourceType)}',`);
          // writer.writeLine(`id: '${String(primaryResource.resourceType)}',`);
          this.generateAttributes(writer);
          this.generateRelationships(writer);
        });

        if (this.resultType.includedResourceTypeCount) {
          writer.write('included: ');
          writer.inlineBlock(() => {});
        }
      });
    });
  }

  protected generateParameters(func: FunctionDeclaration): void {
    const primaryResource = this.resultType.primaryResourceType();

    const paramsType = func
      .getParameterOrThrow('params')
      .getTypeNodeOrThrow()
      .asKindOrThrow(SyntaxKind.TypeLiteral);

    if (primaryResource.attributesSchema) {
      for (const { name, schema } of primaryResource.attributesSchema.getPropertiesDeep()) {
        paramsType.addProperty({
          name: propertyName(name, this.context.clientNaming),
          type: schemaToType(schema, this.context.clientNaming),
          hasQuestionToken: !primaryResource.attributesSchema.isPropertyRequired(name),
        });
      }
    }

    if (primaryResource.relationships.size) {
      for (const [relName, relDef] of primaryResource.relationships) {
        let paramType: string;
        switch (relDef.cardinality) {
          case RelationshipCardinality.Many:
            paramType = 'string[]';
            break;
          case RelationshipCardinality.One:
            paramType = 'string';
            break;
          case RelationshipCardinality.ZeroOrOne:
            paramType = 'string | null';
            break;
          default:
            assert.fail(`Unsupported cardinality ${String(relDef.cardinality)}`);
        }

        paramsType.addProperty({
          name: propertyName(relName, this.context.clientNaming),
          type: paramType,
          hasQuestionToken: !relDef.required,
        });
      }
    }
  }

  protected generateAttributes(writer: CodeBlockWriter): void {
    const primaryResource = this.resultType.primaryResourceType();

    writer.writeLine('attributes: ');
    writer.inlineBlock(() => {
      // TODO need SchemaModel#propertyDeepCount property, returning a number of
      // properties in this schema and its allOf subschemas
      if (primaryResource.attributesSchema) {
        for (const { name } of primaryResource.attributesSchema.getPropertiesDeep()) {
          const propName = propertyName(name, this.context.clientNaming);
          writer.writeLine(`${propName}: ${objectPropertyName('params', propName)},`);
        }
      }
    });
    writer.write(',');
  }

  protected generateRelationships(writer: CodeBlockWriter): void {
    const primaryResource = this.resultType.primaryResourceType();

    writer.writeLine('relationships: ');
    writer.inlineBlock(() => {
      if (primaryResource.relationships.size) {
        for (const [relName, relDef] of primaryResource.relationships) {
          const paramName = propertyName(relName, this.context.clientNaming);
          const objPropName = objectPropertyName('params', paramName);

          let str = '';

          switch (relDef.cardinality) {
            case RelationshipCardinality.ZeroOrOne:
              str = `{ data: ${objPropName} == null ? { type: '${relDef.resourceType}', id: ${objPropName} } : null }`;
              break;
            case RelationshipCardinality.One:
              str = `{ data: { type: '${relDef.resourceType}', id: ${objPropName} } }`;
              break;
            case RelationshipCardinality.Many:
              str = `{ data: ${objPropName}.map(id => ({ type: '${relDef.resourceType}', id })) }`;
              break;
            default:
              assert.fail(`Unsupported relationship cardinality ${String(relDef.cardinality)}`);
          }

          writer.writeLine(
            relDef.required
              ? `${paramName}: ${str},`
              : `${paramName}: ${objPropName} !== undefined ? ${str} : undefined,`,
          );
        }
      }
    });
  }
}

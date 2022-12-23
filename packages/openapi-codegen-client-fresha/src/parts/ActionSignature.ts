import assert from 'assert';

import { titleCase } from '@fresha/api-tools-core';
import {
  addImportDeclaration,
  addTypeAlias,
  addTypeLiteralCall,
  addTypeLiteralProperty,
} from '@fresha/code-morph-ts';
import { getOperationRequestBodySchema } from '@fresha/openapi-codegen-utils';
import { CodeBlockWriter, SyntaxKind, TypeLiteralNode } from 'ts-morph';

import type { Context } from '../context';
import type { OperationTemplate } from './operations';
import type { OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

// returns true if action needs args argument (everything except resource ID)
const actionNeedsArgs = (operation: OperationModel): boolean => {
  for (const param of operation.parameters) {
    if (param.name !== 'id' || param.in !== 'path') {
      return true;
    }
  }
  if (operation.requestBody?.content) {
    for (const requestMimeType of operation.requestBody.content.values()) {
      if (requestMimeType.schema != null) {
        return true;
      }
    }
  }
  return false;
};

export class ActionSignature {
  readonly context: Context;
  readonly operation: OperationModel;
  readonly template: OperationTemplate;
  readonly name: string;
  readonly requestTypeName: string;
  readonly responseTypeName: string;

  constructor(
    context: Context,
    name: string,
    operation: OperationModel,
    template: OperationTemplate,
  ) {
    this.context = context;
    this.operation = operation;
    this.template = template;
    this.name = name;
    this.requestTypeName = titleCase(`${this.name}Request`);
    this.responseTypeName = titleCase(`${this.name}Response`);
  }

  generateCode(type: TypeLiteralNode): void {
    this.context.logger.info(`Generating type for action ${this.name}`);

    const sourceFile = type.getSourceFile();

    const actionType = addTypeLiteralProperty(type, this.name, '{}').asKindOrThrow(
      SyntaxKind.TypeLiteral,
    );

    const actionFuncTypeObj = addTypeLiteralCall(actionType, {}, 'Promise<Response>');

    if (this.operation.getParameter('id', 'path')) {
      if (!sourceFile.getTypeAlias('ResourceId')) {
        addTypeAlias(sourceFile, 'ResourceId', 'string | number');
      }
      actionFuncTypeObj.addParameter({
        name: 'id',
        type: 'ResourceId',
      });
    }

    if (actionNeedsArgs(this.operation)) {
      const argsParamType = actionFuncTypeObj
        .addParameter({
          name: 'args',
          type: '{}',
        })
        .getNodeProperty('type')
        ?.asKindOrThrow(SyntaxKind.TypeLiteral);
      assert(argsParamType);

      for (const param of this.operation.parameters) {
        if (param.name !== 'id' || param.in !== 'path') {
          const p = addTypeLiteralProperty(argsParamType, param.name, (writer: CodeBlockWriter) => {
            switch (param.schema?.type) {
              case undefined:
                writer.write('unknown');
                break;
              case null:
              case 'string':
                writer.write(param.schema?.nullable ? 'string | null' : 'string');
                break;
              case 'number':
              case 'integer':
                writer.write(param.schema?.nullable ? 'number | null' : 'number');
                break;
              case 'boolean':
                writer.write(param.schema?.nullable ? 'boolean | null' : 'boolean');
                break;
              default:
                assert.fail(
                  `Unexpected schema type ${String(param.schema?.type)} in parameter ${
                    param.name
                  }:${param.in}`,
                );
            }
          });
          p.getParentIfKindOrThrow(SyntaxKind.PropertySignature).setHasQuestionToken(
            !param.required,
          );
        }
      }

      // add request body
      const requestBodySchema = getOperationRequestBodySchema(
        this.operation,
        this.context.useJsonApi,
      );
      if (requestBodySchema) {
        this.addRequestBodyParams(argsParamType, requestBodySchema);
      }
    }

    addTypeLiteralProperty(actionType, 'apiName', `'${this.name}'`);

    const actionCache = this.operation.getExtension('cache');
    addTypeLiteralProperty(
      actionType,
      'cache',
      actionCache != null ? 'Map<string, unknown>' : 'null',
    );
  }

  protected addRequestBodyParams(argsParamType: TypeLiteralNode, schema: SchemaModel): void {
    assert(schema.type === 'object');

    for (const prop of schema.getProperties()) {
      switch (prop.schema.type) {
        case null:
          addImportDeclaration(argsParamType.getSourceFile(), '@fresha/noname-core', 't:JSONValue');
          addTypeLiteralProperty(argsParamType, prop.name, 'JSONValue');
          break;
        case 'boolean':
          addTypeLiteralProperty(
            argsParamType,
            prop.name,
            prop.schema.nullable ? 'boolean | null' : 'boolean',
          );
          break;
        case 'number':
        case 'integer':
          addTypeLiteralProperty(
            argsParamType,
            prop.name,
            prop.schema.nullable ? 'number | null' : 'number',
          );
          break;
        case 'string': {
          let propType = 'string';
          if (prop.schema.enum) {
            if (prop.schema.enum.length === 1) {
              propType = `'${String(prop.schema.enum[0])}'`;
            } else if (prop.schema.enum.length > 1) {
              propType = prop.schema.enum?.map(elem => `'${String(elem)}'`).join(' | ');
            }
            if (prop.schema.nullable) {
              propType = `${propType} | null`;
            }
          }
          addTypeLiteralProperty(argsParamType, prop.name, propType);
          break;
        }
        case 'object': {
          if (prop.schema.properties.size) {
            const propType = addTypeLiteralProperty(argsParamType, prop.name, '{}');
            this.addRequestBodyParams(propType.asKindOrThrow(SyntaxKind.TypeLiteral), prop.schema);
          } else {
            addImportDeclaration(
              argsParamType.getSourceFile(),
              '@fresha/noname-core',
              't:JSONObject',
            );
            addTypeLiteralProperty(argsParamType, prop.name, 'JSONObject');
          }
          break;
        }
        case 'array':
          addImportDeclaration(argsParamType.getSourceFile(), '@fresha/noname-core', 't:JSONArray');
          addTypeLiteralProperty(argsParamType, prop.name, 'JSONArray');
          break;
        default:
          this.context.logger.warn(`Cannot handle schema type ${String(prop.schema.type)}`);
      }

      argsParamType
        .getPropertyOrThrow(prop.name)
        .setHasQuestionToken(!schema.required.has(prop.name));
    }
  }
}

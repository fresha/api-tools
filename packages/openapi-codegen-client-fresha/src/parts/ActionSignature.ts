import assert from 'assert';

import {
  addImportDeclaration,
  addTypeAlias,
  addTypeLiteralCall,
  addTypeLiteralProperty,
  Logger,
  titleCase,
} from '@fresha/openapi-codegen-utils';
import { OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import { CodeBlockWriter, SyntaxKind, TypeLiteralNode } from 'ts-morph';

import type { ActionsSignatures } from './ActionsSignatures';
import type { OperationTemplate } from './operations';

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
  readonly parent: ActionsSignatures;
  readonly logger: Logger;
  readonly operation: OperationModel;
  readonly template: OperationTemplate;
  readonly name: string;
  readonly requestTypeName: string;
  readonly responseTypeName: string;

  constructor(
    parent: ActionsSignatures,
    name: string,
    operation: OperationModel,
    template: OperationTemplate,
  ) {
    this.parent = parent;
    this.logger = this.parent.logger;
    this.operation = operation;
    this.template = template;
    this.name = name;
    this.requestTypeName = titleCase(`${this.name}Request`);
    this.responseTypeName = titleCase(`${this.name}Response`);
  }

  generateCode(type: TypeLiteralNode): void {
    this.logger.info(`Generating type for action ${this.name}`);

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
      const requestBodySchema = this.operation.requestBody?.getContentOrThrow(
        this.parent.parent.options.useJsonApi ? 'application/vnd.api+json' : 'application/json',
      ).schema;
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

    for (const [propName, propSchema] of schema.properties) {
      switch (propSchema.type) {
        case null:
          addImportDeclaration(argsParamType.getSourceFile(), '@fresha/noname-core', 't:JSONValue');
          addTypeLiteralProperty(argsParamType, propName, 'JSONValue');
          break;
        case 'boolean':
          addTypeLiteralProperty(
            argsParamType,
            propName,
            propSchema.nullable ? 'boolean | null' : 'boolean',
          );
          break;
        case 'number':
        case 'integer':
          addTypeLiteralProperty(
            argsParamType,
            propName,
            propSchema.nullable ? 'number | null' : 'number',
          );
          break;
        case 'string': {
          let propType = 'string';
          if (propSchema.enum) {
            if (propSchema.enum.length === 1) {
              propType = `'${String(propSchema.enum[0])}'`;
            } else if (propSchema.enum.length > 1) {
              propType = propSchema.enum?.map(elem => `'${String(elem)}'`).join(' | ');
            }
            if (propSchema.nullable) {
              propType = `${propType} | null`;
            }
          }
          addTypeLiteralProperty(argsParamType, propName, propType);
          break;
        }
        case 'object': {
          if (propSchema.properties.size) {
            const propType = addTypeLiteralProperty(argsParamType, propName, '{}');
            this.addRequestBodyParams(propType.asKindOrThrow(SyntaxKind.TypeLiteral), propSchema);
          } else {
            addImportDeclaration(
              argsParamType.getSourceFile(),
              '@fresha/noname-core',
              't:JSONObject',
            );
            addTypeLiteralProperty(argsParamType, propName, 'JSONObject');
          }
          break;
        }
        case 'array':
          addImportDeclaration(argsParamType.getSourceFile(), '@fresha/noname-core', 't:JSONArray');
          addTypeLiteralProperty(argsParamType, propName, 'JSONArray');
          break;
        default:
          this.logger.warn(`Cannot handle schema type ${String(propSchema.type)}`);
      }

      argsParamType
        .getPropertyOrThrow(propName)
        .setHasQuestionToken(!schema.required.has(propName));
    }
  }
}

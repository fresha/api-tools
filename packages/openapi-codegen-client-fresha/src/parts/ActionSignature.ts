import assert from 'assert';

import {
  addFunctionTypeProperty,
  addTypeAlias,
  getOperationEntryKeyOrThrow,
  Logger,
} from '@fresha/openapi-codegen-utils';
import { OperationModel } from '@fresha/openapi-model/build/3.0.3';
import { FunctionTypeNode, StructureKind, SyntaxKind, TypeLiteralNode } from 'ts-morph';

import type { ActionsSignatures } from './ActionsSignatures';
import type { OperationTemplate } from './operations';

export class ActionSignature {
  readonly parent: ActionsSignatures;
  readonly logger: Logger;
  readonly operation: OperationModel;
  readonly template: OperationTemplate;
  readonly name: string;

  constructor(parent: ActionsSignatures, operation: OperationModel, template: OperationTemplate) {
    this.parent = parent;
    this.logger = this.parent.logger;
    this.operation = operation;
    this.template = template;
    this.name = this.template.actionName(getOperationEntryKeyOrThrow(this.operation));
  }

  generateCode(type: TypeLiteralNode): void {
    this.logger.info(`Generating type for action ${this.name}`);

    const actionFuncTypeObj = addFunctionTypeProperty(type, this.name, '() => Promise<Response>');

    switch (this.template.name) {
      case 'list':
        this.generateListActionSignature(actionFuncTypeObj);
        break;
      case 'read':
        this.generateReadActionSignature(actionFuncTypeObj);
        break;
      case 'create':
        this.generateCreateActionSignature(actionFuncTypeObj);
        break;
      case 'update':
        this.generateUpdateActionSignature(actionFuncTypeObj);
        break;
      case 'patch':
        this.generatePatchActionSignature(actionFuncTypeObj);
        break;
      case 'delete':
        this.generateDeleteActionSignature(actionFuncTypeObj);
        break;
      case 'single-read':
        this.generateSingleReadActionSignature(actionFuncTypeObj);
        break;
      case 'single-update':
        this.generateSingleUpdateActionSignature(actionFuncTypeObj);
        break;
      case 'single-patch':
        this.generateSinglePatchActionSignature(actionFuncTypeObj);
        break;
      case 'single-delete':
        this.generateSingleDeleteActionSignature(actionFuncTypeObj);
        break;
      default:
        assert.fail(`Unsupported operation template '${String(this.template.name)}'`);
    }
  }

  protected generateListActionSignature(funcType: FunctionTypeNode): void {
    this.addQueryParameters(funcType);
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateReadActionSignature(funcType: FunctionTypeNode): void {
    addTypeAlias(funcType.getSourceFile(), 'ResourceId', 'string | number');
    funcType.addParameter({
      name: 'id',
      type: 'ResourceId',
    });
    this.addQueryParameters(funcType);
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateCreateActionSignature(funcType: FunctionTypeNode): void {
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateUpdateActionSignature(funcType: FunctionTypeNode): void {
    addTypeAlias(funcType.getSourceFile(), 'ResourceId', 'string | number');
    funcType.addParameter({
      name: 'id',
      type: 'ResourceId',
    });
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generatePatchActionSignature(funcType: FunctionTypeNode): void {
    addTypeAlias(funcType.getSourceFile(), 'ResourceId', 'string | number');
    funcType.addParameter({
      name: 'id',
      type: 'ResourceId',
    });
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateDeleteActionSignature(funcType: FunctionTypeNode): void {
    addTypeAlias(funcType.getSourceFile(), 'ResourceId', 'string | number');
    funcType.addParameter({
      name: 'id',
      type: 'ResourceId',
    });
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateSingleReadActionSignature(funcType: FunctionTypeNode): void {
    this.addQueryParameters(funcType);
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateSingleUpdateActionSignature(funcType: FunctionTypeNode): void {
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateSinglePatchActionSignature(funcType: FunctionTypeNode): void {
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateSingleDeleteActionSignature(funcType: FunctionTypeNode): void {
    const argParams = this.addArgsParameter(funcType);
    this.addQueryParameters(funcType, argParams);
    // TODO request body
  }

  // eslint-disable-next-line class-methods-use-this
  protected addQueryParameters(funcType: FunctionTypeNode, paramType?: TypeLiteralNode): void {
    const queryParams = this.operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length) {
      const paramObj = paramType || this.addArgsParameter(funcType);
      assert(paramObj);
      for (const param of queryParams) {
        paramObj.addMember({
          kind: StructureKind.PropertySignature,
          name: param.name,
          type: 'string',
          hasQuestionToken: true,
        });
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected addArgsParameter(funcType: FunctionTypeNode): TypeLiteralNode {
    const result = funcType
      .addParameter({
        name: 'args',
        type: '{}',
      })
      .getNodeProperty('type')
      ?.asKindOrThrow(SyntaxKind.TypeLiteral);
    assert(result);
    return result;
  }
}

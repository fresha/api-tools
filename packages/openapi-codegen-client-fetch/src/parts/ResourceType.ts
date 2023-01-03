import { addImportDeclaration, addTypeAlias } from '@fresha/code-morph-ts';
import { assert, getSchemaMultiProperty } from '@fresha/openapi-codegen-utils';
import { StructureKind, SyntaxKind } from 'ts-morph';

import { NamedType } from './NamedType';
import { schemaToType } from './utils';

import type { ActionContext } from '../context';
import type { JSONValue, Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

enum RelationshipCardinality {
  ZeroOrOne = '0',
  One = '1',
  Many = 'N',
}

type RelationshipInfo = {
  resourceType: string;
  cardinality: RelationshipCardinality;
  required: boolean;
};

export class ResourceType extends NamedType {
  protected isRequestBody: boolean;
  protected resourceType: Nullable<string>;
  protected attributesSchema: Nullable<SchemaModel>;
  protected relationships: Map<string, RelationshipInfo>;

  constructor(context: ActionContext, name: string, schema: SchemaModel, isRequestBody: boolean) {
    super(context, name, schema);
    this.isRequestBody = isRequestBody;
    this.resourceType = null;
    this.attributesSchema = null;
    this.relationships = new Map<string, RelationshipInfo>();
  }

  collectData(_namedTypes: Map<string, NamedType>): void {
    if (this.schema == null) {
      return;
    }

    this.collectAttributesData();

    const relationshipsSchema = this.schema.getPropertyDeep('relationships');
    assert(
      !relationshipsSchema || relationshipsSchema.type === 'object',
      `Resource relationships schema is present, but it is not an object (it is ${String(
        relationshipsSchema?.type,
      )})`,
      this.context.operation,
    );
    if (relationshipsSchema) {
      this.collectRelationshipsData(relationshipsSchema);
    }
  }

  private collectAttributesData(): void {
    const typeSchema = this.schema.getPropertyDeep('type');

    if (!typeSchema) {
      this.context.logger.warn(
        `Cannot find type field in schema ${this.context.operation.parent.pathUrl}`,
      );
      // this.context.console.log(this.schema);
      return;
    }

    assert(typeSchema, `Missing 'type' property in resource ${this.name}`, this.context.operation);

    if (typeSchema.enum?.length !== 1) {
      this.context.logger.warn(
        `Expected resource schema to have only one allowed value, got ${String(
          typeSchema.enum?.length,
        )} ${this.context.operation.parent.pathUrl}`,
      );
      // this.context.console.log(this.schema);
      return;
    }

    assert(
      typeSchema.enum?.length === 1,
      `Expected resource schema to have only one allowed value, got ${String(
        typeSchema.enum?.length,
      )}`,
      this.context.operation,
    );

    const resourceType = typeSchema.enum[0];
    assert(
      typeof resourceType === 'string',
      `Expected resource type to be a string, got ${typeof resourceType}`,
      this.context.operation,
    );

    this.resourceType = resourceType;

    const attributesSchema = this.schema.getPropertyDeep('attributes') ?? null;
    assert(
      !attributesSchema || attributesSchema.type === 'object',
      `Resource attributes schema is present, but it is not an object (it is ${String(
        attributesSchema?.type,
      )})`,
      this.context.operation,
    );
    this.attributesSchema = attributesSchema;
  }

  private collectRelationshipsData(relationshipsSchema: SchemaModel): void {
    for (const { name, schema } of relationshipsSchema.getPropertiesDeep()) {
      let propDataSchema = schema.getProperty('data') ?? null;

      if (!propDataSchema && schema.isComposite()) {
        this.context.logger.warn(`TODO Handle anyOf/oneOf as resource relationship`);
        return;
      }

      let isArray = false;
      if (propDataSchema?.type === 'array') {
        propDataSchema = propDataSchema?.items;
        isArray = true;
      }

      assert(
        propDataSchema,
        `Cannot find items schema for property ${name}`,
        this.context.operation,
      );

      let cardinality = RelationshipCardinality.One;
      if (isArray) {
        cardinality = RelationshipCardinality.Many;
      } else if (propDataSchema.isNullish()) {
        cardinality = RelationshipCardinality.ZeroOrOne;
      }

      let rawResType: JSONValue | undefined;
      if (propDataSchema.isComposite()) {
        const resTypes = getSchemaMultiProperty(propDataSchema, 'type');
        if (resTypes.length !== 1) {
          global.console.log(resTypes);
        }
        assert(
          resTypes.length === 1,
          `Expected only one definition of the 'type' attribute, got ${resTypes.length}. Schema ${
            (relationshipsSchema.parent as SchemaModel).title as string
          }, property ${name}`,
          this.context.operation,
        );
        rawResType = resTypes[0].enum?.at(0);
      } else {
        rawResType = propDataSchema.getPropertyDeep('type')?.enum?.at(0);
      }

      assert(
        rawResType && typeof rawResType === 'string',
        `Resource type must be a string. Got ${String(rawResType)}`,
        this.context.operation,
      );
      const resType = rawResType;

      assert(
        resType && typeof resType === 'string',
        `Precondition failed ${
          this.context.operation.parent.pathUrl
        } prop=${name} ${typeof resType} ${typeof propDataSchema}`,
        this.context.operation,
      );

      this.relationships.set(name, {
        resourceType: resType,
        cardinality,
        required: relationshipsSchema.required.has(name),
      });
    }
  }

  generateCode(generatedTypes: Set<string>): void {
    if (!generatedTypes.has(this.name)) {
      generatedTypes.add(this.name);
    } else {
      return;
    }

    const templateName = this.isRequestBody ? 'JSONAPIClientResource' : 'JSONAPIServerResource';

    addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', `t:${templateName}`);

    const typeAlias = addTypeAlias(this.context.sourceFile, this.name, templateName, true);
    const typeAliasType = typeAlias.getNodeProperty('type').asKindOrThrow(SyntaxKind.TypeReference);

    if (this.resourceType) {
      typeAliasType.addTypeArgument(`'${this.resourceType}'`);
    }
    if (this.attributesSchema?.properties.size) {
      const typeLiteral = typeAliasType.addTypeArgument('{}').asKindOrThrow(SyntaxKind.TypeLiteral);
      for (const [name, schema] of this.attributesSchema.properties) {
        const typeName = schemaToType(schema);
        if (!typeName.startsWith('Unknown')) {
          typeLiteral.addProperty({
            kind: StructureKind.PropertySignature,
            name: `'${name}'`,
            type: typeName,
            hasQuestionToken: !this.attributesSchema.required.has(name),
          });
        }
      }
    }
    if (this.relationships.size) {
      if (!this.attributesSchema?.properties.size) {
        typeAliasType.addTypeArgument('{}');
      }

      const typeLiteral = typeAliasType.addTypeArgument('{}').asKindOrThrow(SyntaxKind.TypeLiteral);
      for (const [name, info] of this.relationships) {
        const relName = `JSONAPIResourceRelationship${info.cardinality.toString()}`;
        addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', `t:${relName}`);

        typeLiteral.addProperty({
          kind: StructureKind.PropertySignature,
          name: `'${name}'`,
          type: `${relName}<'${info.resourceType}'>`,
          hasQuestionToken: !info.required,
        });
      }
    }
  }
}

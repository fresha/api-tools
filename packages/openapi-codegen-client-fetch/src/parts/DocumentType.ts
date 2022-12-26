import { Nullable } from '@fresha/api-tools-core';
import { addImportDeclaration, addTypeAlias } from '@fresha/code-morph-ts';
import { assert } from '@fresha/openapi-codegen-utils';
import { SyntaxKind } from 'ts-morph';

import { NamedType } from './NamedType';
import { ResourceType } from './ResourceType';
import { determineSchemaName, schemaToType } from './utils';

import type { ActionContext } from '../context';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class DocumentType extends NamedType {
  protected isRequestBody: boolean;
  protected primaryResourceTypes: NamedType[];
  protected primaryDataIsArray: boolean;
  protected includedResourceTypes: NamedType[];

  constructor(context: ActionContext, name: string, schema: SchemaModel, isRequestBody: boolean) {
    super(context, name, schema);
    this.isRequestBody = isRequestBody;
    this.primaryResourceTypes = [];
    this.primaryDataIsArray = false;
    this.includedResourceTypes = [];
  }

  collectData(namedTypes: Map<string, NamedType>): void {
    const primaryDataSchema = this.schema.getProperty('data');
    if (primaryDataSchema) {
      this.determinePrimaryDataTypes(primaryDataSchema, namedTypes);
    }
    const includedSchema = this.schema.getProperty('included');
    if (includedSchema) {
      this.determineIncludedDataTypes(includedSchema, namedTypes);
    }
  }

  private determinePrimaryDataTypes(
    primaryDataSchema: Nullable<SchemaModel>,
    namedTypes: Map<string, NamedType>,
  ): void {
    if (primaryDataSchema?.type === 'array') {
      primaryDataSchema = primaryDataSchema.items;
      this.primaryDataIsArray = true;
    }

    assert(primaryDataSchema, `Cannot determine type of primary data`, this.context.operation);

    const primaryDataAlternatives = [
      ...(primaryDataSchema.oneOf ?? []),
      ...(primaryDataSchema.anyOf ?? []),
    ];
    if (primaryDataAlternatives.length) {
      for (const subschema of primaryDataAlternatives) {
        this.determineSinglePrimaryDataType(subschema, namedTypes);
      }
    } else {
      this.determineSinglePrimaryDataType(primaryDataSchema, namedTypes);
    }
  }

  private determineSinglePrimaryDataType(
    primaryDataSchema: SchemaModel,
    namedTypes: Map<string, NamedType>,
  ): void {
    const primaryDataSchemaName = determineSchemaName(primaryDataSchema);

    let existingNamedType = namedTypes.get(primaryDataSchemaName);
    assert(
      !existingNamedType || existingNamedType.schema === primaryDataSchema,
      `Name ${primaryDataSchemaName} have duplicate associated schemas`,
      this.context.operation,
    );

    if (!existingNamedType) {
      existingNamedType = new ResourceType(
        this.context,
        primaryDataSchemaName,
        primaryDataSchema,
        this.isRequestBody,
      );
      this.primaryResourceTypes.push(existingNamedType);
      namedTypes.set(primaryDataSchemaName, existingNamedType);

      existingNamedType.collectData(namedTypes);
    }
  }

  private determineIncludedDataTypes(
    includedSchema: SchemaModel,
    namedTypes: Map<string, NamedType>,
  ): void {
    assert(
      includedSchema.type === 'array',
      `'included' field must be an array schema, but it is an ${String(includedSchema.type)}`,
      this.context.operation,
    );

    const includedItemsSchema = includedSchema.items;
    if (!includedItemsSchema) {
      return;
    }

    if (includedItemsSchema.type === 'object') {
      this.determineSingleIncludedDataType(includedItemsSchema, namedTypes);
    } else {
      // multiple types of resources
      const subshemas = [
        ...(includedItemsSchema.oneOf ?? []),
        ...(includedItemsSchema.anyOf ?? []),
      ];

      for (const subschema of subshemas) {
        this.determineSingleIncludedDataType(subschema, namedTypes);
      }
    }
  }

  private determineSingleIncludedDataType(
    schema: SchemaModel,
    namedTypes: Map<string, NamedType>,
  ): void {
    let schemaName: string;
    if (schema.parent === schema.root.components) {
      schemaName = schema.title ?? schemaToType(schema);
    } else {
      schemaName = schemaToType(schema);
    }

    let existingNamedType = namedTypes.get(schemaName);
    assert(
      !existingNamedType || existingNamedType.schema === schema,
      `Name ${schemaName} have duplicate associated schemas`,
      this.context.operation,
    );

    if (!existingNamedType) {
      existingNamedType = new ResourceType(this.context, schemaName, schema, this.isRequestBody);
      namedTypes.set(schemaName, existingNamedType);

      existingNamedType.collectData(namedTypes);
    }

    this.includedResourceTypes.push(existingNamedType);
  }

  generateCode(generatedTypes: Set<string>): void {
    if (!generatedTypes.has(this.name)) {
      generatedTypes.add(this.name);
    } else {
      return;
    }

    for (const resourceType of this.primaryResourceTypes) {
      resourceType.generateCode(generatedTypes);
    }
    for (const includedType of this.includedResourceTypes) {
      includedType.generateCode(generatedTypes);
    }

    addImportDeclaration(
      this.context.sourceFile,
      '@fresha/api-tools-core',
      't:JSONAPIDataDocument',
    );
    const typeAlias = addTypeAlias(this.context.sourceFile, this.name, 'JSONAPIDataDocument', true);
    if (this.primaryResourceTypes.length) {
      let typeName = this.primaryResourceTypes.map(t => t.name).join(' | ');
      if (this.primaryDataIsArray) {
        typeName = `(${typeName})[]`;
      }
      typeAlias
        .getNodeProperty('type')
        .asKindOrThrow(SyntaxKind.TypeReference)
        .addTypeArgument(`${typeName}`);
    }
    if (this.includedResourceTypes.length) {
      const names = this.includedResourceTypes.map(t => t.name).join(' | ');
      typeAlias
        .getNodeProperty('type')
        .asKindOrThrow(SyntaxKind.TypeReference)
        .addTypeArgument(`${names}`);
    }

    generatedTypes.delete(this.name);
  }
}

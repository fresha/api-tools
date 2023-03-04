import { Nullable } from '@fresha/api-tools-core';
import { addImportDeclaration, addTypeAlias } from '@fresha/code-morph-ts';
import { assert } from '@fresha/openapi-codegen-utils';
import { SyntaxKind, TypeAliasDeclaration } from 'ts-morph';

import { NamedType } from './NamedType';
import { ResourceType } from './ResourceType';
import { determineSchemaName, schemaToType } from './utils';

import type { ActionContext } from '../context';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class DocumentType extends NamedType {
  primaryResourceTypes: NamedType[];
  primaryDataIsArray: boolean;
  includedResourceTypes: NamedType[];

  constructor(
    context: ActionContext,
    name: string,
    schema: SchemaModel,
    isRequestBody: boolean,
    isRequired: boolean,
  ) {
    super(context, name, schema, isRequestBody, isRequired);
    this.primaryResourceTypes = [];
    this.primaryDataIsArray = false;
    this.includedResourceTypes = [];
  }

  get primaryResourceTypeCount(): number {
    return this.primaryResourceTypes.length;
  }

  primaryResourceType(): ResourceType {
    assert(!this.primaryDataIsArray, 'This is an array type', this.context.operation);
    assert(
      this.primaryResourceTypes[0] instanceof ResourceType,
      'Primary data type is not a resource',
      this.context.operation,
    );
    return this.primaryResourceTypes[0];
  }

  get includedResourceTypeCount(): number {
    return this.includedResourceTypes.length;
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
    const primaryDataSchemas: SchemaModel[] = [];

    if (primaryDataSchema?.type === 'array') {
      if (Array.isArray(primaryDataSchema.items)) {
        primaryDataSchemas.push(...primaryDataSchema.items);
      } else if (primaryDataSchema.items) {
        primaryDataSchemas.push(primaryDataSchema.items);
      }
      this.primaryDataIsArray = true;
    } else if (primaryDataSchema) {
      primaryDataSchemas.push(primaryDataSchema);
    }

    assert(primaryDataSchema, `Cannot determine type of primary data`, this.context.operation);

    const primaryDataAlternatives = [];
    for (const primaryDataAlt of primaryDataSchemas) {
      primaryDataAlternatives.push(
        ...(primaryDataAlt.oneOf ?? []),
        ...(primaryDataAlt.anyOf ?? []),
      );
    }
    if (primaryDataAlternatives.length) {
      for (const subschema of primaryDataAlternatives) {
        this.determineSinglePrimaryDataType(subschema, namedTypes);
      }
    } else if (primaryDataSchemas.length) {
      for (const subschema of primaryDataSchemas) {
        this.determineSinglePrimaryDataType(subschema, namedTypes);
      }
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
        true,
      );
      namedTypes.set(primaryDataSchemaName, existingNamedType);

      existingNamedType.collectData(namedTypes);
    }

    this.primaryResourceTypes.push(existingNamedType);
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

    const includedItemsSchemas: SchemaModel[] = [];
    if (Array.isArray(includedItemsSchema)) {
      includedItemsSchemas.push(...includedItemsSchema);
    } else {
      includedItemsSchemas.push(includedItemsSchema);
    }

    for (const s of includedItemsSchemas) {
      if (s.type === 'object') {
        this.determineSingleIncludedDataType(s, namedTypes);
      } else {
        // multiple types of resources
        const subshemas = [...(s.oneOf ?? []), ...(s.anyOf ?? [])];

        for (const subschema of subshemas) {
          this.determineSingleIncludedDataType(subschema, namedTypes);
        }
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
      existingNamedType = new ResourceType(
        this.context,
        schemaName,
        schema,
        this.isRequestBody,
        true,
      );
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

    const typeBaseName = this.isRequestBody ? 'JSONAPIClientDocument' : 'JSONAPIDataDocument';
    addImportDeclaration(this.context.typesFile, '@fresha/api-tools-core', `t:${typeBaseName}`);
    const typeAlias = addTypeAlias(this.context.typesFile, this.name, typeBaseName, true);

    this.generateJsDocs(typeAlias);

    const typeAliasArgs = [];
    if (this.primaryResourceTypes.length) {
      const typeName = this.primaryResourceTypes.map(t => t.name).join(' | ');
      typeAliasArgs.push(this.primaryDataIsArray ? `(${typeName})[]` : `${typeName}`);
    }
    if (this.includedResourceTypes.length) {
      if (!this.primaryResourceTypes.length) {
        typeAliasArgs.push(this.isRequestBody ? 'JSONAPIClientResource' : 'JSONAPIServerResource');
      }
      const names = this.includedResourceTypes.map(t => t.name).join(' | ');
      typeAliasArgs.push(`${names}`);
    }
    typeAlias
      .getNodeProperty('type')
      .asKindOrThrow(SyntaxKind.TypeReference)
      .addTypeArguments(typeAliasArgs);

    generatedTypes.delete(this.name);
  }

  protected generateJsDocs(typeAlias: TypeAliasDeclaration): void {
    typeAlias.addJsDoc(writer => {
      let addNL = false;

      if (this.schema.title) {
        writer.writeLine(this.schema.title);
        addNL = true;
      }
      if (this.schema.description) {
        if (addNL) {
          writer.newLine();
        }
        writer.writeLine(this.schema.description);
        addNL = true;
      }

      if (addNL) {
        writer.newLine();
      }
      writer.writeLine(`This is a ${this.isRequestBody ? 'request' : 'response'} resource`);
      addNL = true;

      if (this.primaryResourceTypes.length) {
        if (addNL) {
          writer.newLine();
        }
        writer.writeLine('Primary data resources:');
        for (const t of this.primaryResourceTypes) {
          writer.writeLine(` - ${t.name}`);
        }
        addNL = true;
      }

      if (this.includedResourceTypes.length) {
        if (addNL) {
          writer.newLine();
          addNL = true;
        }
        writer.writeLine('Included resources:');
        for (const t of this.includedResourceTypes) {
          writer.writeLine(` - ${t.name}`);
        }
      }
    });
  }
}

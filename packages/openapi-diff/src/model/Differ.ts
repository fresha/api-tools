import type {
  CallbackModelDiff,
  ComponentsModelDiff,
  ContactModelDiff,
  Diff,
  DiscriminatorModelDiff,
  EncodingModelDiff,
  ExampleModelDiff,
  ExternalDocumentationModelDiff,
  HeaderModelDiff,
  InfoModelDiff,
  LicenseModelDiff,
  LinkModelDiff,
  ListDiff,
  MapDiff,
  MediaTypeModelDiff,
  OpenAPIModelDiff,
  ParameterModelDiff,
  PathItemModelDiff,
  PathsModelDiff,
  RequestBodyModelDiff,
  ResponseModelDiff,
  SchemaModelDiff,
  SecuritySchemaModelDiff,
  ServerModelDiff,
  ServerVariableModelDiff,
  SetDiff,
  TagModelDiff,
  XMLModelDiff,
  // SetDiff,
} from './types';
import type { JSONValue, Nullable } from '@fresha/api-tools-core';
import type {
  APIKeySecuritySchemaModelLocation,
  CallbackModel,
  HeaderModel,
  LinkModel,
  RequestBodyModel,
  SecuritySchemaModel,
  SecuritySchemeType,
  ComponentsModel,
  ContactModel,
  DiscriminatorModel,
  ExampleModel,
  ExternalDocumentationModel,
  InfoModel,
  LicenseModel,
  OpenAPIModel,
  ParameterModel,
  ResponseModel,
  SchemaModel,
  ServerModel,
  ServerVariableModel,
  SpecificationExtensionsModel,
  TagModel,
  XMLModel,
  MediaTypeModel,
  EncodingModel,
  PathItemModel,
  PathsModel,
} from '@fresha/openapi-model/build/3.0.3';

const getIn = <T>(obj: unknown, attr: string) => {
  const rec = obj as Record<string, T>;
  if (attr in rec) {
    return rec[attr];
  }
  return undefined;
};

export class Differ {
  // eslint-disable-next-line class-methods-use-this
  valueDiff<T>(from: T, to: T): Diff<T> | undefined {
    return from !== to ? { from, to } : undefined;
  }

  valueDiff2<T>(from: T | undefined, to: T | undefined): Diff<T> | undefined {
    let result: Diff<T> | undefined;
    if (from !== undefined && to !== undefined) {
      result = this.valueDiff(from, to);
    } else if (from !== undefined) {
      if (from !== null) {
        result = { from, to: undefined };
      }
    } else if (to !== undefined) {
      if (to !== null) {
        result = { from: undefined, to };
      }
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  setIterDiff<T>(from: IterableIterator<T>, to: IterableIterator<T>): SetDiff<T> | undefined {
    const added = new Set<T>();
    const deleted = new Set<T>();

    for (const item of to) {
      added.add(item);
    }

    for (const item of from) {
      if (added.has(item)) {
        added.delete(item);
      } else {
        deleted.add(item);
      }
    }

    return added.size + deleted.size
      ? {
          added: added.size ? added : undefined,
          deleted: deleted.size ? deleted : undefined,
        }
      : undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  extensionsDiff(
    from: Nullable<SpecificationExtensionsModel> | undefined,
    to: Nullable<SpecificationExtensionsModel> | undefined,
  ): MapDiff<Diff<JSONValue>> | undefined {
    const added = new Set<string>();
    const deleted = new Set<string>();
    const changed = new Map<string, Diff<JSONValue>>();

    if (to) {
      for (const [key, value] of to.extensions()) {
        if (!from?.hasExtension(key)) {
          added.add(key);
        } else {
          const oldValue = from.getExtension(key);
          if (oldValue !== value) {
            changed.set(key, { from: oldValue, to: value });
          }
        }
      }
    }

    if (from) {
      for (const key of from.extensionKeys()) {
        if (!to?.hasExtension(key)) {
          deleted.add(key);
        }
      }
    }

    if (!(added.size + deleted.size + changed.size)) {
      return undefined;
    }

    return {
      added: added.size ? added : undefined,
      deleted: deleted.size ? deleted : undefined,
      changed: changed.size ? changed : undefined,
    };
  }

  openapiDiff(from: OpenAPIModel, to: OpenAPIModel): OpenAPIModelDiff | undefined {
    const result = {
      from,
      to,
      openapi: this.valueDiff(from.openapi, to.openapi),
      info: this.infoDiff(from.info, to.info),
      servers: this.serverListDiff(from.servers(), to.servers()),
      paths: this.pathsDiff(from.paths, to.paths),
      components: this.componentsDiff(from.components, to.components),
      securityRequirements: undefined,
      tags: this.tagListDiff(from.tags(), to.tags()),
      externalDocs: this.externalDocumentationDiff(from.externalDocs, to.externalDocs),
      extensions: this.extensionsDiff(from, to),
    };

    return result.openapi !== undefined ||
      result.info !== undefined ||
      result.servers !== undefined ||
      result.paths !== undefined ||
      result.components !== undefined ||
      result.securityRequirements !== undefined ||
      result.tags !== undefined ||
      result.externalDocs !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  pathsDiff(from: PathsModel, to: PathsModel): PathsModelDiff | undefined {
    const result = {
      from,
      to,
      added: undefined,
      deleted: undefined,
      changed: undefined,
      ...this.mapDiff(from.pathItems(), to.pathItems(), (p1, p2) => this.pathItemDiff(p1, p2)),
    };

    return result.added !== undefined ||
      result.deleted !== undefined ||
      result.changed !== undefined
      ? result
      : undefined;
  }

  pathItemDiff(from: PathItemModel, to: PathItemModel): PathItemModelDiff | undefined {
    const result = {
      from,
      to,
      summary: this.valueDiff(from.summary, to.summary),
      description: this.valueDiff(from.description, to.description),
      operations: undefined,
      servers: this.serverListDiff(from.servers(), to.servers()),
      parameters: this.listDiff(
        from.parameters(),
        to.parameters(),
        p => `${p.in}:${p.name}`,
        (p1, p2) => this.parameterDiff(p1, p2),
      ),
      extensions: this.extensionsDiff(from, to),
    };

    return result.summary !== undefined ||
      result.description !== undefined ||
      result.servers !== undefined ||
      result.parameters !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  infoDiff(from: InfoModel, to: InfoModel): InfoModelDiff | undefined {
    const result = {
      from,
      to,
      title: this.valueDiff(from.title, to.title),
      description: this.valueDiff(from.description, to.description),
      termsOfService: this.valueDiff(from.termsOfService, to.termsOfService),
      contact: this.contactDiff(from.contact, to.contact),
      license: this.licenseDiff(from.license, to.license),
      version: this.valueDiff(from.version, to.version),
      extensions: this.extensionsDiff(from, to),
    };

    return result.title !== undefined ||
      result.description !== undefined ||
      result.termsOfService !== undefined ||
      result.contact !== undefined ||
      result.license !== undefined ||
      result.version !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  contactDiff(from: ContactModel, to: ContactModel): ContactModelDiff | undefined {
    const result = {
      from,
      to,
      name: this.valueDiff(from.name, to.name),
      url: this.valueDiff(from.url, to.url),
      email: this.valueDiff(from.email, to.email),
      extensions: this.extensionsDiff(from, to),
    };

    return result.name !== undefined ||
      result.url !== undefined ||
      result.email !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  licenseDiff(from: LicenseModel, to: LicenseModel): LicenseModelDiff | undefined {
    const result = {
      from,
      to,
      name: this.valueDiff(from.name, to.name),
      url: this.valueDiff(from.url, to.url),
      extensions: this.extensionsDiff(from, to),
    };

    return result.name !== undefined || result.url !== undefined || result.extensions !== undefined
      ? result
      : undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  listDiff<TItem, TItemDiff extends Diff<TItem>>(
    from: IterableIterator<TItem>,
    to: IterableIterator<TItem>,
    keyFn: (item: TItem) => string,
    itemDiffFn: (item1: TItem, item2: TItem) => TItemDiff | undefined,
  ): ListDiff<TItem, TItemDiff> | undefined {
    const fromMap = new Map<string, TItem>();
    for (const s of from) {
      fromMap.set(keyFn(s), s);
    }
    const toMap = new Map<string, TItem>();
    for (const s of to) {
      toMap.set(keyFn(s), s);
    }

    const addedKeys = new Set<string>();
    const stableKeys = new Set<string>();
    for (const k of fromMap.keys()) {
      if (!toMap.has(k)) {
        addedKeys.add(k);
      } else {
        stableKeys.add(k);
      }
    }
    const deletedKeys = new Set<string>();
    for (const k of toMap.keys()) {
      if (!fromMap.has(k)) {
        deletedKeys.add(k);
      }
    }

    const added = addedKeys.size ? Array.from(addedKeys, k => fromMap.get(k)!) : undefined;
    const deleted = deletedKeys.size ? Array.from(deletedKeys, k => toMap.get(k)!) : undefined;
    const changed: TItemDiff[] = [];
    for (const k of stableKeys) {
      const v = itemDiffFn(fromMap.get(k)!, toMap.get(k)!);
      if (v !== undefined) {
        changed.push(v);
      }
    }

    return added !== undefined || deleted !== undefined || changed.length
      ? { added, deleted, changed: changed.length ? changed : undefined }
      : undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  mapDiff<TItem, TItemDiff extends Diff<TItem>>(
    fromIter: IterableIterator<[string, TItem]>,
    toIter: IterableIterator<[string, TItem]>,
    itemDiffFn: (item1: TItem, item2: TItem) => TItemDiff | undefined,
  ): MapDiff<TItemDiff> | undefined {
    const from = new Map<string, TItem>(fromIter);
    const to = new Map<string, TItem>(toIter);

    const added = new Set<string>();
    const stableKeys = new Set<string>();
    for (const k of from.keys()) {
      if (!to.has(k)) {
        added.add(k);
      } else {
        stableKeys.add(k);
      }
    }

    const deleted = new Set<string>();
    for (const k of to.keys()) {
      if (!from.has(k)) {
        deleted.add(k);
      }
    }

    const changed = new Map<string, TItemDiff>();
    for (const k of stableKeys) {
      const v = itemDiffFn(from.get(k)!, to.get(k)!);
      if (v !== undefined) {
        changed.set(k, v);
      }
    }

    return added.size + deleted.size + changed.size
      ? {
          added: added.size ? added : undefined,
          deleted: deleted.size ? deleted : undefined,
          changed: changed.size ? changed : undefined,
        }
      : undefined;
  }

  serverListDiff(
    from: IterableIterator<ServerModel>,
    to: IterableIterator<ServerModel>,
  ): ListDiff<ServerModel, ServerModelDiff> | undefined {
    return this.listDiff(
      from,
      to,
      s => s.url,
      (s1, s2) => this.serverDiff(s1, s2),
    );
  }

  serverDiff(from: ServerModel, to: ServerModel): ServerModelDiff | undefined {
    const result = {
      from,
      to,
      url: this.valueDiff(from.url, to.url),
      description: this.valueDiff(from.description, to.description),
      variables: undefined, // this.serverVariableMapDiff(from.variables, to.variables),
      extensions: this.extensionsDiff(from, to),
    };

    return result.url !== undefined ||
      result.description !== undefined ||
      result.variables !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  serverVariableMapDiff(
    from: ServerModel,
    to: ServerModel,
  ): MapDiff<ServerVariableModelDiff> | undefined {
    return this.mapDiff(from.variables(), to.variables(), (v1, v2) =>
      this.serverVariableDiff(v1, v2),
    );
  }

  serverVariableDiff(
    from: ServerVariableModel,
    to: ServerVariableModel,
  ): ServerVariableModelDiff | undefined {
    const result = {
      from,
      to,
      allowedValues: this.setIterDiff(from.allowedValues(), to.allowedValues()),
      default: this.valueDiff2(from.defaultValue, to.defaultValue),
      description: this.valueDiff(from.description, to.description),
      extensions: this.extensionsDiff(from, to),
    };

    return result.allowedValues !== undefined ||
      result.default !== undefined ||
      result.description !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  componentsDiff(from: ComponentsModel, to: ComponentsModel): ComponentsModelDiff | undefined {
    const result = {
      from,
      to,
      schemas: this.mapDiff(from.schemas(), to.schemas(), (s1, s2) => this.schemaDiff(s1, s2)),
      responses: this.mapDiff(from.responses(), to.responses(), (r1, r2) =>
        this.responseDiff(r1, r2),
      ),
      parameters: this.mapDiff(from.parameters(), to.parameters(), (p1, p2) =>
        this.parameterDiff(p1, p2),
      ),
      examples: this.mapDiff(from.examples(), to.examples(), (e1, e2) => this.exampleDiff(e1, e2)),
      requestBodies: this.mapDiff(from.requestBodies(), to.requestBodies(), (r1, r2) =>
        this.requestBodyDiff(r1, r2),
      ),
      headers: this.mapDiff(from.headers(), to.headers(), (h1, h2) => this.headerDiff(h1, h2)),
      securitySchemes: this.mapDiff(from.securitySchemas(), to.securitySchemas(), (s1, s2) =>
        this.securitySchemeDiff(s1, s2),
      ),
      links: this.mapDiff(from.links(), to.links(), (l1, l2) => this.linkDiff(l1, l2)),
      callbacks: this.mapDiff(from.callbacks(), to.callbacks(), (c1, c2) =>
        this.callbackDiff(c1, c2),
      ),
      extensions: this.extensionsDiff(from, to),
    };

    return result.schemas !== undefined ||
      result.responses !== undefined ||
      result.parameters !== undefined ||
      result.examples !== undefined ||
      result.requestBodies !== undefined ||
      result.headers !== undefined ||
      result.securitySchemes !== undefined ||
      result.links !== undefined ||
      result.callbacks !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  schemaDiff(from: SchemaModel, to: SchemaModel): SchemaModelDiff | undefined {
    const result = {
      from,
      to,
      title: this.valueDiff(from.title, to.title),
      multipleOf: this.valueDiff(from.multipleOf, to.multipleOf),
      maximum: this.valueDiff(from.maximum, to.maximum),
      exclusiveMaximum: this.valueDiff(from.exclusiveMaximum, to.exclusiveMaximum),
      minimum: this.valueDiff(from.minimum, to.minimum),
      exclusiveMinimum: this.valueDiff(from.exclusiveMinimum, to.exclusiveMinimum),
      maxLength: this.valueDiff(from.maxLength, to.maxLength),
      minLength: this.valueDiff(from.minLength, to.minLength),
      pattern: this.valueDiff(from.pattern, to.pattern),
      maxItems: this.valueDiff(from.maxItems, to.maxItems),
      minItems: this.valueDiff(from.minItems, to.minItems),
      uniqueItems: this.valueDiff(from.uniqueItems, to.uniqueItems),
      maxProperties: this.valueDiff(from.maxProperties, to.maxProperties),
      minProperties: this.valueDiff(from.minProperties, to.minProperties),
      required: undefined,
      allowedValues: undefined,
      type: this.valueDiff(from.type, to.type),
      not: undefined,
      allOf: undefined,
      oneOf: undefined,
      anyOf: undefined,
      items: undefined,
      properties: undefined,
      additionalProperties: undefined,
      description: this.valueDiff(from.description, to.description),
      format: this.valueDiff(from.format, to.format),
      default: this.valueDiff(from.default, to.default),
      nullable: this.valueDiff(from.nullable, to.nullable),
      discriminator: this.discriminatorDiff(from.discriminator, to.discriminator),
      readOnly: this.valueDiff(from.readOnly, to.readOnly),
      writeOnly: this.valueDiff(from.writeOnly, to.writeOnly),
      xml: this.xmlDiff(from.xml, to.xml),
      externalDocs: this.externalDocumentationDiff(from.externalDocs, to.externalDocs),
      example: this.valueDiff(from.example, to.example),
      examples: undefined,
      extensions: this.extensionsDiff(from, to),
      deprecated: this.valueDiff(from.deprecated, to.deprecated),
    };

    return result.title !== undefined ||
      result.multipleOf !== undefined ||
      result.maximum !== undefined ||
      result.exclusiveMaximum !== undefined ||
      result.minimum !== undefined ||
      result.exclusiveMinimum !== undefined ||
      result.maxLength !== undefined ||
      result.minLength !== undefined ||
      result.pattern !== undefined ||
      result.maxItems !== undefined ||
      result.minItems !== undefined ||
      result.uniqueItems !== undefined ||
      result.maxProperties !== undefined ||
      result.minProperties !== undefined ||
      result.required !== undefined ||
      result.allowedValues !== undefined ||
      result.type !== undefined ||
      result.not !== undefined ||
      result.allOf !== undefined ||
      result.oneOf !== undefined ||
      result.anyOf !== undefined ||
      result.items !== undefined ||
      result.properties !== undefined ||
      result.additionalProperties !== undefined ||
      result.description !== undefined ||
      result.format !== undefined ||
      result.default !== undefined ||
      result.nullable !== undefined ||
      result.discriminator !== undefined ||
      result.readOnly !== undefined ||
      result.writeOnly !== undefined ||
      result.xml !== undefined ||
      result.externalDocs !== undefined ||
      result.example !== undefined ||
      result.examples !== undefined ||
      result.extensions !== undefined ||
      result.deprecated !== undefined
      ? result
      : undefined;
  }

  responseDiff(from: ResponseModel, to: ResponseModel): ResponseModelDiff | undefined {
    const result = {
      from,
      to,
      description: this.valueDiff(from.description, to.description),
      headers: this.mapDiff(from.headers(), to.headers(), (h1, h2) => this.headerDiff(h1, h2)),
      mediaTypes: this.mapDiff(from.mediaTypes(), to.mediaTypes(), (m1, m2) =>
        this.mediaTypeDiff(m1, m2),
      ),
      links: this.mapDiff(from.links(), to.links(), (l1, l2) => this.linkDiff(l1, l2)),
      extensions: this.extensionsDiff(from, to),
    };

    return result.description !== undefined ||
      result.headers !== undefined ||
      result.mediaTypes !== undefined ||
      result.links !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  mediaTypeDiff(from: MediaTypeModel, to: MediaTypeModel): MediaTypeModelDiff | undefined {
    const result = {
      from,
      to,
      schema: undefined,
      examples: this.mapDiff(from.examples(), to.examples(), (e1, e2) => this.exampleDiff(e1, e2)),
      encoding: this.mapDiff(from.encodings(), to.encodings(), (e1, e2) =>
        this.encodingDiff(e1, e2),
      ),
      extensions: this.extensionsDiff(from, to),
    };

    return result.schema !== undefined ||
      result.examples !== undefined ||
      result.encoding !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  encodingDiff(from: EncodingModel, to: EncodingModel): EncodingModelDiff | undefined {
    const result = {
      from,
      to,
      contentType: this.valueDiff(from.contentType, to.contentType),
      headers: this.mapDiff(from.headers(), to.headers(), (h1, h2) => this.headerDiff(h1, h2)),
      style: this.valueDiff(from.style, to.style),
      explode: this.valueDiff(from.explode, to.explode),
      allowReserved: this.valueDiff(from.allowReserved, to.allowReserved),
      extensions: this.extensionsDiff(from, to),
    };

    return result.contentType !== undefined ||
      result.headers !== undefined ||
      result.style !== undefined ||
      result.explode !== undefined ||
      result.allowReserved !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  parameterDiff(from: ParameterModel, to: ParameterModel): ParameterModelDiff | undefined {
    const result = {
      from,
      to,
      name: this.valueDiff(from.name, to.name),
      in: this.valueDiff(from.in, to.in),
      description: this.valueDiff(from.description, to.description),
      required: this.valueDiff(from.required, to.required),
      deprecated: this.valueDiff(from.deprecated, to.deprecated),
      allowEmptyValue:
        'allowEmptyValue' in from && 'allowEmptyValue' in to
          ? this.valueDiff(from.allowEmptyValue, to.allowEmptyValue)
          : undefined,
      style: this.valueDiff(from.style, to.style),
      explode: this.valueDiff(from.explode, to.explode),
      allowReserved:
        'allowReserved' in from && 'allowReserved' in to
          ? this.valueDiff(from.allowReserved, to.allowReserved)
          : undefined,
      schema: undefined,
      examples: this.mapDiff(from.examples(), to.examples(), (e1, e2) => this.exampleDiff(e1, e2)),
      extensions: this.extensionsDiff(from, to),
    };

    return result.name !== undefined ||
      result.in !== undefined ||
      result.description !== undefined ||
      result.required !== undefined ||
      result.deprecated !== undefined ||
      result.allowEmptyValue !== undefined ||
      result.style !== undefined ||
      result.explode !== undefined ||
      result.allowReserved !== undefined ||
      result.schema !== undefined ||
      result.examples !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  exampleDiff(from: ExampleModel, to: ExampleModel): ExampleModelDiff | undefined {
    const result = {
      from,
      to,
      summary: this.valueDiff(from.summary, to.summary),
      description: this.valueDiff(from.description, to.description),
      value: this.valueDiff(from.value, to.value),
      externalValue: this.valueDiff(from.externalValue, to.externalValue),
      extensions: this.extensionsDiff(from, to),
    };

    return result.summary !== undefined ||
      result.description !== undefined ||
      result.value !== undefined ||
      result.externalValue !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  requestBodyDiff(from: RequestBodyModel, to: RequestBodyModel): RequestBodyModelDiff | undefined {
    const result = {
      from,
      to,
      description: this.valueDiff(from.description, to.description),
      mediaTypes: this.mapDiff(from.mediaTypes(), to.mediaTypes(), (m1, m2) =>
        this.mediaTypeDiff(m1, m2),
      ),
      required: this.valueDiff(from.required, to.required),
      extensions: this.extensionsDiff(from, to),
    };

    return result.description !== undefined ||
      result.mediaTypes !== undefined ||
      result.required !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  headerDiff(from: HeaderModel, to: HeaderModel): HeaderModelDiff | undefined {
    const result = {
      from,
      to,
      description: this.valueDiff(from.description, to.description),
      required: this.valueDiff(from.required, to.required),
      deprecated: this.valueDiff(from.deprecated, to.deprecated),
      style: this.valueDiff(from.style, to.style),
      explode: this.valueDiff(from.explode, to.explode),
      schema: undefined,
      examples: this.mapDiff(from.examples(), to.examples(), (e1, e2) => this.exampleDiff(e1, e2)),
      mediaTypes: this.mapDiff(from.mediaTypes(), to.mediaTypes(), (m1, m2) =>
        this.mediaTypeDiff(m1, m2),
      ),
      extensions: this.extensionsDiff(from, to),
    };

    return result.description !== undefined ||
      result.required !== undefined ||
      result.deprecated !== undefined ||
      result.style !== undefined ||
      result.explode !== undefined ||
      result.schema !== undefined ||
      result.examples !== undefined ||
      result.mediaTypes !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  securitySchemeDiff(
    from: SecuritySchemaModel,
    to: SecuritySchemaModel,
  ): SecuritySchemaModelDiff | undefined {
    const result = {
      from,
      to,
      type: this.valueDiff<SecuritySchemeType>(from.type, to.type),
      description: this.valueDiff(from.description, to.description),
      name: this.valueDiff2<Nullable<string>>(getIn(from, 'name'), getIn(to, 'name')),
      in: this.valueDiff2<APIKeySecuritySchemaModelLocation>(getIn(from, 'in'), getIn(to, 'in')),
      scheme: this.valueDiff2<SchemaModel>(getIn(from, 'scheme'), getIn(to, 'scheme')),
      bearerFormat: this.valueDiff2<string>(getIn(from, 'bearerFormat'), getIn(to, 'bearerFormat')),
      flows: undefined,
      openIdConnectUrl: this.valueDiff2<string>(
        getIn(from, 'openIdConnectUrl'),
        getIn(to, 'openIdConnectUrl'),
      ),
      extensions: this.extensionsDiff(from, to),
    };

    return result.type !== undefined ||
      result.description !== undefined ||
      result.name !== undefined ||
      result.in !== undefined ||
      result.scheme !== undefined ||
      result.bearerFormat !== undefined ||
      result.flows !== undefined ||
      result.openIdConnectUrl !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  linkDiff(from: LinkModel, to: LinkModel): LinkModelDiff | undefined {
    const result = {
      from,
      to,
      operationRef: this.valueDiff(from.operationRef, to.operationRef),
      operationId: this.valueDiff(from.operationId, to.operationId),
      parameters: this.mapDiff(from.parameters(), to.parameters(), (p1, p2) =>
        this.valueDiff(p1, p2),
      ),
      requestBody: undefined,
      description: this.valueDiff(from.description, to.description),
      server: undefined,
      extensions: this.extensionsDiff(from, to),
    };

    return result.operationRef !== undefined ||
      result.operationId !== undefined ||
      result.parameters !== undefined ||
      result.requestBody !== undefined ||
      result.description !== undefined ||
      result.server !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  callbackDiff(from: CallbackModel, to: CallbackModel): CallbackModelDiff | undefined {
    const result = {
      from,
      to,
      paths: undefined,
      extensions: this.extensionsDiff(from, to),
    };

    return result.paths !== undefined || result.extensions !== undefined ? result : undefined;
  }

  discriminatorDiff(
    from: Nullable<DiscriminatorModel>,
    to: Nullable<DiscriminatorModel>,
  ): DiscriminatorModelDiff | undefined {
    const result = {
      from,
      to,
      propertyName: this.valueDiff2(from?.propertyName, to?.propertyName),
      mapping: undefined,
      extensions: this.extensionsDiff(from, to),
    };

    return result.propertyName !== undefined ||
      result.mapping !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  xmlDiff(from: Nullable<XMLModel>, to: Nullable<XMLModel>): XMLModelDiff | undefined {
    const result = {
      from,
      to,
      name: this.valueDiff(from?.name ?? null, to?.name ?? null),
      namespace: this.valueDiff(from?.namespace ?? null, to?.namespace ?? null),
      prefix: this.valueDiff(from?.prefix ?? null, to?.prefix ?? null),
      attribute: this.valueDiff(from?.attribute ?? false, to?.attribute ?? false),
      wrapped: this.valueDiff(from?.wrapped ?? false, to?.wrapped ?? false),
      extensions: this.extensionsDiff(from, to),
    };

    return result.name !== undefined ||
      result.namespace !== undefined ||
      result.prefix !== undefined ||
      result.attribute !== undefined ||
      result.wrapped !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  tagListDiff(
    from: IterableIterator<TagModel>,
    to: IterableIterator<TagModel>,
  ): ListDiff<TagModel, TagModelDiff> | undefined {
    return this.listDiff(
      from,
      to,
      s => s.name,
      (s1, s2) => this.tagDiff(s1, s2),
    );
  }

  tagDiff(from: TagModel, to: TagModel): TagModelDiff | undefined {
    const result = {
      from,
      to,
      name: this.valueDiff(from.name, to.name),
      description: this.valueDiff(from.description, to.description),
      externalDocs: this.externalDocumentationDiff(from.externalDocs, to.externalDocs),
      extensions: this.extensionsDiff(from, to),
    };

    return result.name !== undefined ||
      result.description !== undefined ||
      result.externalDocs !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }

  externalDocumentationDiff(
    from: Nullable<ExternalDocumentationModel>,
    to: Nullable<ExternalDocumentationModel>,
  ): ExternalDocumentationModelDiff | undefined {
    const result = {
      from,
      to,
      description: this.valueDiff2(from?.description, to?.description),
      url: this.valueDiff2(from?.url, to?.url),
      extensions: this.extensionsDiff(from, to),
    };

    return result.description !== undefined ||
      result.url !== undefined ||
      result.extensions !== undefined
      ? result
      : undefined;
  }
}

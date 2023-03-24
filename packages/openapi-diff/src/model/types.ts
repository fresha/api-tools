import type {
  CommonMarkString,
  EmailString,
  JSONValue,
  Nullable,
  URLString,
  VersionString,
} from '@fresha/api-tools-core';
import type {
  APIKeySecuritySchemaModelLocation,
  CallbackModel,
  ComponentsModel,
  ContactModel,
  DiscriminatorModel,
  EncodingModel,
  EncodingSerializationStyle,
  ExampleModel,
  ExternalDocumentationModel,
  HeaderModel,
  HeaderParameterSerializationStyle,
  InfoModel,
  LicenseModel,
  LinkModel,
  MediaTypeModel,
  OAuthFlowModel,
  OAuthFlowsModel,
  OpenAPIModel,
  OperationModel,
  ParameterLocation,
  ParameterModel,
  PathItemModel,
  PathsModel,
  RequestBodyModel,
  ResponseModel,
  ResponsesModel,
  SchemaFormat,
  SchemaModel,
  SchemaType,
  SecurityRequirementModel,
  SecuritySchemaModel,
  SecuritySchemeType,
  ServerModel,
  ServerVariableModel,
  TagModel,
  XMLModel,
} from '@fresha/openapi-model/build/3.0.3';

export interface Diff<T> {
  readonly from: T | undefined;
  readonly to: T | undefined;
}

export interface ListDiff<T, D extends Diff<T> = Diff<T>> {
  readonly added: ReadonlyArray<T> | undefined;
  readonly deleted: ReadonlyArray<T> | undefined;
  readonly changed: ReadonlyArray<D> | undefined;
}

export interface SetDiff<T> {
  readonly added: ReadonlySet<T> | undefined;
  readonly deleted: ReadonlySet<T> | undefined;
}

export interface MapDiff<TItemDiff> {
  readonly added: ReadonlySet<string> | undefined;
  readonly deleted: ReadonlySet<string> | undefined;
  readonly changed: ReadonlyMap<string, TItemDiff> | undefined;
}

export interface SpecificationExtensionsModelDiff {
  readonly extensions: MapDiff<Diff<JSONValue>> | undefined;
}

export interface OpenAPIModelDiff extends Diff<OpenAPIModel>, SpecificationExtensionsModelDiff {
  readonly openapi: Diff<string> | undefined;
  readonly info: InfoModelDiff | undefined;
  readonly components: ComponentsModelDiff | undefined;
  readonly servers: ListDiff<ServerModel, ServerModelDiff> | undefined;
  readonly paths: PathsModelDiff | undefined;
  readonly securityRequirements:
    | ListDiff<SecurityRequirementModel, SecurityRequirementModelDiff>
    | undefined;
  readonly tags: ListDiff<TagModel, TagModelDiff> | undefined;
  readonly externalDocs: ExternalDocumentationModelDiff | undefined;
}

export interface InfoModelDiff extends Diff<InfoModel>, SpecificationExtensionsModelDiff {
  readonly title: Diff<string> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly termsOfService: Diff<Nullable<URLString>> | undefined;
  readonly contact: ContactModelDiff | undefined;
  readonly license: LicenseModelDiff | undefined;
  readonly version: Diff<VersionString> | undefined;
}

export interface ContactModelDiff extends Diff<ContactModel>, SpecificationExtensionsModelDiff {
  readonly name: Diff<Nullable<string>> | undefined;
  readonly url: Diff<Nullable<URLString>> | undefined;
  readonly email: Diff<Nullable<EmailString>> | undefined;
}

export interface LicenseModelDiff extends Diff<LicenseModel>, SpecificationExtensionsModelDiff {
  readonly name: Diff<string> | undefined;
  readonly url: Diff<Nullable<URLString>> | undefined;
}

export interface ComponentsModelDiff
  extends Diff<ComponentsModel>,
    SpecificationExtensionsModelDiff {
  readonly schemas: MapDiff<SchemaModelDiff> | undefined;
  readonly responses: MapDiff<ResponseModelDiff> | undefined;
  readonly parameters: MapDiff<ParameterModelDiff> | undefined;
  readonly requestBodies: MapDiff<RequestBodyModelDiff> | undefined;
  readonly headers: MapDiff<HeaderModelDiff> | undefined;
  readonly securitySchemes: MapDiff<SecuritySchemaModelDiff> | undefined;
  readonly links: MapDiff<LinkModelDiff> | undefined;
  readonly callbacks: MapDiff<CallbackModelDiff> | undefined;
  readonly examples: MapDiff<ExampleModelDiff> | undefined;
}

export interface SchemaModelDiff extends Diff<SchemaModel>, SpecificationExtensionsModelDiff {
  readonly title: Diff<Nullable<string>> | undefined;
  readonly multipleOf: Diff<Nullable<number>> | undefined;
  readonly maximum: Diff<Nullable<number>> | undefined;
  readonly exclusiveMaximum: Diff<boolean> | undefined;
  readonly minimum: Diff<Nullable<number>> | undefined;
  readonly exclusiveMinimum: Diff<boolean> | undefined;
  readonly maxLength: Diff<Nullable<number>> | undefined;
  readonly minLength: Diff<Nullable<number>> | undefined;
  readonly pattern: Diff<Nullable<string>> | undefined;
  readonly maxItems: Diff<Nullable<number>> | undefined;
  readonly minItems: Diff<Nullable<number>> | undefined;
  readonly uniqueItems: Diff<boolean> | undefined;
  readonly maxProperties: Diff<Nullable<number>> | undefined;
  readonly minProperties: Diff<Nullable<number>> | undefined;
  readonly required: SetDiff<string> | undefined;
  readonly allowedValues: ListDiff<JSONValue, Diff<JSONValue>> | undefined;
  readonly type: Diff<Nullable<SchemaType>> | undefined;
  readonly allOf: ListDiff<SchemaModel, SchemaModelDiff> | undefined;
  readonly oneOf: ListDiff<SchemaModel, SchemaModelDiff> | undefined;
  readonly anyOf: ListDiff<SchemaModel, SchemaModelDiff> | undefined;
  readonly not: SchemaModelDiff | undefined;
  readonly items: SchemaModelDiff | undefined;
  readonly properties: MapDiff<SchemaModelDiff> | undefined;
  readonly additionalProperties: SchemaModelDiff | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly format: Diff<Nullable<SchemaFormat>> | undefined;
  readonly default: Diff<Nullable<JSONValue>> | undefined;
  readonly nullable: Diff<boolean> | undefined;
  readonly discriminator: DiscriminatorModelDiff | undefined;
  readonly readOnly: Diff<boolean> | undefined;
  readonly writeOnly: Diff<boolean> | undefined;
  readonly xml: XMLModelDiff | undefined;
  readonly externalDocs: ExternalDocumentationModelDiff | undefined;
  readonly deprecated: Diff<boolean> | undefined;
  readonly example: Diff<Nullable<JSONValue>> | undefined;
  readonly examples: MapDiff<ExampleModelDiff> | undefined;
}

export interface DiscriminatorModelDiff
  extends Diff<Nullable<DiscriminatorModel>>,
    SpecificationExtensionsModelDiff {
  readonly propertyName: Diff<string> | undefined;
  readonly mapping: MapDiff<Diff<string>> | undefined;
}

export interface XMLModelDiff extends Diff<Nullable<XMLModel>>, SpecificationExtensionsModelDiff {
  readonly name: Diff<Nullable<string>> | undefined;
  readonly namespace: Diff<Nullable<string>> | undefined;
  readonly prefix: Diff<Nullable<string>> | undefined;
  readonly attribute: Diff<boolean> | undefined;
  readonly wrapped: Diff<boolean> | undefined;
}

export interface ResponseModelDiff extends Diff<ResponseModel>, SpecificationExtensionsModelDiff {
  readonly description: Diff<CommonMarkString> | undefined;
  readonly headers: MapDiff<HeaderModelDiff> | undefined;
  readonly mediaTypes: MapDiff<MediaTypeModelDiff> | undefined;
  readonly links: MapDiff<LinkModelDiff> | undefined;
}

export interface MediaTypeModelDiff extends Diff<MediaTypeModel>, SpecificationExtensionsModelDiff {
  readonly schema: SchemaModelDiff | undefined;
  readonly examples: MapDiff<ExampleModelDiff> | undefined;
  readonly encoding: MapDiff<EncodingModelDiff> | undefined;
}

export interface EncodingModelDiff extends Diff<EncodingModel>, SpecificationExtensionsModelDiff {
  readonly contentType: Diff<Nullable<string>> | undefined;
  readonly headers: MapDiff<HeaderModelDiff> | undefined;
  readonly style: Diff<Nullable<EncodingSerializationStyle>> | undefined;
  readonly explode: Diff<boolean> | undefined;
  readonly allowReserved: Diff<boolean> | undefined;
}

export interface ParameterModelDiff extends Diff<ParameterModel>, SpecificationExtensionsModelDiff {
  readonly name: Diff<string> | undefined;
  readonly in: Diff<ParameterLocation> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
}

export interface RequestBodyModelDiff
  extends Diff<RequestBodyModel>,
    SpecificationExtensionsModelDiff {
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly mediaTypes: MapDiff<MediaTypeModelDiff> | undefined;
  readonly required: Diff<boolean> | undefined;
}

export interface SecuritySchemaModelDiff
  extends Diff<SecuritySchemaModel>,
    SpecificationExtensionsModelDiff {
  readonly type: Diff<SecuritySchemeType> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly name: Diff<Nullable<string>> | undefined;
  readonly in: Diff<APIKeySecuritySchemaModelLocation> | undefined;
  readonly scheme: Diff<SchemaModel> | undefined;
  readonly bearerFormat: Diff<Nullable<string>> | undefined;
  readonly flows: OAuthFlowsModelDiff | undefined;
}

export interface OAuthFlowsModelDiff extends Diff<OAuthFlowsModel> {
  readonly implicit: OAuthFlowModelDiff | undefined;
  readonly password: OAuthFlowModelDiff | undefined;
  readonly clientCredentials: OAuthFlowModelDiff | undefined;
  readonly authorizationCode: OAuthFlowModelDiff | undefined;
}

export interface OAuthFlowModelDiff extends Diff<OAuthFlowModel> {
  readonly authorizationUrl: Diff<Nullable<URLString>> | undefined;
  readonly tokenUrl: Diff<Nullable<URLString>> | undefined;
  readonly refreshUrl: Diff<Nullable<URLString>> | undefined;
  readonly scopes: MapDiff<Diff<string>> | undefined;
}

export interface CallbackModelDiff extends Diff<CallbackModel>, SpecificationExtensionsModelDiff {
  readonly paths: MapDiff<PathItemModelDiff> | undefined;
}

export interface HeaderModelDiff extends Diff<HeaderModel>, SpecificationExtensionsModelDiff {
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly required: Diff<boolean> | undefined;
  readonly deprecated: Diff<boolean> | undefined;
  readonly style: Diff<HeaderParameterSerializationStyle> | undefined;
  readonly explode: Diff<boolean> | undefined;
  readonly schema: SchemaModelDiff | undefined;
  readonly examples: MapDiff<ExampleModelDiff> | undefined;
  readonly mediaTypes: MapDiff<MediaTypeModelDiff> | undefined;
}

export interface LinkModelDiff extends Diff<LinkModel>, SpecificationExtensionsModelDiff {
  readonly operationRef: Diff<Nullable<string>> | undefined;
  readonly operationId: Diff<Nullable<string>> | undefined;
  readonly parameters: MapDiff<Diff<JSONValue>> | undefined;
  readonly requestBody: Diff<Nullable<JSONValue>> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly server: ServerModelDiff | undefined;
}

export interface ExampleModelDiff extends Diff<ExampleModel>, SpecificationExtensionsModelDiff {
  readonly summary: Diff<Nullable<string>> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly value: Diff<Nullable<JSONValue>> | undefined;
  readonly externalValue: Diff<Nullable<URLString>> | undefined;
}

export interface ServerModelDiff extends Diff<ServerModel>, SpecificationExtensionsModelDiff {
  readonly url: Diff<string> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly variables: MapDiff<ServerVariableModelDiff> | undefined;
}

export interface ServerVariableModelDiff
  extends Diff<ServerVariableModel>,
    SpecificationExtensionsModelDiff {
  readonly default: Diff<string> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly allowedValues: SetDiff<string> | undefined;
}

export interface PathsModelDiff extends Diff<PathsModel>, MapDiff<PathItemModelDiff> {}

export interface PathItemModelDiff extends Diff<PathItemModel>, SpecificationExtensionsModelDiff {
  readonly summary: Diff<Nullable<string>> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly operations: MapDiff<OperationModelDiff> | undefined;
  readonly parameters: ListDiff<ParameterModel, ParameterModelDiff> | undefined;
  readonly servers: ListDiff<ServerModel, ServerModelDiff> | undefined;
}

export interface OperationModelDiff extends Diff<OperationModel>, SpecificationExtensionsModelDiff {
  readonly summary: Diff<Nullable<string>> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly operationId: Diff<Nullable<string>> | undefined;
  readonly deprecated: Diff<boolean> | undefined;
  readonly parameters: ListDiff<ParameterModel, ParameterModelDiff> | undefined;
  readonly requestBody: RequestBodyModelDiff | undefined;
  readonly responses: ResponsesModelDiff | undefined;
  readonly tags: ListDiff<string, Diff<string>> | undefined;
  readonly externalDocs: ExternalDocumentationModelDiff | undefined;
  readonly securityRequirements:
    | ListDiff<SecurityRequirementModel, SecurityRequirementModelDiff>
    | undefined;
  readonly servers: ListDiff<ServerModel, ServerModelDiff> | undefined;
}

export interface ResponsesModelDiff
  extends Diff<ResponsesModel>,
    MapDiff<ResponseModelDiff>,
    SpecificationExtensionsModelDiff {
  readonly default: ResponseModelDiff | undefined;
}

export interface SecurityRequirementModelDiff
  extends Diff<SecurityRequirementModel>,
    SpecificationExtensionsModelDiff {}

export interface TagModelDiff extends Diff<TagModel>, SpecificationExtensionsModelDiff {
  readonly name: Diff<string> | undefined;
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly externalDocs: ExternalDocumentationModelDiff | undefined;
}

export interface ExternalDocumentationModelDiff
  extends Diff<Nullable<ExternalDocumentationModel>>,
    SpecificationExtensionsModelDiff {
  readonly description: Diff<Nullable<CommonMarkString>> | undefined;
  readonly url: Diff<URLString> | undefined;
}

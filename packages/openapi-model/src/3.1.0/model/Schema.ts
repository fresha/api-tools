import assert from 'assert';

import { Discriminator } from './Discriminator';
import { ExternalDocumentation } from './ExternalDocumentation';
import { Node } from './Node';
import { XML } from './XML';

import type { Components } from './Components';
import type { Header } from './Header';
import type { MediaType } from './MediaType';
import type { Operation } from './Operation';
import type { ParameterBase } from './Parameter';
import type { SchemaFormat, SchemaModel, SchemaType } from './types';
import type { CommonMarkString, JSONValue, Nullable, URLString } from '@fresha/api-tools-core';

type SchemaParent = Components | Operation | ParameterBase | Header | MediaType | Schema;

export class Schema extends Node<SchemaParent> implements SchemaModel {
  #title: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  #defaultValue: JSONValue | undefined;
  #examples: JSONValue[];
  #types: Set<SchemaType>;
  #format: Nullable<SchemaFormat>;
  #allowedValues: Set<JSONValue>;
  #minLength: Nullable<number>;
  #maxLength: Nullable<number>;
  #pattern: Nullable<string>;
  #minimum: Nullable<number>;
  #exclusiveMinimum: Nullable<number>;
  #maximum: Nullable<number>;
  #exclusiveMaximum: Nullable<number>;
  #multipleOf: Nullable<number>;
  #properties: Map<string, Schema>;
  #minProperties: Nullable<number>;
  #maxProperties: Nullable<number>;
  #patternProperties: Map<string, Schema>;
  #additionalProperties: Schema | false;
  #requiredProperties: Set<string>;
  #propertyNamesSchema: Nullable<Schema>;
  #items: Nullable<Schema>;
  #minItems: Nullable<number>;
  #maxItems: Nullable<number>;
  #uniqueItems: boolean;
  #containsSchema: Nullable<Schema>;
  #minContains: Nullable<number>;
  #maxContains: Nullable<number>;
  #prefixItems: Schema[];
  #allOf: Schema[];
  #anyOf: Schema[];
  #oneOf: Schema[];
  #not: Nullable<Schema>;
  #discriminator: Nullable<Discriminator>;
  #xml: Nullable<XML>;
  #extenalDocs: Nullable<ExternalDocumentation>;

  constructor(parent: SchemaParent) {
    super(parent);
    this.#title = null;
    this.#description = null;
    this.#defaultValue = undefined;
    this.#examples = [];
    this.#types = new Set<SchemaType>();
    this.#format = null;
    this.#allowedValues = new Set<JSONValue>();
    this.#minLength = null;
    this.#maxLength = null;
    this.#pattern = null;
    this.#minimum = null;
    this.#exclusiveMinimum = null;
    this.#maximum = null;
    this.#exclusiveMaximum = null;
    this.#multipleOf = null;
    this.#properties = new Map<string, Schema>();
    this.#minProperties = null;
    this.#maxProperties = null;
    this.#patternProperties = new Map<string, Schema>();
    this.#additionalProperties = false;
    this.#requiredProperties = new Set<string>();
    this.#propertyNamesSchema = null;
    this.#items = null;
    this.#minItems = null;
    this.#maxItems = null;
    this.#uniqueItems = false;
    this.#containsSchema = null;
    this.#minContains = null;
    this.#maxContains = null;
    this.#prefixItems = [];
    this.#allOf = [];
    this.#anyOf = [];
    this.#oneOf = [];
    this.#not = null;
    this.#discriminator = null;
    this.#extenalDocs = null;
    this.#xml = null;
  }

  get title(): Nullable<string> {
    return this.#title;
  }

  set title(value: Nullable<string>) {
    this.#title = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get defaultValue(): JSONValue | undefined {
    return this.#defaultValue;
  }

  set defaultValue(value: JSONValue | undefined) {
    this.#defaultValue = value;
  }

  get exampleCount(): number {
    return this.#examples.length;
  }

  examples(): IterableIterator<JSONValue> {
    return this.#examples.values();
  }

  exampleAt(index: number): JSONValue {
    return this.#examples[index];
  }

  deleteExampleAt(index: number): void {
    this.#examples.splice(index, 1);
  }

  clearExamples(): void {
    this.#examples.splice(0, this.#examples.length);
  }

  get typeCount(): number {
    return this.#types.size;
  }

  types(): IterableIterator<SchemaType> {
    return this.#types.values();
  }

  hasType(value: SchemaType): boolean {
    return this.#types.has(value);
  }

  addType(value: SchemaType): void {
    this.#types.add(value);
  }

  deleteType(value: SchemaType): void {
    // TODO clean properties relevant to the type which is removed
    this.#types.delete(value);
  }

  clearTypes(): void {
    this.#types.clear();
  }

  get format(): Nullable<SchemaFormat> {
    return this.#format;
  }

  set format(value: Nullable<SchemaFormat>) {
    this.#format = value;
  }

  get allowedValueCount(): number {
    return this.#allowedValues.size;
  }

  allowedValues(): IterableIterator<JSONValue> {
    return this.#allowedValues.values();
  }

  hasAllowedValue(value: JSONValue): boolean {
    return this.#allowedValues.has(value);
  }

  addAllowedValue(value: JSONValue): void {
    this.#allowedValues.add(value);
  }

  removeAllowedValue(value: JSONValue): void {
    this.#allowedValues.delete(value);
  }

  clearAllowedValues(): void {
    this.#allowedValues.clear();
  }

  get minLength(): Nullable<number> {
    return this.#minLength;
  }

  set minLength(value: Nullable<number>) {
    this.#minLength = value;
  }

  get maxLength(): Nullable<number> {
    return this.#maxLength;
  }

  set maxLength(value: Nullable<number>) {
    this.#maxLength = value;
  }

  get pattern(): Nullable<string> {
    return this.#pattern;
  }

  set pattern(value: Nullable<string>) {
    this.#pattern = value;
  }

  get minimum(): Nullable<number> {
    return this.#minimum;
  }

  set minimum(value: Nullable<number>) {
    this.#minimum = value;
  }

  get exclusiveMinimum(): Nullable<number> {
    return this.#exclusiveMinimum;
  }

  set exclusiveMinimum(value: Nullable<number>) {
    this.#exclusiveMinimum = value;
  }

  get maximum(): Nullable<number> {
    return this.#maximum;
  }

  set maximum(value: Nullable<number>) {
    this.#maximum = value;
  }

  get exclusiveMaximum(): Nullable<number> {
    return this.#exclusiveMaximum;
  }

  set exclusiveMaximum(value: Nullable<number>) {
    this.#exclusiveMaximum = value;
  }

  get multipleOf(): Nullable<number> {
    return this.#multipleOf;
  }

  set multipleOf(value: Nullable<number>) {
    this.#multipleOf = value;
  }

  get propertyCount(): number {
    return this.#properties.size;
  }

  propertyNames(): IterableIterator<string> {
    return this.#properties.keys();
  }

  properties(): IterableIterator<[string, Schema]> {
    return this.#properties.entries();
  }

  hasProperty(name: string): boolean {
    return this.#properties.has(name);
  }

  getProperty(name: string): Schema {
    const result = this.#properties.get(name);
    assert(result, `Property '${name}' does not exist`);
    return result;
  }

  addProperty(name: string): Schema {
    assert(!this.hasProperty(name), `Property '${name}' already exists`);
    const result = new Schema(this);
    this.#properties.set(name, result);
    return result;
  }

  deleteProperty(name: string): void {
    const prop = this.#properties.get(name);
    if (prop) {
      prop.dispose();
      this.#properties.delete(name);
    }
  }

  clearProperties(): void {
    this.#properties.forEach(p => p.dispose());
    this.#properties.clear();
  }

  get minProperties(): Nullable<number> {
    return this.#minProperties;
  }

  set minProperties(value: Nullable<number>) {
    this.#minProperties = value;
  }

  get maxProperties(): Nullable<number> {
    return this.#maxProperties;
  }

  set maxProperties(value: Nullable<number>) {
    this.#maxProperties = value;
  }

  get patternPropertyCount(): number {
    return this.#patternProperties.size;
  }

  patternPropertyNames(): IterableIterator<string> {
    return this.#patternProperties.keys();
  }

  patternProperties(): IterableIterator<[string, Schema]> {
    return this.#patternProperties.entries();
  }

  hasPatternProperty(name: string): boolean {
    return this.#patternProperties.has(name);
  }

  getPatternProperty(name: string): Schema {
    const result = this.#patternProperties.get(name);
    assert(result, `Missing pattern property '${name}'`);
    return result;
  }

  addPatternProperty(name: string): Schema {
    assert(!this.hasPatternProperty(name), `Pattern property '${name}' already exists`);
    const result = new Schema(this);
    this.#patternProperties.set(name, result);
    return result;
  }

  deletePatternProperty(name: string): void {
    const prop = this.#patternProperties.get(name);
    if (prop) {
      prop.dispose();
      this.#patternProperties.delete(name);
    }
  }

  clearPatternProperties(): void {
    this.#properties.forEach(p => p.dispose());
    this.#properties.clear();
  }

  get additionalProperties(): Schema | false {
    return this.#additionalProperties;
  }

  set(value: false) {
    this.#additionalProperties = value;
  }

  addAdditionalProperties(): Schema {
    assert(!this.#additionalProperties, 'Additional properties schema is already set');
    this.#additionalProperties = new Schema(this);
    return this.#additionalProperties;
  }

  disableAdditionalProperties(): void {
    if (this.#additionalProperties) {
      this.#additionalProperties.dispose();
    }
    this.#additionalProperties = false;
  }

  requiredPropertyNames(): IterableIterator<string> {
    return this.#requiredProperties.keys();
  }

  *requiredProperties(): IterableIterator<[string, Schema]> {
    for (const name of this.#requiredProperties) {
      yield [name, this.getProperty(name)];
    }
  }

  isPropertyRequired(name: string): boolean {
    return this.#requiredProperties.has(name);
  }

  setPropertyRequired(name: string, value: boolean): void {
    if (value) {
      this.#requiredProperties.add(name);
    } else {
      this.#requiredProperties.delete(name);
    }
  }

  get propertyNamesSchema(): Nullable<Schema> {
    return this.#propertyNamesSchema;
  }

  addPropertyNamesSchema(): Schema {
    assert(!this.#propertyNamesSchema, 'Property names schema is already set');
    this.#propertyNamesSchema = new Schema(this);
    return this.#propertyNamesSchema;
  }

  deletePropertyNamesSchema(): void {
    if (this.#propertyNamesSchema) {
      this.#propertyNamesSchema.dispose();
      this.#propertyNamesSchema = null;
    }
  }

  get items(): Nullable<Schema> {
    return this.#items;
  }

  addItems(): Schema {
    assert(!this.#items, 'Items schema is already set');
    this.#items = new Schema(this);
    return this.#items;
  }

  deleteItems(): void {
    if (this.#items) {
      this.#items.dispose();
      this.#items = null;
    }
  }

  get minItems(): Nullable<number> {
    return this.#minItems;
  }

  set minItems(value: Nullable<number>) {
    assert(value == null || value >= 0, `minItems cannot be negative`);
    this.#minItems = value;
  }

  get maxItems(): Nullable<number> {
    return this.#maxItems;
  }

  set maxItems(value: Nullable<number>) {
    assert(value == null || value >= 0, `maxItems cannot be negative`);
    this.#maxItems = value;
  }

  get uniqueItems(): boolean {
    return this.#uniqueItems;
  }

  set uniqueItems(value: boolean) {
    this.#uniqueItems = value;
  }

  get containsSchema(): Nullable<Schema> {
    return this.#containsSchema;
  }

  addContainsSchema(): Schema {
    assert(!this.#containsSchema, 'contains schema is set');
    this.#containsSchema = new Schema(this);
    return this.#containsSchema;
  }

  deleteContainsSchema(): void {
    if (this.#containsSchema) {
      this.#containsSchema.dispose();
      this.#containsSchema = null;
    }
  }

  get minContains(): Nullable<number> {
    return this.#minContains;
  }

  set minContains(value: Nullable<number>) {
    this.#minContains = value;
  }

  get maxContains(): Nullable<number> {
    return this.#maxContains;
  }

  set maxContains(value: Nullable<number>) {
    this.#maxContains = value;
  }

  get prefixItemsCount(): number {
    return this.#prefixItems.length;
  }

  prefixItemsAt(index: number): Schema {
    return this.#prefixItems[index];
  }

  addPrefixItem(): Schema {
    const result = new Schema(this);
    this.#prefixItems.push(result);
    return result;
  }

  deletePrefixItemAt(index: number): void {
    const item = this.#prefixItems[index];
    if (item) {
      item.dispose();
      this.#prefixItems.splice(index, 1);
    }
  }

  clearPrefixItems(): void {
    this.#prefixItems.forEach(s => s.dispose());
    this.#prefixItems.splice(0, this.#prefixItems.length);
  }

  get allOfCount(): number {
    return this.#allOf.length;
  }

  allOf(): IterableIterator<Schema> {
    return this.#allOf.values();
  }

  allOfAt(index: number): Schema {
    return this.#allOf[index];
  }

  addAllOf(): Schema {
    const result = new Schema(this);
    this.#allOf.push(result);
    return result;
  }

  deleteAllOfAt(index: number): void {
    const item = this.#allOf[index];
    if (item) {
      item.dispose();
      this.#allOf.splice(index, 1);
    }
  }

  clearAllOf(): void {
    this.#allOf.forEach(s => s.dispose());
    this.#allOf.splice(0, this.#allOf.length);
  }

  get anyOfCount(): number {
    return this.#anyOf.length;
  }

  anyOf(): IterableIterator<Schema> {
    return this.#anyOf.values();
  }

  anyOfAt(index: number): Schema {
    return this.#anyOf[index];
  }

  addAnyOf(): Schema {
    const result = new Schema(this);
    this.#anyOf.push(result);
    return result;
  }

  deleteAnyOfAt(index: number): void {
    const item = this.#anyOf[index];
    if (item) {
      item.dispose();
      this.#anyOf.splice(index, 1);
    }
  }

  clearAnyOf(): void {
    this.#anyOf.forEach(s => s.dispose());
    this.#anyOf.splice(0, this.#anyOf.length);
  }

  get oneOfCount(): number {
    return this.#oneOf.length;
  }

  oneOf(): IterableIterator<Schema> {
    return this.#oneOf.values();
  }

  oneOfAt(index: number): Schema {
    return this.#oneOf[index];
  }

  addOneOf(): Schema {
    const result = new Schema(this);
    this.#oneOf.push(result);
    return result;
  }

  deleteOneOfAt(index: number): void {
    const item = this.#oneOf[index];
    if (item) {
      item.dispose();
      this.#oneOf.splice(index, 1);
    }
  }

  clearOneOf(): void {
    this.#oneOf.forEach(s => s.dispose());
    this.#oneOf.splice(0, this.#oneOf.length);
  }

  get not(): Nullable<Schema> {
    return this.#not;
  }

  addNot(): Schema {
    assert(!this.#not, 'Not schema is already set');
    this.#not = new Schema(this);
    return this.#not;
  }

  deleteNot(): void {
    if (this.#not) {
      this.#not.dispose();
      this.#not = null;
    }
  }

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#extenalDocs;
  }

  addExternalDocs(url: URLString): ExternalDocumentation {
    assert(!this.#extenalDocs, 'externalDocs is already set');
    this.#extenalDocs = new ExternalDocumentation(this, url);
    return this.#extenalDocs;
  }

  deleteExternalDocs(): void {
    if (this.#extenalDocs) {
      this.#extenalDocs.dispose();
      this.#extenalDocs = null;
    }
  }

  get xml(): Nullable<XML> {
    return this.#xml;
  }

  addXML(): XML {
    assert(!this.#xml, 'xml is already set');
    this.#xml = new XML(this);
    return this.#xml;
  }

  deleteXML(): void {
    if (this.#xml) {
      this.#xml.dispose();
      this.#xml = null;
    }
  }

  get discriminator(): Nullable<Discriminator> {
    return this.#discriminator;
  }

  addDiscriminator(propertyName: string): Discriminator {
    assert(!this.#discriminator, 'Discriminator is already set');
    this.#discriminator = new Discriminator(this, propertyName);
    return this.#discriminator;
  }

  deleteDiscriminator(): void {
    if (this.#discriminator) {
      this.#discriminator.dispose();
      this.#discriminator = null;
    }
  }
}

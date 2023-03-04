import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { DiscriminatorModel, DiscriminatorModelParent } from './types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export class Discriminator
  extends BasicNode<DiscriminatorModelParent>
  implements DiscriminatorModel
{
  #propertyName: string;
  readonly #mappings: Map<string, string>;

  constructor(parent: DiscriminatorModelParent, propertyName: string) {
    super(parent);
    this.#propertyName = propertyName;
    this.#mappings = new Map<string, string>();
  }

  get propertyName(): string {
    return this.#propertyName;
  }

  set propertyName(value: string) {
    this.#propertyName = value;
  }

  get mappingCount(): number {
    return this.#mappings.size;
  }

  mappingKeys(): IterableIterator<string> {
    return this.#mappings.keys();
  }

  mappings(): IterableIterator<[string, string]> {
    return this.#mappings.entries();
  }

  hasMapping(key: string): boolean {
    return this.#mappings.has(key);
  }

  getMapping(key: string): string | undefined {
    return this.#mappings.get(key);
  }

  getMappingOrThrow(key: string): string {
    const result = this.getMapping(key);
    assert(result !== undefined, `Cannot find mapping '${key}'`);
    return result;
  }

  setMapping(key: string, value: string): void {
    this.#mappings.set(key, value);
  }

  deleteMapping(key: string): void {
    this.#mappings.delete(key);
  }

  clearMappings(): void {
    this.#mappings.clear();
  }
}

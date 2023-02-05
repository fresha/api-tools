import { Node } from './Node';

import type { Schema } from './Schema';
import type { DiscriminatorModel } from './types';

export type DiscriminatorParent = Schema;

export class Discriminator extends Node<DiscriminatorParent> implements DiscriminatorModel {
  #propertyName: string;
  readonly #mappings: Map<string, string>;

  constructor(parent: DiscriminatorParent, propertyName: string) {
    super(parent);
    this.#propertyName = propertyName;
    this.#mappings = new Map<string, string>();
  }

  get propertyName(): string {
    return this.#propertyName;
  }

  get mappingCount(): number {
    return this.#mappings.size;
  }

  mapping(): IterableIterator<[string, string]> {
    return this.#mappings.entries();
  }

  hasMapping(key: string): boolean {
    return this.#mappings.has(key);
  }

  addMapping(key: string, value: string): void {
    this.#mappings.set(key, value);
  }

  deleteMapping(key: string): void {
    this.#mappings.delete(key);
  }

  clearMappings(): void {
    this.#mappings.clear();
  }
}

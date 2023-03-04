/**
 * Bi-directional map. It is a map which also provides mapping from values to keys.
 */
export class BidiMap<K, V> implements Map<K, V> {
  private items: Map<K, V>;
  private inverted: Map<V, K>;

  constructor() {
    this.items = new Map<K, V>();
    this.inverted = new Map<V, K>();
  }

  clear(): void {
    this.items.clear();
    this.inverted.clear();
  }

  delete(key: K): boolean {
    const value = this.items.get(key);
    if (value !== undefined) {
      this.items.delete(key);
      this.inverted.delete(value);
      return true;
    }
    return false;
  }

  deleteValue(value: V): boolean {
    const key = this.inverted.get(value);
    if (key) {
      this.items.delete(key);
      this.inverted.delete(value);
      return true;
    }
    return false;
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {
    this.items.forEach(callbackfn, thisArg);
  }

  get(key: K): V | undefined {
    return this.items.get(key);
  }

  getKey(value: V): K | undefined {
    return this.inverted.get(value);
  }

  has(key: K): boolean {
    return this.items.has(key);
  }

  hasValue(value: V): boolean {
    return this.inverted.has(value);
  }

  set(key: K, value: V): this {
    this.items.set(key, value);
    this.inverted.set(value, key);
    return this;
  }

  get size(): number {
    return this.items.size;
  }

  entries(): IterableIterator<[K, V]> {
    return this.items.entries();
  }

  keys(): IterableIterator<K> {
    return this.items.keys();
  }

  values(): IterableIterator<V> {
    return this.items.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.items.entries();
  }

  get [Symbol.toStringTag](): string {
    return this.items[Symbol.toStringTag];
  }
}

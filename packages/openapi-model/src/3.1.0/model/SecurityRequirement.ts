import { Node } from './Node';

import type { OpenAPI } from './OpenAPI';
import type { Operation } from './Operation';
import type { SecuritySchema } from './SecuritySchema';
import type { SecurityRequirementModel } from './types';

type SecurityRequirementParent = OpenAPI | Operation;

export class SecurityRequirement
  extends Node<SecurityRequirementParent>
  implements SecurityRequirementModel
{
  readonly #scopes: Map<SecuritySchema, Set<string>>;

  constructor(parent: SecurityRequirementParent) {
    super(parent);
    this.#scopes = new Map<SecuritySchema, Set<string>>();
  }

  get schemaCount(): number {
    return this.#scopes.size;
  }

  schemas(): IterableIterator<SecuritySchema> {
    return this.#scopes.keys();
  }

  scopeCount(schema: SecuritySchema): number {
    return this.#scopes.get(schema)?.size ?? 0;
  }

  *scopes(schema: SecuritySchema): IterableIterator<string> {
    const scopes = this.#scopes.get(schema);
    if (scopes) {
      for (const scope of scopes) {
        yield scope;
      }
    }
  }

  hasScope(schema: SecuritySchema): boolean {
    return this.#scopes.has(schema);
  }

  addScope(schema: SecuritySchema, scope: string): void {
    let scopes = this.#scopes.get(schema);
    if (!scopes) {
      scopes = new Set<string>();
      this.#scopes.set(schema, scopes);
    }
    scopes.add(scope);
  }

  deleteScope(schema: SecuritySchema, scope: string): void {
    this.#scopes.get(schema)?.delete(scope);
  }

  clearScopes(schema: SecuritySchema): void {
    this.#scopes.delete(schema);
  }

  clearAllScopes(): void {
    this.#scopes.clear();
  }
}

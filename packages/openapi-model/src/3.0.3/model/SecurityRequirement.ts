import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { SecurityRequirementModel, SecurityRequirementModelParent } from './types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export class SecurityRequirement
  extends BasicNode<SecurityRequirementModelParent>
  implements SecurityRequirementModel
{
  readonly #scopes: Map<string, Set<string>>;

  constructor(parent: SecurityRequirementModelParent) {
    super(parent);
    this.#scopes = new Map<string, Set<string>>();
  }

  get schemaCount(): number {
    return this.#scopes.size;
  }

  schemaNames(): IterableIterator<string> {
    return this.#scopes.keys();
  }

  hasSchema(schemaName: string): boolean {
    return this.#scopes.has(schemaName);
  }

  addSchema(schemaName: string, ...scopes: string[]): void {
    assert(!this.#scopes.has(schemaName), `Schema '${schemaName}' already exists`);
    this.#scopes.set(schemaName, new Set<string>(scopes));
  }

  deleteSchema(schemaName: string): void {
    this.#scopes.delete(schemaName);
  }

  clearSchemas(): void {
    this.#scopes.clear();
  }

  scopeCount(schemaName: string): number {
    return this.#scopes.get(schemaName)?.size ?? 0;
  }

  getScopes(schemaName: string): IterableIterator<string> {
    const scopes = this.#scopes.get(schemaName);
    assert(scopes !== undefined, `Security schema '${schemaName}' is not referenced`);
    return scopes.values();
  }

  addScopes(schemaName: string, ...scopes: string[]): void {
    const existingScopes = this.#scopes.get(schemaName);
    assert(existingScopes !== undefined, `Security schema '${schemaName}' is not referenced`);
    for (const scope of scopes) {
      existingScopes.add(scope);
    }
  }

  deleteScopes(schemaName: string, ...scopes: string[]): void {
    const existingScopes = this.#scopes.get(schemaName);
    assert(existingScopes !== undefined, `Security schema '${schemaName}' is not referenced`);
    for (const scope of scopes) {
      existingScopes.delete(scope);
    }
  }

  clearScopes(schemaName: string): void {
    const scopes = this.#scopes.get(schemaName);
    assert(scopes !== undefined, `Security schema '${schemaName}' is not referenced`);
    scopes.clear();
  }
}

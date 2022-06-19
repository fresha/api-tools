import type { IRelationship } from './types';

export class Relationship implements IRelationship {
  minCardinality: number;
  maxCardinality: number;

  constructor() {
    this.minCardinality = 0;
    this.maxCardinality = 1;
  }
}

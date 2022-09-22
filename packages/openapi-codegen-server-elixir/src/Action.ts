import console from 'console';

import type { Controller } from './Controller';

export class Action {
  private readonly controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  generateCode(): void {
    console.log(this.controller);
  }
}

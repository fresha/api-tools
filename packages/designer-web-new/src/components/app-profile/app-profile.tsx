import { Component, Element, Prop, h } from '@stencil/core';
import { MatchResults } from '@stencil-community/router';

import { generate } from '../../codegen.worker';

(window as any).testGen = async () => {
  const res = await generate();

  window.console.log('Outside worker');
  window.console.log(res);
};

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.css',
  shadow: true,
})
export class AppProfile {
  @Prop() match: MatchResults;
  @Element() el: HTMLElement;

  normalize(name: string): string {
    return name;
  }

  render() {
    if (this.match && this.match.params.name) {
      return (
        <div class="app-profile">
        </div>
      );
    }
  }
}

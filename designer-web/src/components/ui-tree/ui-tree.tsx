import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-tree',
  styleUrl: 'ui-tree.scss',
  shadow: true,
})
export class UITree {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}

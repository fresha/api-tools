import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-collapsible',
  styleUrl: 'ui-collapsible.scss',
  shadow: true,
})
export class UiCollapsible {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}

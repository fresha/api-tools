import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-toolbar',
  styleUrl: 'ui-toolbar.scss',
  shadow: true,
})
export class UIToolbar {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}

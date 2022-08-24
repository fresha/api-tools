import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-text-field',
  styleUrl: 'ui-text-field.scss',
  shadow: true,
})
export class UiTextField {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}

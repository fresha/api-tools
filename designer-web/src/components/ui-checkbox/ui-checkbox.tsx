import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-checkbox',
  styleUrl: 'ui-checkbox.scss',
  shadow: true,
})
export class UiCheckbox {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}

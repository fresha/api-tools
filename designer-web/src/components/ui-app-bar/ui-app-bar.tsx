import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-app-bar',
  styleUrl: 'ui-app-bar.scss',
  shadow: true,
})
export class UiAppBar {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}

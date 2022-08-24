import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ui-side-bar',
  styleUrl: 'ui-side-bar.scss',
  shadow: true,
})
export class UiSideBar {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}

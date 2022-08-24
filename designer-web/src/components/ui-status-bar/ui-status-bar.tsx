import { Component, Host, h } from '@stencil/core';

export type UIStatusBarItem = {
  text: string;
};

@Component({
  tag: 'ui-status-bar',
  styleUrl: 'ui-status-bar.scss',
  shadow: true,
})
export class UIStatusBar {
  private readonly items: UIStatusBarItem[];

  constructor() {
    this.items = [];
  }

  addItem(props: UIStatusBarItem): void {
    this.items.push(props);
  }

  render() {
    return (
      <Host>
        <div class="left">
          <slot name="left"></slot>
        </div>
        <div class="right">
          <slot name="right"></slot>
        </div>
      </Host>
    );
  }
}

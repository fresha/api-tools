import { Component, Host, h, Prop } from '@stencil/core';

export type UIIconName = '' | 'account' | 'add' | 'book' | 'checklist' | 'code' | 'file' | 'files' | 'lightbulb' | 'settings-gear';
export type UIIconSize = 8 | 16 | 24 | 32 | 48 | 64 | 128;

@Component({
  tag: 'ui-icon',
  styleUrl: 'ui-icon.scss',
  shadow: true,
})
export class UIIcon {
  @Prop({ reflect: true }) name: UIIconName = '';
  @Prop({ reflect: true }) size: UIIconSize = 16;

  render() {
    return (
      <Host role='icon'></Host>
    );
  }
}

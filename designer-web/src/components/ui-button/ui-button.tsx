import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import type { UIIconName } from '../ui-icon/ui-icon';

export type UIButtonKind = 'primary' | 'secondary';

@Component({
  tag: 'ui-button',
  styleUrl: 'ui-button.scss',
  shadow: true,
})
export class UIButton {
  @Prop({ reflect: true }) kind: UIButtonKind = 'primary';
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop({ reflect: true }) icon: UIIconName | null = null;

  @Event({ eventName: 'action' }) actionEvent: EventEmitter;

  private handleClick = (): void => {
    this.actionEvent.emit();
  }

  render() {
    return (
      <Host role='button' onClick={this.handleClick}>
        {this.icon && (
          <ui-icon name={this.icon} size={16} />
        )}
        <slot></slot>
      </Host>
    );
  }
}

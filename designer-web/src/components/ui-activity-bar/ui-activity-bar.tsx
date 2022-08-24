import { Component, Event, Host, h, Listen, EventEmitter } from '@stencil/core';
import { UIIconName } from '../ui-icon/ui-icon';

export type UIActivityBarItem = {
  id: string;
  icon: UIIconName;
  title: string;
};

@Component({
  tag: 'ui-activity-bar',
  styleUrl: 'ui-activity-bar.scss',
  shadow: true,
})
export class UIActivityBar {
  @Event() action: EventEmitter<{ id: string }>;

  @Listen('activity-bar-action')
  handleAction(event: CustomEvent): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.action.emit({ id: (event.target as HTMLElement).id });
  };

  render() {
    return (
      <Host>
        <ul role='tablist' class='top'>
          <slot name='top'></slot>
        </ul>
        <ul role='tablist' class='bottom'>
          <slot name='bottom'></slot>
        </ul>
      </Host>
    );
  }
}

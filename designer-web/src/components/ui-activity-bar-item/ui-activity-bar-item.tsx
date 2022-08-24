import { Component, Event, Host, h, Prop, EventEmitter } from '@stencil/core';
import { UIIconName } from '../ui-icon/ui-icon';

@Component({
  tag: 'ui-activity-bar-item',
  styleUrl: 'ui-activity-bar-item.scss',
  shadow: true,
})
export class UiActivityBarItem {
  @Prop({ reflect: true }) icon: UIIconName = '';
  @Event({ eventName: 'activity-bar-action' }) action: EventEmitter<{ id: string }>;

  private handleClick = (): void => {
    this.action.emit();
  };

  render() {
    return (
      <Host onClick={this.handleClick}>
        <span class='active-indicator' />
        <ui-icon name={this.icon} size={24} />
      </Host>
    );
  }
}

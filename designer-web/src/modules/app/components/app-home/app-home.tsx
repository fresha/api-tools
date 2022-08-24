import { Component, h, Listen } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: true,
})
export class AppHome {
  @Listen('action', { target: 'window' })
  handleAction(event: CustomEvent): void {
    window.console.log(event);
  }

  render() {
    return (
      <div class="app-home">
        App-Home

        <ui-icon name='add' size={48}></ui-icon>
        <ui-icon name='lightbulb' size={128}></ui-icon>

        <ui-button kind='primary'>Primary</ui-button>
        <ui-button kind='secondary'>Secondary</ui-button>
      </div>
    );
  }
}

import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: true,
})
export class AppRoot {
  @State() sideBarVisible: boolean = false;

  private handleActivityBarAction = (event: CustomEvent<{ id: string }>): void => {
    console.log(event);
    this.sideBarVisible = !this.sideBarVisible;
  };

  render() {
    return (
      <div class="layout">
        <ui-activity-bar id="activity-bar" onAction={this.handleActivityBarAction}>
          <ui-activity-bar-item slot='top' id="design" icon='files' title='Design' />
          <ui-activity-bar-item slot='top' id="document" icon='book' title='Document' />
          <ui-activity-bar-item slot='top' id="codegen" icon='code' title='Generate Code' />
          <ui-activity-bar-item slot='top' id='validate' icon='checklist' title='Validate' />
          <ui-activity-bar-item slot='bottom' id='preferences' icon='settings-gear' title='Settings' />
        </ui-activity-bar>
        {this.sideBarVisible && (
          <ui-side-bar id="side-bar"></ui-side-bar>
        )}
        <ui-status-bar id="status-bar"></ui-status-bar>
        <div id="editor">
          <header>
            <h1>API Designer</h1>
          </header>

          <main>
            <stencil-router>
              <stencil-route-switch scrollTopOffset={0}>
                <stencil-route url="/" component="app-home" exact={true} />
                <stencil-route url="/profile/:name" component="app-profile" />
              </stencil-route-switch>
            </stencil-router>
          </main>
        </div>
      </div>
    );
  }
}

import { newSpecPage } from '@stencil/core/testing';
import { UiAppBar } from './ui-app-bar';

describe('ui-app-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiAppBar],
      html: `<ui-app-bar></ui-app-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-app-bar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-app-bar>
    `);
  });
});

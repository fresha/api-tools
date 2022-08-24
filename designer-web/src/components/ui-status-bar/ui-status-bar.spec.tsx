import { newSpecPage } from '@stencil/core/testing';
import { UIStatusBar } from './ui-status-bar';

describe('ui-status-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UIStatusBar],
      html: `<ui-status-bar></ui-status-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-status-bar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-status-bar>
    `);
  });
});

import { newSpecPage } from '@stencil/core/testing';
import { UIToolbar } from './ui-toolbar';

describe('ui-toolbar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UIToolbar],
      html: `<ui-toolbar></ui-toolbar>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-toolbar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-toolbar>
    `);
  });
});

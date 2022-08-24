import { newSpecPage } from '@stencil/core/testing';
import { UITree } from './ui-tree';

describe('ui-tree', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UITree],
      html: `<ui-tree></ui-tree>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-tree>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-tree>
    `);
  });
});

import { newSpecPage } from '@stencil/core/testing';
import { UIIcon } from './ui-icon';

describe('ui-icon', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UIIcon],
      html: `<ui-icon></ui-icon>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-icon>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-icon>
    `);
  });
});

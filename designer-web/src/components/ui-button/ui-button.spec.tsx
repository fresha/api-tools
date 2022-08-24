import { newSpecPage } from '@stencil/core/testing';
import { UIButton } from './ui-button';

describe('ui-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UIButton],
      html: `<ui-button></ui-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-button>
    `);
  });
});

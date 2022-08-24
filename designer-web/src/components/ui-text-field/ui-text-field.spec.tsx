import { newSpecPage } from '@stencil/core/testing';
import { UiTextField } from './ui-text-field';

describe('ui-text-field', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiTextField],
      html: `<ui-text-field></ui-text-field>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-text-field>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-text-field>
    `);
  });
});

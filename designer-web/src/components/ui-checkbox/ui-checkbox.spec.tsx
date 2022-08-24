import { newSpecPage } from '@stencil/core/testing';
import { UiCheckbox } from './ui-checkbox';

describe('ui-checkbox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox></ui-checkbox>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-checkbox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-checkbox>
    `);
  });
});

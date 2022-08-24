import { newSpecPage } from '@stencil/core/testing';
import { UiCollapsible } from './ui-collapsible';

describe('ui-collapsible', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiCollapsible],
      html: `<ui-collapsible></ui-collapsible>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-collapsible>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-collapsible>
    `);
  });
});

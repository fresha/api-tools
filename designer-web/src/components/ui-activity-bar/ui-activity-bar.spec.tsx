import { newSpecPage } from '@stencil/core/testing';
import { UIActivityBar } from './ui-activity-bar';

describe('ui-activity-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UIActivityBar],
      html: `<ui-activity-bar></ui-activity-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-activity-bar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-activity-bar>
    `);
  });
});

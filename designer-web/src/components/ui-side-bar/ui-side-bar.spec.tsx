import { newSpecPage } from '@stencil/core/testing';
import { UiSideBar } from './ui-side-bar';

describe('ui-side-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiSideBar],
      html: `<ui-side-bar></ui-side-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-side-bar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-side-bar>
    `);
  });
});

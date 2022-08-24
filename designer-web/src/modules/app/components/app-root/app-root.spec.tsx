import { newSpecPage } from '@stencil/core/testing';
import { AppRoot } from './app-root';

describe('app-root', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AppRoot],
      html: `<app-root></app-root>`,
    });
    expect(page.root).toEqualHtml(`
      <app-root>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </app-root>
    `);
  });
});

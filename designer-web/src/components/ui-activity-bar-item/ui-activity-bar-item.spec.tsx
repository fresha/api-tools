import { newSpecPage } from '@stencil/core/testing';
import { UiActivityBarItem } from './ui-activity-bar-item';

describe('ui-activity-bar-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [UiActivityBarItem],
      html: `<ui-activity-bar-item></ui-activity-bar-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-activity-bar-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-activity-bar-item>
    `);
  });
});

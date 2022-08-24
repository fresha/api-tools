import { newE2EPage } from '@stencil/core/testing';

describe('ui-activity-bar-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-activity-bar-item></ui-activity-bar-item>');

    const element = await page.find('ui-activity-bar-item');
    expect(element).toHaveClass('hydrated');
  });
});

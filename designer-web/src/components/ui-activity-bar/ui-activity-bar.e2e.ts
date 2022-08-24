import { newE2EPage } from '@stencil/core/testing';

describe('ui-activity-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-activity-bar></ui-activity-bar>');

    const element = await page.find('ui-activity-bar');
    expect(element).toHaveClass('hydrated');
  });
});

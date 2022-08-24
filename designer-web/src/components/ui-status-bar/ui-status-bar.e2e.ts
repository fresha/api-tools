import { newE2EPage } from '@stencil/core/testing';

describe('ui-status-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-status-bar></ui-status-bar>');

    const element = await page.find('ui-status-bar');
    expect(element).toHaveClass('hydrated');
  });
});

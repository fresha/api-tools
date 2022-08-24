import { newE2EPage } from '@stencil/core/testing';

describe('ui-app-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-app-bar></ui-app-bar>');

    const element = await page.find('ui-app-bar');
    expect(element).toHaveClass('hydrated');
  });
});

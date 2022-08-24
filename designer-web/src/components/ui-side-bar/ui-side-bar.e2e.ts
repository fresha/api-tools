import { newE2EPage } from '@stencil/core/testing';

describe('ui-side-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-side-bar></ui-side-bar>');

    const element = await page.find('ui-side-bar');
    expect(element).toHaveClass('hydrated');
  });
});

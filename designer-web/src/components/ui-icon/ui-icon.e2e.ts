import { newE2EPage } from '@stencil/core/testing';

describe('ui-icon', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-icon></ui-icon>');

    const element = await page.find('ui-icon');
    expect(element).toHaveClass('hydrated');
  });
});

import { newE2EPage } from '@stencil/core/testing';

describe('ui-checkbox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-checkbox></ui-checkbox>');

    const element = await page.find('ui-checkbox');
    expect(element).toHaveClass('hydrated');
  });
});

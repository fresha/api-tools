import { newE2EPage } from '@stencil/core/testing';

describe('ui-text-field', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-text-field></ui-text-field>');

    const element = await page.find('ui-text-field');
    expect(element).toHaveClass('hydrated');
  });
});

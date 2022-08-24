import { newE2EPage } from '@stencil/core/testing';

describe('ui-collapsible', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-collapsible></ui-collapsible>');

    const element = await page.find('ui-collapsible');
    expect(element).toHaveClass('hydrated');
  });
});

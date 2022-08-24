import { newE2EPage } from '@stencil/core/testing';

describe('ui-toolbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-toolbar></ui-toolbar>');

    const element = await page.find('ui-toolbar');
    expect(element).toHaveClass('hydrated');
  });
});

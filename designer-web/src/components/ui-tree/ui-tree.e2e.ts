import { newE2EPage } from '@stencil/core/testing';

describe('ui-tree', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ui-tree></ui-tree>');

    const element = await page.find('ui-tree');
    expect(element).toHaveClass('hydrated');
  });
});

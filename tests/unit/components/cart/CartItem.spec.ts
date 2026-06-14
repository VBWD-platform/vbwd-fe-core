import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CartItem from '@/components/cart/CartItem.vue';

const baseItem = {
  type: 'product',
  id: 'prod-1',
  name: 'Widget',
  price: 119,
  quantity: 2,
};

describe('CartItem', () => {
  it('renders the line total from item.price when no display amount is passed', () => {
    const wrapper = mount(CartItem, { props: { item: baseItem } });
    // 119 * 2 = 238
    expect(wrapper.get('[data-testid="cart-item-price"]').text()).toContain('238');
  });

  it('uses the parent-resolved display unit amount when provided (S85.4)', () => {
    // The fe-user parent resolves the viewer side (e.g. business ⇒ net 100) and
    // passes the chosen per-unit amount down; fe-core stays dependency-free and
    // never recomputes the side. 100 * 2 = 200.
    const wrapper = mount(CartItem, {
      props: { item: baseItem, displayUnitAmount: 100 },
    });
    const text = wrapper.get('[data-testid="cart-item-price"]').text();
    expect(text).toContain('200');
    expect(text).not.toContain('238');
  });
});

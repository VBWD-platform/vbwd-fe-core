import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CouponInput from '@/components/ui/CouponInput.vue';

describe('CouponInput', () => {
  it('renders the input + apply button by default', () => {
    const wrapper = mount(CouponInput);
    expect(wrapper.find('[data-testid="coupon-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="coupon-apply"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="coupon-applied"]').exists()).toBe(false);
  });

  it('emits "apply" with the trimmed code on apply click', async () => {
    const wrapper = mount(CouponInput);
    await wrapper.find('[data-testid="coupon-input"]').setValue('  SUMMER2026  ');
    await wrapper.find('[data-testid="coupon-apply"]').trigger('click');
    expect(wrapper.emitted('apply')).toBeTruthy();
    expect(wrapper.emitted('apply')![0]).toEqual(['SUMMER2026']);
  });

  it('does not emit "apply" for an empty code', async () => {
    const wrapper = mount(CouponInput);
    await wrapper.find('[data-testid="coupon-apply"]').trigger('click');
    expect(wrapper.emitted('apply')).toBeFalsy();
  });

  it('shows the applied state + a clear button when appliedCode is set', () => {
    const wrapper = mount(CouponInput, { props: { appliedCode: 'SUB30' } });
    const applied = wrapper.find('[data-testid="coupon-applied"]');
    expect(applied.exists()).toBe(true);
    expect(applied.text()).toContain('SUB30');
    expect(wrapper.find('[data-testid="coupon-input"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="coupon-clear"]').exists()).toBe(true);
  });

  it('emits "clear" on clear click', async () => {
    const wrapper = mount(CouponInput, { props: { appliedCode: 'SUB30' } });
    await wrapper.find('[data-testid="coupon-clear"]').trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('shows an error message when error is set', () => {
    const wrapper = mount(CouponInput, { props: { error: 'Coupon not found' } });
    const err = wrapper.find('[data-testid="coupon-error"]');
    expect(err.exists()).toBe(true);
    expect(err.text()).toBe('Coupon not found');
  });
});

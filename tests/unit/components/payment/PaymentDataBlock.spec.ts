import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import PaymentDataBlock from '@/components/payment/PaymentDataBlock.vue';
import {
  registerPaymentDataContributor,
  _resetPaymentDataContributors,
} from '@/registries/paymentDataContributors';

beforeEach(() => {
  _resetPaymentDataContributors();
});

afterEach(() => {
  _resetPaymentDataContributors();
});

describe('PaymentDataBlock', () => {
  it('renders nothing for empty metadata', () => {
    const wrapper = mount(PaymentDataBlock, { props: { metadata: {} } });
    // The component is a chrome-less list of rows — when empty it outputs no
    // rows at all (parent ``v-if`` keeps the absence clean).
    expect(wrapper.findAll('[data-testid^="payment-data-"]').length).toBe(0);
  });

  it('renders nothing for null metadata', () => {
    const wrapper = mount(PaymentDataBlock, { props: { metadata: null } });
    expect(wrapper.findAll('[data-testid^="payment-data-"]').length).toBe(0);
  });

  it('renders each contributor as a flat detail-row (label + value, no heading)', () => {
    registerPaymentDataContributor('tokens_paid', {
      label: 'Paid with tokens',
      format: (data) => `${(data as { amount: number }).amount} tokens`,
    });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { tokens_paid: { amount: 600 } } },
    });
    // No heading, no <table> wrapping — just rows.
    expect(wrapper.find('h3').exists()).toBe(false);
    expect(wrapper.find('table').exists()).toBe(false);
    const row = wrapper.find('[data-testid="payment-data-tokens_paid"]');
    expect(row.exists()).toBe(true);
    expect(row.classes()).toContain('vbwd-payment-data__row');
    expect(row.find('.vbwd-payment-data__label').text()).toBe('Paid with tokens');
    expect(row.find('.vbwd-payment-data__value').text()).toContain('600 tokens');
  });

  it('renders a stripe-style link contributor as an external <a target="_blank">', () => {
    registerPaymentDataContributor('stripe', {
      label: 'Stripe transaction',
      format: (data) => (data as { payment_intent_id: string }).payment_intent_id,
      link: (data) =>
        `https://dashboard.stripe.com/payments/${(data as { payment_intent_id: string }).payment_intent_id}`,
    });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { stripe: { payment_intent_id: 'pi_42' } } },
    });
    const link = wrapper.find('[data-testid="payment-data-stripe"] a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://dashboard.stripe.com/payments/pi_42');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
    expect(link.text()).toContain('pi_42');
  });

  it('renders plain text when contributor returns null from link()', () => {
    registerPaymentDataContributor('stripe', {
      label: 'Stripe transaction',
      format: () => 'something',
      link: () => null,
    });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { stripe: {} } },
    });
    expect(wrapper.find('[data-testid="payment-data-stripe"] a').exists()).toBe(false);
    expect(wrapper.find('[data-testid="payment-data-stripe"] .vbwd-payment-data__value').text()).toBe('something');
  });

  it('renders a contributor component receiving { data } props', () => {
    const Marker = defineComponent({
      props: { data: { type: Object, required: true } },
      setup: (props) => () =>
        h(
          'div',
          { class: 'stripe-marker' },
          `tx=${(props.data as { transaction_id: string }).transaction_id}`,
        ),
    });
    registerPaymentDataContributor('stripe', { component: Marker });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { stripe: { transaction_id: 'pi_42' } } },
    });
    expect(wrapper.find('.stripe-marker').text()).toBe('tx=pi_42');
  });

  it('falls back to JSON for unknown namespaces (still surfaces the data)', () => {
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { mystery: { x: 1 } } },
    });
    const row = wrapper.find('[data-testid="payment-data-mystery"]');
    expect(row.exists()).toBe(true);
    expect(row.find('.vbwd-payment-data__label').text()).toBe('mystery');
    expect(row.text()).toContain('"x":1');
  });

  it('sorts entries by ``order`` then key', () => {
    registerPaymentDataContributor('tokens_paid', { label: 'Tokens', format: () => 'T', order: 10 });
    registerPaymentDataContributor('invoice', { label: 'Invoice', format: () => 'I', order: 1 });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { tokens_paid: { amount: 1 }, invoice: { ts: 2 } } },
    });
    // Filter to per-entry rows (the wrapper also carries data-testid="payment-data-block").
    const rows = wrapper
      .findAll('[data-testid^="payment-data-"]')
      .filter((node) => node.attributes('data-testid') !== 'payment-data-block');
    expect(rows[0].attributes('data-testid')).toBe('payment-data-invoice');
    expect(rows[1].attributes('data-testid')).toBe('payment-data-tokens_paid');
  });

  it('skips entries with null/undefined payload', () => {
    registerPaymentDataContributor('tokens_paid', { label: 'Tokens', format: () => 'T' });
    const wrapper = mount(PaymentDataBlock, {
      props: { metadata: { tokens_paid: null, invoice: undefined } },
    });
    expect(wrapper.findAll('[data-testid^="payment-data-"]').length).toBe(0);
  });
});

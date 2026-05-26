import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PaymentInformationBlock from '@/components/payment/PaymentInformationBlock.vue';
import {
  registerPaymentInformationContributor,
  _resetPaymentInformationContributors,
} from '@/registries/paymentInformationContributors';

beforeEach(() => {
  _resetPaymentInformationContributors();
});

afterEach(() => {
  _resetPaymentInformationContributors();
});

describe('PaymentInformationBlock', () => {
  it('renders nothing when no contributor matches', () => {
    const wrapper = mount(PaymentInformationBlock, { props: { metadata: {} } });
    expect(wrapper.find('[data-testid="payment-information-block"]').exists()).toBe(false);
  });

  it('renders a tokens contribution: two rows (Payment type / Tokens paid)', () => {
    registerPaymentInformationContributor('tokens_paid', {
      rows: (data) => [
        { label: 'Payment type', value: 'Tokens', order: 1 },
        { label: 'Tokens paid', value: `${(data as { amount: number }).amount} tokens`, order: 2 },
      ],
    });
    const wrapper = mount(PaymentInformationBlock, {
      props: { metadata: { tokens_paid: { amount: 900 } }, heading: 'Payment Information' },
    });
    expect(wrapper.find('[data-testid="payment-information-block"]').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('Payment Information');
    const rows = wrapper.findAll('tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].find('th').text()).toBe('Payment type');
    expect(rows[0].find('td').text()).toBe('Tokens');
    expect(rows[1].find('th').text()).toBe('Tokens paid');
    expect(rows[1].find('td').text()).toBe('900 tokens');
  });

  it('falls back via matchPaymentMethod when the namespace is absent', () => {
    registerPaymentInformationContributor('tokens_paid', {
      matchPaymentMethod: ['token_balance', 'token_payment'],
      rows: () => [
        { label: 'Payment type', value: 'Tokens', order: 1 },
        { label: 'Tokens paid', value: '0 tokens', order: 2 },
      ],
    });
    const wrapper = mount(PaymentInformationBlock, {
      props: { metadata: {}, paymentMethod: 'token_balance' },
    });
    const rows = wrapper.findAll('tr');
    expect(rows).toHaveLength(2);
    expect(rows[1].find('td').text()).toBe('0 tokens');
  });

  it('renders a row link as an external <a target="_blank">', () => {
    registerPaymentInformationContributor('stripe', {
      rows: () => [
        { label: 'Payment type', value: 'Stripe' },
        { label: 'Transaction id', value: 'pi_42', link: 'https://dashboard.stripe.com/payments/pi_42' },
      ],
    });
    const wrapper = mount(PaymentInformationBlock, {
      props: { metadata: { stripe: { payment_intent_id: 'pi_42' } } },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://dashboard.stripe.com/payments/pi_42');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
  });

  it('sorts by contributor.order then row.order', () => {
    registerPaymentInformationContributor('stripe', {
      order: 20,
      rows: () => [
        { label: 'Stripe-A', value: '1', order: 1 },
        { label: 'Stripe-B', value: '2', order: 2 },
      ],
    });
    registerPaymentInformationContributor('tokens_paid', {
      order: 10,
      rows: () => [
        { label: 'Tokens-A', value: '1', order: 1 },
        { label: 'Tokens-B', value: '2', order: 2 },
      ],
    });
    const wrapper = mount(PaymentInformationBlock, {
      props: { metadata: { tokens_paid: {}, stripe: {} } },
    });
    const labels = wrapper.findAll('th').map((node) => node.text());
    expect(labels).toEqual(['Tokens-A', 'Tokens-B', 'Stripe-A', 'Stripe-B']);
  });
});

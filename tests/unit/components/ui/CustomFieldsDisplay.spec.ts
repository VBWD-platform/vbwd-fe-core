import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CustomFieldsDisplay from '@/components/ui/CustomFieldsDisplay.vue';
import type { CustomFieldDef } from '@/components/ui/types';

const defs: CustomFieldDef[] = [
  { key: 'material', label: 'Material', type: 'text', sort_order: 1 },
  { key: 'weight', label: 'Weight', type: 'number', sort_order: 2 },
  { key: 'in_stock', label: 'In stock', type: 'bool', sort_order: 3 },
  { key: 'released', label: 'Released', type: 'date', sort_order: 4 },
  { key: 'colors', label: 'Colors', type: 'multiselect', sort_order: 5 },
];

describe('CustomFieldsDisplay', () => {
  it('renders nothing when there are no values', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: { customFields: {}, fieldDefs: defs },
    });
    expect(wrapper.find('[data-testid="custom-fields-display"]').exists()).toBe(false);
  });

  it('renders labelled rows ordered by sort_order, formatting by type', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: {
        customFields: {
          material: 'cotton',
          weight: 1.5,
          in_stock: true,
          colors: ['red', 'blue'],
        },
        fieldDefs: defs,
      },
    });
    const rows = wrapper.findAll('[data-testid="custom-field-row"]');
    expect(rows).toHaveLength(4);
    expect(rows[0].text()).toContain('Material');
    expect(rows[0].text()).toContain('cotton');
    expect(rows[1].text()).toContain('1.5');
    expect(rows[2].text()).toContain('Yes');
    expect(rows[3].text()).toContain('red, blue');
  });

  it('formats a false bool as No', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: { customFields: { in_stock: false }, fieldDefs: defs },
    });
    expect(wrapper.find('[data-testid="custom-field-row"]').text()).toContain('No');
  });

  it('formats a date value via locale date', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: { customFields: { released: '2026-06-13' }, fieldDefs: defs },
    });
    const expected = new Date('2026-06-13').toLocaleDateString();
    expect(wrapper.find('[data-testid="custom-field-row"]').text()).toContain(expected);
  });

  it('only renders fields present in the values map', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: { customFields: { material: 'wool' }, fieldDefs: defs },
    });
    expect(wrapper.findAll('[data-testid="custom-field-row"]')).toHaveLength(1);
  });

  it('falls back to raw key/value pairs when no defs are supplied', () => {
    const wrapper = mount(CustomFieldsDisplay, {
      props: { customFields: { foo: 'bar' }, fieldDefs: [] },
    });
    const row = wrapper.find('[data-testid="custom-field-row"]');
    expect(row.text()).toContain('foo');
    expect(row.text()).toContain('bar');
  });
});

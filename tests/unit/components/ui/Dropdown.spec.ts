import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dropdown from '@/components/ui/Dropdown.vue';

describe('Dropdown', () => {
  it('opens and closes the menu via the trigger', async () => {
    const wrapper = mount(Dropdown, {
      props: { items: [{ label: 'One' }, { label: 'Two' }] },
    });

    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(false);

    await wrapper.find('.vbwd-dropdown-trigger').trigger('click');
    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(true);

    await wrapper.find('.vbwd-dropdown-trigger').trigger('click');
    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(false);
  });

  it('emits select and closes when a built-in item is clicked', async () => {
    const wrapper = mount(Dropdown, {
      props: { items: [{ label: 'One' }, { label: 'Two' }] },
    });

    await wrapper.find('.vbwd-dropdown-trigger').trigger('click');
    await wrapper.findAll('.vbwd-dropdown-item')[0].trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(false);
  });

  it('exposes close to the default slot so custom items can dismiss the menu', async () => {
    const wrapper = mount(Dropdown, {
      slots: {
        default: `<template #default="{ close }">
          <div class="custom-item" @click="close">Custom action</div>
        </template>`,
      },
    });

    await wrapper.find('.vbwd-dropdown-trigger').trigger('click');
    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(true);

    await wrapper.find('.custom-item').trigger('click');
    expect(wrapper.find('.vbwd-dropdown-menu').exists()).toBe(false);
  });
});

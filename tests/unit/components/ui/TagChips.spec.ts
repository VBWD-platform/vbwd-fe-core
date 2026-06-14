import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TagChips from '@/components/ui/TagChips.vue';

describe('TagChips', () => {
  it('renders nothing when there are no tags', () => {
    const wrapper = mount(TagChips, { props: { tags: [] } });
    expect(wrapper.find('[data-testid="tag-chips"]').exists()).toBe(false);
  });

  it('renders string slugs as chips using the slug as the label', () => {
    const wrapper = mount(TagChips, { props: { tags: ['featured', 'sale'] } });
    const chips = wrapper.findAll('[data-testid="tag-chip"]');
    expect(chips).toHaveLength(2);
    expect(chips[0].text()).toBe('featured');
    expect(chips[1].text()).toBe('sale');
  });

  it('renders object tags with name and color', () => {
    const wrapper = mount(TagChips, {
      props: {
        tags: [{ slug: 'sale', name: 'On Sale', color: '#ff0000' }],
      },
    });
    const chip = wrapper.find('[data-testid="tag-chip"]');
    expect(chip.text()).toBe('On Sale');
    expect(chip.attributes('style')).toContain('background-color');
  });

  it('falls back to the slug when an object tag has no name', () => {
    const wrapper = mount(TagChips, {
      props: { tags: [{ slug: 'vip' }] },
    });
    expect(wrapper.find('[data-testid="tag-chip"]').text()).toBe('vip');
  });

  it('renders nothing when tags is null', () => {
    const wrapper = mount(TagChips, { props: { tags: null } });
    expect(wrapper.find('[data-testid="tag-chips"]').exists()).toBe(false);
  });
});

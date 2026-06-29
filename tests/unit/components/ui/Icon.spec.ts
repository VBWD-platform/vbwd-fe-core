import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Icon from '@/components/ui/Icon.vue';
import { ICON_PATHS, resolveIconPath, hasIcon } from '@/components/ui/icons';

describe('Icon', () => {
  it('renders an inline svg for a known name', () => {
    const wrapper = mount(Icon, { props: { name: 'dashboard' } });
    expect(wrapper.find('.vbwd-icon').exists()).toBe(true);
    const html = wrapper.html();
    expect(html).toContain('<svg');
    // dashboard is the 4-rect grid glyph
    expect(html).toContain(ICON_PATHS.dashboard.slice(0, 20));
  });

  it('exposes the icon name via data-icon', () => {
    const wrapper = mount(Icon, { props: { name: 'users' } });
    expect(wrapper.attributes('data-icon')).toBe('users');
  });

  it('uses currentColor so it inherits surrounding text colour', () => {
    const wrapper = mount(Icon, { props: { name: 'invoice' } });
    expect(wrapper.html()).toContain('stroke="currentColor"');
  });

  it('honours the size prop', () => {
    const wrapper = mount(Icon, { props: { name: 'settings', size: 32 } });
    expect(wrapper.html()).toContain('width="32"');
    expect(wrapper.html()).toContain('height="32"');
  });

  it('falls back to the default glyph for an unknown name', () => {
    const wrapper = mount(Icon, { props: { name: 'totally-unknown-icon' } });
    // The DOM serialises self-closing tags, so compare on the glyph's coords
    // rather than the raw self-closed string. resolveIconPath() covers the
    // exact fallback contract below.
    expect(wrapper.html()).toContain('<circle');
    expect(wrapper.html()).toContain('r="3"');
    expect(resolveIconPath('totally-unknown-icon')).toBe(ICON_PATHS.default);
  });

  it('resolveIconPath returns default for empty / unknown names', () => {
    expect(resolveIconPath('')).toBe(ICON_PATHS.default);
    expect(resolveIconPath(null)).toBe(ICON_PATHS.default);
    expect(resolveIconPath('nope')).toBe(ICON_PATHS.default);
    expect(resolveIconPath('dashboard')).toBe(ICON_PATHS.dashboard);
  });

  it('hasIcon distinguishes registered names from the fallback', () => {
    expect(hasIcon('dashboard')).toBe(true);
    expect(hasIcon('nope')).toBe(false);
    expect(hasIcon('')).toBe(false);
  });
});

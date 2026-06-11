import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApiKeysManager from '@/components/ui/ApiKeysManager.vue';

const sampleKeys = [
  {
    id: 'k1',
    label: 'CI pipeline',
    key_prefix: 'vbwdk_ab12',
    scopes: ['cms:posts:create'],
    ip_whitelist: ['10.0.0.0/8'],
    is_active: true,
    last_used_at: null,
  },
];

const sampleScopes = [
  { key: 'cms:posts:create', label: 'Create CMS posts', description: '', user_grantable: true },
  { key: 'demo:thing:do', label: 'Do thing', description: '', user_grantable: true },
];

describe('ApiKeysManager', () => {
  it('renders a row per key with prefix, label and scopes', () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: sampleKeys, availableScopes: sampleScopes },
    });
    const rows = wrapper.findAll('[data-testid="api-key-row"]');
    expect(rows).toHaveLength(1);
    expect(wrapper.text()).toContain('vbwdk_ab12');
    expect(wrapper.text()).toContain('CI pipeline');
    expect(wrapper.text()).toContain('cms:posts:create');
  });

  it('renders a scope checkbox per available scope', () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: [], availableScopes: sampleScopes },
    });
    expect(wrapper.findAll('[data-testid="api-key-scope-option"]')).toHaveLength(2);
  });

  it('emits create with label, selected scopes and parsed ip whitelist', async () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: [], availableScopes: sampleScopes },
    });
    await wrapper.find('[data-testid="api-key-label-input"]').setValue('My key');
    const checkbox = wrapper.findAll('[data-testid="api-key-scope-option"] input')[0];
    await checkbox.setValue(true);
    await wrapper.find('[data-testid="api-key-ip-input"]').setValue('10.0.0.1\n192.168.0.0/16');
    await wrapper.find('[data-testid="api-key-create-btn"]').trigger('click');

    const emitted = wrapper.emitted('create');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual({
      label: 'My key',
      scopes: ['cms:posts:create'],
      ipWhitelist: ['10.0.0.1', '192.168.0.0/16'],
    });
  });

  it('does not emit create when label is blank', async () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: [], availableScopes: sampleScopes },
    });
    await wrapper.find('[data-testid="api-key-create-btn"]').trigger('click');
    expect(wrapper.emitted('create')).toBeFalsy();
  });

  it('reveals one-time plaintext and emits dismiss-plaintext', async () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: sampleKeys, availableScopes: sampleScopes, createdPlaintext: 'vbwdk_secretvalue' },
    });
    const reveal = wrapper.find('[data-testid="api-key-plaintext"]');
    expect(reveal.exists()).toBe(true);
    expect(reveal.text()).toContain('vbwdk_secretvalue');
    await wrapper.find('[data-testid="api-key-plaintext-dismiss"]').trigger('click');
    expect(wrapper.emitted('dismiss-plaintext')).toBeTruthy();
  });

  it('emits revoke and delete with the key id', async () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: sampleKeys, availableScopes: sampleScopes, canDelete: true },
    });
    await wrapper.find('[data-testid="api-key-revoke-btn"]').trigger('click');
    await wrapper.find('[data-testid="api-key-delete-btn"]').trigger('click');
    expect(wrapper.emitted('revoke')![0]).toEqual(['k1']);
    expect(wrapper.emitted('delete')![0]).toEqual(['k1']);
  });

  it('shows an error message when error prop is set', () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: [], availableScopes: [], error: 'Something failed' },
    });
    expect(wrapper.find('[data-testid="api-key-error"]').text()).toContain('Something failed');
  });

  it('disables the create button while loading', () => {
    const wrapper = mount(ApiKeysManager, {
      props: { keys: [], availableScopes: sampleScopes, loading: true },
    });
    expect(
      wrapper.find('[data-testid="api-key-create-btn"]').attributes('disabled'),
    ).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import ImportExportPage from '@/dataExchange/ImportExportPage.vue';
import type {
  DataExchangeApi,
  DataExchangeManifestEntry,
} from '@/dataExchange/types';

const MANIFEST: DataExchangeManifestEntry[] = [
  {
    entity_key: 'users',
    label: 'Users',
    cluster: 'sales',
    supported_formats: ['json', 'csv'],
    supports_export: true,
    supports_import: true,
    can_export: true,
    can_import: true,
    can_export_pii: false,
  },
  {
    entity_key: 'invoices',
    label: 'Invoices',
    cluster: 'sales',
    supported_formats: ['json'],
    supports_export: true,
    supports_import: false,
    can_export: true,
    can_import: false,
    can_export_pii: false,
  },
  {
    entity_key: 'countries',
    label: 'Countries',
    cluster: 'settings',
    supported_formats: ['json', 'csv'],
    supports_export: true,
    supports_import: true,
    can_export: true,
    can_import: true,
    can_export_pii: false,
  },
];

function makeApi(manifest = MANIFEST): DataExchangeApi {
  return {
    getJson: vi.fn(async () => ({ entities: manifest })),
    postForBlob: vi.fn(async () => new Blob(['x'])),
    postFormForJson: vi.fn(),
  };
}

async function mountPage(props: Record<string, unknown> = {}) {
  const wrapper = mount(ImportExportPage, {
    props: { api: makeApi(), isSuperadmin: false, ...props },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('ImportExportPage — manifest grouping', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches the manifest on mount', async () => {
    const api = makeApi();
    mount(ImportExportPage, { props: { api, isSuperadmin: false } });
    await flushPromises();
    expect(api.getJson).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/manifest',
    );
  });

  it('renders a Sales cluster group and a Settings cluster group', async () => {
    const wrapper = await mountPage();
    expect(wrapper.find('[data-test="cluster-sales"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="cluster-settings"]').exists()).toBe(true);
  });

  it('lists exportable entities under their cluster in the export block', async () => {
    const wrapper = await mountPage();
    const exportBlock = wrapper.find('[data-test="export-block"]');
    expect(exportBlock.find('[data-test="export-entity-users"]').exists()).toBe(
      true,
    );
    expect(
      exportBlock.find('[data-test="export-entity-countries"]').exists(),
    ).toBe(true);
  });
});

describe('ImportExportPage — arbitrary clusters', () => {
  beforeEach(() => vi.clearAllMocks());

  const CONTENT_MANIFEST: DataExchangeManifestEntry[] = [
    {
      entity_key: 'users',
      label: 'Users',
      cluster: 'sales',
      supported_formats: ['json'],
      supports_export: true,
      supports_import: true,
      can_export: true,
      can_import: true,
      can_export_pii: false,
    },
    {
      entity_key: 'countries',
      label: 'Countries',
      cluster: 'settings',
      supported_formats: ['json'],
      supports_export: true,
      supports_import: true,
      can_export: true,
      can_import: true,
      can_export_pii: false,
    },
    {
      entity_key: 'cms_pages',
      label: 'CMS Pages',
      cluster: 'content',
      supported_formats: ['json'],
      supports_export: true,
      supports_import: true,
      can_export: true,
      can_import: true,
      can_export_pii: false,
    },
  ];

  it('renders without throwing and shows sales, settings and content groups', async () => {
    const wrapper = mount(ImportExportPage, {
      props: { api: makeApi(CONTENT_MANIFEST), isSuperadmin: false },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="manifest-error"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="cluster-sales"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="cluster-settings"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="cluster-content"]').exists()).toBe(true);
  });

  it('lists the content-cluster entity and labels the group "Content"', async () => {
    const wrapper = mount(ImportExportPage, {
      props: { api: makeApi(CONTENT_MANIFEST), isSuperadmin: false },
    });
    await flushPromises();
    await nextTick();

    const contentCluster = wrapper.find('[data-test="cluster-content"]');
    expect(contentCluster.exists()).toBe(true);
    expect(contentCluster.text()).toContain('Content');
    expect(
      contentCluster.find('[data-test="export-entity-cms_pages"]').exists(),
    ).toBe(true);
  });

  it('Title-Cases an unrecognised cluster name for its group label', async () => {
    const miscManifest: DataExchangeManifestEntry[] = [
      {
        entity_key: 'gadgets',
        label: 'Gadgets',
        cluster: 'misc',
        supported_formats: ['json'],
        supports_export: true,
        supports_import: true,
        can_export: true,
        can_import: true,
        can_export_pii: false,
      },
    ];
    const wrapper = mount(ImportExportPage, {
      props: { api: makeApi(miscManifest), isSuperadmin: false },
    });
    await flushPromises();
    await nextTick();

    const miscCluster = wrapper.find('[data-test="cluster-misc"]');
    expect(miscCluster.exists()).toBe(true);
    expect(miscCluster.find('.vbwd-iep-cluster-title').text()).toBe('Misc');
  });
});

describe('ImportExportPage — format selector', () => {
  beforeEach(() => vi.clearAllMocks());

  it('offers json and csv for a multi-format entity', async () => {
    const wrapper = await mountPage();
    const options = wrapper
      .find('[data-test="format-users"]')
      .findAll('option')
      .map((o) => o.element.value);
    expect(options).toEqual(['json', 'csv']);
  });

  it('offers only json for a json-only entity', async () => {
    const wrapper = await mountPage();
    const options = wrapper
      .find('[data-test="format-invoices"]')
      .findAll('option')
      .map((o) => o.element.value);
    expect(options).toEqual(['json']);
  });
});

describe('ImportExportPage — tabs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('always renders the built-in General tab', async () => {
    const wrapper = await mountPage();
    expect(wrapper.find('[data-test="tab-general"]').exists()).toBe(true);
  });

  it('renders extra tabs passed via the tabs prop', async () => {
    const Extra = defineComponent({
      render: () => h('div', { class: 'extra-tab-body' }, 'extra'),
    });
    const wrapper = await mountPage({
      tabs: [{ id: 'cms', label: 'CMS', component: Extra }],
    });
    expect(wrapper.find('[data-test="tab-cms"]').exists()).toBe(true);

    await wrapper.find('[data-test="tab-cms"]').trigger('click');
    await nextTick();
    expect(wrapper.find('.extra-tab-body').exists()).toBe(true);
  });
});

describe('ImportExportPage — replace_all gating', () => {
  beforeEach(() => vi.clearAllMocks());

  it('hides replace_all in the import block for non-superadmin', async () => {
    const wrapper = await mountPage({ isSuperadmin: false });
    expect(wrapper.find('[data-test="import-mode-replace_all"]').exists()).toBe(
      false,
    );
  });

  it('shows replace_all in the import block for superadmin', async () => {
    const wrapper = await mountPage({ isSuperadmin: true });
    expect(wrapper.find('[data-test="import-mode-replace_all"]').exists()).toBe(
      true,
    );
  });
});

describe('ImportExportPage — single-entity import key derivation', () => {
  beforeEach(() => vi.clearAllMocks());

  function apiWithImport(): DataExchangeApi {
    const api = makeApi();
    (api.postFormForJson as ReturnType<typeof vi.fn>).mockResolvedValue({
      entity: 'booking_resources',
      created: 1,
      updated: 0,
      skipped: 0,
      errors: [],
    });
    return api;
  }

  async function uploadAndPreview(
    wrapper: ReturnType<typeof mount>,
    file: File,
  ): Promise<void> {
    const input = wrapper.find('[data-test="import-file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });
    await input.trigger('change');
    await wrapper.find('[data-test="import-preview-run"]').trigger('click');
    await flushPromises();
    // readImportFile resolves via FileReader.onload (a macrotask) — let it fire,
    // then drain the follow-up microtasks (the import call).
    await new Promise((resolve) => setTimeout(resolve, 20));
    await flushPromises();
  }

  it('derives the entity_key from the envelope rows-array key, not the file name', async () => {
    const api = apiWithImport();
    const wrapper = mount(ImportExportPage, {
      props: { api, isSuperadmin: false },
    });
    await flushPromises();
    await nextTick();
    // File deliberately NOT named after the entity — proves the key is read
    // from the envelope content (the rows-array key), fixing the prior
    // "entityKey is required" failure for single-entity JSON uploads.
    const envelope = JSON.stringify({
      vbwd_export: true,
      version: 1,
      exported_at: '2026-06-11',
      booking_resources: [{ slug: 'r1', name: 'R1' }],
    });
    await uploadAndPreview(
      wrapper,
      new File([envelope], 'my-catalog-dump.json', {
        type: 'application/json',
      }),
    );
    expect(api.postFormForJson).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/booking_resources/import',
      expect.anything(),
    );
  });

  it('falls back to the file name (without extension) for a CSV import', async () => {
    const api = apiWithImport();
    const wrapper = mount(ImportExportPage, {
      props: { api, isSuperadmin: false },
    });
    await flushPromises();
    await nextTick();
    await uploadAndPreview(
      wrapper,
      new File(['slug,name\nc1,C1\n'], 'countries.csv', { type: 'text/csv' }),
    );
    expect(api.postFormForJson).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/countries/import',
      expect.anything(),
    );
  });
});

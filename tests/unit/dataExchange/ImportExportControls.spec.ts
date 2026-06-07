import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ImportExportControls from '@/dataExchange/ImportExportControls.vue';
import type { DataExchangeApi, ImportResult } from '@/dataExchange/types';

function makeApi(overrides: Partial<DataExchangeApi> = {}): DataExchangeApi {
  return {
    getJson: vi.fn(),
    postForBlob: vi.fn(async () => new Blob(['x'])),
    postFormForJson: vi.fn(),
    ...overrides,
  };
}

const baseProps = {
  api: makeApi(),
  entityKey: 'users',
  selectedIds: [] as string[],
  filterState: {} as Record<string, unknown>,
  canExport: true,
  canImport: true,
  canExportPii: false,
  isSuperadmin: false,
  supportedFormats: ['json', 'csv'] as ('json' | 'csv')[],
};

describe('ImportExportControls — permission rendering', () => {
  it('renders export and import actions when permitted', () => {
    const wrapper = mount(ImportExportControls, { props: { ...baseProps } });
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(true);
  });

  it('hides export actions when canExport is false', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, canExport: false },
    });
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(false);
  });

  it('hides import action when canImport is false', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, canImport: false },
    });
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(false);
  });
});

describe('ImportExportControls — granular action props', () => {
  it('shows all four actions by default (back-compat)', () => {
    const wrapper = mount(ImportExportControls, { props: { ...baseProps } });
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(true);
  });

  it('allowExportAll=false hides only export-all', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, allowExportAll: false },
    });
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(true);
  });

  it('allowExportSelected=false hides only export-selected', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, allowExportSelected: false },
    });
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(true);
  });

  it('allowExportFiltered=false hides only export-filter', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, allowExportFiltered: false },
    });
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(true);
  });

  it('allowImport=false hides only import-open', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, allowImport: false },
    });
    expect(wrapper.find('[data-test="import-open"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-selected"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="export-filter"]').exists()).toBe(true);
  });

  it('allow* props still require the matching permission gate', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, canExport: false, allowExportAll: true },
    });
    expect(wrapper.find('[data-test="export-all"]').exists()).toBe(false);
  });
});

describe('ImportExportControls — export', () => {
  beforeEach(() => vi.clearAllMocks());

  it('export-selected posts the selected ids', async () => {
    const api = makeApi();
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, api, selectedIds: ['a', 'b'] },
    });
    await wrapper.find('[data-test="export-selected"]').trigger('click');
    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/users/export',
      expect.objectContaining({ ids: ['a', 'b'] }),
    );
  });

  it('export-selected is disabled when nothing is selected', () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, selectedIds: [] },
    });
    expect(
      wrapper.find('[data-test="export-selected"]').attributes('disabled'),
    ).toBeDefined();
  });

  it('export-all posts the all selector', async () => {
    const api = makeApi();
    const wrapper = mount(ImportExportControls, { props: { ...baseProps, api } });
    await wrapper.find('[data-test="export-all"]').trigger('click');
    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/users/export',
      expect.objectContaining({ all: true }),
    );
  });

  it('export-filter posts the current filter state', async () => {
    const api = makeApi();
    const filterState = { status: 'active' };
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, api, filterState },
    });
    await wrapper.find('[data-test="export-filter"]').trigger('click');
    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/users/export',
      expect.objectContaining({ filters: filterState }),
    );
  });
});

describe('ImportExportControls — import dialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens the import dialog when import button clicked', async () => {
    const wrapper = mount(ImportExportControls, { props: { ...baseProps } });
    expect(wrapper.find('[data-test="import-dialog"]').exists()).toBe(false);
    await wrapper.find('[data-test="import-open"]').trigger('click');
    expect(wrapper.find('[data-test="import-dialog"]').exists()).toBe(true);
  });

  it('hides the replace_all option when not superadmin', async () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, isSuperadmin: false },
    });
    await wrapper.find('[data-test="import-open"]').trigger('click');
    expect(wrapper.find('[data-test="mode-replace_all"]').exists()).toBe(false);
  });

  it('shows the replace_all option when superadmin', async () => {
    const wrapper = mount(ImportExportControls, {
      props: { ...baseProps, isSuperadmin: true },
    });
    await wrapper.find('[data-test="import-open"]').trigger('click');
    expect(wrapper.find('[data-test="mode-replace_all"]').exists()).toBe(true);
  });

  it('dry-run shows a preview, then confirm imports and emits refresh', async () => {
    const dryResult: ImportResult = {
      entity: 'users',
      mode: 'upsert',
      dry_run: true,
      created: 5,
      updated: 2,
      skipped: 1,
      errors: [],
    };
    const realResult: ImportResult = { ...dryResult, dry_run: false };
    const postFormForJson = vi
      .fn()
      .mockResolvedValueOnce(dryResult)
      .mockResolvedValueOnce(realResult);
    const api = makeApi({ postFormForJson });
    const wrapper = mount(ImportExportControls, { props: { ...baseProps, api } });

    await wrapper.find('[data-test="import-open"]').trigger('click');

    // attach a file
    const file = new File(['{}'], 'users.json', { type: 'application/json' });
    const input = wrapper.find('[data-test="import-file"]')
      .element as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    await wrapper.find('[data-test="import-file"]').trigger('change');

    // dry-run / preview
    await wrapper.find('[data-test="import-preview"]').trigger('click');
    await flushPromises();

    expect(postFormForJson).toHaveBeenCalledTimes(1);
    const firstForm = postFormForJson.mock.calls[0][1] as FormData;
    expect(firstForm.get('dry_run')).toBe('true');
    expect(wrapper.find('[data-test="preview-created"]').text()).toContain('5');

    // confirm
    await wrapper.find('[data-test="import-confirm"]').trigger('click');
    await flushPromises();

    expect(postFormForJson).toHaveBeenCalledTimes(2);
    const secondForm = postFormForJson.mock.calls[1][1] as FormData;
    expect(secondForm.get('dry_run')).toBe('false');
    expect(wrapper.emitted('refresh')).toHaveLength(1);
  });
});

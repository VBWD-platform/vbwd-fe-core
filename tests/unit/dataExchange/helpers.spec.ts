import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob, readImportFile } from '@/dataExchange/helpers';

describe('downloadBlob', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:fake-url');
    revokeObjectURL = vi.fn();
    // jsdom does not implement these
    (URL as unknown as Record<string, unknown>).createObjectURL = createObjectURL;
    (URL as unknown as Record<string, unknown>).revokeObjectURL = revokeObjectURL;
    clickSpy = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an object URL, clicks an anchor with the filename, and revokes the URL', () => {
    const blob = new Blob(['hello'], { type: 'application/json' });
    downloadBlob(blob, 'users.json');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('sets the download attribute to the given filename', () => {
    const created: HTMLAnchorElement[] = [];
    const original = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = original(tag);
      if (tag === 'a') created.push(el as HTMLAnchorElement);
      return el;
    });

    downloadBlob(new Blob(['x']), 'bundle.zip');

    expect(created).toHaveLength(1);
    expect(created[0].getAttribute('download')).toBe('bundle.zip');
  });
});

describe('readImportFile', () => {
  it('reads a text file as a string', async () => {
    const file = new File(['{"vbwd_export":"users"}'], 'users.json', {
      type: 'application/json',
    });
    const text = await readImportFile(file);
    expect(text).toBe('{"vbwd_export":"users"}');
  });

  it('rejects when no file is provided', async () => {
    await expect(
      readImportFile(undefined as unknown as File),
    ).rejects.toThrow();
  });
});

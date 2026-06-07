/**
 * Data Exchange — blob-download + file-read helpers.
 *
 * Single home (DRY) for the browser blob-download dance and the file-read
 * dance that were previously duplicated across admin stores / settings views.
 */

/**
 * Trigger a browser download of a blob under the given filename.
 *
 * Creates a temporary object URL, clicks a hidden anchor, then revokes the URL.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Read an uploaded file's contents as a UTF-8 string.
 *
 * Used to preview/inspect a JSON or CSV file before sending it (the upload
 * itself goes as multipart so the binary stays intact).
 */
export function readImportFile(file: File): Promise<string> {
  if (!file) {
    return Promise.reject(new Error('No file provided'));
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsText(file);
  });
}

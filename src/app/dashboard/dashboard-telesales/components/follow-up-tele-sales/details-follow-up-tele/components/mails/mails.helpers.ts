export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'bi bi-file-earmark-pdf',
    doc: 'bi bi-file-earmark-word',
    docx: 'bi bi-file-earmark-word',
    xls: 'bi bi-file-earmark-excel',
    xlsx: 'bi bi-file-earmark-excel',
    jpg: 'bi bi-file-earmark-image',
    jpeg: 'bi bi-file-earmark-image',
    png: 'bi bi-file-earmark-image',
    zip: 'bi bi-file-earmark-zip',
  };
  return map[ext ?? ''] ?? 'bi bi-file-earmark';
}

export function getStatusMeta(status: string) {
  const map: Record<string, { cls: string; icon: string }> = {
    sent: { cls: 'status-sent', icon: 'bi bi-check-circle' },
    failed: { cls: 'status-failed', icon: 'bi bi-x-circle' },
    draft: { cls: 'status-draft', icon: 'bi bi-file-earmark' },
  };
  return map[status] ?? { cls: '', icon: 'bi bi-circle' };
}

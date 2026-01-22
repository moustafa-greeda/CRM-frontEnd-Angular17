export class MailAttachments {
  private _files: File[] = [];

  get files(): File[] {
    return this._files;
  }

  add(list: FileList | null): void {
    if (!list) return;
    this._files.push(...Array.from(list));
  }

  remove(index: number): void {
    this._files.splice(index, 1);
  }

  clear(): void {
    this._files = [];
  }

  get totalSize(): number {
    return this._files.reduce((t, f) => t + f.size, 0);
  }
}

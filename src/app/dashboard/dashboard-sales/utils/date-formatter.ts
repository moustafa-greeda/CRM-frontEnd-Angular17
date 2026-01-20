export class DateFormatter {
  static formatCellValue(value: any, formatter?: string): string {
    if (!value) return '';

    if (formatter === 'date' || formatter === 'datetime') {
      const date = new Date(value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      if (formatter === 'datetime') {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      return `${day}/${month}/${year}`;
    }

    return value;
  }
}

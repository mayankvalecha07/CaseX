export type DateTimeDisplayFormat = 'locale' | 'iso';

export const formatDateTime = (value: string | undefined, format: DateTimeDisplayFormat = 'locale'): string => {
  if (!value) return 'Not recorded';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  if (format === 'iso') return `${parsed.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')} UTC`;
  return parsed.toLocaleString();
};

import { format, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

function toDate(value) {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) throw new TypeError(`Invalid date value: ${value}`);
  return date;
}

export function formatDate(value, pattern = 'd MMMM yyyy') {
  return format(toDate(value), pattern, { locale: id });
}

export function formatTime(value) {
  return format(toDate(value), 'HH:mm', { locale: id });
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(value);
}

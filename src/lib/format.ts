const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um valor em reais (número decimal). */
export function formatBRL(value: number): string {
  return BRL.format(Number.isFinite(value) ? value : 0);
}

/** Formata um valor em centavos (inteiro) para reais. */
export function formatCents(cents: number): string {
  return formatBRL((cents ?? 0) / 100);
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value ?? 0).toFixed(digits)}%`;
}

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const TIME = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '—' : DATE_TIME.format(d);
}

export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '—' : TIME.format(d);
}

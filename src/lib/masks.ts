/** Máscaras e formatação de entrada (pt-BR). */

/** Formata telefone BR conforme digitação: (11) 99999-9999 ou (11) 9999-9999. */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/** Só os dígitos (para enviar à API). */
export function unmaskDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Máscara de moeda a partir dos dígitos: "4000" → "R$ 40,00".
 * Trabalha em centavos (últimos 2 dígitos = centavos).
 */
export function maskCurrencyFromDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Valor mascarado de moeda → centavos (inteiro). */
export function currencyToCents(masked: string): number {
  const digits = masked.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/** Centavos → string mascarada para valor inicial de input. */
export function centsToMasked(cents: number): string {
  if (!cents) return '';
  return maskCurrencyFromDigits(String(cents));
}

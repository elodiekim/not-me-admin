// Display-only formatting — never touches the stored value. Phone numbers
// aren't stored in one consistent format (search already handles that by
// comparing digits-only), so this only formats the clear cases and leaves
// anything ambiguous as-is rather than guessing.
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return digits.startsWith('02')
      ? `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
      : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

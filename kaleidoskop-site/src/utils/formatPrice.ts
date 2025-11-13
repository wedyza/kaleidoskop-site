export function formatPrice(price: number): string {
  if (!price) return '';
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
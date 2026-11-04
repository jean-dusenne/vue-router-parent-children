export function assertStockIdAllowed(id: unknown): void {
  if (id === '404') {
    throw new Error('Stock ID 404 not found')
  }
}
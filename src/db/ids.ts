/** Local-only unique id: time-sortable prefix + random suffix. */
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

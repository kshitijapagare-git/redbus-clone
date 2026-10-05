export const MIN_ROOMS = 1
export const MAX_ROOMS = 5
export const MIN_ADULTS_PER_ROOM = 1
export const MAX_ADULTS_PER_ROOM = 4

/** Clamps `n` to the inclusive range [MIN_ROOMS, MAX_ROOMS]. */
export function clampRooms(n: number): number {
  return Math.min(MAX_ROOMS, Math.max(MIN_ROOMS, n))
}

/** Clamps `n` to the inclusive range [MIN_ADULTS_PER_ROOM, MAX_ADULTS_PER_ROOM]. */
export function clampAdultsPerRoom(n: number): number {
  return Math.min(MAX_ADULTS_PER_ROOM, Math.max(MIN_ADULTS_PER_ROOM, n))
}

/**
 * Formats the rooms & guests summary text, e.g. '1 Room · 2 Adults' or
 * '2 Rooms · 3 Adults'. `adultsPerRoom` is the per-room adult count, per
 * product clarification — not a total across rooms.
 */
export function formatRoomsGuestsSummary(rooms: number, adultsPerRoom: number): string {
  const roomLabel = rooms === 1 ? 'Room' : 'Rooms'
  return `${rooms} ${roomLabel} · ${adultsPerRoom} Adults`
}

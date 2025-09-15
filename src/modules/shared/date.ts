import dayjs from 'dayjs'

export function nowIso(): string {
  return dayjs().toISOString()
}

export function diffMinutes(a?: string, b?: string): number | undefined {
  if (!a || !b) return undefined
  return dayjs(b).diff(dayjs(a), 'minute')
}

export function formatDate(date?: string, format: string = 'DD/MM/YYYY'): string {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

/**
 * Google Sheet backup. Paste the Apps Script web app URL here (it looks like
 * https://script.google.com/macros/s/.../exec). Leave it empty to turn the
 * automatic backup off. See README, "Google Sheet backup".
 */
const PASTED_URL = ''

export const BACKUP_URL: string = (import.meta.env.VITE_BACKUP_URL as string | undefined) || PASTED_URL

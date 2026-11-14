/**
 * Convertit un titre en slug d'URL : minuscules, sans accents, mots séparés par des tirets.
 * Ex : "DiagnoCare - IA & Triage Médical" -> "diagnocare-ia-triage-medical"
 */
export function slugify(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

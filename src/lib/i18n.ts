export const locales = ["en", "es", "ca"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

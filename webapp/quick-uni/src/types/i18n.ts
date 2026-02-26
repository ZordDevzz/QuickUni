/**
 * Type for the translation function
 * This is a helper to avoid using 'any' when passing 't' around
 */
export type TranslationFunction = (key: string, values?: Record<string, string | number | boolean>) => string;
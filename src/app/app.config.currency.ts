export const APP_CURRENCY_CONFIG = {
  symbol: 'R',
  code: 'ZAR',
  locale: 'en-ZA',
  name: 'South African Rand',
} as const;

export type CurrencyConfig = typeof APP_CURRENCY_CONFIG;

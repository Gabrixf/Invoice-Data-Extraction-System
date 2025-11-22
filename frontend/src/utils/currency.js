/**
 * Currency utilities for frontend
 */

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  MXN: '$',
  BRL: 'R$',
  RUB: '₽',
  ZAR: 'R',
  NOK: 'kr',
  SEK: 'kr',
  NZD: 'NZ$',
};

// Currency names
export const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  RUB: 'Russian Ruble',
  ZAR: 'South African Rand',
  NOK: 'Norwegian Krone',
  SEK: 'Swedish Krona',
  NZD: 'New Zealand Dollar',
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

/**
 * Get currency name
 */
export const getCurrencyName = (currencyCode) => {
  return CURRENCY_NAMES[currencyCode] || 'Unknown';
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currencyCode, includeSymbol = true) => {
  if (!amount) return '0.00';

  const formatted =
    amount >= 1000 ? amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) : amount.toFixed(2);

  if (includeSymbol) {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${currencyCode}`;
};

/**
 * Get currency color for display
 */
export const getCurrencyColor = (currencyCode) => {
  const colors = {
    USD: 'blue',
    EUR: 'green',
    GBP: 'purple',
    JPY: 'red',
    CAD: 'blue',
    AUD: 'yellow',
    CHF: 'red',
    CNY: 'red',
    INR: 'orange',
    MXN: 'green',
    BRL: 'yellow',
    RUB: 'red',
    ZAR: 'yellow',
    NOK: 'blue',
    SEK: 'blue',
    NZD: 'yellow',
  };

  return colors[currencyCode] || 'gray';
};

/**
 * Get currency badge color class for Tailwind
 */
export const getCurrencyBadgeClass = (currencyCode) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const color = getCurrencyColor(currencyCode);
  return colorMap[color] || colorMap.gray;
};

/**
 * Determine if currency is major
 */
export const isMajorCurrency = (currencyCode) => {
  const major = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
  return major.includes(currencyCode);
};

/**
 * Get currency confidence indicator text
 */
export const getCurrencyConfidenceText = (confidence) => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.7) return 'Medium';
  if (confidence >= 0.5) return 'Low';
  return 'Very Low';
};

/**
 * Get currency confidence color
 */
export const getCurrencyConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.8) return 'text-blue-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  if (confidence >= 0.5) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Get all supported currencies
 */
export const getAllSupportedCurrencies = () => {
  return Object.keys(CURRENCY_NAMES).map(code => ({
    code,
    name: CURRENCY_NAMES[code],
    symbol: CURRENCY_SYMBOLS[code],
    isMajor: isMajorCurrency(code),
  }));
};

/**
 * Filter currencies by search term
 */
export const filterCurrencies = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return getAllSupportedCurrencies().filter(currency =>
    currency.code.toLowerCase().includes(term) ||
    currency.name.toLowerCase().includes(term)
  );
};

"""
Currency detection and conversion utilities for invoice processing.

Supports major currencies: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, etc.
"""

import re
from typing import Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

CURRENCY_SYMBOLS = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    'C$': 'CAD',
    'A$': 'AUD',
    'NZ$': 'NZD',
    'kr': 'SEK',
    'CHF': 'CHF',
    'R$': 'BRL',
    '₽': 'RUB',
    'R': 'ZAR',
    'kr': 'NOK',
}

CURRENCY_NAMES = {
    'dollar': 'USD',
    'usd': 'USD',
    'us dollar': 'USD',
    'euro': 'EUR',
    'eur': 'EUR',
    'pound': 'GBP',
    'gbp': 'GBP',
    'british pound': 'GBP',
    'yen': 'JPY',
    'jpy': 'JPY',
    'japanese yen': 'JPY',
    'canadian dollar': 'CAD',
    'cad': 'CAD',
    'australian dollar': 'AUD',
    'aud': 'AUD',
    'swiss franc': 'CHF',
    'chf': 'CHF',
    'yuan': 'CNY',
    'cny': 'CNY',
    'rupee': 'INR',
    'inr': 'INR',
}

EXCHANGE_RATES = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'CAD': 1.36,
    'AUD': 1.53,
    'CHF': 0.89,
    'CNY': 7.24,
    'INR': 83.12,
    'MXN': 17.05,
    'BRL': 4.97,
    'RUB': 98.50,
    'ZAR': 18.50,
    'NOK': 10.48,
    'SEK': 10.35,
    'NZD': 1.62,
}

CURRENCY_PATTERNS = [
    (r'USD|\$(?!\s)|US\$', 'USD'),
    (r'EUR|€|Euro', 'EUR'),
    (r'GBP|£|British Pound', 'GBP'),
    (r'JPY|¥|Japanese Yen', 'JPY'),
    (r'CAD|C\$|Canadian', 'CAD'),
    (r'AUD|A\$|Australian', 'AUD'),
    (r'CHF|Swiss Franc', 'CHF'),
    (r'CNY|Yuan|RMB', 'CNY'),
    (r'INR|₹|Rupee', 'INR'),
    (r'MXN|Mexican Peso', 'MXN'),
    (r'BRL|R\$|Brazilian', 'BRL'),
    (r'RUB|₽|Russian', 'RUB'),
    (r'ZAR|South African', 'ZAR'),
    (r'NOK|Norwegian Krone', 'NOK'),
    (r'SEK|Swedish Krona', 'SEK'),
    (r'NZD|New Zealand', 'NZD'),
]


def detect_currency(text: str) -> Tuple[str, float]:
    """
    Detect currency from invoice text.

    Args:
        text: Invoice text to analyze

    Returns:
        Tuple of (currency_code, confidence_score)
        confidence_score: 0-1 indicating how confident the detection is
    """
    if not text:
        return 'USD', 0.5

    text_lower = text.lower()

    for pattern, currency_code in CURRENCY_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            logger.info(f"Detected currency: {currency_code} using pattern {pattern}")
            return currency_code, 0.9

    for name, currency_code in CURRENCY_NAMES.items():
        if name in text_lower:
            logger.info(f"Detected currency: {currency_code} by name match")
            return currency_code, 0.85

    for symbol, currency_code in CURRENCY_SYMBOLS.items():
        if symbol in text:
            logger.info(f"Detected currency: {currency_code} by symbol")
            return currency_code, 0.88

    logger.warning("No currency detected, defaulting to USD")
    return 'USD', 0.5


def get_currency_symbol(currency_code: str) -> str:
    """
    Get the symbol for a currency code.

    Args:
        currency_code: ISO 4217 currency code (e.g., 'USD', 'EUR')

    Returns:
        Currency symbol or code if symbol not found
    """
    symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'INR': '₹',
        'MXN': '$',
        'BRL': 'R$',
        'RUB': '₽',
        'ZAR': 'R',
        'NOK': 'kr',
        'SEK': 'kr',
        'NZD': 'NZ$',
    }
    return symbols.get(currency_code, currency_code)


def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str = 'USD'
) -> float:
    """
    Convert amount from one currency to another.

    Args:
        amount: Amount to convert
        from_currency: Source currency code
        to_currency: Target currency code (default: USD)

    Returns:
        Converted amount
    """
    if from_currency == to_currency:
        return amount

    from_rate = EXCHANGE_RATES.get(from_currency)
    to_rate = EXCHANGE_RATES.get(to_currency)

    if from_rate is None or to_rate is None:
        logger.warning(
            f"Exchange rate not found for {from_currency} or {to_currency}, "
            f"returning original amount"
        )
        return amount

    amount_in_usd = amount / from_rate if from_currency != 'USD' else amount
    converted = amount_in_usd * to_rate

    return round(converted, 2)


def format_currency(amount: float, currency_code: str, include_symbol: bool = True) -> str:
    """
    Format amount as currency string.

    Args:
        amount: Amount to format
        currency_code: ISO currency code
        include_symbol: Whether to include currency symbol

    Returns:
        Formatted currency string (e.g., "$1,234.56" or "1,234.56 USD")
    """
    formatted = f"{amount:,.2f}" if amount >= 1000 else f"{amount:.2f}"

    if include_symbol:
        symbol = get_currency_symbol(currency_code)
        return f"{symbol}{formatted}"
    else:
        return f"{formatted} {currency_code}"


def get_currency_info(currency_code: str) -> Dict:
    """
    Get information about a currency.

    Args:
        currency_code: ISO currency code

    Returns:
        Dictionary with currency information
    """
    names = {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CAD': 'Canadian Dollar',
        'AUD': 'Australian Dollar',
        'CHF': 'Swiss Franc',
        'CNY': 'Chinese Yuan',
        'INR': 'Indian Rupee',
        'MXN': 'Mexican Peso',
        'BRL': 'Brazilian Real',
        'RUB': 'Russian Ruble',
        'ZAR': 'South African Rand',
        'NOK': 'Norwegian Krone',
        'SEK': 'Swedish Krona',
        'NZD': 'New Zealand Dollar',
    }

    return {
        'code': currency_code,
        'name': names.get(currency_code, 'Unknown'),
        'symbol': get_currency_symbol(currency_code),
        'exchange_rate_to_usd': EXCHANGE_RATES.get(currency_code, None),
    }


def normalize_currency_data(invoice_data: Dict) -> Dict:
    """
    Normalize currency information in invoice data.

    Adds currency detection and converts all amounts to a standard format.

    Args:
        invoice_data: Dictionary containing invoice data

    Returns:
        Invoice data with normalized currency information
    """
    invoice_text = ' '.join([
        str(invoice_data.get('vendor_name', '')),
        str(invoice_data.get('invoice_number', '')),
        str(invoice_data.get('invoice_date', '')),
    ])

    detected_currency, confidence = detect_currency(invoice_text)

    invoice_data['currency'] = detected_currency
    invoice_data['currency_confidence'] = confidence
    invoice_data['currency_symbol'] = get_currency_symbol(detected_currency)

    if 'total_amount' in invoice_data:
        invoice_data['total_amount_formatted'] = format_currency(
            invoice_data['total_amount'],
            detected_currency
        )
        invoice_data['total_amount_usd'] = convert_currency(
            invoice_data['total_amount'],
            detected_currency,
            'USD'
        )

    if 'line_items' in invoice_data:
        for item in invoice_data['line_items']:
            if 'cost' in item:
                item['cost_formatted'] = format_currency(item['cost'], detected_currency)
                item['cost_usd'] = convert_currency(item['cost'], detected_currency, 'USD')

    return invoice_data


def get_multi_currency_summary(invoices: list) -> Dict:
    """
    Generate summary statistics for invoices in multiple currencies.

    Args:
        invoices: List of invoice dictionaries

    Returns:
        Summary statistics including totals by currency and in USD
    """
    if not invoices:
        return {
            'total_by_currency': {},
            'total_in_usd': 0.0,
            'currency_breakdown': {},
        }

    totals_by_currency = {}
    currency_breakdown = {}

    for invoice in invoices:
        currency = invoice.get('currency', 'USD')
        amount = invoice.get('total_amount', 0)

        if currency not in totals_by_currency:
            totals_by_currency[currency] = 0
            currency_breakdown[currency] = {'count': 0, 'total': 0, 'average': 0}

        totals_by_currency[currency] += amount
        currency_breakdown[currency]['count'] += 1
        currency_breakdown[currency]['total'] += amount

    total_in_usd = 0
    for currency, total in totals_by_currency.items():
        total_in_usd += convert_currency(total, currency, 'USD')

    for currency in currency_breakdown:
        count = currency_breakdown[currency]['count']
        total = currency_breakdown[currency]['total']
        currency_breakdown[currency]['average'] = round(total / count, 2) if count > 0 else 0

    return {
        'total_by_currency': {
            currency: round(total, 2)
            for currency, total in totals_by_currency.items()
        },
        'total_in_usd': round(total_in_usd, 2),
        'currency_breakdown': currency_breakdown,
        'currencies_detected': list(totals_by_currency.keys()),
    }


def is_valid_currency_code(code: str) -> bool:
    """Check if a currency code is valid."""
    return code in EXCHANGE_RATES or code in CURRENCY_NAMES.values()


def update_exchange_rates(new_rates: Dict[str, float]) -> None:
    """
    Update exchange rates (for testing or API integration).

    Args:
        new_rates: Dictionary of currency codes to rates
    """
    global EXCHANGE_RATES
    EXCHANGE_RATES.update(new_rates)
    logger.info(f"Exchange rates updated: {list(new_rates.keys())}")

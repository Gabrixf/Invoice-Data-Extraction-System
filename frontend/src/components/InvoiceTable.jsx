import { calculateConfidenceScore, getConfidenceLevel, validateInvoiceData } from '../utils/validation';
import { formatCurrency, getCurrencyBadgeClass, getCurrencyConfidenceText, getCurrencyConfidenceColor } from '../utils/currency';

export default function InvoiceTable({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No invoices processed yet
      </div>
    );
  }

  // Calculate multi-currency summary
  const currencySummary = {};
  let totalUSD = 0;

  invoices.forEach(invoice => {
    const currency = invoice.currency || 'USD';
    if (!currencySummary[currency]) {
      currencySummary[currency] = { count: 0, total: 0 };
    }
    currencySummary[currency].count++;
    currencySummary[currency].total += (invoice.total_amount || 0);

    if (invoice.total_amount_usd) {
      totalUSD += invoice.total_amount_usd;
    }
  });

  return (
    <div className="space-y-4">
      {/* Multi-Currency Summary Banner */}
      {Object.keys(currencySummary).length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
          <h3 className="font-semibold text-purple-900 mb-3">💱 Multi-Currency Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total in USD */}
            <div className="bg-white rounded p-3 border border-purple-100">
              <p className="text-sm text-gray-600">Total (USD)</p>
              <p className="text-2xl font-bold text-purple-600">${totalUSD.toFixed(2)}</p>
            </div>

            {/* Currencies Found */}
            <div className="bg-white rounded p-3 border border-purple-100">
              <p className="text-sm text-gray-600">Currencies Detected</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(currencySummary).map(currency => (
                  <span
                    key={currency}
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCurrencyBadgeClass(currency)}`}
                  >
                    {currency}
                  </span>
                ))}
              </div>
            </div>

            {/* Count by Currency */}
            <div className="bg-white rounded p-3 border border-purple-100">
              <p className="text-sm text-gray-600 mb-2">Invoices by Currency</p>
              <div className="space-y-1 text-sm">
                {Object.entries(currencySummary).map(([currency, data]) => (
                  <div key={currency} className="flex justify-between">
                    <span className="font-medium">{currency}:</span>
                    <span className="text-gray-600">{data.count} invoice(s)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Vendor Name</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Invoice Number</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Invoice Date</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Currency</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-right">Total Amount</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-right text-xs">Amount (USD)</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-center">Line Items</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-center">Confidence</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => {
              const confidenceScore = calculateConfidenceScore(invoice);
              const confidenceLevel = getConfidenceLevel(confidenceScore);
              const { errors: dataErrors, warnings: dataWarnings } = validateInvoiceData(invoice);
              const hasIssues = dataErrors.length > 0 || dataWarnings.length > 0;
              const currency = invoice.currency || 'USD';
              const currencyConfidence = invoice.currency_confidence || 0.5;

              return (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    hasIssues ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{invoice.vendor_name || '-'}</p>
                        {dataErrors.length > 0 && (
                          <p className="text-red-600 text-xs mt-1">⚠ {dataErrors.length} error(s)</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{invoice.invoice_number || '-'}</td>
                  <td className="px-6 py-4 text-gray-900">{invoice.invoice_date || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCurrencyBadgeClass(currency)}`}>
                        {currency}
                      </span>
                      <span className={`text-xs ${getCurrencyConfidenceColor(currencyConfidence)}`}>
                        {getCurrencyConfidenceText(currencyConfidence)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-right font-semibold">
                    {formatCurrency(invoice.total_amount, currency)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-right text-xs text-gray-600">
                    ${(invoice.total_amount_usd || invoice.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900">
                    {invoice.line_items?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            confidenceLevel.color === 'green'
                              ? 'bg-green-500'
                              : confidenceLevel.color === 'blue'
                              ? 'bg-blue-500'
                              : confidenceLevel.color === 'yellow'
                              ? 'bg-yellow-500'
                              : confidenceLevel.color === 'orange'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 ml-1">
                        {confidenceScore}%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 text-${confidenceLevel.color}-600`}>
                      {confidenceLevel.label}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {invoice.flagged ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                      {hasIssues && (
                        <button
                          title={`${dataErrors.length} error(s), ${dataWarnings.length} warning(s)`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          ⚠️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Data Quality Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Data Quality Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Excellent', color: 'green', count: invoices.filter(inv => getConfidenceLevel(calculateConfidenceScore(inv)).label === 'Excellent').length },
            { label: 'Good', color: 'blue', count: invoices.filter(inv => getConfidenceLevel(calculateConfidenceScore(inv)).label === 'Good').length },
            { label: 'Fair', color: 'yellow', count: invoices.filter(inv => getConfidenceLevel(calculateConfidenceScore(inv)).label === 'Fair').length },
            { label: 'Poor', color: 'orange', count: invoices.filter(inv => getConfidenceLevel(calculateConfidenceScore(inv)).label === 'Poor').length },
            { label: 'Very Poor', color: 'red', count: invoices.filter(inv => getConfidenceLevel(calculateConfidenceScore(inv)).label === 'Very Poor').length },
          ].map((quality) => (
            <div key={quality.label} className="text-center">
              <p className={`text-2xl font-bold text-${quality.color}-600`}>{quality.count}</p>
              <p className={`text-xs text-${quality.color}-700`}>{quality.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Summary */}
      {invoices.some(inv => {
        const { errors, warnings } = validateInvoiceData(inv);
        return errors.length > 0 || warnings.length > 0;
      }) && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Data Issues Found</h3>
          <div className="space-y-2">
            {invoices.map((invoice, index) => {
              const { errors, warnings } = validateInvoiceData(invoice);
              if (errors.length === 0 && warnings.length === 0) return null;

              return (
                <details key={index} className="text-sm">
                  <summary className="cursor-pointer font-medium text-yellow-800">
                    {invoice.vendor_name || `Invoice ${index + 1}`}
                    {errors.length > 0 && <span className="ml-2 text-red-600">({errors.length} error(s))</span>}
                    {warnings.length > 0 && <span className="ml-2 text-yellow-600">({warnings.length} warning(s))</span>}
                  </summary>
                  <div className="mt-2 ml-4 space-y-1">
                    {errors.map((error, idx) => (
                      <p key={`err-${idx}`} className="text-red-700">
                        ❌ {error}
                      </p>
                    ))}
                    {warnings.map((warning, idx) => (
                      <p key={`warn-${idx}`} className="text-yellow-700">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

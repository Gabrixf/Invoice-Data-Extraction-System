import React from 'react';

export default function SummarySection({ summary, onDownload, isDownloading }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Invoices Processed</p>
            <p className="text-3xl font-bold text-blue-600">
              {summary.total_invoices_processed || 0}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-green-600">
              ${(summary.total_amount || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Flagged Invoices (&gt;$5,000)</p>
            <p className="text-3xl font-bold text-red-600">
              {summary.flagged_invoices_count || 0}
            </p>
          </div>
        </div>
      </div>

      {summary.errors && summary.errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Processing Errors</h3>
          <ul className="space-y-1">
            {summary.errors.map((error, index) => (
              <li key={index} className="text-sm text-yellow-800">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.total_invoices_processed > 0 && (
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel Report
            </>
          )}
        </button>
      )}
    </div>
  );
}

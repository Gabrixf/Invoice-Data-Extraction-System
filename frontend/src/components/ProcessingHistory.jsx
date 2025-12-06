import React from 'react';

export default function ProcessingHistory({ batches }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Timestamp</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Files</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Invoices</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{batch.timestamp}</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{batch.fileCount}</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{batch.invoiceCount}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                ${(batch.totalAmount || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import InvoiceTable from './components/InvoiceTable';
import SummarySection from './components/SummarySection';
import ProcessingHistory from './components/ProcessingHistory';
import { invoiceAPI } from './services/api';
import { useLocalStorage, clearLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [invoices, setInvoices] = useLocalStorage('invoices', []);
  const [summary, setSummary] = useLocalStorage('summary', null);
  const [processingHistory, setProcessingHistory] = useLocalStorage('processingHistory', []);
  const [excelFilename, setExcelFilename] = useLocalStorage('excelFilename', null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = async (files) => {
    console.log('App.handleFilesSelected called with:', files.length, 'files');
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Sending request to API with FormData');
      const response = await invoiceAPI.processInvoices(formData);
      console.log('API response received:', response);

      // Acumular invoices en lugar de reemplazarlos
      setInvoices((prevInvoices) => [...prevInvoices, ...response.invoices]);

      // Agregar al historial de procesamiento
      const newBatch = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        fileCount: files.length,
        invoiceCount: response.invoices.length,
        totalAmount: response.summary.total_amount,
        excelFile: response.excel_file_path
      };
      setProcessingHistory((prevHistory) => [newBatch, ...prevHistory]);

      setSummary(response.summary);
      setExcelFilename(response.excel_file_path);
    } catch (err) {
      console.error('Error in handleFilesSelected:', err);
      const errorMessage = err.detail || err.message || 'Error processing invoices';
      setError(errorMessage);
      console.error('Error message set to:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setInvoices([]);
    setProcessingHistory([]);
    setSummary(null);
    setExcelFilename(null);
    clearLocalStorage('invoices');
    clearLocalStorage('processingHistory');
    clearLocalStorage('summary');
    clearLocalStorage('excelFilename');
  };

  const handleDownloadExcel = async () => {
    if (!excelFilename) {
      setError('Excel file not available');
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const blob = await invoiceAPI.downloadExcel(excelFilename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = excelFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Error downloading file';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice Data Extraction System
          </h1>
          <p className="mt-2 text-gray-600">
            Upload PDF invoices to extract data and export to Excel
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Invoices</h2>
          <FileUpload onFilesSelected={handleFilesSelected} isLoading={loading} />

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing invoices...
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {invoices.length > 0 && (
          <>
            {processingHistory.length > 0 && (
              <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Processing History</h2>
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    Clear All
                  </button>
                </div>
                <ProcessingHistory batches={processingHistory} />
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Extracted Data ({invoices.length} invoices)</h2>
              <InvoiceTable invoices={invoices} />

              <SummarySection
                summary={summary}
                onDownload={handleDownloadExcel}
                isDownloading={downloading}
              />
            </div>
          </>
        )}

        {invoices.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>Upload one or multiple PDF invoice files</li>
              <li>The system will extract vendor name, invoice number, date, and amounts</li>
              <li>Line items will be extracted from each invoice</li>
              <li>Invoices with amounts exceeding $5,000 will be flagged</li>
              <li>Download the results as an Excel file with a summary section</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

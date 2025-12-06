/**
 * File validation utilities
 */

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_UPLOAD = 20;
export const ALLOWED_FILE_TYPES = ['application/pdf'];

export const validateFiles = (files) => {
  const errors = [];
  const warnings = [];

  if (!files || files.length === 0) {
    errors.push('No files selected');
    return { errors, warnings, validFiles: [] };
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    errors.push(`Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`);
  }

  const validFiles = [];

  files.forEach((file, index) => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`File ${index + 1} (${file.name}): Not a PDF file`);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File ${index + 1} (${file.name}): File too large (${formatFileSize(file.size)} > 50MB)`
      );
      return;
    }

    // Warning for small files (might be invalid)
    if (file.size < 1024) {
      warnings.push(`File ${index + 1} (${file.name}): File is very small, might be empty or corrupted`);
    }

    validFiles.push(file);
  });

  return { errors, warnings, validFiles };
};

/**
 * Validate extracted invoice data
 */
export const validateInvoiceData = (invoice) => {
  const errors = [];
  const warnings = [];

  // Validate vendor name
  if (!invoice.vendor_name || invoice.vendor_name.trim() === '') {
    errors.push('Vendor name is missing');
  }

  // Validate invoice number
  if (!invoice.invoice_number || invoice.invoice_number.trim() === '') {
    warnings.push('Invoice number is missing');
  }

  // Validate date
  if (!invoice.invoice_date || invoice.invoice_date.trim() === '') {
    warnings.push('Invoice date is missing');
  } else if (!isValidDate(invoice.invoice_date)) {
    warnings.push(`Invoice date format might be invalid: "${invoice.invoice_date}"`);
  }

  // Validate total amount
  if (invoice.total_amount === undefined || invoice.total_amount === null) {
    errors.push('Total amount is missing');
  } else if (invoice.total_amount < 0) {
    errors.push('Total amount cannot be negative');
  } else if (invoice.total_amount === 0) {
    warnings.push('Total amount is zero');
  }

  // Validate line items
  if (!invoice.line_items || invoice.line_items.length === 0) {
    warnings.push('No line items found');
  } else {
    invoice.line_items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        warnings.push(`Line item ${index + 1}: Missing description`);
      }
      if (item.cost < 0) {
        errors.push(`Line item ${index + 1}: Negative cost`);
      }
    });
  }

  return { errors, warnings };
};

/**
 * Calculate confidence score for extracted data (0-100)
 */
export const calculateConfidenceScore = (invoice) => {
  let score = 100;

  // Deduct points for missing fields
  if (!invoice.vendor_name || invoice.vendor_name.trim() === '') score -= 20;
  if (!invoice.invoice_number || invoice.invoice_number.trim() === '') score -= 10;
  if (!invoice.invoice_date || invoice.invoice_date.trim() === '') score -= 10;
  if (invoice.total_amount === 0) score -= 10;
  if (!invoice.line_items || invoice.line_items.length === 0) score -= 15;

  // Deduct points for suspicious values
  if (invoice.total_amount > 1000000) score -= 5; // Unusually large amount
  if (invoice.vendor_name && invoice.vendor_name.length < 2) score -= 10; // Too short name

  return Math.max(0, Math.min(100, score));
};

/**
 * Get confidence level label and color
 */
export const getConfidenceLevel = (score) => {
  if (score >= 95) return { label: 'Excellent', color: 'green', icon: '✓' };
  if (score >= 85) return { label: 'Good', color: 'blue', icon: '✓' };
  if (score >= 70) return { label: 'Fair', color: 'yellow', icon: '⚠' };
  if (score >= 50) return { label: 'Poor', color: 'orange', icon: '⚠' };
  return { label: 'Very Poor', color: 'red', icon: '✗' };
};

/**
 * Validate date string (multiple formats)
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;

  // Common date formats
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4}$/, // Jan 1, 2024
  ];

  return datePatterns.some(pattern => pattern.test(dateString));
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get data quality assessment
 */
export const getDataQualityAssessment = (invoices) => {
  if (!invoices || invoices.length === 0) {
    return { totalInvoices: 0, qualityBreakdown: {} };
  }

  const qualityBreakdown = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    veryPoor: 0
  };

  invoices.forEach(invoice => {
    const score = calculateConfidenceScore(invoice);
    const level = getConfidenceLevel(score);

    switch (level.label) {
      case 'Excellent':
        qualityBreakdown.excellent++;
        break;
      case 'Good':
        qualityBreakdown.good++;
        break;
      case 'Fair':
        qualityBreakdown.fair++;
        break;
      case 'Poor':
        qualityBreakdown.poor++;
        break;
      case 'Very Poor':
        qualityBreakdown.veryPoor++;
        break;
      default:
        break;
    }
  });

  return { totalInvoices: invoices.length, qualityBreakdown };
};

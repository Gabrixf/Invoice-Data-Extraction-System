import logging
import os
from typing import List, Dict, Tuple
from datetime import datetime
from pathlib import Path

from app.utils.pdf_handler import extract_text_from_pdf, validate_pdf
from app.utils.openai_service import InvoiceExtractor
from app.utils.excel_generator import ExcelGenerator
from app.utils.currency import normalize_currency_data, get_multi_currency_summary

logger = logging.getLogger(__name__)


class InvoiceProcessingService:
    """Service to handle invoice processing pipeline."""

    FLAGGED_AMOUNT_THRESHOLD = 5000.0

    def __init__(self, api_key: str, temp_dir: str = "temp_uploads"):
        """Initialize the service."""
        self.extractor = InvoiceExtractor(api_key)
        self.excel_generator = ExcelGenerator()
        self.temp_dir = temp_dir
        Path(self.temp_dir).mkdir(exist_ok=True)

    def process_invoices(self, pdf_file_paths: List[str]) -> Tuple[List[Dict], Dict]:
        """
        Process multiple PDF invoices and return extracted data with summary.

        Args:
            pdf_file_paths: List of paths to PDF files

        Returns:
            Tuple of (invoices list, summary dict)

        Raises:
            ValueError: If no valid PDFs provided
        """
        invoices = []
        errors = []

        for file_path in pdf_file_paths:
            try:
                logger.info(f"Starting to process invoice: {file_path}")
                invoice = self._process_single_invoice(file_path)
                logger.info(f"Successfully processed: {file_path}")
                invoices.append(invoice)
            except Exception as e:
                error_msg = f"Error processing {os.path.basename(file_path)}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                errors.append(error_msg)

        if not invoices:
            raise ValueError("No invoices could be processed from provided files")

        summary = self.excel_generator.get_summary_data(invoices)
        summary['errors'] = errors if errors else None

        return invoices, summary

    def _process_single_invoice(self, pdf_path: str) -> Dict:
        """
        Process a single PDF invoice.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with extracted invoice data

        Raises:
            Exception: If processing fails
        """
        if not validate_pdf(pdf_path):
            raise ValueError(f"Invalid PDF file: {pdf_path}")

        pdf_text = extract_text_from_pdf(pdf_path)

        if not pdf_text.strip():
            raise ValueError("Could not extract readable text from PDF")

        invoice_data = self.extractor.extract_invoice_data(pdf_text)
        invoice_data = normalize_currency_data(invoice_data)

        comparison_amount = float(invoice_data.get('total_amount_usd', invoice_data.get('total_amount', 0)))
        invoice_data['flagged'] = comparison_amount > self.FLAGGED_AMOUNT_THRESHOLD

        return invoice_data

    def generate_excel_export(self, invoices: List[Dict]) -> str:
        """
        Generate Excel file from invoices.

        Args:
            invoices: List of invoice dictionaries

        Returns:
            Path to generated Excel file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"invoices_export_{timestamp}.xlsx"
        output_path = os.path.join(self.temp_dir, output_filename)

        self.excel_generator.generate_invoice_report(invoices, output_path)
        return output_path

    def cleanup_temp_files(self, file_paths: List[str]):
        """Clean up temporary uploaded files."""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Deleted temporary file: {file_path}")
            except Exception as e:
                logger.warning(f"Could not delete temp file {file_path}: {str(e)}")

from pypdf import PdfReader
import json
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Extracted text from the PDF

    Raises:
        Exception: If PDF is invalid or cannot be read
    """
    try:
        logger.info(f"Extracting text from PDF: {pdf_path}")
        text = ""
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PdfReader(pdf_file)
            logger.info(f"PDF has {len(pdf_reader.pages)} pages")

            if len(pdf_reader.pages) == 0:
                raise ValueError("PDF file is empty")

            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()

            logger.info(f"Extracted {len(text)} characters from PDF")

        if not text.strip():
            raise ValueError("Could not extract text from PDF. The file might be image-based.")

        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
        raise


def validate_pdf(pdf_path: str) -> bool:
    """
    Validate if a file is a valid PDF.

    Args:
        pdf_path: Path to the file

    Returns:
        True if valid PDF, False otherwise
    """
    try:
        with open(pdf_path, 'rb') as pdf_file:
            PdfReader(pdf_file)
        return True
    except Exception:
        return False

import json
import logging
from typing import Dict, List
from openai import OpenAI
import os

logger = logging.getLogger(__name__)


class InvoiceExtractor:
    def __init__(self, api_key: str):
        """Initialize OpenAI client with API key."""
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4"

    def extract_invoice_data(self, pdf_text: str) -> Dict:
        """
        Extract structured invoice data from PDF text using OpenAI.

        Args:
            pdf_text: Extracted text from the PDF file

        Returns:
            Dictionary containing extracted invoice information

        Raises:
            Exception: If API call fails or data extraction fails
        """
        try:
            logger.info(f"Starting OpenAI extraction with model: {self.model}")
            prompt = self._create_extraction_prompt(pdf_text)
            logger.info(f"Prompt created with {len(pdf_text)} characters of PDF text")

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting structured data from invoices. Extract the requested information and return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=4000
            )

            logger.info("OpenAI API call successful")
            response_text = response.choices[0].message.content
            logger.info(f"OpenAI response: {response_text[:200]}...")  # Log first 200 chars
            extracted_data = self._parse_response(response_text)
            logger.info("Successfully parsed invoice data")

            return extracted_data

        except Exception as e:
            logger.error(f"Error extracting invoice data: {str(e)}", exc_info=True)
            raise

    def _create_extraction_prompt(self, pdf_text: str) -> str:
        """Create the prompt for invoice data extraction."""
        return f"""Extract the following information from this invoice text and return ONLY a valid JSON object with this exact structure:
{{
    "vendor_name": "Company or vendor name",
    "invoice_number": "Invoice number or ID",
    "invoice_date": "Date in YYYY-MM-DD format",
    "total_amount": 0.00,
    "line_items": [
        {{
            "description": "Item description",
            "cost": 0.00
        }}
    ]
}}

Rules:
- If a field is not found, use empty string for text or 0.00 for numbers
- Total amount must be a number only, no currency symbols
- Invoice date MUST be in YYYY-MM-DD format (e.g., "2024-03-01"). Convert dates from any format (like "1. März 2024", "March 1, 2024", etc.) to YYYY-MM-DD
- Extract ALL line items from the invoice - do not skip any items, even if they have a cost of 0.00
- Each line item must have description and cost (use the "Total Amount" column, not the unit price)
- Include ALL services, fees, and charges listed in the invoice
- Return ONLY the JSON object, no other text

Invoice text:
{pdf_text}"""

    def _parse_response(self, response_text: str) -> Dict:
        """Parse the OpenAI response and extract JSON data."""
        try:
            # Try to find JSON in the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1

            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")

            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)

            # Validate and clean data
            data['vendor_name'] = str(data.get('vendor_name', '')).strip()
            data['invoice_number'] = str(data.get('invoice_number', '')).strip()
            data['invoice_date'] = str(data.get('invoice_date', '')).strip()

            # Ensure total_amount is a number
            try:
                data['total_amount'] = float(data.get('total_amount', 0))
            except (ValueError, TypeError):
                data['total_amount'] = 0.0

            # Validate line items
            line_items = data.get('line_items', [])
            if not isinstance(line_items, list):
                line_items = []

            cleaned_items = []
            for item in line_items:
                try:
                    cleaned_items.append({
                        'description': str(item.get('description', '')).strip(),
                        'cost': float(item.get('cost', 0))
                    })
                except (ValueError, TypeError):
                    continue

            data['line_items'] = cleaned_items

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            raise ValueError(f"Failed to parse invoice data: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing response: {str(e)}")
            raise

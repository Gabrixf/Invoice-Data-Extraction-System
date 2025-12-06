from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LineItem(BaseModel):
    description: str
    cost: float


class ExtractedInvoice(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str
    total_amount: float
    line_items: List[LineItem]
    flagged: bool = False


class InvoiceProcessingResponse(BaseModel):
    invoices: List[ExtractedInvoice]
    summary: dict
    excel_file_path: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None

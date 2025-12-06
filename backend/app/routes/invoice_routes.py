import logging
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.services.invoice_service import InvoiceProcessingService
from app.schemas import InvoiceProcessingResponse, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


def get_invoice_service() -> InvoiceProcessingService:
    """Get invoice processing service with API key."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not configured"
        )
    return InvoiceProcessingService(api_key)


@router.post("/process", response_model=InvoiceProcessingResponse)
async def process_invoices(files: List[UploadFile] = File(...)):
    """
    Process PDF invoices and extract data.

    Returns:
        InvoiceProcessingResponse with extracted data and summary
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    temp_file_paths = []
    service = None

    try:
        service = get_invoice_service()

        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is not a PDF"
                )

            temp_path = f"temp_uploads/{file.filename}"
            os.makedirs("temp_uploads", exist_ok=True)

            with open(temp_path, "wb") as f:
                content = await file.read()
                f.write(content)

            temp_file_paths.append(temp_path)

        invoices, summary = service.process_invoices(temp_file_paths)
        excel_path = service.generate_excel_export(invoices)
        excel_filename = os.path.basename(excel_path)

        return InvoiceProcessingResponse(
            invoices=invoices,
            summary=summary,
            excel_file_path=excel_filename
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing invoices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing invoices: {str(e)}"
        )
    finally:
        if service:
            service.cleanup_temp_files(temp_file_paths)


@router.get("/export/{filename}")
async def download_export(filename: str):
    """
    Download generated Excel export file.

    Args:
        filename: Name of the export file

    Returns:
        File response for download
    """
    from fastapi.responses import FileResponse

    file_path = f"temp_uploads/{filename}"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=filename
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

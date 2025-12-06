import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.invoice_routes import router as invoice_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Invoice Data Extraction System",
    description="Extract data from PDF invoices using AI",
    version="1.0.0"
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoice_router)


@app.on_event("startup")
async def startup_event():
    """Initialize app on startup."""
    logger.info("Invoice Extraction System starting up")
    os.makedirs("temp_uploads", exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Invoice Data Extraction System API",
        "docs": "/docs",
        "redoc": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Invoice Data Extraction System

A full-stack application for extracting structured data from PDF invoices using OpenAI's API and exporting the results to Excel.

## Features

- **PDF Invoice Processing**: Upload single or multiple PDF invoices
- **AI-Powered Data Extraction**: Uses OpenAI GPT-4 Turbo for superior accuracy in extracting:
  - Company/Vendor Name
  - Invoice Number
  - Invoice Date
  - Total Amount
  - Line Items (description and cost)
- **Automatic Flagging**: Invoices exceeding $5,000 are flagged
- **Excel Export**: Generate formatted Excel reports with:
  - Detailed invoice data
  - Summary statistics
  - Color-coded flagged invoices
- **Error Handling**: Graceful error handling for invalid PDFs and API failures
- **Modern UI**: React + Vite frontend with Tailwind CSS styling

## Architecture

```
Invoice-Data-Extraction-System/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── schemas.py        # Pydantic models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helper functions
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── main.jsx          # React entry point
│   │   ├── App.jsx           # Main component
│   │   ├── components/       # React components
│   │   └── services/         # API client
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── README.md                 # This file
├── 00_START_HERE.md          # Quick start guide
├── ENHANCEMENT_IDEAS.md      # Feature ideas and improvements
└── Other documentation files
```

## ✨ Recently Implemented Features

### 1. Advanced Data Validation ✅

✅ **File Upload Validation** - File type, size (50MB max), count (20 max)
✅ **Invoice Validation** - Field-level checks with error/warning detection
✅ **Confidence Scoring** - 0-100% quality score per invoice
✅ **Quality Dashboard** - Distribution across 5 quality tiers
✅ **Issue Detection** - Expandable details with specific errors/warnings

See **[DATA_VALIDATION_GUIDE.md](DATA_VALIDATION_GUIDE.md)** for details.

### 2. Multi-Currency Support 💱

✅ **Auto Currency Detection** - 16+ major currencies (USD, EUR, GBP, JPY, CAD, AUD, etc.)
✅ **Multi-Currency Dashboard** - Total in USD, currencies detected, invoices by currency
✅ **Smart Flagging** - Uses USD-converted amounts for consistent threshold comparison
✅ **Enhanced Display** - Original currency + amount, USD conversion, confidence indicator
✅ **Formatted Amounts** - Proper formatting in detected currency ($1,234.56, €1.234,56, etc.)

See **[MULTI_CURRENCY_GUIDE.md](MULTI_CURRENCY_GUIDE.md)** for complete details.

---

## Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend)
- OpenAI API Key (get one at https://platform.openai.com)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk_your_actual_api_key_here
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend

From the `backend` directory:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Start the Frontend

From the `frontend` directory:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Process Invoices
**POST** `/api/invoices/process`

Upload PDF files for processing.

**Request:**
- Form data with `files` field containing PDF files

**Response:**
```json
{
  "invoices": [
    {
      "vendor_name": "Acme Corp",
      "invoice_number": "INV-001",
      "invoice_date": "2024-01-15",
      "total_amount": 1500.00,
      "line_items": [
        {
          "description": "Service A",
          "cost": 1000.00
        }
      ],
      "flagged": false
    }
  ],
  "summary": {
    "total_invoices_processed": 1,
    "total_amount": 1500.00,
    "flagged_invoices_count": 0
  },
  "excel_file_path": "invoices_export_20240121_153042.xlsx"
}
```

### Download Excel Export
**GET** `/api/invoices/export/{filename}`

Download the generated Excel file.

### Health Check
**GET** `/api/invoices/health`

Check API status.

## Code Structure

### Backend

**Services** (`app/services/invoice_service.py`):
- `InvoiceProcessingService`: Orchestrates the entire invoice processing pipeline
- Handles PDF validation, text extraction, OpenAI calls, and Excel generation

**Utils**:
- `pdf_handler.py`: PDF text extraction and validation
- `openai_service.py`: OpenAI API integration for data extraction
- `excel_generator.py`: Excel file generation with formatting

**Routes** (`app/routes/invoice_routes.py`):
- `/api/invoices/process`: Main processing endpoint
- `/api/invoices/export/{filename}`: File download endpoint
- `/api/invoices/health`: Health check

### Frontend

**Components**:
- `FileUpload.jsx`: Drag-and-drop file upload interface
- `InvoiceTable.jsx`: Displays extracted invoice data in a table
- `SummarySection.jsx`: Shows summary statistics and download button

**Services**:
- `api.js`: Axios-based API client for backend communication

## Error Handling

The application handles various error scenarios:

1. **Invalid PDF files**: Returns 400 error with description
2. **API failures**: Displays user-friendly error messages
3. **Empty PDFs**: Detected and reported
4. **Missing data**: Gracefully defaults to empty strings or 0
5. **Network errors**: Timeout and connection errors are caught and reported

## Data Extraction Logic

The OpenAI extraction uses GPT-4 Turbo with:
- Temperature: 0.3 (low for consistency)
- Max tokens: 1500
- Structured JSON output format
- Superior accuracy for complex invoice formats
- Validation and cleaning of extracted data

## Excel Report Format

The generated Excel file includes:
- **Invoice Data Sheet**: One row per invoice with:
  - Vendor Name
  - Invoice Number
  - Invoice Date
  - Total Amount (formatted as currency)
  - Line Items Count
  - Flagged Status (highlighted in red if exceeds $5,000)

- **Summary Section**:
  - Total invoices processed
  - Total amount across all invoices
  - Count of flagged invoices

## Testing

### Test Data

Create sample PDF invoices with:
1. Simple text-based PDFs
2. Different invoice formats
3. Invoices with amounts >$5,000 for flagging validation
4. Invoices with missing fields

### Manual Testing Steps

1. Upload a single invoice
2. Upload multiple invoices at once
3. Verify flagged status for high-value invoices
4. Download and verify Excel file formatting
5. Test error handling with invalid files

## Performance Considerations

- PDF processing time: ~2-5 seconds per invoice (depends on size and complexity)
- OpenAI API calls: ~1-2 seconds per invoice
- Temporary files are cleaned up after processing
- Excel generation is optimized with minimal memory usage

## Limitations

- PDF must contain extractable text (not image-based scans)
- OCR is not supported in the current version
- Line items are extracted best-effort from available text
- Invoice amounts are validated as numbers

## Future Enhancements

- Add OCR support for image-based PDFs
- Implement batch processing with job queue
- Add invoice templates for different formats
- Support for more export formats (CSV, JSON)
- Advanced filtering and search functionality
- User authentication and invoice history

## Troubleshooting

### Backend won't start
- Verify Python 3.8+ is installed
- Check OpenAI API key is valid
- Ensure port 8000 is not in use

### Frontend won't compile
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

### API calls fail
- Verify backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify OpenAI API key in .env file

### PDF extraction fails
- Ensure PDF is not corrupted
- Check if PDF is text-based (not image-only)
- Try with a different PDF file

## API Cost

This application uses OpenAI's GPT-4 Turbo API for superior accuracy:
- Approximately $0.003-0.005 per invoice processed
- $5 covers approximately 1,000-1,700 invoices
- Higher cost offset by significantly better extraction accuracy
- Perfect for production use where accuracy is critical

## License

MIT

## Support

For issues or questions, please check:
1. The troubleshooting section above
2. OpenAI API documentation
3. FastAPI documentation
4. Vite documentation

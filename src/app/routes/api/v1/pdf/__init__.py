from fastapi import APIRouter, File, Form, UploadFile

from src.app.routes.api.v1.pdf.controller import PDFController
from src.app.routes.api.v1.pdf.validator import PDFInfoResponse

# Create the router
router = APIRouter()


@router.post(
    "/unlock",
    summary="Unlock PDF",
    description="Unlock a password-protected PDF file",
    response_description="Unlocked PDF file for download",
)
async def unlock_pdf(
    file: UploadFile = File(..., description="The password-protected PDF file"),
    password: str = Form(..., description="The password to unlock the PDF"),
):
    """
    Unlock a password-protected PDF file.

    Args:
        file: The password-protected PDF file
        password: The password to unlock the PDF

    Returns:
        The unlocked PDF file for download
    """
    return await PDFController.unlock_pdf(file, password)


@router.post(
    "/info",
    response_model=PDFInfoResponse,
    summary="Get PDF Info",
    description="Get information about a PDF file",
)
async def get_pdf_info(
    file: UploadFile = File(..., description="The PDF file"),
    include_metadata: bool = Form(False, description="Whether to include PDF metadata"),
):
    """
    Get information about a PDF file.

    Args:
        file: The PDF file
        include_metadata: Whether to include PDF metadata

    Returns:
        PDF information including page count, encryption status, etc.
    """
    return await PDFController.get_pdf_info(file, include_metadata)


@router.post(
    "/subset",
    summary="Create PDF Subset",
    description="Create a subset of PDF pages from start_page to end_page",
    response_description="Subset PDF file for download",
)
async def create_pdf_subset(
    file: UploadFile = File(..., description="The PDF file"),
    start_page: int = Form(..., description="Starting page number (1-indexed)"),
    end_page: int = Form(..., description="Ending page number (1-indexed)"),
):
    """
    Create a subset of PDF pages from start_page to end_page.

    Args:
        file: The PDF file
        start_page: Starting page number (1-indexed)
        end_page: Ending page number (1-indexed)

    Returns:
        The subset PDF file for download
    """
    return await PDFController.create_pdf_subset(file, start_page, end_page)


@router.get(
    "/",
    summary="PDF Utilities Info",
    description="Get information about available PDF utilities",
)
async def get_pdf_utilities_info():
    """
    Get information about available PDF utilities.

    Returns:
        Information about PDF utilities and their endpoints
    """
    return {
        "utility": "PDF Utilities",
        "description": "Various PDF processing utilities (unlock, info, etc.)",
        "version": "1.0.0",
        "endpoints": {
            "unlock": "POST /unlock - Unlock a password-protected PDF file",
            "info": "POST /info - Get information about a PDF file",
        },
    }

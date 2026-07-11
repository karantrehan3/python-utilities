from typing import List

from fastapi import APIRouter, File, Form, UploadFile

from src.app.routes.api.v1.pdf.controller import PDFController
from src.app.routes.api.v1.pdf.validator import PDFCompressResponse, PDFInfoResponse

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
    return await PDFController.create_pdf_subset(file, start_page, end_page)


@router.post(
    "/from-images",
    summary="Images to PDF",
    description="Convert multiple image files into a single PDF document",
    response_description="PDF file for download",
)
async def images_to_pdf(
    files: List[UploadFile] = File(
        ..., description="Image files to combine into a PDF"
    ),
):
    return await PDFController.images_to_pdf(files)


@router.post(
    "/compress",
    summary="Compress PDF",
    description=(
        "Compress a PDF file by re-encoding images and removing unused objects. "
        "Returns the compressed file with compression stats in response headers."
    ),
    response_description="Compressed PDF file for download",
)
async def compress_pdf(
    file: UploadFile = File(..., description="The PDF file to compress"),
    image_quality: int = Form(
        80,
        description="JPEG quality for re-encoded images (1-100, lower = smaller)",
        ge=1,
        le=100,
    ),
    garbage_collect: bool = Form(
        True,
        description="Remove unused objects and deduplicate streams",
    ),
):
    response, _stats = await PDFController.compress_pdf(
        file, image_quality, garbage_collect
    )
    return response


@router.post(
    "/compress/info",
    response_model=PDFCompressResponse,
    summary="Compress PDF (with stats)",
    description=(
        "Compress a PDF and return compression statistics as JSON "
        "instead of the file. Useful for previewing savings before downloading."
    ),
)
async def compress_pdf_info(
    file: UploadFile = File(..., description="The PDF file to compress"),
    image_quality: int = Form(
        80,
        description="JPEG quality for re-encoded images (1-100, lower = smaller)",
        ge=1,
        le=100,
    ),
    garbage_collect: bool = Form(
        True,
        description="Remove unused objects and deduplicate streams",
    ),
):
    _response, stats = await PDFController.compress_pdf(
        file, image_quality, garbage_collect
    )
    return stats


@router.get(
    "/",
    summary="PDF Utilities Info",
    description="Get information about available PDF utilities",
)
async def get_pdf_utilities_info():
    return {
        "utility": "PDF Utilities",
        "description": "Various PDF processing utilities",
        "version": "1.1.0",
        "endpoints": {
            "unlock": "POST /unlock - Unlock a password-protected PDF file",
            "info": "POST /info - Get information about a PDF file",
            "subset": "POST /subset - Extract a page range into a new PDF",
            "from_images": "POST /from-images - Combine images into a PDF",
            "compress": "POST /compress - Compress a PDF (returns file)",
            "compress_info": "POST /compress/info - Compress a PDF (returns stats JSON)",
        },
    }

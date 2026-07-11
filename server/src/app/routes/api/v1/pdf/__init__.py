from typing import List, Optional

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
    "/merge",
    summary="Merge PDFs",
    description="Merge multiple PDF files into a single document, in the order provided",
    response_description="Merged PDF file for download",
)
async def merge_pdfs(
    files: List[UploadFile] = File(
        ..., description="PDF files to merge (order is preserved)"
    ),
):
    return await PDFController.merge_pdfs(files)


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


@router.post(
    "/rotate",
    summary="Rotate PDF Pages",
    description=("Rotate specified pages of a PDF " "by 90, 180, or 270 degrees"),
    response_description="Rotated PDF file for download",
)
async def rotate_pdf(
    file: UploadFile = File(..., description="The PDF file"),
    rotation: int = Form(
        ...,
        description="Rotation degrees (90, 180, or 270)",
    ),
    pages: Optional[str] = Form(
        None,
        description=(
            "Comma-separated page numbers to rotate "
            "(e.g. '1,3,5'). Omit to rotate all pages."
        ),
    ),
):
    return await PDFController.rotate_pdf(file, rotation, pages)


@router.post(
    "/watermark",
    summary="Add Watermark",
    description=("Add a text watermark to every page of a PDF"),
    response_description="Watermarked PDF file for download",
)
async def watermark_pdf(
    file: UploadFile = File(..., description="The PDF file"),
    text: str = Form(..., description="Watermark text"),
    font_size: int = Form(48, description="Font size for the watermark"),
    opacity: float = Form(
        0.3,
        description="Watermark opacity (0-1)",
        ge=0,
        le=1,
    ),
    position: str = Form(
        "diagonal",
        description=("Watermark position: 'center' or 'diagonal'"),
    ),
):
    return await PDFController.watermark_pdf(file, text, font_size, opacity, position)


@router.post(
    "/to-images",
    summary="PDF to Images",
    description=("Convert each PDF page to an image, " "returned as a ZIP file"),
    response_description="ZIP file containing page images",
)
async def pdf_to_images(
    file: UploadFile = File(..., description="The PDF file"),
    format: str = Form(
        "png",
        description="Image format: 'png' or 'jpeg'",
    ),
    dpi: int = Form(150, description="Image resolution in DPI"),
):
    return await PDFController.pdf_to_images(file, format, dpi)


@router.post(
    "/add-page-numbers",
    summary="Add Page Numbers",
    description=("Stamp page numbers on each page of a PDF"),
    response_description="Numbered PDF file for download",
)
async def add_page_numbers(
    file: UploadFile = File(..., description="The PDF file"),
    position: str = Form(
        "bottom-center",
        description=("Position: 'bottom-center', " "'bottom-right', or 'bottom-left'"),
    ),
    start_number: int = Form(1, description="Starting page number"),
    font_size: int = Form(12, description="Font size for page numbers"),
):
    return await PDFController.add_page_numbers(file, position, start_number, font_size)


@router.post(
    "/protect",
    summary="Protect PDF",
    description=("Add password protection to a PDF file"),
    response_description="Protected PDF file for download",
)
async def protect_pdf(
    file: UploadFile = File(..., description="The PDF file"),
    user_password: str = Form(
        ...,
        description="Password required to open the PDF",
    ),
    owner_password: Optional[str] = Form(
        None,
        description=(
            "Owner password for full access. " "Defaults to user_password if omitted."
        ),
    ),
    permissions: Optional[int] = Form(
        None,
        description="PyMuPDF permission flags (integer)",
    ),
):
    return await PDFController.protect_pdf(
        file, user_password, owner_password, permissions
    )


@router.post(
    "/split",
    summary="Split PDF",
    description=("Split each page into its own PDF, " "returned as a ZIP file"),
    response_description=("ZIP file containing individual page PDFs"),
)
async def split_pdf(
    file: UploadFile = File(..., description="The PDF file"),
):
    return await PDFController.split_pdf(file)


@router.get(
    "/",
    summary="PDF Utilities Info",
    description="Get information about available PDF utilities",
)
async def get_pdf_utilities_info():
    return {
        "utility": "PDF Utilities",
        "description": "Various PDF processing utilities",
        "version": "2.0.0",
        "endpoints": {
            "unlock": ("POST /unlock - " "Unlock a password-protected PDF"),
            "info": ("POST /info - " "Get information about a PDF"),
            "subset": ("POST /subset - " "Extract a page range into a new PDF"),
            "merge": ("POST /merge - " "Merge multiple PDFs into one"),
            "from_images": ("POST /from-images - " "Combine images into a PDF"),
            "compress": ("POST /compress - " "Compress a PDF (returns file)"),
            "compress_info": (
                "POST /compress/info - " "Compress a PDF (returns stats JSON)"
            ),
            "rotate": ("POST /rotate - " "Rotate pages by 90/180/270 degrees"),
            "watermark": ("POST /watermark - " "Add text watermark to every page"),
            "to_images": ("POST /to-images - " "Convert pages to images (ZIP)"),
            "add_page_numbers": (
                "POST /add-page-numbers - " "Stamp page numbers on each page"
            ),
            "protect": ("POST /protect - " "Add password protection to a PDF"),
            "split": ("POST /split - " "Split each page into its own PDF (ZIP)"),
        },
    }

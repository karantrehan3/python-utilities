import asyncio
import io
import os
from typing import List

import fitz  # PyMuPDF
from fastapi import UploadFile
from fastapi.responses import Response
from PIL import Image

from src.app.dependencies.common import FileHandler, ProcessingError, ValidationError
from src.app.routes.api.v1.pdf.validator import PDFCompressResponse, PDFInfoResponse


class PDFController:
    """Controller for PDF utility operations"""

    @staticmethod
    async def unlock_pdf(file: UploadFile, password: str) -> Response:
        """
        Unlock a password-protected PDF file.

        Args:
            file: The password-protected PDF file
            password: The password to unlock the PDF

        Returns:
            The unlocked PDF file for download
        """
        # Validate file type
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationError("File must be a PDF", "file")

        temp_input_path = None
        temp_output_path = None

        try:
            # Create temporary input file
            temp_input_path = FileHandler.create_temp_file(suffix=".pdf")
            content = await file.read()
            with open(temp_input_path, "wb") as temp_input:
                temp_input.write(content)

            # Create temporary output file
            temp_output_path = FileHandler.create_temp_file(suffix="_unlocked.pdf")

            # Unlock the PDF
            success = PDFController._unlock_pdf_file(
                temp_input_path, temp_output_path, password
            )

            if not success:
                raise ValidationError(
                    "Failed to unlock PDF. Check if the password is correct."
                )

            # Read the unlocked file content
            with open(temp_output_path, "rb") as unlocked_file:
                file_content = unlocked_file.read()

            # Schedule cleanup after response is sent
            asyncio.create_task(
                FileHandler.cleanup_temp_files(temp_input_path, temp_output_path)
            )

            # Return the unlocked file as response
            original_filename = file.filename or "document.pdf"
            filename = f"unlocked_{original_filename}"
            return Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(len(file_content)),
                },
            )

        except ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            # Clean up on error
            if temp_input_path and os.path.exists(temp_input_path):
                os.unlink(temp_input_path)
            if temp_output_path and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
            raise ProcessingError(
                f"An error occurred while processing the PDF: {str(e)}"
            )

    @staticmethod
    async def get_pdf_info(
        file: UploadFile, include_metadata: bool = False
    ) -> PDFInfoResponse:
        """
        Get information about a PDF file.

        Args:
            file: The PDF file
            include_metadata: Whether to include PDF metadata

        Returns:
            PDF information response
        """
        # Validate file type
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationError("File must be a PDF", "file")

        temp_input_path = None

        try:
            # Create temporary input file
            temp_input_path = FileHandler.create_temp_file(suffix=".pdf")
            content = await file.read()
            with open(temp_input_path, "wb") as temp_input:
                temp_input.write(content)

            # Get PDF info
            info = PDFController._get_pdf_info(temp_input_path, include_metadata)

            # Clean up
            if temp_input_path and os.path.exists(temp_input_path):
                os.unlink(temp_input_path)

            return info

        except ValidationError:
            raise
        except Exception as e:
            # Clean up on error
            if temp_input_path and os.path.exists(temp_input_path):
                os.unlink(temp_input_path)
            raise ProcessingError(
                f"An error occurred while processing the PDF: {str(e)}"
            )

    @staticmethod
    async def create_pdf_subset(
        file: UploadFile, start_page: int, end_page: int
    ) -> Response:
        """
        Create a subset of PDF pages from start_page to end_page.

        Args:
            file: The PDF file
            start_page: Starting page number (1-indexed)
            end_page: Ending page number (1-indexed)

        Returns:
            The subset PDF file for download
        """
        # Validate file type
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationError("File must be a PDF", "file")

        temp_input_path = None
        temp_output_path = None

        try:
            # Create temporary input file
            temp_input_path = FileHandler.create_temp_file(suffix=".pdf")
            content = await file.read()
            with open(temp_input_path, "wb") as temp_input:
                temp_input.write(content)

            # Create temporary output file
            temp_output_path = FileHandler.create_temp_file(suffix="_subset.pdf")

            # Create PDF subset
            success = PDFController._create_pdf_subset(
                temp_input_path, temp_output_path, start_page, end_page
            )

            if not success:
                raise ProcessingError("Failed to create PDF subset")

            # Read the subset file content
            with open(temp_output_path, "rb") as subset_file:
                file_content = subset_file.read()

            # Schedule cleanup after response is sent
            asyncio.create_task(
                FileHandler.cleanup_temp_files(temp_input_path, temp_output_path)
            )

            # Return the subset file as response
            original_filename = file.filename or "document.pdf"
            filename = f"pages_{start_page}-{end_page}_{original_filename}"
            return Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(len(file_content)),
                },
            )

        except ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            # Clean up on error
            if temp_input_path and os.path.exists(temp_input_path):
                os.unlink(temp_input_path)
            if temp_output_path and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
            raise ProcessingError(
                f"An error occurred while processing the PDF: {str(e)}"
            )

    @staticmethod
    async def merge_pdfs(files: List[UploadFile]) -> Response:
        if len(files) < 2:
            raise ValidationError("At least two PDF files are required", "files")

        temp_paths: List[str] = []
        temp_output_path = None

        try:
            for f in files:
                if not f.filename or not f.filename.lower().endswith(".pdf"):
                    raise ValidationError(
                        f"All files must be PDFs, got: {f.filename}", "files"
                    )
                content = await f.read()
                path = FileHandler.create_temp_file(suffix=".pdf")
                with open(path, "wb") as tmp:
                    tmp.write(content)
                temp_paths.append(path)

            temp_output_path = FileHandler.create_temp_file(suffix="_merged.pdf")

            merged = fitz.open()
            for path in temp_paths:
                doc = fitz.open(path)
                merged.insert_pdf(doc)
                doc.close()

            merged.save(temp_output_path)
            merged.close()

            with open(temp_output_path, "rb") as merged_file:
                file_content = merged_file.read()

            asyncio.create_task(
                FileHandler.cleanup_temp_files(*temp_paths, temp_output_path)
            )

            return Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": 'attachment; filename="merged.pdf"',
                    "Content-Length": str(len(file_content)),
                },
            )

        except ValidationError:
            raise
        except Exception as e:
            for path in temp_paths:
                if os.path.exists(path):
                    os.unlink(path)
            if temp_output_path and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
            raise ProcessingError(f"An error occurred while merging PDFs: {str(e)}")

    @staticmethod
    async def images_to_pdf(files: List[UploadFile]) -> Response:
        if len(files) < 1:
            raise ValidationError("At least one image file is required", "files")

        temp_output_path = None

        try:
            images: List[Image.Image] = []
            for f in files:
                content = await f.read()
                try:
                    img = Image.open(io.BytesIO(content))
                    if img.mode in ("RGBA", "LA", "P"):
                        background = Image.new("RGB", img.size, (255, 255, 255))
                        if img.mode == "P":
                            img = img.convert("RGBA")
                        background.paste(
                            img,
                            mask=img.split()[-1] if img.mode == "RGBA" else None,
                        )
                        img = background
                    elif img.mode != "RGB":
                        img = img.convert("RGB")
                    images.append(img)
                except Exception:
                    raise ValidationError(f"Invalid image file: {f.filename}", "files")

            temp_output_path = FileHandler.create_temp_file(suffix=".pdf")

            first_image = images[0]
            remaining = images[1:] if len(images) > 1 else []
            first_image.save(
                temp_output_path,
                "PDF",
                save_all=True,
                append_images=remaining,
                resolution=72.0,
            )

            with open(temp_output_path, "rb") as pdf_file:
                file_content = pdf_file.read()

            asyncio.create_task(FileHandler.cleanup_temp_files(temp_output_path))

            return Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": 'attachment; filename="images.pdf"',
                    "Content-Length": str(len(file_content)),
                },
            )

        except ValidationError:
            raise
        except Exception as e:
            if temp_output_path and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
            raise ProcessingError(
                f"An error occurred while creating PDF from images: {str(e)}"
            )

    @staticmethod
    async def compress_pdf(
        file: UploadFile,
        image_quality: int = 80,
        garbage_collect: bool = True,
    ) -> tuple[Response, PDFCompressResponse]:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationError("File must be a PDF", "file")

        if not 1 <= image_quality <= 100:
            raise ValidationError(
                "image_quality must be between 1 and 100", "image_quality"
            )

        temp_input_path = None
        temp_output_path = None

        try:
            temp_input_path = FileHandler.create_temp_file(suffix=".pdf")
            content = await file.read()
            original_size = len(content)
            with open(temp_input_path, "wb") as temp_input:
                temp_input.write(content)

            temp_output_path = FileHandler.create_temp_file(suffix="_compressed.pdf")

            PDFController._compress_pdf_file(
                temp_input_path,
                temp_output_path,
                image_quality=image_quality,
                garbage_collect=garbage_collect,
            )

            with open(temp_output_path, "rb") as compressed:
                file_content = compressed.read()

            compressed_size = len(file_content)
            reduction = (
                ((original_size - compressed_size) / original_size) * 100
                if original_size > 0
                else 0.0
            )

            asyncio.create_task(
                FileHandler.cleanup_temp_files(temp_input_path, temp_output_path)
            )

            original_filename = file.filename or "document.pdf"
            filename = f"compressed_{original_filename}"

            response = Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(compressed_size),
                    "X-Original-Size": str(original_size),
                    "X-Compressed-Size": str(compressed_size),
                    "X-Reduction-Percent": f"{reduction:.1f}",
                },
            )

            stats = PDFCompressResponse(
                original_size=original_size,
                compressed_size=compressed_size,
                reduction_percent=round(reduction, 1),
            )

            return response, stats

        except ValidationError:
            raise
        except Exception as e:
            if temp_input_path and os.path.exists(temp_input_path):
                os.unlink(temp_input_path)
            if temp_output_path and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
            raise ProcessingError(
                f"An error occurred while compressing the PDF: {str(e)}"
            )

    @staticmethod
    def _compress_pdf_file(
        input_file: str,
        output_file: str,
        image_quality: int = 80,
        garbage_collect: bool = True,
    ) -> None:
        doc = fitz.open(input_file)

        for page in doc:
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                try:
                    base_image = doc.extract_image(xref)
                    if not base_image:
                        continue

                    image_bytes = base_image["image"]
                    pil_image = Image.open(io.BytesIO(image_bytes))

                    if pil_image.mode in ("RGBA", "LA", "P"):
                        pil_image = pil_image.convert("RGB")
                    elif pil_image.mode != "RGB":
                        pil_image = pil_image.convert("RGB")

                    buf = io.BytesIO()
                    pil_image.save(
                        buf, format="JPEG", quality=image_quality, optimize=True
                    )

                    if len(buf.getvalue()) < len(image_bytes):
                        doc.update_stream(xref, buf.getvalue())
                except Exception:
                    continue

        gc_level = 4 if garbage_collect else 0
        doc.save(
            output_file,
            garbage=gc_level,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True,
        )
        doc.close()

    @staticmethod
    def _unlock_pdf_file(input_file: str, output_file: str, password: str) -> bool:
        """
        Unlock a password-protected PDF file.

        Args:
            input_file: Path to the input PDF file
            output_file: Path to save the unlocked PDF file
            password: Password to unlock the PDF

        Returns:
            True if successful, False otherwise
        """
        try:
            doc = fitz.open(input_file)

            if doc.authenticate(password):
                doc.save(output_file)
                doc.close()
                return True
            else:
                doc.close()
                return False

        except Exception as e:
            print(f"Error unlocking PDF: {e}")
            return False

    @staticmethod
    def _get_pdf_info(
        input_file: str, include_metadata: bool = False
    ) -> PDFInfoResponse:
        """
        Get information about a PDF file.

        Args:
            input_file: Path to the input PDF file
            include_metadata: Whether to include PDF metadata

        Returns:
            PDF information response
        """
        try:
            doc = fitz.open(input_file)

            page_count = len(doc)
            is_encrypted = doc.is_encrypted
            file_size = os.path.getsize(input_file)

            metadata = None
            if include_metadata:
                metadata = doc.metadata

            doc.close()

            return PDFInfoResponse(
                page_count=page_count,
                is_encrypted=is_encrypted,
                file_size=file_size,
                metadata=metadata,
            )

        except Exception as e:
            print(f"Error getting PDF info: {e}")
            raise ProcessingError(f"Error getting PDF info: {str(e)}")

    @staticmethod
    def _create_pdf_subset(
        input_file: str, output_file: str, start_page: int, end_page: int
    ) -> bool:
        """
        Create a subset of PDF pages from start_page to end_page.

        Args:
            input_file: Path to the input PDF file
            output_file: Path to save the subset PDF file
            start_page: Starting page number (1-indexed)
            end_page: Ending page number (1-indexed)

        Returns:
            True if successful, False otherwise
        """
        try:
            doc = fitz.open(input_file)

            # Validate page range
            total_pages = len(doc)
            if start_page > total_pages or end_page > total_pages:
                doc.close()
                raise ValidationError(
                    f"Page range out of bounds. PDF has {total_pages} pages, "
                    f"but requested pages {start_page}-{end_page}"
                )

            if start_page < 1:
                doc.close()
                raise ValidationError("Start page must be 1 or greater")

            # Convert to 0-indexed for PyMuPDF
            start_idx = start_page - 1
            end_idx = end_page - 1

            # Create new document with selected pages
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=start_idx, to_page=end_idx)

            # Save the subset
            new_doc.save(output_file)
            new_doc.close()
            doc.close()

            return True

        except ValidationError:
            raise
        except Exception as e:
            print(f"Error creating PDF subset: {e}")
            return False

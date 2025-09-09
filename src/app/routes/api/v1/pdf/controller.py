import asyncio
import os

import fitz  # PyMuPDF
from fastapi import UploadFile
from fastapi.responses import Response

from src.app.dependencies.common import FileHandler, ProcessingError, ValidationError
from src.app.routes.api.v1.pdf.validator import PDFInfoResponse


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
            filename = f"unlocked_{file.filename}"
            return Response(
                content=file_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}",
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

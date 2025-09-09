import asyncio
import os
from typing import Any, Dict

import fitz  # PyMuPDF
from fastapi import File, Form, UploadFile
from fastapi.responses import Response

from ..dependencies.common import FileHandler, ProcessingError, ValidationError
from .base import BaseUtilityRouter, UtilityInfo


class PDFUnlockRouter(BaseUtilityRouter):
    """PDF Unlock utility router"""

    def __init__(self):
        super().__init__(prefix="/pdf/unlock", tags=["PDF Unlock"])

    def get_utility_info(self) -> Dict[str, Any]:
        """Return information about the PDF unlock utility"""
        info = UtilityInfo(
            name="PDF Unlock",
            description="Unlock password-protected PDF files",
            version="1.0.0",
            endpoints=[
                {
                    "name": "unlock",
                    "description": "POST /unlock - Unlock a password-protected PDF file",
                }
            ],
        )
        return info.to_dict()

    def _setup_routes(self) -> None:
        """Setup the routes for PDF unlock utility"""
        self._add_info_route()
        self._add_unlock_route()

    def _add_unlock_route(self) -> None:
        """Add the PDF unlock route"""

        @self.router.post(
            "",
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
                success = self._unlock_pdf_file(
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

    def _unlock_pdf_file(
        self, input_file: str, output_file: str, password: str
    ) -> bool:
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


# Create the router instance
pdf_unlock_router = PDFUnlockRouter()
router = pdf_unlock_router.router

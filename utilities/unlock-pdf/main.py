from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
import fitz  # PyMuPDF
import tempfile
import os
from typing import Optional
import uuid
import asyncio

app = FastAPI(title="PDF Unlock API", description="API to unlock password-protected PDF files")

@app.get("/")
async def root():
    return {"message": "PDF Unlock API is running"}

@app.post("/unlock")
async def unlock_pdf(
    file: UploadFile = File(...),
    password: str = Form(...)
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
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    temp_input_path = None
    temp_output_path = None
    
    try:
        # Create temporary input file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_input:
            content = await file.read()
            temp_input.write(content)
            temp_input_path = temp_input.name
        
        # Create temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix='_unlocked.pdf') as temp_output:
            temp_output_path = temp_output.name
        
        # Unlock the PDF
        success = unlock_pdf_file(temp_input_path, temp_output_path, password)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to unlock PDF. Check if the password is correct.")
        
        # Read the unlocked file content
        with open(temp_output_path, 'rb') as unlocked_file:
            file_content = unlocked_file.read()
        
        # Schedule cleanup after response is sent
        asyncio.create_task(cleanup_temp_files(temp_input_path, temp_output_path))
        
        # Return the unlocked file as response
        filename = f"unlocked_{file.filename}"
        return Response(
            content=file_content,
            media_type='application/pdf',
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_content))
            }
        )
        
    except Exception as e:
        # Clean up on error
        if temp_input_path and os.path.exists(temp_input_path):
            os.unlink(temp_input_path)
        if temp_output_path and os.path.exists(temp_output_path):
            os.unlink(temp_output_path)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

async def cleanup_temp_files(input_path: str, output_path: str):
    """Clean up temporary files after a short delay"""
    await asyncio.sleep(1)  # Give time for response to be sent
    try:
        if input_path and os.path.exists(input_path):
            os.unlink(input_path)
        if output_path and os.path.exists(output_path):
            os.unlink(output_path)
    except Exception as e:
        print(f"Error cleaning up temp files: {e}")

def unlock_pdf_file(input_file: str, output_file: str, password: str) -> bool:
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
        print(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

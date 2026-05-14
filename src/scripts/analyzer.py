import sys
import json
import os
import re

# ─── Tesseract Path Detection ──────────────────────────────────────────────────
# Supports Windows (local dev) and Linux (Render/production)
tesseract_paths = [
    # Linux / Render paths
    '/usr/bin/tesseract',
    '/usr/local/bin/tesseract',
    # Windows paths
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
]

def find_tesseract():
    """Returns the path to the Tesseract binary if found, else None."""
    for p in tesseract_paths:
        if os.path.exists(p):
            return p
    return None

def extract_text_from_image(img, tesseract_cmd=None):
    """Runs pytesseract OCR on a PIL Image."""
    import pytesseract
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    return pytesseract.image_to_string(img)

def extract_text(file_path):
    ext = file_path.lower().split('.')[-1]
    text = ""
    
    tesseract_cmd = find_tesseract()

    if ext == 'pdf':
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text("text") + "\n"

            # If PDF has no embedded text, use OCR on rendered images
            if len(text.strip()) < 20:
                text = ""
                try:
                    from PIL import Image
                    for page in doc:
                        pix = page.get_pixmap(dpi=300)
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        img = img.convert('L')  # Grayscale for better OCR
                        text += extract_text_from_image(img, tesseract_cmd) + "\n"
                except ImportError as e:
                    text = f"[Image OCR Error: {str(e)}]"
                except Exception as e:
                    text += f"[OCR Error: {str(e)}]"
        except ImportError as e:
            text = f"[PDF Extraction Error: Missing dependency - {str(e)}]"
        except Exception as e:
            text = f"[PDF Extraction Error: {str(e)}]"

    elif ext in ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff']:
        try:
            from PIL import Image, ImageEnhance
            img = Image.open(file_path)
            # Preprocessing: grayscale + contrast boost for better OCR accuracy
            img = img.convert('L')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)
            text = extract_text_from_image(img, tesseract_cmd)
        except ImportError as e:
            text = f"[Image OCR Error: {str(e)}]"
        except Exception as e:
            text = f"[Image OCR Error: {str(e)}]"

    elif ext == 'txt':
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        except Exception as e:
            text = f"[Text Read Error: {str(e)}]"
    else:
        text = f"[Unsupported file type: {ext}]"

    return text


def analyze_prescription(text):
    return {"extracted_text": text.strip()}


def analyze_report(text):
    return {"extracted_text": text.strip()}


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: analyzer.py <filepath> <type>"}))
        sys.exit(1)

    file_path = sys.argv[1]
    doc_type = sys.argv[2]

    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    extracted_text = extract_text(file_path)

    if doc_type == 'prescription':
        result = analyze_prescription(extracted_text)
    elif doc_type == 'report':
        result = analyze_report(extracted_text)
    else:
        result = {"error": f"Unknown type: {doc_type}"}

    print(json.dumps(result))

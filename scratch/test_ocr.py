import pytesseract
from PIL import Image
import os

tesseract_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
]

found = False
for p in tesseract_paths:
    if os.path.exists(p):
        print(f"Found Tesseract at: {p}")
        pytesseract.pytesseract.tesseract_cmd = p
        found = True
        break

if not found:
    print("Tesseract NOT found in common paths.")
else:
    try:
        version = pytesseract.get_tesseract_version()
        print(f"Tesseract version: {version}")
        print("Pytesseract is correctly configured.")
    except Exception as e:
        print(f"Error running Tesseract: {e}")

import sys
import json
import os
import re

# Fallback paths for Tesseract OCR on Windows
tesseract_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
]

def extract_text(file_path):
    ext = file_path.lower().split('.')[-1]
    text = ""
    
    if ext == 'pdf':
        try:
            import fitz # PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text("text") + "\n"
                
            # If PDF has no text, try OCR on the rendered image
            if len(text.strip()) < 20:
                text = ""
                try:
                    import pytesseract
                    from PIL import Image
                    for p in tesseract_paths:
                        if os.path.exists(p):
                            pytesseract.pytesseract.tesseract_cmd = p
                            break
                    for page in doc:
                        pix = page.get_pixmap(dpi=300)
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        text += pytesseract.image_to_string(img) + "\n"
                except Exception as ex:
                    text += f"[OCR Error: {str(ex)}]"
        except Exception as e:
            raise Exception(f"PDF Extraction Error: {str(e)}")
            
    elif ext in ['jpg', 'jpeg', 'png', 'webp', 'bmp']:
        try:
            import pytesseract
            from PIL import Image, ImageEnhance
            
            for p in tesseract_paths:
                if os.path.exists(p):
                    pytesseract.pytesseract.tesseract_cmd = p
                    break
                    
            img = Image.open(file_path)
            # Basic preprocessing: convert to grayscale and increase contrast
            img = img.convert('L')
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)
            
            text = pytesseract.image_to_string(img)
        except Exception as e:
            raise Exception(f"Image OCR Error: {str(e)}")
    elif ext == 'txt':
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        except Exception as e:
            raise Exception(f"Text Read Error: {str(e)}")
    else:
        raise Exception(f"Unsupported file type: {ext}")
        
    return text

def analyze_prescription(text):
    return {"extracted_text": text.strip()}

def analyze_report(text):
    return {"extracted_text": text.strip()}

if __name__ == "__main__":
    try:
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
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(0) # Exit with 0 so the JS side can parse the JSON error


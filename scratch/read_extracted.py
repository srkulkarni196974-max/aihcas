import json

encodings = ['utf-16', 'utf-8-sig', 'utf-8', 'utf-16le', 'utf-16be']
data = None

for enc in encodings:
    try:
        with open('scratch/rskreport_extracted.json', 'r', encoding=enc) as f:
            data = json.load(f)
        print(f"Successfully decoded with {enc}")
        break
    except Exception as e:
        continue

if data:
    extracted_text = data.get('extracted_text', '')
    with open('scratch/rskreport_text.txt', 'w', encoding='utf-8') as f_out:
        f_out.write(extracted_text)
    print("Successfully wrote to scratch/rskreport_text.txt")
else:
    print("Failed to decode with all encodings.")

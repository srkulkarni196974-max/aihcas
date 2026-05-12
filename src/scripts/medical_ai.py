import sys
import json
import re

# Medical Knowledge Base
CONDITIONS = [
    {
        "id": "headache",
        "name": "Headache",
        "keywords": ["headache", "head ache", "head pain", "forehead", "throbbing", "migraine", "head hurts"],
        "excludes": ["stomach", "chest", "leg", "back"]
    },
    {
        "id": "stomach_pain",
        "name": "Stomach Pain / Gastric",
        "keywords": ["stomach", "abdomen", "belly", "cramps", "nausea", "vomiting", "gastric", "acidity", "indigestion", "bloating", "gas", "lower abdomen", "upper abdomen"],
        "excludes": ["head", "chest", "back"]
    },
    {
        "id": "back_pain",
        "name": "Back Pain",
        "keywords": ["back pain", "lower back", "backache", "spine", "lumbar", "disc", "sciatica", "neck pain", "shoulder pain"],
        "excludes": ["stomach", "abdomen", "chest"]
    },
    {
        "id": "fever",
        "name": "Fever",
        "keywords": ["fever", "temperature", "high temp", "chills", "shivering", "sweating", "hot body"],
        "excludes": []
    },
    {
        "id": "chest_pain",
        "name": "Chest Pain / Cardiac",
        "keywords": ["chest pain", "chest tightness", "heart pain", "breathless", "shortness of breath", "chest pressure"],
        "excludes": ["stomach", "abdomen", "back"]
    },
    {
        "id": "cold",
        "name": "Common Cold / Cough",
        "keywords": ["cold", "runny nose", "sneezing", "cough", "sore throat", "blocked nose"],
        "excludes": []
    }
]

def classify_query(query):
    query = query.lower()
    
    # Negation detection
    negations = ["no ", "not ", "don't ", "dont ", "never ", "without "]
    
    best_match = None
    max_score = 0
    
    for condition in CONDITIONS:
        score = 0
        
        # 1. Direct Keyword Matching with Negation Check
        for kw in condition["keywords"]:
            if kw in query:
                # Check if this keyword is negated
                start_idx = query.find(kw)
                prefix = query[max(0, start_idx-15):start_idx]
                is_negated = any(neg in prefix for neg in negations)
                
                if is_negated:
                    score -= 50 # Strongly penalize negated symptoms
                else:
                    # Give higher weight to longer matches
                    score += (len(kw) * 3)
        
        # 2. Body Part Context (High specificity)
        # If 'abdomen' is mentioned, it's almost certainly stomach_pain
        if condition["id"] == "stomach_pain" and "abdomen" in query:
            score += 40
            
        # 3. Disambiguation (Excludes)
        for exclude in condition.get("excludes", []):
            if exclude in query:
                score -= 100 
                
        if score > max_score:
            max_score = score
            best_match = condition
            
    if best_match and max_score > 5:
        return {"id": best_match["id"], "score": max_score}
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
        
    query_text = " ".join(sys.argv[1:])
    result = classify_query(query_text)
    print(json.dumps(result))

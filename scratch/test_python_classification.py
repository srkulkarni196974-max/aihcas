import sys
sys.path.append('src/scripts')
import medical_ai

test_cases = [
    ("dry eyes and burning sensation", "dry_eye"),
    ("pelvic pain painful periods heavy menstrual bleeding", "endometriosis"),
    ("difficulty urinating weak flow frequent at night", "prostate_enlargement"),
    ("painful rash with burning skin herpes zoster", "shingles"),
    ("stiff neck severe headache high fever light sensitivity", "meningitis"),
    ("mood swings extreme happiness extreme sadness", "bipolar_disorder"),
    ("swollen leg with calf redness DVT", "deep_vein_thrombosis"),
    ("sudden breathlessness blood clot lung chest pain", "pulmonary_embolism"),
    ("severe allergic reaction throat swelling", "anaphylaxis"),
    ("sharp lower right pain near navel moving right", "appendicitis_acute"),
    ("cannot pass stool severe abdominal swelling bowel obstruction", "intestinal_obstruction"),
    ("alternating diarrhea constipation bloating after meals ibs", "ibs"),
    ("reduced urination swollen body high creatinine", "kidney_failure"),
    ("high blood pressure pregnancy swelling protein urine", "preeclampsia"),
    ("chronic smoker cough difficulty breathing", "copd"),
    ("sudden testicle pain twisted testicle severe scrotal pain", "testicular_torsion"),
    ("motion sickness car sickness vomiting during travel", "motion_sickness"),
    ("dog bite infection and fear of water hydrophobia", "rabies"),
    ("stiff jaw after injury with lockjaw and muscle spasms", "tetanus"),
    ("tight chest exercise chest pain exertion", "angina"),
    ("blood cancer persistent fatigue cancer easy bruising", "leukemia"),
    ("sudden vision loss and floaters or curtain over vision", "retinal_detachment"),
    ("severe infection low blood pressure shock organ failure", "septic_shock"),
    ("worst headache of life and thunderclap headache", "subarachnoid_hemorrhage"),
    ("progressive muscle weakness lou gehrig disease muscle wasting als", "als"),
    ("pain after tooth extraction exposed bone tooth removal", "dry_socket"),
    ("child barking cough and stridor noisy breathing", "croup"),
    ("child seizure with high fever convulsion", "febrile_seizure")
]

failed = 0
for query, expected_id in test_cases:
    result = medical_ai.classify_query(query)
    if result and result.get("id") == expected_id:
        print(f"SUCCESS: '{query}' -> {result.get('id')} (score: {result.get('score')})")
    else:
        print(f"FAIL: '{query}' -> {result.get('id') if result else None} (expected {expected_id})")
        failed += 1

if failed == 0:
    print("\nALL TESTS PASSED SUCCESSFULLY!")
else:
    print(f"\n{failed} tests failed.")

export type TriageLevel = 'self-care' | 'consult' | 'emergency';

export interface Condition {
  id: string;
  name: string;
  keywords: string[];
  triage: TriageLevel;
  response: string;
}

export const CONDITIONS: Condition[] = [
  {
    id: 'headache',
    name: 'Tension Headache / Dehydration Headache',
    keywords: ['headache','head ache','head pain','forehead pain','throbbing head','migraine','head hurts'],
    triage: 'self-care',
    response: `**Headache Assessment**

Headaches are very common and usually not serious. Most headaches in India are caused by dehydration, stress, or eye strain.

**Likely causes:**
- Dehydration (most common) — drink 2–3 glasses of water immediately
- Tension/stress headache
- Eye strain from screens
- Sinusitis (common during seasonal changes)
- Migraine (if one-sided + light sensitivity)

**Self-care steps:**
- Drink plenty of water or ORS
- Rest in a quiet, dark room
- Apply cold compress to forehead
- **Paracetamol (Dolo-650 / Crocin)** for pain relief

**⚠️ See a doctor if:**
- Headache is sudden and "worst of your life"
- Fever + neck stiffness + headache together
- Lasts more than 3 days
- Vision changes or vomiting

✅ **Self-Care Recommended** for mild headache.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'fever',
    name: 'Fever',
    keywords: ['fever','temperature','high temp','body heat','febrile','pyrexia','chills','shivering','sweating'],
    triage: 'consult',
    response: `**Fever Assessment**

Fever is your body fighting infection. In India, fever commonly accompanies viral infections, dengue, typhoid, and malaria.

**Fever severity guide:**
- 99–100.4°F → Low grade: rest, fluids
- 100.4–102°F → Moderate: Paracetamol + monitor
- 102–104°F → High: medicine + see doctor soon
- >104°F → **Emergency — go to hospital**

**Safe treatment:**
- **Paracetamol (Dolo-650 / Crocin)** every 6 hours
- ❌ Do NOT take Aspirin (especially if dengue suspected)
- Drink ORS, coconut water, or 3–4 L water/day
- Sponge bath with lukewarm water

**Get tested if fever persists >2 days:**
- CBC, Dengue NS1, Widal test

🩺 **Doctor Consultation Advised** if fever lasts more than 3 days.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'cold',
    name: 'Common Cold / Upper Respiratory Infection',
    keywords: ['cold','runny nose','sneezing','cough','sore throat','blocked nose','nasal congestion','throat pain','throat ache'],
    triage: 'self-care',
    response: `**Cold & Upper Respiratory Infection**

Common colds are viral — antibiotics do NOT help. Most resolve in 5–7 days.

**Self-care:**
- Steam inhalation with Vicks / tulsi leaves twice daily
- Salt water gargle for throat pain
- Honey + ginger + tulsi tea (proven antiviral in Ayurveda)
- **Cetirizine 10mg** (Cetzine) for runny nose at night
- **Paracetamol** for throat pain/low fever
- Rest and stay warm

**Foods to eat:** Turmeric milk (haldi doodh), kadha, warm soups

**⚠️ See a doctor if:**
- Fever >101°F for >3 days
- Green/yellow thick mucus persisting >1 week
- Chest pain or severe breathlessness
- Ear pain develops

✅ **Self-Care Recommended** — rest and hydrate well.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'dengue',
    name: 'Dengue Fever',
    keywords: ['dengue','dengue fever','breakbone','bone pain','platelet','rash fever','eye pain fever','mosquito bite fever','body ache fever'],
    triage: 'consult',
    response: `**Possible Dengue Fever**

Dengue is extremely common in India (August–November peak). Your symptoms need urgent evaluation.

**Classic dengue signs:**
- High fever (102–104°F) for 2–7 days
- Severe body/joint pain ("breakbone fever")
- Pain behind eyes
- Skin rash (appears day 3–4)
- Fatigue, nausea

**⚠️ WARNING SIGNS (go to emergency immediately):**
- Bleeding from gums, nose, or in vomit/stool
- Severe abdominal pain
- Vomiting >3 times/day
- Extreme fatigue, cold clammy skin

**DO NOT take:** ❌ Aspirin ❌ Ibuprofen (increases bleeding risk)
**Safe:** ✅ Paracetamol only

**Get tested today:** Dengue NS1 Antigen + CBC with platelet count

🩺 **Doctor Consultation TODAY** — do not delay.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'chest_pain',
    name: 'Chest Pain',
    keywords: ['chest pain','chest tightness','chest pressure','heart pain','left arm pain','jaw pain','chest discomfort','heart attack','cardiac'],
    triage: 'emergency',
    response: `🚨 **Chest Pain — Urgent Attention Required**

Chest pain must NEVER be ignored. It can indicate a cardiac emergency.

**Call 112 immediately if you have:**
- Pain spreading to left arm, jaw, or shoulder
- Shortness of breath + chest pain
- Sweating + nausea + chest pressure
- Sudden severe chest pain

**While waiting for help:**
- Sit/lie down, stay calm
- Loosen tight clothing
- If available: chew 1 Aspirin 325mg (if not allergic)
- Do NOT drive yourself to hospital

**If pain is mild and positional (worse with movement):** May be musculoskeletal — but still get evaluated.

🚨 **Emergency — Call 112 Immediately. Do not wait.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'diabetes',
    name: 'Diabetes / High Blood Sugar',
    keywords: ['diabetes','sugar','blood sugar','glucose','diabetic','hyperglycemia','hypoglycemia','low sugar','high sugar','thirsty all time','frequent urination'],
    triage: 'consult',
    response: `**Diabetes / Blood Sugar Concern**

India has 77 million diabetics — the world's second highest. Proper management is crucial.

**Normal blood sugar levels (Indian guidelines):**
- Fasting: 70–100 mg/dL (normal)
- Post-meal (2hr): <140 mg/dL
- HbA1c: <7% (well-controlled)

**If you have low sugar (hypoglycemia) right now:**
- Eat 15g fast sugar immediately: 3 glucose tablets / half cup juice / 1 tbsp honey
- Re-check in 15 min

**Indian diet tips:**
- Replace white rice with millets (ragi, jowar, bajra)
- Eat methi seeds (soaked overnight) — proven to reduce sugar
- Avoid: maida, sweets, sugary drinks, fried foods
- Exercise: 30 min walk daily reduces sugar significantly

**⚠️ See doctor urgently if:**
- Blood sugar >300 mg/dL consistently
- Feeling confused, very thirsty, nauseous
- Foot wounds that aren't healing

🩺 **Doctor Consultation Required** — diabetes needs medical supervision.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'hypertension',
    name: 'High Blood Pressure / Hypertension',
    keywords: ['blood pressure','bp','hypertension','high bp','low bp','systolic','diastolic','bp reading','pressure high','pressure low'],
    triage: 'consult',
    response: `**Blood Pressure Assessment**

Hypertension is India's #1 silent killer — 1 in 3 Indian adults is affected.

**BP Categories:**
- Normal: <120/80 mmHg ✅
- Elevated: 120–129/<80 — lifestyle changes needed
- Stage 1 HTN: 130–139/80–89 — medication may be needed
- Stage 2 HTN: ≥140/90 — medication required
- **Hypertensive Crisis: >180/120 → Emergency 🚨**

**Lifestyle interventions:**
- Reduce salt (<5g/day) — avoid pickles, papads, processed food
- DASH diet: spinach, bananas, low-fat dairy
- Yoga + pranayama (proven in Indian studies)
- Walk 30 minutes daily
- Limit alcohol, quit smoking

**Never stop BP medication** without consulting your doctor — sudden stoppage is dangerous.

🩺 **Doctor Consultation Advised** if BP consistently >140/90.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'stomach_pain',
    name: 'Abdominal / Stomach Pain',
    keywords: ['stomach pain','stomach ache','abdominal pain','belly pain','cramps','nausea','vomiting','gastric','acidity','acid reflux','indigestion','bloating','gas'],
    triage: 'self-care',
    response: `**Stomach / Abdominal Pain Assessment**

Stomach issues are extremely common in India due to food, water, and spices.

**Common causes:**
- **Acidity/GERD** — burning pain after meals
- **Gastroenteritis** — infection causing cramps + vomiting
- **IBS** — chronic cramps with bowel changes
- **Food poisoning** — sudden cramps + vomiting after eating out
- **Gas/bloating** — discomfort after heavy meals

**Self-care for mild stomach pain:**
- **Antacids** (Gelusil, Digene, Eno) for acidity
- **ORS** for vomiting/diarrhea dehydration
- Light diet: khichdi, curd rice, banana, toast
- Avoid spicy/oily food for 48 hours
- **Jeera water** or **ajwain water** for gas

**⚠️ See doctor immediately if:**
- Severe sudden pain (especially lower right = appendicitis risk)
- Blood in stool or vomit
- Pain after injury/fall
- Cannot keep any fluids down

🩺 **Doctor Consultation Advised** if pain is severe or persists >2 days.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'back_pain',
    name: 'Back Pain',
    keywords: ['back pain','lower back','backache','spine pain','lumbar','disc','sciatica','neck pain','shoulder pain','muscle pain'],
    triage: 'self-care',
    response: `**Back Pain Assessment**

Back pain affects 60–80% of Indians at some point. Usually muscular and not serious.

**Common causes in India:**
- Poor posture (desk work, mobile use)
- Muscle strain from lifting
- Vitamin D deficiency (extremely common)
- Kidney stones (if flank pain + burning urination)
- Disc herniation (if pain radiates to leg)

**Self-care:**
- Rest for 1–2 days (do not rest more — it worsens)
- Apply **hot pack** for muscle spasm
- **Combiflam (Ibuprofen 400mg + Paracetamol)** for pain
- Gentle stretching and walking
- Check Vitamin D levels — deficiency causes bone/muscle pain

**⚠️ See doctor urgently if:**
- Pain radiates down leg with numbness/tingling (sciatica)
- Loss of bladder/bowel control
- Fever + back pain (kidney infection)
- Pain after injury

✅ **Self-Care Recommended** for mild muscular back pain.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'malaria',
    name: 'Malaria',
    keywords: ['malaria','chills fever','rigor','sweating fever','cyclic fever','mosquito','plasmodium','alternating fever'],
    triage: 'consult',
    response: `**Possible Malaria**

Malaria remains a serious concern in India, especially in rural areas, monsoon season, and states like Odisha, Chhattisgarh, Jharkhand.

**Classic malaria pattern:**
- Cyclic fever with chills and sweating (every 48–72 hours)
- Severe headache + body aches
- Nausea and vomiting
- Fatigue and weakness

**Types in India:**
- **P. vivax** — less severe, can relapse
- **P. falciparum** — more dangerous, can be fatal

**⚠️ Danger signs (Emergency):**
- Confusion or altered consciousness
- High fever (>104°F) + vomiting
- Difficulty breathing
- Yellowish eyes/skin (jaundice)

**Get tested immediately:** Rapid Malaria Test (RDT) or blood smear — available at all PHCs

🚨 **Emergency if** confusion, difficulty breathing, or severe vomiting occur.
🩺 **Doctor Consultation Today** — malaria needs prescription antimalarials.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'typhoid',
    name: 'Typhoid Fever',
    keywords: ['typhoid','enteric fever','continuous fever','salmonella','widal','week long fever','step ladder fever'],
    triage: 'consult',
    response: `**Possible Typhoid Fever**

Typhoid is common in India due to contaminated food and water, especially in urban slums and during monsoon.

**Classic signs:**
- Prolonged fever (1–3 weeks), gradually rising ("step-ladder" pattern)
- Headache and fatigue
- Abdominal pain and constipation (sometimes diarrhea)
- Rose spots on skin (rare but diagnostic)
- Slow heart rate despite high fever

**Diagnosis:**
- **Widal test** (after 1 week of fever)
- Blood culture (gold standard)
- CBC shows low WBC count

**Prevention:**
- Drink only boiled/bottled water
- Typhoid vaccine available (Vi vaccine, Typbar-TCV)

**⚠️ Complications if untreated:**
- Intestinal perforation (emergency)
- Encephalopathy

🩺 **Doctor Consultation Required** — needs prescription antibiotics (Azithromycin/Ciprofloxacin).

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'asthma',
    name: 'Asthma / Breathing Difficulty',
    keywords: ['asthma','breathlessness','wheezing','difficulty breathing','shortness of breath','breathing problem','chest tight','inhaler','bronchial'],
    triage: 'consult',
    response: `**Asthma / Breathing Difficulty**

Asthma affects 30 million Indians. Air pollution makes it significantly worse in urban areas.

**Asthma attack self-care:**
- Use your **rescue inhaler (Salbutamol/Asthalin)** immediately — 2 puffs
- Sit upright, lean slightly forward
- Breathe slowly through pursed lips
- Remove from trigger (dust, smoke, pets)

**Common triggers in India:**
- Air pollution (AQI spikes)
- Incense/agarbatti smoke
- Dust mites
- Seasonal pollen (Feb–April, Sept–Nov)
- Cold air, exercise

**Daily management:**
- Use **preventer inhaler** (ICS) as prescribed — never skip
- Keep AQI app installed, avoid outdoor activity on bad AQI days
- Rinse mouth after using inhaler (prevents thrush)

**🚨 Go to Emergency if:**
- Severe breathlessness, cannot speak in full sentences
- Lips/fingertips turning blue
- No relief after 2 uses of rescue inhaler

🩺 **Doctor Consultation Advised** for asthma management plan.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'anemia',
    name: 'Anemia / Iron Deficiency',
    keywords: ['anemia','anaemia','low haemoglobin','low hemoglobin','fatigue','tiredness','weakness','pale','dizzy','iron deficiency','low iron'],
    triage: 'consult',
    response: `**Possible Anemia (Iron Deficiency)**

Iron deficiency anemia is the most common nutritional deficiency in India — especially in women, children, and vegetarians.

**Symptoms:**
- Fatigue and weakness
- Pale skin and inner eyelids
- Shortness of breath on exertion
- Dizziness, cold hands/feet
- Brittle nails, hair loss
- Craving to eat mud/ice (pica)

**Normal Hemoglobin levels:**
- Women: 12–15.5 g/dL
- Men: 13.5–17.5 g/dL
- Children: 11–13 g/dL

**Iron-rich Indian foods:**
- Spinach, methi, amaranth (chaulai)
- Rajma, chana, masoor dal
- Dates (khajoor), pomegranate
- Til (sesame), jaggery (gud)
- Eat with Vitamin C (lemon, amla) for better absorption

**❌ Avoid with iron:** Tea, coffee, milk — they block absorption

**Treatment:** Iron supplements (Ferrous sulphate) — needs doctor prescription for dose.

🩺 **Doctor Consultation Advised** for blood test and correct supplementation dose.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'uti',
    name: 'Urinary Tract Infection (UTI)',
    keywords: ['uti','burning urination','frequent urination','painful urination','urine infection','bladder infection','urine burning','dysuria'],
    triage: 'consult',
    response: `**Urinary Tract Infection (UTI)**

UTIs are very common, especially in women (shorter urethra). 50% of women have at least one UTI in their lifetime.

**Classic symptoms:**
- Burning or pain while urinating
- Frequent urge to urinate (little comes out)
- Cloudy, foul-smelling urine
- Pelvic/lower abdominal discomfort
- Blood in urine (pink/red)

**Immediate self-care:**
- Drink 3–4 liters of water daily — flushes bacteria
- Cranberry juice (unsweetened) may help
- Do NOT hold urine
- Urinate after intercourse (women)

**⚠️ See doctor immediately if:**
- Fever + back/flank pain (kidney infection)
- Symptoms in men or children (always needs evaluation)
- Blood in urine
- Symptoms lasting >2 days

**Treatment:** Needs urine culture + antibiotics. Common: Nitrofurantoin or Trimethoprim (doctor prescription needed)

🩺 **Doctor Consultation Required** — needs urine test and prescription.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'anxiety',
    name: 'Anxiety / Stress / Panic Attack',
    keywords: ['anxiety','panic','stress','panic attack','heart racing','nervous','worry','fear','restless','anxious','mental health','depression','sad'],
    triage: 'consult',
    response: `**Anxiety / Mental Health Support**

Mental health concerns are very real and increasingly common in India. You are not alone.

**If you're having a panic attack right now:**
1. Breathe in slowly for 4 counts
2. Hold for 4 counts
3. Breathe out for 6 counts
4. Repeat 5 times — this activates your parasympathetic system

**Common anxiety symptoms:**
- Racing heart, chest tightness
- Excessive worry you can't control
- Sleep disturbances
- Irritability, difficulty concentrating
- Physical symptoms (sweating, trembling)

**Indian self-care:**
- **Pranayama** (Anulom-Vilom) — 10 minutes daily
- Ashwagandha (KSM-66 extract) — proven adaptogen
- Limit social media and news
- Regular exercise releases endorphins

**Helplines (free, confidential):**
- **iCall:** 9152987821
- **KIRAN (Mental Health):** 1800-599-0019 (free, 24/7)
- **Vandrevala Foundation:** 1860-2662-345

🩺 **Doctor Consultation Advised** — therapy (CBT) and/or medication can help significantly.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'stroke',
    name: 'Stroke',
    keywords: ['stroke','face drooping','arm weakness','slurred speech','sudden weakness','one side weak','face numb','sudden confusion','vision loss sudden'],
    triage: 'emergency',
    response: `🚨 **POSSIBLE STROKE — THIS IS AN EMERGENCY**

Use the **FAST test:**
- **F**ace: Is one side drooping?
- **A**rms: Can they raise both arms equally?
- **S**peech: Is speech slurred or strange?
- **T**ime: Call **112 NOW**

**Do immediately:**
- Call 112 immediately
- Note exact time symptoms started
- Do NOT give food, water, or medication
- Lay person on their side if unconscious
- Stay with them until help arrives

**Time is brain** — every minute of stroke = 1.9 million neurons die.

**Do NOT wait.** Do NOT drive to hospital yourself.

🚨 **Call 112 RIGHT NOW.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'food_poisoning',
    name: 'Food Poisoning / Gastroenteritis',
    keywords: ['food poisoning','vomiting','diarrhea','loose motions','gastroenteritis','ate bad food','stomach bug','nausea after eating'],
    triage: 'self-care',
    response: `**Food Poisoning / Gastroenteritis**

Very common in India — street food, water contamination, or improperly stored food are common causes.

**Most cases resolve in 24–48 hours with self-care.**

**Immediate treatment:**
- **ORS (Electral / Jeevani)** — most important! Prevents dangerous dehydration
- Small sips of water/coconut water frequently
- Do NOT eat solid food until vomiting stops
- Then eat: khichdi, curd, banana, boiled rice
- **Probiotics** (Darolac, Econorm) help restore gut bacteria

**ORS home recipe:** 1L boiled water + 6 tsp sugar + 1/2 tsp salt

**⚠️ Go to doctor/emergency if:**
- Can't keep any fluids down for >6 hours
- Blood in stool or vomit
- High fever (>102°F)
- Signs of dehydration: no urination, sunken eyes, dry mouth
- Elderly, children, or diabetics — seek care sooner

✅ **Self-Care Recommended** if mild and able to keep fluids down.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'chikungunya',
    name: 'Chikungunya',
    keywords: ['chikungunya','joint pain fever','joint swelling fever','rash joint pain','arthralgia fever','mosquito joint pain','severe joint ache fever'],
    triage: 'consult',
    response: `**Possible Chikungunya**

Your symptom pattern — fever with severe joint pain — is classic for chikungunya (mosquito-borne, Aedes mosquito).

**Differs from Dengue:** Joint pain in chikungunya is far more severe and can persist for weeks to months. Bleeding risk is much lower.

**Treatment:** No specific antiviral. Paracetamol for fever. Once dengue is ruled out, Ibuprofen helps joint pain. Rest and hydration (ORS, coconut water, 3–4L/day).

**Get tested:** Chikungunya IgM antibody + CBC to rule out dengue simultaneously.

⚠️ **See doctor today** — diagnosis needed to rule out dengue.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'kidney_stone',
    name: 'Kidney Stone / Renal Colic',
    keywords: ['kidney stone','renal colic','flank pain','side pain urination','groin pain','blood in urine','urine blood','stone urine','severe side pain','loin pain'],
    triage: 'consult',
    response: `**Possible Kidney Stone (Renal Colic)**

Sudden, severe, cramping flank/side pain radiating to the groin — with nausea and possibly blood in urine — is the classic kidney stone picture.

**Immediate steps:**
- Drink 2–3 glasses of water now
- **Diclofenac (Voveran) or Ibuprofen** for pain — best OTC options
- Most stones <5mm pass on their own in 1–4 weeks

**🚨 Go to Emergency if:**
- Fever + chills with flank pain (= kidney infection — serious)
- Pain is unbearable (>8/10) and not responding to medication
- Complete inability to urinate

**Tests needed:** Urine routine/microscopy + USG abdomen. CT KUB is gold standard.

🩺 **Doctor visit required** for pain management and stone assessment.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'thyroid',
    name: 'Thyroid Disorder',
    keywords: ['thyroid','hypothyroid','hyperthyroid','tsh','weight gain thyroid','fatigue thyroid','hair loss thyroid','always cold','feeling cold always','slow metabolism','goiter','neck swelling','palpitation weight loss'],
    triage: 'consult',
    response: `**Possible Thyroid Disorder**

Thyroid disorders affect 1 in 10 Indians — women are 5–8x more likely.

**Hypothyroid (underactive — most common):** Weight gain, fatigue, feeling cold, hair loss, dry skin, constipation, depression, slow heart rate.

**Hyperthyroid (overactive):** Weight loss with increased appetite, rapid heartbeat, anxiety, heat intolerance, excessive sweating, tremors.

**Key test:** TSH — single most useful screening test.
- TSH >4.5 → Hypothyroid → Levothyroxine (Thyronorm) daily on empty stomach
- TSH <0.4 → Hyperthyroid → needs specialist (endocrinologist)

🩺 **Doctor Consultation Required** — get TSH tested first.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'migraine',
    name: 'Migraine',
    keywords: ['migraine','one side headache','throbbing headache','light sensitive headache','sound sensitive headache','nausea headache','aura','headache vomiting','pulsating head','severe one sided'],
    triage: 'consult',
    response: `**Migraine Assessment**

One-sided throbbing headache + light/sound sensitivity + nausea = classic migraine. This is a neurological condition, not just a bad headache.

**Acute treatment — take early (within 30 min of onset):**
- **Sumatriptan 50mg** (Suminat) — most effective, needs prescription
- **Ibuprofen 400–600mg** — good OTC option, take with food
- **Paracetamol + Metoclopramide** (Perinorm) for nausea component

**Non-drug:** Dark quiet room, cold compress on forehead, sleep.

**Common triggers:** Skipping meals, dehydration, bright lights, stress, hormonal changes, red wine, aged cheese.

🩺 **Doctor Consultation** if migraines occur >4x/month — preventive medications available.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'jaundice',
    name: 'Jaundice / Liver Disease',
    keywords: ['jaundice','yellow eyes','yellow skin','yellowing','liver','hepatitis','dark urine','pale stools','bilirubin','right upper pain','liver pain'],
    triage: 'consult',
    response: `**Possible Jaundice / Liver Issue**

Yellow eyes or skin means bilirubin is elevated — the liver, bile ducts, or blood cells need investigation. In India, Hepatitis A/E (contaminated water) are most common.

**Immediate steps:**
- Complete rest — liver needs it
- Stop alcohol completely
- Avoid Paracetamol — toxic to stressed liver
- Hydrate: coconut water, sugarcane juice, ORS
- Light diet: fruits, boiled vegetables, dal — no oily/spicy food

**🚨 Go to Emergency if:** Confusion/drowsiness, vomiting blood, black stools, rapidly worsening jaundice, severe abdominal swelling.

**Tests:** LFT, total/direct bilirubin, hepatitis serology, USG abdomen.

🩺 **Doctor Consultation TODAY** — jaundice always needs investigation.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'skin_allergy',
    name: 'Skin Allergy / Urticaria / Rash',
    keywords: ['rash','skin allergy','hives','urticaria','itching','itchy skin','skin rash','red spots','allergic rash','eczema','dermatitis','blisters skin','swollen skin'],
    triage: 'self-care',
    response: `**Skin Allergy / Rash Assessment**

**Immediate self-care:**
- **Cetirizine 10mg** (Cetzine/Zyrtec) — best OTC antihistamine, take at night
- **Calamine lotion** — soothes itching directly
- Cool compress on affected area
- Identify and remove the trigger (new soap, food, fabric, medication)
- Avoid scratching — causes infection and scarring

**Types:** Urticaria (hives/welts) = allergic. Eczema = chronic dry itchy patches. Contact dermatitis = reaction to something touching skin. Prickly heat = common in Indian summers.

**🚨 Emergency if:** Rash + difficulty breathing or swallowing (anaphylaxis!), rapidly spreading rash with fever, blistering rash after starting a new medication (stop it immediately).

✅ **Self-care for mild rash.** See doctor if persists >3 days.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'leg_pain',
    name: 'Leg Pain / Muscle Cramp / Strain / Swelling',
    keywords: ['leg','legs','ankle','ankles','hamstring','calf','heel','achilles','leg pain','leg cramps','swollen ankles','calf stiffness','heel pain','achilles tendon pain','hamstring strain','cramps legs','cramp legs','cramp leg','cramps leg','leg muscle','leg cramp','ankle swelling','foot pain','foot cramps','shin splint'],
    triage: 'self-care',
    response: `**Leg Pain & Muscle Cramp / Strain / Swelling Assessment**

Leg pain, cramps, and ankle swelling are common physical symptoms often related to muscle overuse, strains, or mild circulatory issues.

**Likely causes:**
- **Muscle Strain** (e.g., Hamstring strain) — from sports or sudden stretches
- **Muscle Cramps** (e.g., Leg cramps, calf stiffness) — caused by dehydration, electrolyte imbalance, or muscle fatigue
- **Peripheral Edema** (e.g., Swollen ankles) — fluid retention from prolonged standing or sitting
- **Achilles Tendinitis / Heel Pain** — inflammation of the tendon from overuse or improper footwear

**Self-care steps (R.I.C.E. Protocol):**
- **Rest**: Avoid putting heavy weight on the affected leg or ankle
- **Ice**: Apply cold packs to the strained muscle for 15-20 minutes, 3-4 times daily
- **Compression**: Use an elastic bandage to support a strained muscle or reduce ankle swelling
- **Elevation**: Prop your leg up on pillows above heart level to drain excess fluid and reduce swelling
- **Hydration & Electrolytes**: Drink plenty of water and ORS to relieve leg muscle cramps
- **Crocin / Combiflam** for pain and inflammation relief

**⚠️ See a doctor if:**
- You have severe, sudden swelling in only one leg with redness, warmth, or pain (deep vein thrombosis risk)
- You cannot bear any weight on the leg or walk at all
- There is a visible deformity or suspected fracture/rupture
- The pain is severe, constant, or persists beyond 3-5 days

✅ **Self-Care Recommended** for mild strain, leg cramps, or minor ankle swelling.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'arm_pain',
    name: 'Arm Pain / Numbness / Wrist Ache / Weakness',
    keywords: ['arm','arms','wrist','wrists','hand','hands','finger','fingers','elbow','elbows','shoulder','shoulders','arm pain','arm numbness','wrist pain','wrist ache','hand pain','hand numbness','muscle weakness arm','arm weakness','numbness arm'],
    triage: 'self-care',
    response: `**Arm Pain, Numbness & Wrist Ache Assessment**

Arm and wrist discomfort (ache, stiffness, weakness, or localized numbness/tingling) is often musculoskeletal but requires careful evaluation to rule out nerve compression or circulatory issues.

**Likely causes:**
- **Muscle Strain / Sprain**: Overuse of the arm or wrist (e.g., heavy lifting, sports)
- **Repetitive Strain Injury (RSI) / Carpal Tunnel Syndrome**: Nerve compression causing wrist ache, tingling, or finger numbness (common from prolonged computer typing)
- **Tendinitis (e.g., Tennis Elbow / Pitcher's Elbow)**: Inflammation from repetitive joint movement
- **Poor Sleep Posture**: Sleeping on your arm, causing temporary numbness/weakness ("pins and needles")

**Self-care steps:**
- **Rest & Immobilization**: Avoid repetitive movements, heavy lifting, or activities that trigger the pain. Consider a wrist splint for RSI.
- **R.I.C.E. Protocol**: Ice the affected muscle/joint for 15 minutes, 3 times a day.
- **Gentle Stretching**: If the pain is minor, perform gentle wrist and finger stretches to relieve tension.
- **Pain Relief**: Take **Combiflam (Ibuprofen + Paracetamol)** or Crocin for inflammation and pain.
- **Ergonomics**: Adjust your desk setup, keyboard, and mouse positions to avoid wrist strain.

**⚠️ WARNING: Seek Emergency Care (Call 112) immediately if:**
- **Sudden, unexplained left arm pain, numbness, or weakness** occurs, especially if accompanied by chest pain, tightness, shortness of breath, sweating, or jaw/shoulder pain (possible Heart Attack warning)
- **Sudden weakness or numbness on one side of your body** (e.g., unable to lift one arm, face drooping, or slurred speech - FAST stroke symptoms)
- The pain is severe, accompanied by a popping sound, or you suspect a fracture or tendon rupture.

🩺 **Consult a doctor** if symptoms persist for more than 3-5 days or if tingling/numbness is continuous.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'endometriosis',
    name: 'Endometriosis',
    keywords: ['endometriosis', 'pelvic pain', 'painful periods', 'pain during periods', 'pain during intercourse', 'heavy menstrual bleeding', 'chronic pelvic pain'],
    triage: 'consult',
    response: `**Endometriosis Assessment**

Endometriosis is a condition where tissue similar to the lining of the uterus grows outside it, commonly causing chronic pelvic pain.

**Common symptoms:**
- Painful periods (dysmenorrhea) and pelvic cramps
- Pain during or after sexual intercourse
- Heavy menstrual bleeding
- Pain with bowel movements or urination (especially during periods)

**Recommended steps:**
- Consult a gynecologist for a proper diagnosis (which may involve pelvic exams or ultrasounds).
- **Ibuprofen or Paracetamol** can help manage menstrual pain.
- Keep a symptom diary to identify patterns to share with your doctor.

🩺 **Doctor Consultation Required** for diagnosis and management.`
  },
  {
    id: 'ovarian_cyst',
    name: 'Ovarian Cyst',
    keywords: ['ovarian cyst', 'pelvic pressure', 'lower abdomen pain', 'pain during ovulation', 'bloating near pelvis'],
    triage: 'consult',
    response: `**Ovarian Cyst Assessment**

Ovarian cysts are fluid-filled sacs that develop on an ovary. Most are harmless and resolve on their own, but some can cause discomfort or complications.

**Common symptoms:**
- Pelvic pressure or fullness
- Dull ache in the lower abdomen on the side of the cyst
- Pain during ovulation or intercourse
- Bloating or swelling in the lower abdomen

**Recommended steps:**
- Consult a gynecologist to monitor the cyst using ultrasound.
- Rest and use warm compresses for mild pain.
- **🚨 Seek immediate emergency care if** you experience sudden, severe pelvic pain with fever or vomiting (risk of cyst rupture or ovarian torsion).

🩺 **Doctor Consultation Advised** for evaluation.`
  },
  {
    id: 'fibroids',
    name: 'Uterine Fibroids',
    keywords: ['fibroids', 'heavy periods', 'pelvic pressure', 'frequent urination', 'uterus pain'],
    triage: 'consult',
    response: `**Uterine Fibroids Assessment**

Uterine fibroids are non-cancerous growths of the uterus that commonly appear during childbearing years.

**Common symptoms:**
- Heavy menstrual bleeding or prolonged periods
- Pelvic pressure, pain, or fullness
- Frequent urination or difficulty emptying the bladder
- Constipation or lower back pain

**Recommended steps:**
- Consult a doctor or gynecologist. Diagnosis is usually confirmed via ultrasound.
- Iron supplements may be needed if heavy bleeding causes fatigue/anemia.
- Medical or surgical treatments are available depending on severity.

🩺 **Doctor Consultation Required** to discuss management options.`
  },
  {
    id: 'yeast_infection',
    name: 'Yeast Infection',
    keywords: ['yeast infection', 'vaginal itching', 'white discharge', 'burning sensation vaginal', 'fungal vaginal infection'],
    triage: 'self-care',
    response: `**Vaginal Yeast Infection Assessment**

Vaginal candidiasis (yeast infection) is a common fungal infection causing irritation, discharge, and intense itching.

**Common symptoms:**
- Intense vaginal itching and irritation
- Thick, white, odorless vaginal discharge (resembling cottage cheese)
- Burning sensation during urination or intercourse
- Redness or swelling of the vulva

**Self-care & safe treatment:**
- **Antifungal treatments**: Over-the-counter creams or suppositories (e.g., Clotrimazole, Miconazole) are highly effective.
- Keep the vaginal area clean and dry. Avoid scented soaps or douches.
- Wear loose, breathable cotton underwear.

🩺 **See a doctor if** symptoms persist after treatment, recur frequently, or if you are pregnant.`
  },
  {
    id: 'prostate_enlargement',
    name: 'Prostate Enlargement (BPH)',
    keywords: ['prostate enlargement', 'difficulty urinating', 'weak urine flow', 'frequent urination at night', 'bph'],
    triage: 'consult',
    response: `**Prostate Enlargement (Benign Prostatic Hyperplasia) Assessment**

BPH is a common, non-cancerous enlargement of the prostate gland in aging men, compressing the urethra and affecting urination.

**Common symptoms:**
- Difficulty starting urination or a weak/dribbling urine flow
- Frequent or urgent need to urinate, especially at night (nocturia)
- Feeling that the bladder is not completely empty

**Recommended steps:**
- Consult a urologist for checkup (includes PSA blood test, prostate ultrasound).
- Avoid drinking fluids close to bedtime.
- Limit caffeine and alcohol as they irritate the bladder.

🩺 **Doctor Consultation Required** to discuss medical therapies.`
  },
  {
    id: 'erectile_dysfunction',
    name: 'Erectile Dysfunction',
    keywords: ['erectile dysfunction', 'ed', 'cannot maintain erection', 'sexual weakness', 'difficulty erection'],
    triage: 'consult',
    response: `**Erectile Dysfunction (ED) Assessment**

Erectile dysfunction is the inability to get or keep an erection firm enough for sexual intercourse. It can be linked to physical, vascular, or psychological factors.

**Common causes:**
- Cardiovascular issues or high blood pressure
- Diabetes, stress, or performance anxiety
- Medication side effects

**Recommended steps:**
- Consult a primary physician or urologist. ED can sometimes be an early warning sign of heart health issues.
- Focus on regular exercise, stress reduction, and a healthy diet.
- Avoid unverified online supplements.

🩺 **Doctor Consultation Advised** for safe and effective treatment.`
  },
  {
    id: 'breast_cancer',
    name: 'Breast Cancer Symptoms',
    keywords: ['breast lump', 'breast pain', 'nipple discharge', 'breast swelling', 'change in breast shape'],
    triage: 'consult',
    response: `**Breast Change / Lump Evaluation**

Changes in breast tissue, including lumps, pain, or nipple discharge, should always be clinically evaluated to rule out serious conditions such as breast cancer.

**Symptom indicators:**
- A painless, firm lump or thickening in the breast or underarm
- Nipple discharge (especially bloody or spontaneous)
- Changes in the skin texture, shape, or size of the breast
- Nipple inversion or redness

**Urgent steps:**
- Schedule an appointment with a doctor immediately for a clinical breast exam.
- **Recommended Tests:** Mammogram, breast ultrasound, or biopsy if indicated.
- Do not delay evaluation. Early detection is crucial.

🩺 **Doctor Consultation TODAY** is strongly recommended.`
  },
  {
    id: 'lung_cancer',
    name: 'Lung Cancer Symptoms',
    keywords: ['chronic cough', 'blood in cough', 'chest pain', 'unexplained weight loss', 'persistent cough'],
    triage: 'consult',
    response: `**Respiratory / Chronic Cough Evaluation**

A persistent, chronic cough, especially when accompanied by coughing up blood or unexplained weight loss, requires urgent medical diagnostics to evaluate for serious lung conditions, including lung cancer.

**Common warning symptoms:**
- A new cough that doesn't go away or worsens over weeks
- Coughing up blood (hemoptysis) or rust-colored sputum
- Chest pain that gets worse with deep breathing or coughing
- Unexplained weight loss and fatigue
- Persistent shortness of breath or wheezing

**Immediate steps:**
- Consult a pulmonologist or general physician immediately.
- **Diagnostics required:** Chest X-ray, CT scan, and sputum analysis.

🩺 **Urgent Doctor Consultation Required** for diagnostic screening.`
  },
  {
    id: 'colon_cancer',
    name: 'Colon Cancer Symptoms',
    keywords: ['blood in stool', 'colon cancer', 'bowel habit changes', 'abdominal discomfort', 'unexplained anemia'],
    triage: 'consult',
    response: `**Gastrointestinal / Bowel Change Assessment**

Persistent changes in bowel habits, blood in stool, or unexplained weight loss and anemia should be promptly evaluated by a specialist to rule out colon cancer or inflammatory bowel disease.

**Symptom indicators:**
- Blood in your stool (bright red or dark, tarry stools)
- A persistent change in bowel habits (diarrhea, constipation, or narrowing of stool)
- Persistent abdominal cramps, gas, or pain
- Unexplained weight loss, weakness, or fatigue (anemia)

**Recommended steps:**
- Consult a gastroenterologist.
- **Recommended Tests:** Colonoscopy, fecal occult blood test (FOBT), or CBC.

🩺 **Doctor Consultation Required** to determine the source of bleeding.`
  },
  {
    id: 'brain_tumor',
    name: 'Brain Tumor Symptoms',
    keywords: ['brain tumor', 'persistent headache', 'vision changes', 'seizures', 'balance problems'],
    triage: 'consult',
    response: `**Neurological / Persistent Headache Assessment**

New, persistent headaches accompanied by vision changes, seizures, or balance issues require immediate clinical neuro-imaging to rule out structural issues, including brain tumors.

**Symptom indicators:**
- Frequent, severe headaches that are worse in the morning or change with posture
- Unexplained nausea or vomiting
- Gradual loss of sensation or movement in an arm or leg
- Difficulty with balance, speech, or vision changes
- New onset of seizures

**Urgent actions:**
- Consult a neurologist immediately.
- **Diagnostics required:** Brain MRI or CT scan.
- **🚨 Emergency:** Go to emergency if you have sudden loss of consciousness or status epilepticus.

🩺 **Urgent Doctor Consultation Required** for neurological evaluation.`
  },
  {
    id: 'multiple_sclerosis',
    name: 'Multiple Sclerosis',
    keywords: ['multiple sclerosis', 'ms', 'numbness', 'vision loss', 'muscle weakness', 'coordination problems'],
    triage: 'consult',
    response: `**Multiple Sclerosis (MS) Assessment**

Multiple Sclerosis is a chronic, autoimmune neurological disease of the central nervous system, affecting communication between the brain and body.

**Common symptoms:**
- Numbness or weakness in one or more limbs (typically on one side)
- Electric-shock sensations with certain neck movements (Lhermitte's sign)
- Partial or complete loss of vision, typically in one eye at a time
- Lack of coordination, unsteady gait, or tremors

**Recommended steps:**
- Consult a neurologist. MS diagnosis involves brain/spine MRI and lumbar puncture.
- Avoid getting overheated, as heat can worsen symptoms temporarily (Uhthoff's phenomenon).

🩺 **Doctor Consultation Required** for neurological diagnosis and therapy.`
  },
  {
    id: 'bells_palsy',
    name: 'Bell\'s Palsy',
    keywords: ['bells palsy', 'face drooping', 'facial paralysis', 'unable to smile'],
    triage: 'consult',
    response: `**Bell\'s Palsy / Facial Muscle Drooping Assessment**

Bell's palsy is a temporary weakness or paralysis of the muscles on one side of the face, usually linked to viral inflammation of the facial nerve.

**Common symptoms:**
- Sudden weakness or total paralysis on one side of your face (develops over hours)
- Facial droop and difficulty making expressions (such as closing your eye or smiling)
- Drooling or changes in tear production

**🚨 CRITICAL DIFFERENTIAL WARNING:**
- Sudden face drooping can also be a sign of a **Stroke**. 
- Perform the FAST check: If you also experience **arm weakness, slurred speech, or confusion**, call **112 immediately**. If the facial weakness is isolated, it still needs prompt evaluation.

🩺 **Doctor Consultation TODAY** is required to rule out stroke and begin early steroid therapy (most effective within 72 hours).`
  },
  {
    id: 'meningitis',
    name: 'Meningitis',
    keywords: ['meningitis', 'stiff neck', 'high fever', 'sensitivity to light', 'severe headache'],
    triage: 'emergency',
    response: `🚨 **POSSIBLE MENINGITIS — HIGH-RISK EMERGENCY**

Meningitis is a serious inflammation of the protective membranes covering the brain and spinal cord, typically caused by a viral or bacterial infection.

**Classic symptoms:**
- Sudden high fever and chills
- Severe, persistent headache
- **Stiff neck** (inability to touch chin to chest)
- Sensitivity to light (photophobia) and confusion

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.**
- Bacterial meningitis is life-threatening and progresses rapidly within hours. It requires immediate IV antibiotics in a hospital setting.

🚨 **Emergency — Go to the Hospital Immediately.**`
  },
  {
    id: 'bipolar_disorder',
    name: 'Bipolar Disorder',
    keywords: ['bipolar', 'mood swings', 'mania', 'extreme happiness', 'extreme sadness'],
    triage: 'consult',
    response: `**Bipolar Disorder Assessment**

Bipolar disorder is a mental health condition characterized by extreme mood swings, including emotional highs (mania or hypomania) and lows (depression).

**Common symptoms:**
- **Manic phases:** Hyperactivity, racing thoughts, decreased need for sleep, and extreme talkativeness.
- **Depressive phases:** Extreme sadness, loss of energy, feelings of worthlessness, and suicidal thoughts.

**Recommended steps:**
- Consult a psychiatrist or clinical psychologist. Bipolar disorder is managed effectively with mood stabilizers and therapy.
- Maintain a structured sleep schedule and avoid recreational drugs/alcohol.
- **Helpline (confidential):** Kiran Mental Health Helpline: 1800-599-0019.

🩺 **Doctor Consultation Required** for diagnosis and management.`
  },
  {
    id: 'ocd',
    name: 'Obsessive Compulsive Disorder',
    keywords: ['ocd', 'obsessive thoughts', 'compulsive behavior', 'repeating actions', 'intrusive thoughts'],
    triage: 'consult',
    response: `**Obsessive-Compulsive Disorder (OCD) Assessment**

OCD is a mental health condition characterized by unreasonable thoughts and fears (obsessions) that lead to repetitive behaviors (compulsions).

**Common symptoms:**
- Obsessions: Fear of contamination, need for symmetry, or intrusive distressing thoughts.
- Compulsions: Excessive washing, checking, counting, or repeating routine tasks.

**Recommended steps:**
- Consult a psychiatrist or psychologist. First-line treatments include Cognitive Behavioral Therapy (CBT) / Exposure and Response Prevention (ERP).
- Practice stress management and mindfulness exercises.

🩺 **Doctor Consultation Advised** for therapeutic support.`
  },
  {
    id: 'ptsd',
    name: 'Post Traumatic Stress Disorder',
    keywords: ['ptsd', 'trauma flashbacks', 'nightmares after trauma', 'panic after trauma'],
    triage: 'consult',
    response: `**Post-Traumatic Stress Disorder (PTSD) Assessment**

PTSD is a mental health condition triggered by experiencing or witnessing a terrifying, traumatic event.

**Common symptoms:**
- Flashbacks or reliving the traumatic event
- Nightmares or severe sleep disturbances
- Intense physical panic reactions to triggers reminding you of the trauma
- Avoidance of places, activities, or thoughts related to the trauma

**Recommended steps:**
- Consult a therapist specializing in trauma (EMDR or trauma-focused CBT are highly effective).
- Practice deep breathing techniques to manage panic spikes.

🩺 **Doctor Consultation Advised** for specialized counseling.`
  },
  {
    id: 'schizophrenia',
    name: 'Schizophrenia',
    keywords: ['schizophrenia', 'hearing voices', 'hallucinations', 'delusions', 'paranoia'],
    triage: 'consult',
    response: `**Schizophrenia / Clinical Evaluation Assessment**

Schizophrenia is a chronic and severe mental disorder affecting how a person thinks, feels, and behaves, leading to a disconnect from reality.

**Common symptoms:**
- Hallucinations (hearing voices or seeing things that aren't there)
- Delusions (strongly held false beliefs not grounded in reality)
- Disorganized thinking or speech, and social withdrawal

**Urgent actions:**
- Consult a psychiatrist for a full evaluation. Schizophrenia requires long-term antipsychotic medication and therapy.
- Ensure a safe, supportive environment for the individual.

🩺 **Doctor Consultation Required** for diagnosis and medical management.`
  },
  {
    id: 'lupus',
    name: 'Lupus',
    keywords: ['lupus', 'butterfly rash', 'joint pain autoimmune', 'fatigue autoimmune', 'skin sensitivity'],
    triage: 'consult',
    response: `**Lupus (Systemic Lupus Erythematosus) Assessment**

Lupus is a chronic, systemic autoimmune disease where the body's immune system attacks its own tissues and organs.

**Common symptoms:**
- A **butterfly-shaped rash** across the cheeks and bridge of the nose
- Joint pain, stiffness, and swelling
- Extreme fatigue and unexplained fevers
- Skin lesions that appear or worsen with sun exposure (photosensitivity)

**Recommended steps:**
- Consult a rheumatologist for diagnosis (which involves ANA tests, CBC).
- Use high-SPF sunscreen and wear protective clothing outdoors.
- Rest during flare-ups and maintain a healthy anti-inflammatory diet.

🩺 **Doctor Consultation Required** to manage autoimmune activity.`
  },
  {
    id: 'crohns_disease',
    name: 'Crohn\'s Disease',
    keywords: ['crohns disease', 'chronic diarrhea', 'abdominal cramps', 'weight loss digestive'],
    triage: 'consult',
    response: `**Crohn\'s Disease / Inflammatory Bowel Disease Assessment**

Crohn's disease is a chronic inflammatory bowel disease (IBD) that causes inflammation of the digestive tract, leading to abdominal pain and severe diarrhea.

**Common symptoms:**
- Chronic diarrhea (sometimes with blood)
- Abdominal pain and cramping, especially in the lower right abdomen
- Unexplained weight loss and fatigue
- Mouth sores or reduced appetite

**Recommended steps:**
- Consult a gastroenterologist.
- Keep a food diary to identify trigger foods (often dairy, spicy, or high-fiber foods during flares).
- Stay well-hydrated with ORS during bouts of diarrhea.

🩺 **Doctor Consultation Required** for diagnosis (via colonoscopy/endoscopy) and medical therapies.`
  },
  {
    id: 'celiac_disease',
    name: 'Celiac Disease',
    keywords: ['celiac', 'gluten intolerance', 'bloating after wheat', 'diarrhea after gluten'],
    triage: 'consult',
    response: `**Celiac Disease / Gluten Intolerance Assessment**

Celiac disease is an autoimmune reaction to eating gluten (a protein found in wheat, barley, and rye) that causes damage to the lining of the small intestine.

**Common symptoms:**
- Chronic diarrhea, bloating, and abdominal gas after eating wheat products
- Fatigue and unexplained weight loss
- Nutritional deficiencies (like iron deficiency anemia due to poor absorption)

**Recommended steps:**
- Consult a gastroenterologist for an anti-tTG antibody blood test and biopsy. **Do not stop eating gluten before the test**, as this can cause a false negative.
- If diagnosed, the primary treatment is a strict, lifelong gluten-free diet.

🩺 **Doctor Consultation Required** for confirmation and nutritional guidance.`
  },
  {
    id: 'deep_vein_thrombosis',
    name: 'Deep Vein Thrombosis (DVT)',
    keywords: ['dvt', 'deep vein thrombosis', 'swollen leg', 'leg redness', 'calf swelling'],
    triage: 'emergency',
    response: `🚨 **POSSIBLE DEEP VEIN THROMBOSIS (DVT) — EMERGENCY**

DVT is a serious condition where a blood clot forms in a deep vein, typically in the calf or thigh.

**Classic warning symptoms:**
- Swelling in only one leg (most common)
- Redness, warmth, or tenderness in the calf
- Pain that feels like a severe muscle cramp in the leg, worsening when walking

**🚨 Immediate Action Required:**
- **Go to the nearest Emergency Room immediately.** Do not massage the leg, as this can dislodge the clot.
- **High Risk:** The clot can travel to the lungs, causing a life-threatening **Pulmonary Embolism**. Seek urgent care.

🚨 **Emergency — Go to the Nearest Hospital Immediately.**`
  },
  {
    id: 'pulmonary_embolism',
    name: 'Pulmonary Embolism (PE)',
    keywords: ['pulmonary embolism', 'sudden breathlessness', 'sharp chest pain', 'blood clot lung'],
    triage: 'emergency',
    response: `🚨 **POSSIBLE PULMONARY EMBOLISM — LIFE-THREATENING EMERGENCY**

A pulmonary embolism is a sudden blockage in a lung artery, typically caused by a blood clot traveling from the deep veins in the legs (DVT).

**Classic warning symptoms:**
- **Sudden onset of shortness of breath** or rapid breathing
- **Sharp chest pain** that worsens when breathing in deeply or coughing
- Coughing up blood (hemoptysis)
- Rapid heart rate, dizziness, or fainting

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.** This is a critical medical emergency requiring immediate clot-dissolving therapies.

🚨 **Emergency — Call 112 Immediately.**`
  },
  {
    id: 'anaphylaxis',
    name: 'Anaphylaxis',
    keywords: ['anaphylaxis', 'severe allergic reaction', 'throat swelling', 'cannot breathe allergy'],
    triage: 'emergency',
    response: `🚨 **ANAPHYLAXIS — LIFE-THREATENING ALLERGIC EMERGENCY**

Anaphylaxis is a severe, rapid-onset allergic reaction affecting multiple systems of the body, commonly triggered by certain foods, insect stings, or medications.

**Classic emergency signs:**
- **Difficulty breathing** or severe wheezing
- **Swelling of the throat, tongue, or lips**
- Dizziness, fainting, or rapid drop in blood pressure
- Hives, itching, and flushed skin

**🚨 Immediate Action Required:**
- **Administer an Epinephrine Auto-Injector (EpiPen)** immediately if available.
- **Call 112 or go to the nearest Emergency Room immediately.** Anaphylaxis can be fatal within minutes if untreated.

🚨 **Emergency — Call 112 or Administer EpiPen Now.**`
  },
  {
    id: 'sepsis',
    name: 'Sepsis',
    keywords: ['sepsis', 'infection spreading', 'confusion with fever', 'rapid heartbeat infection'],
    triage: 'emergency',
    response: `🚨 **POSSIBLE SEPSIS — CRITICAL EMERGENCY**

Sepsis is the body's extreme, life-threatening response to an infection. It is a medical emergency that can lead to rapid organ failure and death.

**Classic emergency signs:**
- High fever or very low body temperature with severe shivering
- **Confusion, disorientation, or extreme sleepiness**
- Rapid heartbeat and rapid breathing
- Extreme pain or discomfort

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.**
- Treatment requires rapid IV fluids and antibiotics within the "golden hour" to stabilize blood pressure.

🚨 **Emergency — Go to the Hospital Immediately.**`
  },
  {
    id: 'poisoning',
    name: 'Poisoning',
    keywords: ['poisoning', 'consumed poison', 'toxic ingestion', 'chemical poisoning'],
    triage: 'emergency',
    response: `🚨 **POISONING / TOXIC INGESTION — EMERGENCY**

This involves the ingestion, inhalation, or absorption of a toxic substance, chemical, or household poison.

**🚨 Immediate Action Required:**
- **Call 112 or contact your local Poison Control Center immediately.**
- Do NOT induce vomiting unless explicitly instructed by medical professionals.
- Identify the packaging or substance name to share with emergency responders.
- Keep the person calm and in a safe position.

🚨 **Emergency — Call 112 or Poison Control Immediately.**`
  },
  {
    id: 'drug_overdose',
    name: 'Drug Overdose',
    keywords: ['drug overdose', 'too many pills', 'overdose medicine', 'unconscious after drugs'],
    triage: 'emergency',
    response: `🚨 **DRUG OVERDOSE — CRITICAL EMERGENCY**

An overdose occurs when a person consumes toxic amounts of a drug or medication, which can suppress breathing and cardiac function.

**Classic emergency signs:**
- Unconsciousness or inability to wake up
- Slow, shallow, or stopped breathing
- Bluish lips or fingertips (cyanosis)
- Seizures or confusion

**🚨 Immediate Action Required:**
- **Call 112 immediately.**
- If opioids are suspected, administer Naloxone if available.
- Roll the person onto their side (recovery position) to prevent choking.
- Do NOT leave them unattended.

🚨 **Emergency — Call 112 Immediately.**`
  },
  {
    id: 'hiv_aids',
    name: 'HIV/AIDS',
    keywords: ['hiv', 'aids', 'immune deficiency', 'frequent infections', 'weight loss hiv'],
    triage: 'consult',
    response: `**HIV / AIDS Assessment**

HIV is a viral infection that attacks the immune system. With modern Antiretroviral Therapy (ART), it is a highly manageable chronic condition.

**Common symptoms (advanced/untreated):**
- Rapid weight loss and chronic fatigue
- Recurring fevers or profuse night sweats
- Prolonged swelling of the lymph glands
- Frequent, unusual, or severe infections

**Recommended steps:**
- Consult an infectious disease specialist.
- **Diagnostics required:** ELISA, HIV rapid tests, or viral load tests.
- ART is provided free of charge under NACO (National AIDS Control Organisation) at government centers in India.

Brief details on NACO support: [NACO India](https://naco.gov.in/)

🩺 **Doctor Consultation Required** for treatment planning.`
  },
  {
    id: 'hepatitis',
    name: 'Hepatitis',
    keywords: ['hepatitis', 'liver infection', 'yellow skin', 'dark urine', 'liver swelling'],
    triage: 'consult',
    response: `**Hepatitis / Liver Inflammation Assessment**

Hepatitis is an inflammation of the liver, commonly caused by viral infections (Hepatitis A, B, C, D, E) or toxic substances.

**Common symptoms:**
- **Jaundice** (yellowing of the eyes and skin)
- Dark urine and pale or clay-colored stools
- Pain in the upper right abdomen under the ribs
- Fatigue, nausea, and loss of appetite

**Recommended steps:**
- Consult a gastroenterologist or hepatologist today.
- Rest and stay hydrated. Avoid all alcohol and medications metabolized by the liver (like Paracetamol) unless cleared by a doctor.
- **Diagnostics required:** Liver Function Tests (LFT), Viral Hepatitis Serology.

🩺 **Doctor Consultation Required** to identify the virus type.`
  },
  {
    id: 'influenza',
    name: 'Influenza (Flu)',
    keywords: ['influenza', 'flu', 'body aches', 'viral fever', 'fatigue with fever'],
    triage: 'self-care',
    response: `**Influenza (Flu) Assessment**

The flu is a highly contagious respiratory infection caused by influenza viruses. It causes sudden onset of severe body symptoms.

**Common symptoms:**
- Sudden high fever, chills, and sweats
- Severe body aches, joint pain, and muscle soreness
- Extreme fatigue and exhaustion
- Dry cough and sore throat

**Self-care steps:**
- Rest in bed and drink plenty of fluids (warm water, soups, ORS).
- **Paracetamol** (Dolo-650) for muscle aches and fever.
- Isolate yourself to prevent spreading to family members.

🩺 **Consult a doctor if** you have chronic health conditions (like asthma or diabetes), or if fever lasts >3 days.`
  },
  {
    id: 'conjunctivitis',
    name: 'Conjunctivitis (Pink Eye)',
    keywords: ['conjunctivitis', 'pink eye', 'red eye infection', 'sticky eyes'],
    triage: 'self-care',
    response: `**Conjunctivitis (Pink Eye) Assessment**

Conjunctivitis is an inflammation of the conjunctiva, usually caused by a viral or bacterial infection or an allergic reaction.

**Common symptoms:**
- Redness or pink coloration in one or both eyes
- Gritty feeling, itching, or burning in the eyes
- A sticky, yellow-green discharge that crusts over the eyelashes overnight

**Self-care & prevention:**
- Avoid touching or rubbing your eyes.
- Wash your hands frequently with soap and water.
- Apply a clean, cool, or warm damp compress to soothe the eye.
- Do not wear contact lenses or eye makeup until cleared.

🩺 **Consult an ophthalmologist** for prescription eye drops.`
  },
  {
    id: 'dry_eye',
    name: 'Dry Eye Syndrome',
    keywords: ['dry eyes', 'burning eyes', 'eye irritation', 'gritty eyes'],
    triage: 'self-care',
    response: `**Dry Eye Syndrome Assessment**

Dry eyes occur when your eyes do not produce enough tears, or when tears evaporate too quickly, causing chronic irritation.

**Common symptoms:**
- A stinging, burning, or scratchy sensation in your eyes
- Sensitivity to light and eye redness
- A sensation of having something in your eyes (grittiness)

**Self-care steps:**
- Use **OTC lubricating eye drops (artificial tears)** regularly.
- Practice the **20-20-20 rule**: Every 20 minutes, look at something 20 feet away for at least 20 seconds to reduce screen strain.
- Avoid blowing air directly into your eyes (from fans or AC).

🩺 **Consult an eye doctor if** symptoms are persistent or worsen.`
  },
  {
    id: 'arrhythmia',
    name: 'Arrhythmia / Palpitations',
    keywords: ['arrhythmia', 'irregular heartbeat', 'palpitations', 'heart beating fast'],
    triage: 'consult',
    response: `**Arrhythmia / Heart Palpitations Assessment**

An arrhythmia is a problem with the rate or rhythm of your heartbeat, making it beat too fast, too slow, or irregularly.

**Common symptoms:**
- A fluttering or racing heartbeat in your chest (palpitations)
- Feeling dizzy, lightheaded, or short of breath
- Chest discomfort or fatigue

**Recommended steps:**
- Consult a cardiologist.
- **Recommended Tests:** Electrocardiogram (ECG), Holter monitor, or echocardiogram.
- Avoid stimulants like caffeine, nicotine, and alcohol.
- **🚨 Seek emergency care immediately if** palpitations are accompanied by chest pain, shortness of breath, or fainting.

🩺 **Doctor Consultation Required** to evaluate cardiac rhythm.`
  },
  {
    id: 'heart_failure',
    name: 'Heart Failure',
    keywords: ['heart failure', 'swollen feet', 'breathlessness lying down', 'fatigue heart'],
    triage: 'consult',
    response: `**Heart Failure / Chronic Cardiac Assessment**

Heart failure is a chronic, progressive condition where the heart muscle is unable to pump blood as efficiently as it should.

**Common symptoms:**
- **Shortness of breath** during exertion or especially when lying down flat in bed
- Swelling (edema) in your ankles, feet, or legs
- Persistent fatigue and weakness
- A dry, hacking cough

**Recommended steps:**
- Consult a cardiologist immediately.
- Monitor your daily weight. A sudden increase can indicate fluid retention.
- Limit salt and fluid intake as directed by your doctor.
- Strictly adhere to prescribed medications (Beta-blockers, ACE inhibitors).

🩺 **Doctor Consultation Required** for cardiac management.`
  },
  {
    id: 'vitamin_d_deficiency',
    name: 'Vitamin D Deficiency',
    keywords: ['vitamin d deficiency', 'bone weakness', 'low vitamin d', 'muscle pain deficiency'],
    triage: 'self-care',
    response: `**Vitamin D Deficiency Assessment**

Vitamin D deficiency is extremely common, affecting over 70% of urban Indians, leading to bone and muscle issues.

**Common symptoms:**
- Chronic fatigue and low energy
- Bone pain, lower back ache, or muscle weakness
- Frequent infections due to lowered immune function

**Recommended steps:**
- Get a 25-hydroxy vitamin D blood test.
- Exposure to morning sunlight for 15-20 minutes daily.
- Dietary sources: egg yolks, fatty fish, mushrooms, or fortified foods.
- **Supplementation**: Cholecalciferol (60k IU weekly for 8 weeks is a standard regimen for moderate deficiency under doctor direction).

🩺 **Consult a doctor** to interpret blood levels and recommend dosage.`
  },
  {
    id: 'vitamin_b12_deficiency',
    name: 'Vitamin B12 Deficiency',
    keywords: ['vitamin b12 deficiency', 'tingling hands', 'memory issues deficiency', 'fatigue b12'],
    triage: 'self-care',
    response: `**Vitamin B12 Deficiency Assessment**

Vitamin B12 is essential for nerve function and red blood cell production. Deficiencies are highly prevalent in vegetarian diets since B12 is primarily found in animal products.

**Common symptoms:**
- **Numbness or tingling sensation ("pins and needles")** in hands and feet
- Chronic fatigue, weakness, or feeling lightheaded
- Memory lapses, confusion, or difficulty concentrating
- A smooth, red tongue (glossitis)

**Recommended steps:**
- Get a Serum Vitamin B12 blood test.
- Dietary sources: milk, curd, cheese, paneer, and fortified cereals.
- **Supplementation**: Sublingual tablets or Methylcobalamin injections (for severe cases under doctor guidance).

🩺 **Consult a doctor** to determine appropriate B12 supplementation.`
  },
  {
    id: 'malnutrition',
    name: 'Malnutrition / Underweight',
    keywords: ['malnutrition', 'poor nutrition', 'underweight', 'lack of nutrients'],
    triage: 'consult',
    response: `**Malnutrition / Nutritional Deficiency Assessment**

Malnutrition refers to a lack of proper nutrients in the diet, resulting in poor physical health, low BMI, and weakness.

**Common symptoms:**
- Unintentional weight loss and low muscle mass
- Extreme fatigue, weakness, and slow healing of wounds
- Dry skin, brittle hair, and bleeding gums

**Recommended steps:**
- Consult a dietician or general physician for a comprehensive dietary assessment.
- Focus on a high-protein, calorie-dense, balanced diet containing lentils, nuts, eggs, milk, and fresh vegetables.
- Screen for underlying malabsorption conditions (like celiac disease or thyroid issues).

🩺 **Doctor Consultation Advised** to address nutrient deficiencies.`
  },
  {
    id: 'tmj_disorder',
    name: 'TMJ Disorder',
    keywords: ['tmj', 'jaw pain', 'clicking jaw', 'difficulty chewing'],
    triage: 'self-care',
    response: `**TMJ (Temporomandibular Joint) Disorder Assessment**

TMJ disorders affect the jaw joints and surrounding muscles, causing pain and restricted movement.

**Common symptoms:**
- Pain or tenderness in your jaw, joint area, or near the ear
- Clicking, popping, or grating sounds in the jaw when opening or closing your mouth
- Difficulty or discomfort while chewing

**Self-care steps:**
- Eat soft foods; avoid chewing gum or tough foods.
- Apply warm, moist heat or ice packs to the side of your face.
- Practice gentle jaw stretching and massage.
- Avoid extreme jaw movements (like yawning wide).

🩺 **Consult a dentist** if jaw pain is persistent or locks.`
  },
  {
    id: 'scabies',
    name: 'Scabies',
    keywords: ['scabies', 'intense itching', 'itching at night', 'skin mites'],
    triage: 'consult',
    response: `**Possible Scabies Infestation**

Scabies is a highly contagious skin infestation caused by tiny burrowing mites (*Sarcoptes scabiei*), resulting in intense itching.

**Common symptoms:**
- **Intense itching**, which is typically **much worse at night**
- Thin, irregular burrow tracks made of tiny blisters or bumps on the skin (commonly in webbing of fingers, wrists, or armpits)

**Recommended steps:**
- Consult a dermatologist immediately for verification.
- **Treatment**: Typically requires prescription **Permethrin 5% cream** applied from neck down and washed off after 8-14 hours.
- **⚠️ Family Treatment**: All household members must be treated simultaneously to prevent re-infestation. Wash all bedding and clothing in hot water.

🩺 **Doctor Consultation Required** for prescription scabicide.`
  },
  {
    id: 'shingles',
    name: 'Shingles (Herpes Zoster)',
    keywords: ['shingles', 'painful rash', 'burning skin rash', 'herpes zoster'],
    triage: 'consult',
    response: `**Possible Shingles (Herpes Zoster) Assessment**

Shingles is a viral infection caused by the reactivation of the varicella-zoster virus (the virus that causes chickenpox), resulting in a painful, localized rash.

**Common symptoms:**
- Pain, burning, numbness, or tingling in a localized area
- A **painful red rash** that begins as blisters and develops along a single stripe or band, typically on one side of the body or face
- Fever, headache, and fatigue

**Urgent actions:**
- Consult a doctor today.
- **Treatment**: Prescription **antiviral medications** (e.g., Acyclovir) are highly effective at shortening the infection but **must be started within 72 hours** of the rash appearing to prevent chronic nerve pain (postherpetic neuralgia).
- Keep the rash clean, dry, and covered to prevent spread to others who haven't had chickenpox.

🩺 **Doctor Consultation TODAY** is strongly recommended.`
  },
  {
    id: 'appendicitis_acute',
    name: 'Acute Appendicitis',
    keywords: ['appendicitis', 'sharp lower right pain', 'pain near navel moving right', 'rebound tenderness', 'fever with stomach pain'],
    triage: 'emergency',
    response: `🚨 **Acute Appendicitis — EMERGENCY**

Acute appendicitis is a rapid inflammation of the appendix. If untreated, it can rupture and cause a life-threatening abdominal infection (peritonitis).

**Warning Signs:**
- Sharp, severe pain starting near the navel and moving to the **lower right abdomen**.
- Pain that worsens with coughing, walking, or sudden movements.
- **Rebound tenderness** (increased pain when pressure is released).
- Low-grade fever, nausea, vomiting, and loss of appetite.

**🚨 Immediate Action Required:**
- **Go to the nearest emergency department immediately.**
- Do NOT eat, drink, or take laxatives/painkillers before being evaluated by a surgeon, as this can mask symptoms or cause rupture.

🚨 **Emergency — Seek Immediate Surgical Evaluation.**`
  },
  {
    id: 'intestinal_obstruction',
    name: 'Intestinal Obstruction',
    keywords: ['intestinal blockage', 'cannot pass stool', 'severe abdominal swelling', 'vomiting fecal matter', 'bowel obstruction'],
    triage: 'emergency',
    response: `🚨 **Intestinal Obstruction — EMERGENCY**

An intestinal obstruction is a mechanical or functional blockage of the intestines that prevents the normal passage of digestive products.

**Warning Signs:**
- Severe, cramping abdominal pain that comes and goes.
- Inability to pass gas or have a bowel movement (constipation).
- Severe abdominal swelling (distension) and bloating.
- Nausea and **vomiting** (sometimes smelling or looking like fecal matter).

**🚨 Immediate Action Required:**
- **Go to the nearest hospital emergency room immediately.**
- This condition requires urgent hospitalization, intravenous fluids, bowel decompression, or surgery to prevent bowel ischemia (death of tissue).

🚨 **Emergency — Seek Immediate Hospital Care.**`
  },
  {
    id: 'ibs',
    name: 'Irritable Bowel Syndrome (IBS)',
    keywords: ['ibs', 'alternating diarrhea constipation', 'stress stomach pain', 'bloating after meals', 'irritable bowel'],
    triage: 'consult',
    response: `**Irritable Bowel Syndrome (IBS) Assessment**

IBS is a common gastrointestinal disorder affecting the large intestine, characterized by chronic cramping, abdominal pain, bloating, gas, and changes in bowel habits.

**Common symptoms:**
- Abdominal pain or cramping, often relieved by a bowel movement.
- Alternating periods of diarrhea and constipation.
- Excess gas, bloating, and mucus in the stool.
- Symptoms often worsen with stress or specific trigger foods.

**Recommended steps:**
- Consult a gastroenterologist to rule out inflammatory bowel diseases (IBD) or celiac disease.
- Keep a food diary to identify triggers (common triggers include dairy, gluten, and carbonated beverages).
- Practice stress management techniques like yoga, pranayama, or meditation.
- Consider a low-FODMAP diet under dietary supervision.

🩺 **Doctor Consultation Advised** for diagnostic evaluation and dietary planning.`
  },
  {
    id: 'ulcerative_colitis',
    name: 'Ulcerative Colitis',
    keywords: ['ulcerative colitis', 'bloody diarrhea', 'colon inflammation', 'urgent bowel movement'],
    triage: 'consult',
    response: `**Ulcerative Colitis Assessment**

Ulcerative Colitis is a chronic inflammatory bowel disease (IBD) that causes long-lasting inflammation and ulcers in the digestive tract, specifically the colon and rectum.

**Common symptoms:**
- **Bloody diarrhea**, often with mucus or pus.
- Urgent need to have a bowel movement, sometimes accompanied by an inability to defecate despite urgency (tenesmus).
- Abdominal pain, cramping, and weight loss.
- Fatigue and mild fever.

**Recommended steps:**
- Consult a gastroenterologist for confirmation (which requires a colonoscopy and biopsy).
- Ensure adequate hydration with ORS to replace lost fluids and electrolytes.
- Avoid spicy, oily, and high-fiber foods during active flares.
- Adhere strictly to prescribed medications (like Mesalamine or corticosteroids).

🩺 **Doctor Consultation Required** to manage inflammation and prevent flares.`
  },
  {
    id: 'diverticulitis',
    name: 'Diverticulitis',
    keywords: ['diverticulitis', 'left lower abdomen pain', 'fever abdominal pain', 'colon pouch infection'],
    triage: 'consult',
    response: `**Diverticulitis Assessment**

Diverticulitis occurs when small, bulging pouches (diverticula) that can form in the walls of the intestines become inflamed or infected.

**Common symptoms:**
- Persistent, usually severe **pain in the lower left side of the abdomen**.
- Fever, chills, nausea, and vomiting.
- Abdominal tenderness and changes in bowel habits (often constipation).

**Recommended steps:**
- Consult a doctor promptly. Mild cases may be treated with rest, a liquid diet, and oral antibiotics.
- **🚨 Seek emergency care immediately if** you experience severe abdominal pain, high fever, or inability to pass gas/stool (risk of bowel perforation or peritonitis).
- Follow a high-fiber diet only *after* the acute inflammation has fully resolved.

🩺 **Doctor Consultation Required** for diagnosis and management.`
  },
  {
    id: 'kidney_failure',
    name: 'Kidney Failure / Renal Insufficiency',
    keywords: ['kidney failure', 'reduced urination', 'swelling body', 'kidney dysfunction', 'high creatinine'],
    triage: 'emergency',
    response: `🚨 **Kidney Failure / Renal Failure — EMERGENCY**

Kidney failure occurs when your kidneys lose the ability to sufficiently filter waste products from your blood, leading to a dangerous buildup of toxins.

**Warning Signs:**
- **Significantly reduced urination** or no urine output.
- Rapid swelling (edema) in your legs, ankles, feet, face, or hands due to fluid retention.
- Unexplained shortness of breath, confusion, nausea, or chest pain/pressure.
- Lab results showing elevated creatinine or blood urea nitrogen (BUN).

**🚨 Immediate Action Required:**
- **Go to the nearest emergency department immediately.**
- This condition requires urgent blood tests, kidney function monitoring, fluid balancing, and potentially emergency dialysis.

🚨 **Emergency — Seek Immediate Medical Attention.**`
  },
  {
    id: 'nephrotic_syndrome',
    name: 'Nephrotic Syndrome',
    keywords: ['nephrotic syndrome', 'protein in urine', 'swollen face', 'foamy urine'],
    triage: 'consult',
    response: `**Nephrotic Syndrome Assessment**

Nephrotic Syndrome is a kidney disorder that causes your body to excrete too much protein in your urine, resulting in low blood protein levels and fluid buildup.

**Common symptoms:**
- **Severe swelling (edema)**, particularly around your eyes (swollen face) and in your ankles and feet.
- **Foamy urine**, caused by high protein levels (proteinuria).
- Weight gain due to excess fluid retention.
- Fatigue and loss of appetite.

**Recommended steps:**
- Consult a nephrologist for diagnostic tests (urine protein-to-creatinine ratio, blood albumin, lipid profile, and possibly a kidney biopsy).
- Follow a low-sodium diet to help manage swelling and fluid retention.
- Strictly adhere to prescribed medications (like ACE inhibitors or immunosuppressants).

🩺 **Doctor Consultation Required** to prevent kidney damage and manage symptoms.`
  },
  {
    id: 'glomerulonephritis',
    name: 'Glomerulonephritis',
    keywords: ['glomerulonephritis', 'blood in urine', 'kidney inflammation', 'high blood pressure kidney'],
    triage: 'consult',
    response: `**Glomerulonephritis Assessment**

Glomerulonephritis is an inflammation of the tiny filters in your kidneys (glomeruli), which can develop after infections (like strep throat) or due to autoimmune conditions.

**Common symptoms:**
- **Pink or cola-colored urine** from red blood cells (hematuria).
- Foamy urine due to protein leakage.
- High blood pressure (hypertension) and swelling in your face, hands, feet, or abdomen.
- Fatigue from anemia or kidney dysfunction.

**Recommended steps:**
- Consult a nephrologist. Diagnosis is confirmed through urine tests, blood tests (creatinine, BUN), and imaging.
- Monitor your blood pressure closely.
- Limit salt, fluid, and protein intake as directed by your doctor.

🩺 **Doctor Consultation Required** for diagnosis and to preserve kidney function.`
  },
  {
    id: 'migraine_with_aura',
    name: 'Migraine With Aura',
    keywords: ['migraine aura', 'flashing lights headache', 'visual aura', 'zigzag vision'],
    triage: 'consult',
    response: `**Migraine With Aura Assessment**

Migraine with aura is a specific type of migraine headache accompanied or preceded by sensory, visual, or speech disturbances (auras) that typically last 20–60 minutes.

**Common symptoms:**
- Visual disturbances: Seeing flashing lights, blind spots, or **zigzag patterns/vision**.
- Sensory changes: Numbness or tingling in your hands, face, or tongue.
- Temporary difficulty speaking or finding words.
- Followed by a severe, throbbing, usually one-sided headache.

**🚨 Differential Stroke Warning:**
- If visual disturbances, numbness, or speech difficulties occur **suddenly without a subsequent headache**, or are accompanied by face drooping or arm weakness, call **112 immediately** to rule out a stroke.
- Rest in a quiet, dark room. Take prescribed migraine medications (like triptans) or Ibuprofen early in the aura phase.

🩺 **Doctor Consultation Advised** to establish a treatment and prevention plan.`
  },
  {
    id: 'cluster_headache',
    name: 'Cluster Headache',
    keywords: ['cluster headache', 'pain behind eye', 'severe one sided headache', 'watering eye headache'],
    triage: 'consult',
    response: `**Cluster Headache Assessment**

Cluster headaches are extremely severe, painful headaches that occur in cyclical patterns or "clusters", often waking patients in the middle of the night.

**Common symptoms:**
- Excruciating, sharp, penetrating pain **focused behind or around one eye**.
- One-sided headache that reaches peak intensity within minutes.
- Redness, swelling, or watering of the eye on the affected side.
- Nasal congestion or runny nose on the affected side.

**Recommended steps:**
- Consult a neurologist. Standard painkillers (like Paracetamol) are usually ineffective.
- **Acute treatments**: High-flow oxygen therapy or triptan injections/nasal sprays are highly effective.
- Keep a headache diary to identify cluster cycle patterns.

🩺 **Doctor Consultation Required** for specialized acute and preventive treatments.`
  },
  {
    id: 'trigeminal_neuralgia',
    name: 'Trigeminal Neuralgia',
    keywords: ['electric shock face pain', 'trigeminal neuralgia', 'facial nerve pain'],
    triage: 'consult',
    response: `**Trigeminal Neuralgia Assessment**

Trigeminal neuralgia is a chronic pain condition that affects the trigeminal nerve, causing sudden, severe, shock-like facial pain triggered by mild stimulation.

**Common symptoms:**
- Episodes of severe, shooting, or **electric shock-like pain in the face** (cheeks, jaw, teeth, gums, or lips).
- Pain triggered by simple actions like brushing teeth, washing face, shaving, eating, or talking.
- Attacks that last from a few seconds to several minutes, occurring in quick succession.

**Recommended steps:**
- Consult a neurologist. Common pain medications (like NSAIDs) are typically not effective.
- Avoid triggers where possible, using lukewarm water for washing and soft foods during painful episodes.
- **Treatment**: Standard therapy involves anticonvulsant medications (such as Carbamazepine) to block nerve firing.

🩺 **Doctor Consultation Required** for prescription neuro-medications.`
  },
  {
    id: 'neuropathy',
    name: 'Peripheral Neuropathy',
    keywords: ['burning feet', 'tingling legs', 'nerve pain', 'numb feet', 'pins and needles'],
    triage: 'consult',
    response: `**Peripheral Neuropathy Assessment**

Peripheral neuropathy is a result of damage to your peripheral nerves, most commonly caused by diabetes, nutritional deficiencies (like Vitamin B12), or autoimmune disorders.

**Common symptoms:**
- Gradual onset of numbness, prickling, or **tingling ("pins and needles")** in your feet or hands, which can spread upward into your legs or arms.
- Sharp, jabbing, throbbing, or **burning pain** (often described as "burning feet").
- Extreme sensitivity to touch.
- Lack of coordination or muscle weakness.

**Recommended steps:**
- Consult a physician or neurologist.
- **Diagnostics**: Screen blood sugar (HbA1c) and Vitamin B12 levels immediately.
- Inspect your feet daily for any cuts, blisters, or infections, as numbness increases the risk of undetected injuries.

🩺 **Doctor Consultation Advised** to treat the underlying cause and manage nerve pain.`
  },
  {
    id: 'guillain_barre',
    name: 'Guillain-Barre Syndrome (GBS)',
    keywords: ['ascending weakness', 'sudden paralysis', 'guillain barre', 'weak legs spreading upward'],
    triage: 'emergency',
    response: `🚨 **Guillain-Barre Syndrome (GBS) — EMERGENCY**

Guillain-Barre Syndrome is a rare, acute autoimmune disorder where your immune system attacks your peripheral nerves, leading to rapid muscle weakness.

**Warning Signs:**
- **Ascending weakness**: Muscle weakness or tingling starting in your feet/legs and rapidly spreading upward to your arms and upper body.
- Difficulty with facial movements, speaking, chewing, or swallowing.
- **Difficulty breathing** or shortness of breath (a medical emergency indicating respiratory muscle paralysis).
- Loss of reflexes in your limbs.

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest emergency department immediately.**
- GBS is a medical emergency requiring hospitalization, close monitoring of breathing, and treatment like plasmapheresis or intravenous immunoglobulin (IVIG).

🚨 **Emergency — Seek Immediate Hospitalization.**`
  },
  {
    id: 'myasthenia_gravis',
    name: 'Myasthenia Gravis',
    keywords: ['muscle fatigue', 'drooping eyelids', 'difficulty swallowing weakness', 'myasthenia'],
    triage: 'consult',
    response: `**Myasthenia Gravis Assessment**

Myasthenia Gravis is a chronic autoimmune neuromuscular disorder characterized by fluctuating weakness of voluntary muscle groups, worsening with activity and improving with rest.

**Common symptoms:**
- **Drooping of one or both eyelids (ptosis)** and double vision (diplopia).
- Muscle weakness in the arms, hands, legs, or neck.
- Difficulty speaking, chewing, or swallowing (dysphagia).
- Fluctuating muscle fatigue that worsens toward the end of the day.

**🚨 EMERGENCY WARNING (Myasthenic Crisis):**
- If you experience severe **difficulty breathing** or swallowing, seek emergency medical care immediately, as this indicates respiratory muscle failure.
- Consult a neurologist for diagnosis (which involves antibody tests, EMG, or tensilon tests).

🩺 **Doctor Consultation Required** to manage neuromuscular transmission.`
  },
  {
    id: 'encephalitis',
    name: 'Encephalitis',
    keywords: ['brain inflammation', 'confusion fever', 'encephalitis', 'seizures with fever'],
    triage: 'emergency',
    response: `🚨 **Encephalitis — EMERGENCY**

Encephalitis is an acute inflammation of the brain, most commonly caused by a viral infection (such as Herpes Simplex Virus, Japanese Encephalitis, or West Nile Virus).

**Warning Signs:**
- **High fever** accompanied by **sudden confusion, disorientation, or hallucinations**.
- Severe, persistent headache and stiff neck.
- **Seizures** (convulsions).
- Tremors, muscle weakness, or loss of consciousness/coma.

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.**
- Encephalitis is life-threatening and progresses rapidly, requiring immediate hospitalization, diagnostic lumbar puncture, neuroimaging (MRI/CT), and IV antivirals or supportive care.

🚨 **Emergency — Go to the Hospital Immediately.**`
  },
  {
    id: 'autism_spectrum_disorder',
    name: 'Autism Spectrum Disorder (ASD)',
    keywords: ['autism', 'speech delay', 'poor eye contact', 'repetitive behavior', 'social communication difficulty'],
    triage: 'consult',
    response: `**Autism Spectrum Disorder (ASD) Assessment**

Autism Spectrum Disorder is a developmental condition that affects communication, social interaction, behavior, and learning.

**Common developmental signs (usually noticed in childhood):**
- **Speech delay** or difficulty starting/maintaining conversations.
- **Poor eye contact** and limited facial expressions.
- Repetitive behaviors (like rocking, spinning, or hand-flapping).
- Highly specific or intense interests and difficulty adjusting to changes in routines.
- Sensory sensitivities (over- or under-reacting to lights, sounds, or textures).

**Recommended steps:**
- Consult a developmental pediatrician, child psychologist, or psychiatrist for a comprehensive behavioral assessment.
- Early intervention services (speech therapy, occupational therapy, and behavioral therapies like ABA) are highly beneficial.

🩺 **Doctor Consultation Advised** for specialist screening and support.`
  },
  {
    id: 'eating_disorder',
    name: 'Eating Disorder (Anorexia / Bulimia)',
    keywords: ['anorexia', 'bulimia', 'fear of weight gain', 'self induced vomiting'],
    triage: 'consult',
    response: `**Eating Disorder Assessment**

Eating disorders are serious mental health conditions characterized by severe disturbances in eating behaviors and related thoughts and emotions.

**Common symptoms:**
- **Anorexia Nervosa**: Severe restriction of food intake, leading to significantly low body weight, accompanied by an intense fear of gaining weight.
- **Bulimia Nervosa**: Repeated episodes of eating large quantities of food (bingeing) followed by compensatory behaviors like **self-induced vomiting** or laxative use (purging).
- Distorted body image (perceiving oneself as overweight despite being underweight).
- Chronic fatigue, dizziness, hair loss, or irregular menstrual cycles (amenorrhea).

**Recommended steps:**
- Consult a psychiatrist, clinical psychologist, and a registered dietitian.
- Treatment typically involves psychotherapy (CBT), nutritional rehabilitation, and medical monitoring.
- **Helpline (confidential):** Kiran Mental Health Helpline: 1800-599-0019.

🩺 **Doctor Consultation Required** to address physical and psychological health.`
  },
  {
    id: 'substance_abuse',
    name: 'Substance Abuse Disorder',
    keywords: ['drug addiction', 'substance abuse', 'alcohol dependence', 'withdrawal symptoms'],
    triage: 'consult',
    response: `**Substance Abuse / Dependence Assessment**

Substance Use Disorder is a disease that affects a person's brain and behavior, leading to an inability to control the use of legal or illegal drugs, alcohol, or medications.

**Common indicators:**
- Feeling a strong urge or craving to use the substance regularly.
- Tolerance (needing more of the substance to get the same effect).
- Experiencing **withdrawal symptoms** (nausea, sweating, shaking, or anxiety) when attempting to stop.
- Neglecting personal, professional, or social responsibilities.

**Recommended steps:**
- Consult a psychiatrist or addiction specialist.
- Seek support from a rehabilitation program, detoxification service, or therapy (such as Cognitive Behavioral Therapy).
- **Helplines (India):** 
  - National Toll-Free Drug De-addiction Helpline: **1800-11-0031**
  - Kiran Mental Health: **1800-599-0019**

🩺 **Doctor Consultation Required** for safe medical detoxification and treatment.`
  },
  {
    id: 'suicidal_ideation',
    name: 'Suicidal Ideation / Crisis Support',
    keywords: ['want to die', 'suicidal thoughts', 'self harm thoughts', 'thinking of suicide'],
    triage: 'emergency',
    response: `🚨 **SUICIDAL IDEATION / CRISIS — IMMEDIATE SUPPORT REQUIRED**

If you or someone you know is going through a crisis or thinking about self-harm or suicide, please know that you are not alone, and help is available.

**🚨 Immediate Actions to Take:**
- **Reach out to a helpline immediately.** Free, confidential, and professional support is available 24/7.
- Speak with a trusted family member, friend, or healthcare provider.
- Remove any immediate means of self-harm.

**Emergency & Crisis Helplines (India):**
- **Tele-MANAS (Govt of India):** **14416** or **1800-891-4416** (24/7, free)
- **KIRAN Mental Health:** **1800-599-0019** (24/7, free)
- **Vandrevala Foundation:** **9999 666 555** (24/7)
- **Sneha India:** **044-24640050**

🚨 **Please call a helpline or go to the nearest hospital emergency room immediately.**`
  },
  {
    id: 'addisons_disease',
    name: 'Addison\'s Disease',
    keywords: ['addisons disease', 'low cortisol', 'skin darkening', 'salt craving'],
    triage: 'consult',
    response: `**Addison\'s Disease (Adrenal Insufficiency) Assessment**

Addison's disease is a rare disorder that occurs when your adrenal glands do not produce enough essential hormones, primarily cortisol and aldosterone.

**Common symptoms:**
- Chronic, worsening fatigue and muscle weakness.
- **Hyperpigmentation (skin darkening)**, especially on scars, skin folds, and gums.
- Low blood pressure (hypotension), leading to lightheadedness or fainting.
- **Salt craving**, weight loss, and loss of appetite.

**🚨 EMERGENCY WARNING (Adrenal Crisis):**
- Severe vomiting, abdominal pain, sudden low blood pressure, and confusion indicate an **Adrenal Crisis**. Seek immediate emergency care, as this requires urgent IV hydrocortisone.
- Consult an endocrinologist. Diagnosis involves ACTH stimulation and morning cortisol blood tests.

🩺 **Doctor Consultation Required** for hormone replacement therapy.`
  },
  {
    id: 'cushings_syndrome',
    name: 'Cushing\'s Syndrome',
    keywords: ['cushings syndrome', 'moon face', 'buffalo hump', 'high cortisol'],
    triage: 'consult',
    response: `**Cushing\'s Syndrome Assessment**

Cushing's syndrome occurs when your body has abnormally high levels of the hormone cortisol over a long period, often due to steroid medication use or a pituitary/adrenal tumor.

**Common symptoms:**
- **"Moon face"**: A round, full, red face.
- **"Buffalo hump"**: A fatty hump between the shoulders.
- Weight gain, particularly around the midsection (central obesity) with thin arms and legs.
- Pink or purple stretch marks (striae) on the abdomen, thighs, or breasts.
- High blood pressure, bone loss (osteoporosis), and easy bruising.

**Recommended steps:**
- Consult an endocrinologist.
- **Diagnostics**: 24-hour urinary free cortisol, late-night salivary cortisol, or dexamethasone suppression tests.
- Do NOT stop steroid medications suddenly; always taper under medical supervision.

🩺 **Doctor Consultation Required** for diagnostic workup.`
  },
  {
    id: 'hyperthyroidism',
    name: 'Hyperthyroidism',
    keywords: ['hyperthyroid', 'weight loss thyroid', 'rapid heartbeat thyroid', 'heat intolerance'],
    triage: 'consult',
    response: `**Hyperthyroidism Assessment**

Hyperthyroidism occurs when your thyroid gland produces too much of the hormone thyroxine, accelerating your body's metabolism.

**Common symptoms:**
- **Unintentional weight loss**, even when food intake increases.
- **Rapid or irregular heartbeat (palpitations)**.
- **Heat intolerance** and increased sweating.
- Anxiety, irritability, muscle weakness, and hand tremors.
- Frequent bowel movements or enlargement of the thyroid gland (goiter).

**Recommended steps:**
- Consult an endocrinologist.
- **Diagnostics**: Free T3, Free T4, and TSH blood tests. TSH will typically be very low.
- Avoid excessive caffeine and stimulants.

🩺 **Doctor Consultation Required** for anti-thyroid medications or beta-blockers.`
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    keywords: ['hypothyroid', 'cold intolerance', 'weight gain thyroid', 'fatigue thyroid'],
    triage: 'consult',
    response: `**Hypothyroidism Assessment**

Hypothyroidism is an underactive thyroid state where the thyroid gland does not produce enough thyroid hormones, slowing down the body's metabolism.

**Common symptoms:**
- **Fatigue**, low energy, and sluggishness.
- **Unexplained weight gain** or difficulty losing weight.
- **Cold intolerance** (feeling unusually cold).
- Dry skin, hair loss, constipation, and muscle aches.
- Irregular or heavy menstrual periods in women.

**Recommended steps:**
- Consult a primary physician or endocrinologist.
- **Diagnostics**: Serum TSH (TSH will be elevated) and Free T4.
- Treatment typically involves taking daily oral hormone replacement (Levothyroxine/Thyronorm) on an empty stomach.

🩺 **Doctor Consultation Required** to confirm dosage and start hormone therapy.`
  },
  {
    id: 'pcos',
    name: 'Polycystic Ovary Syndrome (PCOS)',
    keywords: ['pcos', 'irregular periods', 'facial hair female', 'ovarian cysts'],
    triage: 'consult',
    response: `**Polycystic Ovary Syndrome (PCOS) Assessment**

PCOS is a common hormonal disorder among women of reproductive age, characterized by irregular menstrual cycles, excess androgen levels, and cyst-like follicles on the ovaries.

**Common symptoms:**
- **Irregular, infrequent, or prolonged periods**.
- Excess androgen symptoms: **Facial and body hair growth (hirsutism)**, severe acne, or male-pattern baldness.
- Weight gain, difficulty losing weight, and insulin resistance.
- Enlarged ovaries containing multiple follicles (seen on ultrasound).

**Recommended steps:**
- Consult a gynecologist or endocrinologist.
- **Lifestyle modifications**: A low-glycemic diet, regular physical exercise, and weight management are primary treatments.
- Medically managed using oral contraceptives or insulin-sensitizing medications (like Metformin) if prescribed.

🩺 **Doctor Consultation Advised** for diagnosis and management.`
  },
  {
    id: 'ectopic_pregnancy',
    name: 'Ectopic Pregnancy',
    keywords: ['ectopic pregnancy', 'pregnancy with pelvic pain', 'bleeding during early pregnancy'],
    triage: 'emergency',
    response: `🚨 **Ectopic Pregnancy — EMERGENCY**

An ectopic pregnancy occurs when a fertilized egg implants outside the main cavity of the uterus, most commonly in a fallopian tube. It is a critical medical emergency.

**Warning Signs:**
- **Severe pelvic or abdominal pain** (often on one side) in a woman who is or could be pregnant.
- Light to heavy **vaginal bleeding** during early pregnancy.
- Shoulder tip pain (due to internal bleeding irritating the diaphragm).
- Dizziness, weakness, or fainting.

**🚨 Immediate Action Required:**
- **Go to the nearest emergency department immediately.**
- Ectopic pregnancies cannot survive, and a ruptured fallopian tube can cause life-threatening internal bleeding requiring immediate emergency surgery.

🚨 **Emergency — Go to the Hospital Immediately.**`
  },
  {
    id: 'placenta_previa',
    name: 'Placenta Previa',
    keywords: ['placenta previa', 'painless bleeding pregnancy', 'third trimester bleeding'],
    triage: 'emergency',
    response: `🚨 **Placenta Previa — EMERGENCY**

Placenta Previa occurs when the placenta partially or totally covers the mother's cervix, which can cause severe bleeding during pregnancy and delivery.

**Warning Signs:**
- **Painless, bright red vaginal bleeding** during the second half of pregnancy (typically third trimester).
- Contractions may or may not accompany the bleeding.

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.**
- Avoid any vaginal examinations. Rest in a lying position.
- This condition requires immediate hospitalization and monitoring to ensure the safety of both the mother and baby, often requiring a Cesarean section.

🚨 **Emergency — Seek Immediate Obstetric Care.**`
  },
  {
    id: 'preeclampsia',
    name: 'Preeclampsia',
    keywords: ['high blood pressure pregnancy', 'swelling pregnancy', 'protein urine pregnancy', 'preeclampsia'],
    triage: 'emergency',
    response: `🚨 **Preeclampsia — EMERGENCY**

Preeclampsia is a pregnancy complication characterized by high blood pressure and signs of damage to other organ systems, most often the kidneys (protein in urine). It typically begins after 20 weeks of pregnancy.

**Warning Signs:**
- **High blood pressure (hypertension)** developing during pregnancy.
- **Sudden swelling**, particularly in your face and hands.
- Severe headaches or changes in vision (blurred vision, flashing lights, temporary vision loss).
- Pain in the upper right abdomen.
- Shortness of breath.

**🚨 Immediate Action Required:**
- **Go to the nearest obstetric emergency unit immediately.**
- If left untreated, preeclampsia can lead to serious — even fatal — complications for both mother and baby, including seizures (eclampsia).

🚨 **Emergency — Seek Immediate Obstetric Evaluation.**`
  },
  {
    id: 'mastitis',
    name: 'Mastitis',
    keywords: ['breast infection', 'painful breastfeeding', 'mastitis', 'red swollen breast'],
    triage: 'consult',
    response: `**Mastitis Assessment**

Mastitis is an inflammation of breast tissue that sometimes involves an infection, most commonly occurring in breastfeeding mothers due to a blocked milk duct or bacteria entering the breast.

**Common symptoms:**
- Breast tenderness, warmth to the touch, and **swelling/redness** in a wedge-shaped pattern.
- **Pain or a burning sensation** continuously or while breastfeeding.
- Fever, chills, and flu-like body aches.

**Recommended steps:**
- Consult a doctor or lactation specialist. Most cases of bacterial mastitis require prescription antibiotics.
- **Continue breastfeeding or pumping** from the affected breast — keeping the breast empty is crucial for recovery and does not harm the baby.
- Apply warm compresses before feeding to help milk flow, and cold compresses after feeding to reduce swelling.

🩺 **Doctor Consultation Advised** for evaluation and potential antibiotics.`
  },
  {
    id: 'orchitis',
    name: 'Orchitis',
    keywords: ['testicle pain', 'orchitis', 'swollen testicles', 'painful scrotum'],
    triage: 'consult',
    response: `**Orchitis Assessment**

Orchitis is an inflammation of one or both testicles, usually caused by a bacterial infection (often associated with UTIs or STIs) or a viral infection (like the mumps virus).

**Common symptoms:**
- **Testicle pain and tenderness**, which can range from mild to severe.
- Swelling and redness of the scrotum.
- Fever, nausea, and general malaise.

**Recommended steps:**
- Consult a general practitioner or urologist. Bacterial cases require antibiotics.
- Rest in bed, apply cold packs to the scrotum, and wear an athletic supporter to reduce discomfort.
- **🚨 Seek emergency care immediately if** the pain is sudden and extremely severe (requires ruling out Testicular Torsion, which is a surgical emergency).

🩺 **Doctor Consultation Required** to identify the cause and receive treatment.`
  },
  {
    id: 'testicular_torsion',
    name: 'Testicular Torsion',
    keywords: ['sudden testicle pain', 'twisted testicle', 'severe scrotal pain'],
    triage: 'emergency',
    response: `🚨 **Testicular Torsion — EMERGENCY**

Testicular torsion occurs when a testicle rotates, twisting the spermatic cord that brings blood to the scrotum. This is a critical urological emergency.

**Warning Signs:**
- **Sudden, extremely severe pain in one testicle**.
- Rapid swelling and redness of the scrotum.
- Abdominal pain, nausea, and vomiting.
- The affected testicle may appear positioned higher than normal or at an unusual angle.

**🚨 Immediate Action Required:**
- **Go to the nearest hospital emergency room immediately.**
- Surgery is required to untwist the cord. If surgery is performed **within 6 hours** of pain onset, there is a 90% chance of saving the testicle. Delay can result in permanent tissue death.

🚨 **Emergency — Seek Immediate Emergency Surgery.**`
  },
  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    keywords: ['copd', 'chronic smoker cough', 'difficulty breathing smoker', 'lung obstruction'],
    triage: 'consult',
    response: `**Chronic Obstructive Pulmonary Disease (COPD) Assessment**

COPD is a chronic, progressive inflammatory lung disease that causes obstructed airflow from the lungs, most commonly caused by long-term cigarette smoking or exposure to biomass fuel smoke (common in rural India).

**Common symptoms:**
- **Chronic cough**, often producing thick mucus (smoker's cough).
- Progressive **difficulty breathing**, especially during physical exertion.
- Wheezing and chest tightness.
- Frequent respiratory infections.

**🚨 EMERGENCY WARNING:**
- If you experience severe **difficulty breathing**, blue lips, or inability to speak in sentences, seek emergency medical care immediately (COPD exacerbation).
- Consult a pulmonologist. Treatment includes bronchodilators, inhaled steroids, and smoking cessation.

🩺 **Doctor Consultation Required** for lung function testing (Spirometry).`
  },
  {
    id: 'pleural_effusion',
    name: 'Pleural Effusion',
    keywords: ['fluid around lungs', 'pleural effusion', 'shortness breath lying'],
    triage: 'consult',
    response: `**Pleural Effusion Assessment**

Pleural effusion is an unusual accumulation of fluid in the space between the lungs and the chest cavity, often secondary to pneumonia, tuberculosis, or heart failure.

**Common symptoms:**
- **Shortness of breath (dyspnea)**, which often worsens when lying down flat.
- Sharp chest pain that worsens with deep breathing or coughing (pleuritic pain).
- Dry cough and fever (especially if caused by an infection).

**Recommended steps:**
- Consult a pulmonologist or physician promptly.
- **Diagnostics**: Chest X-ray or ultrasound is required to confirm fluid presence.
- **🚨 Seek emergency care if** you experience severe difficulty breathing or a sudden spike in chest pain.

🩺 **Doctor Consultation Required** for diagnosis and potential fluid drainage.`
  },
  {
    id: 'pneumothorax',
    name: 'Pneumothorax (Collapsed Lung)',
    keywords: ['collapsed lung', 'sudden chest pain breathing', 'pneumothorax'],
    triage: 'emergency',
    response: `🚨 **Pneumothorax — EMERGENCY**

A pneumothorax is a collapsed lung that occurs when air leaks into the space between your lung and chest wall, pushing on the outside of your lung.

**Warning Signs:**
- **Sudden, sharp chest pain** on one side, which worsens when breathing in.
- **Sudden, severe shortness of breath** or difficulty breathing.
- Rapid heart rate and rapid breathing.
- Skin turning blue (cyanosis) due to lack of oxygen.

**🚨 Immediate Action Required:**
- **Call 112 or go to the nearest Emergency Room immediately.**
- This condition requires immediate medical evaluation and decompression (often via a chest tube) to relieve pressure on the lung and heart.

🚨 **Emergency — Call 112 or Go to the Hospital Immediately.**`
  },
  {
    id: 'sleep_paralysis',
    name: 'Sleep Paralysis',
    keywords: ['sleep paralysis', 'cannot move during sleep', 'awake but cannot move'],
    triage: 'self-care',
    response: `**Sleep Paralysis Assessment**

Sleep paralysis is a temporary inability to move or speak that occurs when waking up or falling asleep, caused by a transition mismatch between REM sleep and wakefulness. It is harmless and common.

**Common symptoms:**
- Being **awake but unable to move or speak** for several seconds or minutes.
- Feeling a sensation of pressure on your chest.
- Experiencing vivid hallucinations or a sense of presence in the room.

**Self-care steps:**
- **Establish healthy sleep habits**: Go to sleep and wake up at consistent times. Aim for 7-9 hours of sleep.
- Avoid sleeping on your back, as this position is strongly linked to episodes.
- Reduce stress through meditation, yoga, or relaxation techniques.
- Avoid caffeine, alcohol, and heavy meals close to bedtime.

**Note**: Come back if episodes are very frequent or cause excessive daytime sleepiness.

✅ **Self-Care Recommended** for isolated sleep paralysis.`
  },
  {
    id: 'restless_leg_syndrome',
    name: 'Restless Leg Syndrome (RLS)',
    keywords: ['restless legs', 'urge move legs', 'leg discomfort at night'],
    triage: 'self-care',
    response: `**Restless Leg Syndrome (RLS) Assessment**

RLS is a neurological disorder characterized by an irresistible urge to move your legs, typically accompanied by uncomfortable sensations.

**Common symptoms:**
- **Urge to move the legs**, usually starting or worsening during periods of rest or inactivity (like sitting or lying down).
- Uncomfortable crawling, pulling, tingling, or itching sensations deep within the legs.
- Symptoms that are **worse at night or in the evening**.

**Self-care steps:**
- Apply warm or cold compresses, or take a warm bath before bed.
- Massage your legs or perform gentle leg stretches.
- Practice good sleep hygiene.
- Limit caffeine, alcohol, and tobacco use.
- Check iron levels (ferritin), as iron deficiency is a common reversible cause.

🩺 **Consult a doctor if** symptoms interfere with your sleep or daily life.`
  },
  {
    id: 'frozen_shoulder',
    name: 'Frozen Shoulder (Adhesive Capsulitis)',
    keywords: ['frozen shoulder', 'stiff shoulder', 'difficulty moving shoulder'],
    triage: 'self-care',
    response: `**Frozen Shoulder Assessment**

Frozen shoulder is characterized by stiffness and pain in your shoulder joint, typically developing slowly in three stages (freezing, frozen, thawing). It is common in diabetics.

**Common symptoms:**
- **Severe shoulder stiffness** and pain.
- **Difficulty moving your shoulder** or raising your arm.
- Pain that is often worse at night and when sleeping on the affected side.

**Self-care steps:**
- **Gentle stretching exercises**: Slowly stretch the shoulder daily within a pain-free range.
- Apply **heat packs** before stretching to loosen muscles, and **ice packs** after to reduce inflammation.
- Take OTC pain relievers like **Ibuprofen (Combiflam)** to manage pain and inflammation.

🩺 **Consult a physiotherapist or orthopedic doctor** for a tailored exercise plan, especially if you have diabetes.`
  },
  {
    id: 'tennis_elbow',
    name: 'Tennis Elbow (Lateral Epicondylitis)',
    keywords: ['tennis elbow', 'outer elbow pain', 'pain gripping objects'],
    triage: 'self-care',
    response: `**Tennis Elbow Assessment**

Tennis elbow is a painful condition that occurs when tendons in your elbow are overworked, usually by repetitive motions of the wrist and arm.

**Common symptoms:**
- **Pain or soreness on the outer part of your elbow**.
- Pain that worsens when **gripping objects**, shaking hands, or turning doorknobs.
- Stiffness or weakness in your forearm.

**Self-care steps:**
- **Rest**: Avoid repetitive wrist extension and gripping activities.
- Apply **ice packs** to the outer elbow for 15 minutes, 3 times a day.
- Wear an elbow brace (counterforce brace) to relieve pressure on the tendon.
- Gentle forearm stretches and strengthening exercises once pain subsides.

🩺 **Consult a doctor or physiotherapist if** the pain is severe or does not improve after 2-3 weeks of rest.`
  },
  {
    id: 'acl_injury',
    name: 'ACL Injury / Tear',
    keywords: ['acl tear', 'knee instability', 'popping sound knee', 'sports knee injury'],
    triage: 'consult',
    response: `**ACL (Anterior Cruciate Ligament) Injury Assessment**

An ACL injury is a tear or sprain of the anterior cruciate ligament, one of the major ligaments in your knee, commonly occurring during sports.

**Common symptoms:**
- A **loud "pop" sound or sensation** in the knee at the time of injury.
- Severe pain and rapid swelling of the knee (within 2-4 hours).
- **Knee instability**: Feeling that your knee is "giving way" or cannot bear weight.
- Loss of full range of motion.

**Recommended steps:**
- Consult an orthopedic specialist. Confirming the diagnosis requires an MRI scan.
- Follow the **R.I.C.E.** protocol: Rest, Ice, Compression (compression bandage), and Elevation.
- Do NOT try to run or play sports. Use a knee brace or crutches if weight-bearing is painful.

🩺 **Doctor Consultation Required** to evaluate for surgical reconstruction.`
  },
  {
    id: 'meniscus_tear',
    name: 'Meniscus Tear',
    keywords: ['meniscus tear', 'locking knee', 'pain twisting knee'],
    triage: 'consult',
    response: `**Meniscus Tear Assessment**

A meniscus tear is a common knee injury involving a tear in the shock-absorbing cartilage (meniscus) between your thighbone and shinbone.

**Common symptoms:**
- Pain in the knee joint, especially when **twisting or rotating your knee**.
- Stiffness, swelling, and difficulty fully straightening your leg.
- A sensation of **locking or catching** in the knee, where the knee gets stuck.
- Feeling that your knee is unstable or giving way.

**Recommended steps:**
- Consult an orthopedic doctor. An MRI scan is usually needed for confirmation.
- Use the **R.I.C.E.** protocol (Rest, Ice, Compression, Elevation) to manage swelling.
- Avoid deep squatting, twisting, or pivoting the knee.

🩺 **Doctor Consultation Required** for diagnosis and treatment planning.`
  },
  {
    id: 'osteomyelitis',
    name: 'Osteomyelitis',
    keywords: ['bone infection', 'osteomyelitis', 'bone pain fever'],
    triage: 'consult',
    response: `**Osteomyelitis (Bone Infection) Assessment**

Osteomyelitis is an inflammation or infection of the bone, usually caused by bacteria traveling through the bloodstream or spreading from nearby infected tissue.

**Common symptoms:**
- **Severe bone pain** or tenderness in the infected area.
- Fever, chills, and fatigue.
- Swelling, redness, and warmth over the affected bone.
- Drainage (pus) from a nearby wound or skin lesion.

**Recommended steps:**
- Consult an orthopedic specialist or general surgeon immediately.
- **Diagnostics**: Blood tests (CBC, CRP, ESR), blood cultures, X-rays, or MRI.
- **Treatment**: Requires prolonged courses of intravenous (IV) antibiotics in a hospital setting and sometimes surgery to remove dead bone.

🩺 **Doctor Consultation Required TODAY** — do not delay evaluation.`
  },
  {
    id: 'scurvy',
    name: 'Vitamin C Deficiency / Scurvy',
    keywords: ['scurvy', 'bleeding gums deficiency', 'vitamin c deficiency'],
    triage: 'self-care',
    response: `**Vitamin C Deficiency (Scurvy) Assessment**

Scurvy is a disease caused by a severe, prolonged deficiency of Vitamin C (ascorbic acid) in the diet, leading to impaired collagen synthesis.

**Common symptoms:**
- **Swollen, bleeding gums** and loose teeth.
- Small red or purple spots on the skin (petechiae) and easy bruising.
- Joint pain and swelling, slow wound healing, and dry, brittle hair.
- Fatigue and weakness.

**Self-care steps:**
- **Increase Vitamin C intake**: Consume citrus fruits (oranges, lemons, sweet lime/mosambi), amla (Indian gooseberry - extremely high in Vitamin C), guavas, tomatoes, and bell peppers.
- Take oral Vitamin C supplements (Ascorbic acid tablets, e.g., Limcee 500mg daily) under guidance.
- Maintain good oral hygiene.

🩺 **Consult a doctor if** symptoms are severe or do not improve after dietary changes.`
  },
  {
    id: 'rickets',
    name: 'Rickets',
    keywords: ['rickets', 'bowed legs child', 'soft bones child'],
    triage: 'consult',
    response: `**Rickets Assessment**

Rickets is a childhood skeletal disorder characterized by soft and weak bones, typically caused by a severe, prolonged deficiency of Vitamin D or calcium.

**Common symptoms in children:**
- **Bowed legs** or knock knees.
- Soft skull bones (craniotabes) and delayed growth.
- Thickened wrists and ankles, and skeletal pain.
- Late teething or weak tooth enamel.

**Recommended steps:**
- Consult a pediatrician or pediatric endocrinologist.
- **Diagnostics**: Blood tests checking calcium, phosphorus, alkaline phosphatase, and Vitamin D levels, along with bone X-rays.
- Treatment includes vitamin D and calcium supplements.
- Ensure the child gets safe morning sunlight exposure and a calcium-rich diet.

🩺 **Doctor Consultation Required** to confirm diagnosis and prescribe therapeutic doses.`
  },
  {
    id: 'dehydration_severe',
    name: 'Severe Dehydration',
    keywords: ['sunken eyes', 'very dry mouth', 'severe dehydration', 'minimal urine'],
    triage: 'emergency',
    response: `🚨 **Severe Dehydration — EMERGENCY**

Severe dehydration is a critical condition where your body has lost a dangerous amount of water and essential electrolytes, often due to diarrhea, vomiting, or excessive heat.

**Warning Signs:**
- **Sunken eyes** and a **very dry mouth** or tongue.
- No urination for 8+ hours, or **minimal, dark amber urine**.
- Extreme thirst, confusion, dizziness, rapid heart rate, or fainting.
- Inability to keep any fluids down.

**🚨 Immediate Action Required:**
- **Go to the nearest emergency department or clinic immediately.**
- Severe dehydration is life-threatening and requires immediate **intravenous (IV) fluids** to restore blood volume and kidney function.

🚨 **Emergency — Seek Immediate Medical Treatment.**`
  },
  {
    id: 'heat_exhaustion',
    name: 'Heat Exhaustion',
    keywords: ['heat exhaustion', 'heavy sweating', 'weakness in heat', 'dizziness heat'],
    triage: 'self-care',
    response: `**Heat Exhaustion Assessment**

Heat exhaustion is your body's response to an excessive loss of water and salt, usually through heavy sweating in high temperatures.

**Common symptoms:**
- **Heavy sweating** and cold, pale, clammy skin.
- **Dizziness, headache, or lightheadedness**.
- Extreme weakness or fatigue, and muscle cramps.
- Nausea or a rapid, weak pulse.

**Self-care steps:**
- Move to a cool, air-conditioned, or shaded place immediately.
- Loosen your clothing and apply cool, wet cloths to your skin.
- Sip cool water, ORS (Electral), or sports drinks.
- Rest and avoid physical activity.
- **🚨 Seek emergency care immediately if** you experience confusion, vomiting, or if your body temperature rises above 104°F (indicators of life-threatening Heat Stroke).

✅ **Self-Care Recommended** if symptoms improve with cooling and hydration.`
  },
  {
    id: 'altitude_sickness',
    name: 'Altitude Sickness',
    keywords: ['altitude sickness', 'mountain sickness', 'headache at high altitude'],
    triage: 'self-care',
    response: `**Altitude / Mountain Sickness Assessment**

Altitude sickness occurs when you travel to high altitudes (typically above 8,000 feet) too quickly, where the air pressure and oxygen levels are lower. It is common during treks in Leh-Ladakh or the Himalayas.

**Common symptoms:**
- **Headache**, which is usually the primary symptom.
- Dizziness, fatigue, and sleep disturbances.
- Loss of appetite, nausea, or vomiting.

**Self-care steps:**
- **Acclimatize**: Spend 1–2 days resting at a mid-altitude before climbing higher.
- **Descend**: If symptoms worsen, the most effective treatment is to descend immediately.
- Drink plenty of water; avoid alcohol and smoking.
- Medications like **Acetazolamide (Diamox)** can help prevent and treat symptoms (consult a doctor for a prescription before traveling).
- Use supplementary oxygen if available.

🩺 **See a doctor immediately if** you experience severe breathlessness at rest or confusion (risk of life-threatening lung/brain fluid buildup - HAPE/HACE).`
  },
  {
    id: 'motion_sickness',
    name: 'Motion Sickness',
    keywords: ['motion sickness', 'car sickness', 'vomiting during travel'],
    triage: 'self-care',
    response: `**Motion Sickness Assessment**

Motion sickness is a common disturbance of the inner ear caused by repeated motion (such as in a car, boat, or airplane), leading to sensory conflicts.

**Common symptoms:**
- **Nausea and vomiting** during travel.
- Dizziness, cold sweating, and pale skin.

**Self-care steps:**
- Focus on a stable point (e.g., look at the horizon ahead). Sit in the front seat of a car or over the wing of an airplane.
- Keep your head still and close your eyes if possible.
- Avoid reading or looking at screens during motion.
- Ensure fresh air ventilation.
- **Prevention**: Take OTC medications like **Dimenhydrinate (Gravol)** or **Meclizine** 30-60 minutes *before* traveling. Ginger candies or prescription patches can also help.

✅ **Self-Care Recommended** for travel-related motion sickness.`
  },
  {
    id: 'rabies',
    name: 'Rabies',
    keywords: ['rabies', 'dog bite infection', 'fear of water', 'animal bite fever', 'hydrophobia'],
    triage: 'emergency',
    response: `🚨 **Possible Rabies / Animal Bite Exposure — EMERGENCY**

Rabies is a 100% fatal viral disease once symptoms appear, but it is 100% preventable if treated immediately after exposure (animal bite/scratch).

**Critical Post-Exposure Prophylaxis (PEP) Steps:**
1. **Wash the wound immediately** with soap and running water for at least 15 minutes. This is the most crucial step to remove the virus.
2. Apply an antiseptic (like povidone-iodine or alcohol).
3. Do NOT suture/stitch the wound unless absolutely necessary.
4. **Go to a hospital/clinic immediately** to receive the Rabies Vaccine and Rabies Immunoglobulin (ERIG) if required.

**Symptoms (Once active, rabies is fatal):**
- Fear of water (hydrophobia) or air drafts (aerophobia)
- Extreme agitation, confusion, or muscle spasms
- Fever, headache, and tingling at the bite site

🚨 **Emergency — Seek Immediate Rabies Vaccination.`
  },
  {
    id: 'tetanus',
    name: 'Tetanus',
    keywords: ['tetanus', 'lockjaw', 'muscle spasms', 'stiff jaw after injury'],
    triage: 'emergency',
    response: `🚨 **Possible Tetanus / Lockjaw — EMERGENCY**

Tetanus is a serious bacterial infection caused by *Clostridium tetani* spores entering the body through wounds, cuts, or punctures, especially from rusted metal, soil, or animal bites.

**Common symptoms:**
- **Lockjaw** (stiff jaw muscles making it hard to open the mouth)
- Painful muscle spasms and stiffness (especially in the neck, abdomen, and back)
- Difficulty swallowing and fever

**Urgent Actions:**
- Wash the wound thoroughly.
- **Get a Tetanus Toxoid (TT) vaccine injection within 24 hours** if your last dose was more than 5 years ago (or if unknown).
- Go to an emergency clinic immediately for evaluation and possible tetanus immunoglobulin.

🚨 **Emergency — Seek Immediate Medical Treatment.`
  },
  {
    id: 'lyme_disease',
    name: 'Lyme Disease',
    keywords: ['lyme disease', 'tick bite rash', 'bullseye rash', 'joint pain after tick bite'],
    triage: 'consult',
    response: `**Possible Lyme Disease**

Lyme disease is a bacterial infection transmitted through the bite of infected blacklegged ticks.

**Key symptoms:**
- **Bullseye rash** (Erythema migrans) — a circular red rash expanding around the bite site
- Fever, chills, fatigue, and body aches
- Joint pain and swelling (often migratory)

**Recommended steps:**
- Consult a doctor for a blood test and prescription antibiotics (e.g., Doxycycline), which are highly effective when taken early.
- Do not ignore tick bites that develop expanding rashes.

🩺 **Doctor Consultation Advised** for antibiotic therapy.`
  },
  {
    id: 'amoebiasis',
    name: 'Amoebiasis / Amoebic Dysentery',
    keywords: ['amoebiasis', 'bloody diarrhea parasite', 'intestinal parasite', 'amoeba infection'],
    triage: 'consult',
    response: `**Possible Amoebiasis (Amoebic Dysentery)**

Amoebiasis is an intestinal infection caused by the parasite *Entamoeba histolytica*, common in areas with poor sanitation.

**Common symptoms:**
- **Bloody diarrhea** (loose stools with mucus and blood)
- Severe abdominal cramps and flatulence
- Fever and weight loss

**Recommended steps:**
- Drink plenty of **ORS** to prevent dehydration.
- Avoid self-medication with anti-diarrheals (like Loperamide), as they can worsen the infection.
- Consult a doctor for a stool test. Common treatment includes antiprotozoal medication (like Metronidazole / Flagyl).

🩺 **Doctor Consultation Required** for prescription antiprotozoals.`
  },
  {
    id: 'giardiasis',
    name: 'Giardiasis',
    keywords: ['giardiasis', 'foul smelling diarrhea', 'parasite diarrhea', 'bloating parasite'],
    triage: 'consult',
    response: `**Possible Giardiasis**

Giardiasis is a diarrheal illness caused by the microscopic parasite *Giardia duodenalis*, transmitted via contaminated water or food.

**Common symptoms:**
- Watery, **foul-smelling diarrhea** that may look greasy
- Severe abdominal bloating, gas, and cramps
- Nausea, fatigue, and weight loss

**Recommended steps:**
- Maintain hydration with ORS and clean water.
- Avoid milk and dairy products, as Giardia can cause temporary lactose intolerance.
- Consult a doctor for stool analysis. Treatment usually requires Metronidazole or Tinidazole.

🩺 **Doctor Consultation Required** to confirm and treat the parasite.`
  },
  {
    id: 'tapeworm_infection',
    name: 'Tapeworm Infection',
    keywords: ['tapeworm', 'worms in stool', 'parasitic worms', 'intestinal worms'],
    triage: 'self-care',
    response: `**Tapeworm Infection Assessment**

Tapeworm infections are caused by consuming undercooked meat or food/water contaminated with tapeworm eggs or larvae.

**Common symptoms:**
- **Segmented worms visible in stool**
- Mild abdominal discomfort, nausea, or changes in appetite
- Unexplained weight loss

**Self-care steps:**
- Cook meats thoroughly and wash hands frequently.
- **Albendazole** is a common deworming medication in India, but should be confirmed with a physician or pharmacist.
- Get a stool test if symptoms persist.

✅ **Self-Care Recommended** with proper deworming medication.`
  },
  {
    id: 'oral_thrush',
    name: 'Oral Thrush (Oral Candidiasis)',
    keywords: ['oral thrush', 'white patches mouth', 'fungal mouth infection', 'tongue white coating'],
    triage: 'consult',
    response: `**Oral Thrush Assessment**

Oral thrush is a fungal infection caused by *Candida* yeast overgrowth inside the mouth, common after antibiotic use, steroid inhalers, or in immunocompromised individuals.

**Common symptoms:**
- **Creamy white patches** on the tongue, inner cheeks, or gums (can bleed slightly if scraped)
- Soreness or burning sensation in the mouth
- Loss of taste or difficulty swallowing

**Recommended steps:**
- Clean your tongue daily. Rinse mouth after steroid inhalers.
- Consult a doctor or dentist for antifungal treatment (e.g., Clotrimazole mouth paint or Nystatin rinse).

🩺 **Doctor/Dentist Consultation Advised** for antifungal mouth paint.`
  },
  {
    id: 'candida_infection',
    name: 'Candida Infection / Candidiasis',
    keywords: ['candida', 'fungal candida infection', 'yeast overgrowth', 'candida symptoms'],
    triage: 'consult',
    response: `**Candida Infection (Candidiasis) Assessment**

Candidiasis refers to fungal infections caused by *Candida* yeast, which can affect the skin, nails, or mucosal linings.

**Common symptoms:**
- Red, itchy skin rashes in skin folds (armpits, groin, under breasts)
- White coating on tongue or vaginal yeast infections
- Itching, burning, or cracking skin

**Recommended steps:**
- Keep affected areas dry and clean.
- Avoid tight clothing.
- Consult a doctor for a topical or oral antifungal prescription (e.g., Fluconazole, Clotrimazole cream).

🩺 **Doctor Consultation Advised** for appropriate antifungal treatment.`
  },
  {
    id: 'cellulitis',
    name: 'Cellulitis',
    keywords: ['cellulitis', 'red swollen skin', 'skin infection spreading', 'painful skin redness'],
    triage: 'consult',
    response: `**Cellulitis Assessment**

Cellulitis is a common, potentially serious bacterial skin infection that causes redness, swelling, and heat, typically in the lower legs.

**Common symptoms:**
- **Rapidly spreading red, swollen skin**
- Area feels hot and tender to the touch
- Fever, chills, or red streaks extending from the area

**⚠️ Go to emergency if:**
- The red area expands very rapidly
- You develop a high fever or confusion
- The infection is near your eyes

**Treatment:** Requires prescription oral or IV antibiotics. Do not delay seeing a doctor.

🩺 **Doctor Consultation TODAY** — antibiotics are required to prevent spreading.`
  },
  {
    id: 'abscess',
    name: 'Skin Abscess',
    keywords: ['abscess', 'pus filled swelling', 'painful lump with pus', 'infected boil'],
    triage: 'consult',
    response: `**Skin Abscess Assessment**

An abscess is a painful, swollen pocket of pus beneath the skin caused by a bacterial infection.

**Common symptoms:**
- **Painful, firm, or squishy red lump**
- Pus collection in the center (yellow or white head)
- Localized warmth and tenderness, sometimes fever

**Recommended steps:**
- Do NOT squeeze, pop, or needle the abscess, as this spreads the infection deeper.
- Apply warm compresses to encourage drainage.
- Consult a doctor. Many abscesses require a minor procedure called **Incision and Drainage (I&D)** and antibiotics.

🩺 **Doctor Consultation Advised** for evaluation and possible drainage.`
  },
  {
    id: 'vitiligo',
    name: 'Vitiligo',
    keywords: ['vitiligo', 'white skin patches', 'loss of skin pigment'],
    triage: 'self-care',
    response: `**Vitiligo Assessment**

Vitiligo is a long-term skin condition characterized by patches of the skin losing their pigment, occurring when pigment-producing cells die or stop functioning. It is not contagious.

**Common symptoms:**
- **Patchy loss of skin color** (depigmentation), typically appearing first on hands, face, and areas around body openings.
- Premature whitening or graying of hair on scalp, eyelashes, eyebrows, or beard.

**Self-care steps:**
- **Sun protection**: Apply sunscreen (SPF 30+) daily on white patches to prevent severe sunburn.
- Cosmetic camouflaging creams can help even out skin appearance.
- Consult a dermatologist for treatment options (like topical steroid creams, phototherapy, or tacrolimus).

✅ **Self-Care Recommended** along with a dermatologist consultation.`
  },
  {
    id: 'warts',
    name: 'Warts',
    keywords: ['warts', 'skin wart', 'rough skin growth', 'viral wart'],
    triage: 'self-care',
    response: `**Warts Assessment**

Warts are small, non-cancerous skin growths caused by human papillomavirus (HPV) infection of the top skin layer.

**Common symptoms:**
- Small, **rough, grainy skin growths** on hands, fingers, or feet.
- May have tiny black dots in the center (clotted blood vessels).

**Self-care steps:**
- Over-the-counter **Salicylic acid** preparations can gradually dissolve warts.
- Avoid picking or scratching warts, as they can spread to other body parts.
- Consult a dermatologist for advanced removal (cryotherapy, laser, or cautery) if they are painful or spreading.

✅ **Self-Care Recommended** for mild, non-painful warts.`
  },
  {
    id: 'rosacea',
    name: 'Rosacea',
    keywords: ['rosacea', 'red face skin', 'facial flushing', 'persistent facial redness'],
    triage: 'self-care',
    response: `**Rosacea Assessment**

Rosacea is a chronic inflammatory skin condition that primarily affects the face, causing redness and visible blood vessels.

**Common symptoms:**
- **Persistent redness / flushing** across the cheeks, nose, forehead, and chin.
- Small, red, pus-filled bumps (resembling acne).
- Burning or stinging sensation on the face.

**Self-care steps:**
- Identify and avoid triggers (spicy food, hot beverages, alcohol, extreme temperatures, sun).
- Use gentle, fragrance-free skin cleansers and daily sunscreen.
- Consult a dermatologist for topical gels (like Metronidazole or Azelaic acid).

✅ **Self-Care Recommended** with trigger avoidance.`
  },
  {
    id: 'sunburn',
    name: 'Sunburn',
    keywords: ['sunburn', 'skin burning after sun', 'red skin sunlight', 'peeling skin sun'],
    triage: 'self-care',
    response: `**Sunburn Assessment**

Sunburn is an inflammatory reaction to ultraviolet (UV) radiation damage to the skin's outermost layers.

**Common symptoms:**
- **Red, painful, warm skin** after sun exposure.
- Skin peeling after a few days.
- Mild swelling or itching.

**Self-care steps:**
- Cool the skin: Take cool baths or apply cold, damp towels.
- Apply **Aloe vera gel** or Calamine lotion to soothe the burning.
- Stay hydrated by drinking plenty of water.
- Take Paracetamol or Ibuprofen for pain relief.
- Do NOT pop any blisters if they form.

✅ **Self-Care Recommended** for mild sunburn.`
  },
  {
    id: 'herpes_simplex',
    name: 'Herpes Simplex',
    keywords: ['herpes', 'cold sores', 'painful blisters lips', 'genital herpes'],
    triage: 'self-care',
    response: `**Herpes Simplex Assessment**

Herpes Simplex Virus (HSV) causes recurrent infections characterized by small, painful blisters on the lips/mouth (oral herpes) or genitals (genital herpes).

**Common symptoms:**
- **Painful, tingling sensation** followed by clusters of small fluid-filled blisters.
- Blisters rupture, ooze, and crust over.
- Itching and localized pain.

**Self-care steps:**
- Keep the sores clean and dry.
- Apply ice wrapped in a towel to reduce swelling.
- Over-the-counter **Acyclovir cream** (apply early at the tingling stage).
- Consult a doctor for oral antiviral tablets (Acyclovir/Valacyclovir) for faster recovery.

✅ **Self-Care Recommended** for mild outbreaks. Consult doctor for recurring cases.`
  },
  {
    id: 'peripheral_artery_disease',
    name: 'Peripheral Artery Disease (PAD)',
    keywords: ['pad', 'leg pain walking', 'poor blood circulation legs', 'cold feet'],
    triage: 'consult',
    response: `**Peripheral Artery Disease (PAD) Assessment**

PAD is a common circulatory problem in which narrowed arteries reduce blood flow to your limbs, usually the legs.

**Common symptoms:**
- **Painful leg cramping while walking** (claudication) that resolves with a few minutes of rest.
- Numbness, weakness, or coldness in the lower leg or foot.
- Slow-healing sores on toes or feet.

**Recommended steps:**
- Consult a doctor or cardiologist. Confirming PAD involves checking the Ankle-Brachial Index (ABI) or an ultrasound.
- Quit smoking completely, as it is the major risk factor.
- Walk regularly and manage diabetes, blood pressure, and cholesterol.

🩺 **Doctor Consultation Required** to manage cardiovascular risks.`
  },
  {
    id: 'angina',
    name: 'Angina Pectoris',
    keywords: ['angina', 'chest pain exertion', 'tight chest exercise', 'heart chest discomfort'],
    triage: 'emergency',
    response: `🚨 **Angina / Heart Chest Discomfort — EMERGENCY**

Angina is chest pain or discomfort caused when your heart muscle doesn't get enough oxygen-rich blood, typically triggered by physical exertion or stress. It is a warning sign of coronary artery disease.

**Warning Signs:**
- Squeezing, pressure, heaviness, or **tightness in the chest during exertion** that goes away with rest.
- Pain radiating to your neck, jaw, back, or left arm.

**🚨 Emergency Action Required:**
- Stop all activity immediately and sit down.
- If you have prescribed **Sublingual Nitroglycerin (Sorbitrate)**, place one tablet under your tongue.
- **If the pain lasts longer than 5 minutes or is accompanied by breathlessness or sweating, call 112 immediately.**

🚨 **Emergency — Seek Immediate Medical Treatment if pain persists.`
  },
  {
    id: 'atrial_fibrillation',
    name: 'Atrial Fibrillation (AFib)',
    keywords: ['atrial fibrillation', 'afib', 'irregular pulse', 'fluttering heartbeat'],
    triage: 'consult',
    response: `**Atrial Fibrillation (AFib) Assessment**

AFib is an irregular and often very rapid heart rhythm (arrhythmia) that can lead to blood clots in the heart, increasing the risk of stroke and heart failure.

**Common symptoms:**
- **Irregular, fluttering, or racing heartbeat** (palpitations).
- Fatigue, dizziness, lightheadedness, or shortness of breath.
- Chest discomfort.

**Recommended steps:**
- Consult a cardiologist. Diagnosis requires an ECG (Electrocardiogram) or a Holter monitor.
- Take prescribed blood thinners (anticoagulants) and rate-control medications exactly as directed.
- **🚨 Seek emergency care if** you experience sudden slurred speech, face drooping, or arm weakness (stroke signs) or severe chest pain.

🩺 **Cardiologist Consultation Required** for diagnosis and management.`
  },
  {
    id: 'cardiac_arrest',
    name: 'Cardiac Arrest',
    keywords: ['cardiac arrest', 'collapsed suddenly', 'no pulse', 'heart stopped'],
    triage: 'emergency',
    response: `🚨 **CARDIAC ARREST — IMMEDIATE ACTION REQUIRED — EMERGENCY**

Cardiac arrest occurs when the heart suddenly stops beating. This is a medical emergency that results in death within minutes if not treated immediately.

**🚨 Action Plan:**
1. **Call 112 (or local emergency) immediately.**
2. Get an AED (Automated External Defibrillator) if available.
3. **Start CPR (Cardiopulmonary Resuscitation) immediately**:
   - Push hard and fast in the center of the chest (100–120 compressions per minute).
   - Allow the chest to rise completely between compressions.
   - Continue until professional help arrives.

🚨 **Emergency — Call 112 and Start CPR Immediately.`
  },
  {
    id: 'deep_burn',
    name: 'Severe / Deep Burn (Third-Degree)',
    keywords: ['third degree burn', 'deep burn', 'charred skin', 'severe skin burn'],
    triage: 'emergency',
    response: `🚨 **Severe / Deep Burn — EMERGENCY**

Deep, third-degree burns damage all layers of the skin and underlying tissues. They require immediate medical treatment to prevent infection, dehydration, and shock.

**Warning signs:**
- Skin appears **charred, white, black, or dry and leathery**.
- Pain may be minimal or absent because nerve endings are destroyed.
- Burn covers a large area (hands, face, joints, or groin).

**🚨 Immediate Steps:**
- **Call 112 or go to the nearest hospital immediately.**
- Do NOT apply cold water or ice to severe burns (can cause shock/hypothermia).
- Cover the burn loosely with a clean, dry, non-stick bandage or cloth.
- Do NOT apply ointments, butter, or home remedies.

🚨 **Emergency — Seek Immediate Medical Treatment.`
  },
  {
    id: 'internal_bleeding',
    name: 'Internal Bleeding',
    keywords: ['internal bleeding', 'blood vomiting', 'black stools', 'abdominal trauma bleeding'],
    triage: 'emergency',
    response: `🚨 **Internal Bleeding — EMERGENCY**

Internal bleeding is a life-threatening medical emergency where blood loss occurs inside the body cavity, often after trauma, surgery, or severe gastrointestinal issues.

**Warning Signs:**
- Vomiting blood (bright red or coffee-ground appearance).
- **Black, tarry stools** (melena) or bright red blood in stool.
- Dizziness, cold clammy skin, rapid heart rate, and fainting (shock signs).
- Severe abdominal pain or swelling after an injury.

**🚨 Urgent Actions:**
- **Go to the nearest emergency department immediately.**
- Lie flat and keep warm. Do NOT eat or drink anything.

🚨 **Emergency — Seek Immediate Medical Treatment.`
  },
  {
    id: 'shock',
    name: 'Medical Shock',
    keywords: ['shock', 'cold clammy skin', 'low blood pressure emergency', 'weak rapid pulse'],
    triage: 'emergency',
    response: `🚨 **Medical Shock — EMERGENCY**

Medical shock is a life-threatening drop in blood flow through the body, preventing organs from receiving enough oxygen. It can be caused by severe blood loss, trauma, severe infection (sepsis), or allergic reactions.

**Warning Signs:**
- **Cold, pale, clammy skin**.
- Rapid, shallow breathing and a **weak, rapid pulse**.
- Dizziness, confusion, extreme weakness, or loss of consciousness.
- Blue lips or fingernails.

**🚨 Immediate Action:**
- **Call 112 or go to emergency immediately.**
- Lay the person flat and elevate their legs slightly (unless spinal injury suspected).
- Keep them warm and comfortable. Do NOT give them food or water.

🚨 **Emergency — Seek Immediate Medical Treatment.`
  },
  {
    id: 'respiratory_failure',
    name: 'Respiratory Failure',
    keywords: ['respiratory failure', 'cannot breathe properly', 'oxygen low', 'severe breathing distress'],
    triage: 'emergency',
    response: `🚨 **Respiratory Failure — EMERGENCY**

Respiratory failure occurs when the lungs cannot successfully exchange oxygen and carbon dioxide, leading to dangerously low blood oxygen levels.

**Warning Signs:**
- **Extreme difficulty breathing** or gasping for air.
- Confusion, extreme sleepiness, or anxiety.
- **Blue tint to lips, face, or fingernails** (cyanosis).
- Blood oxygen levels (SpO2) dropping below 90% on a pulse oximeter.

**🚨 Urgent Actions:**
- **Call 112 or go to the nearest emergency room immediately.**
- If oxygen cylinder/concentrator is available, administer oxygen immediately.
- Sit upright and stay calm while waiting for help.

🚨 **Emergency — Call 112 Immediately.`
  },
  {
    id: 'dvt_pregnancy',
    name: 'Pregnancy-Related DVT',
    keywords: ['leg swelling pregnancy', 'blood clot pregnancy', 'painful calf pregnancy'],
    triage: 'emergency',
    response: `🚨 **Pregnancy-Related Deep Vein Thrombosis (DVT) — EMERGENCY**

Pregnancy increases blood clotting risks. DVT is a blood clot forming in a deep vein (usually the leg), which can break off and travel to the lungs (pulmonary embolism), a life-threatening emergency.

**Warning Signs:**
- **Sudden swelling in one leg** (usually left leg).
- Severe, constant calf pain, tenderness, or warmth.
- Redness or discoloration on the leg skin.

**🚨 Urgent Actions:**
- **Go to an emergency department or contact your obstetrician immediately.**
- Do NOT massage the painful calf, as this could dislodge the clot.
- Diagnosis requires a lower limb Doppler ultrasound. Treatment involves safe blood thinners (low molecular weight heparin).

🚨 **Emergency — Seek Immediate Medical Evaluation.`
  },
  {
    id: 'miscarriage',
    name: 'Miscarriage / Pregnancy Loss',
    keywords: ['miscarriage', 'pregnancy bleeding', 'cramps during pregnancy', 'loss of pregnancy'],
    triage: 'emergency',
    response: `🚨 **Possible Miscarriage — EMERGENCY**

Vaginal bleeding or severe cramping during pregnancy must be evaluated by a healthcare professional immediately to assess maternal and fetal health.

**Common signs:**
- **Vaginal bleeding or spotting** (bright red or brownish).
- Sharp, cramping pain in the lower abdomen or lower back.
- Passing tissue or fluid from the vagina.

**🚨 Urgent Actions:**
- **Go to the nearest emergency department or contact your obstetrician immediately.**
- Save any passed tissue in a clean container if possible for examination.
- Do NOT use tampons or insert anything into the vagina.

🚨 **Emergency — Seek Immediate Obstetric Care.`
  },
  {
    id: 'menopause',
    name: 'Menopause',
    keywords: ['menopause', 'hot flashes', 'night sweats female', 'stopped periods'],
    triage: 'self-care',
    response: `**Menopause Assessment**

Menopause is a natural biological process marking the permanent end of menstruation (confirmed after 12 consecutive months without a period), typically occurring between ages 45 and 55.

**Common symptoms:**
- **Hot flashes** (sudden feeling of heat) and night sweats.
- Mood changes, sleep disturbances, and fatigue.
- Vaginal dryness and irregular periods during the transition (perimenopause).

**Self-care steps:**
- Dress in layers and drink cool water to manage hot flashes.
- Exercise regularly and consume a diet rich in calcium and Vitamin D to protect bone density.
- Avoid triggers like caffeine, alcohol, and spicy foods.
- Consult a gynecologist if symptoms are severe; Hormone Replacement Therapy (HRT) or non-hormonal medications can help.

✅ **Self-Care Recommended** for normal menopausal symptoms.`
  },
  {
    id: 'pelvic_inflammatory_disease',
    name: 'Pelvic Inflammatory Disease (PID)',
    keywords: ['pid', 'pelvic inflammatory disease', 'pelvic infection', 'painful intercourse infection'],
    triage: 'consult',
    response: `**Pelvic Inflammatory Disease (PID) Assessment**

PID is an infection of the female reproductive organs, usually caused by sexually transmitted bacteria spreading from the vagina to the uterus, fallopian tubes, or ovaries.

**Common symptoms:**
- **Dull ache or pain in the pelvis** or lower abdomen.
- Foul-smelling vaginal discharge.
- Pain or bleeding during or after intercourse, or burning urination.
- Fever and chills.

**Recommended steps:**
- Consult a gynecologist immediately. Untreated PID can lead to scarring and infertility.
- Avoid intercourse until treatment is complete.
- **Treatment**: Requires a course of prescription antibiotics. Sexual partners should also be treated to prevent reinfection.

🩺 **Doctor Consultation Required** for prescription antibiotic therapy.`
  },
  {
    id: 'bacterial_vaginosis',
    name: 'Bacterial Vaginosis (BV)',
    keywords: ['bacterial vaginosis', 'fishy vaginal odor', 'gray discharge', 'vaginal infection bacteria'],
    triage: 'self-care',
    response: `**Bacterial Vaginosis (BV) Assessment**

BV is a mild vaginal infection caused by an imbalance of the normal bacteria in the vagina. It is not an STI but can increase susceptibility to them.

**Common symptoms:**
- **Thin, grayish-white vaginal discharge**.
- **Strong "fishy" odor**, especially after intercourse or washing.
- Mild vaginal itching or burning.

**Self-care steps:**
- Avoid douching, scented soaps, or bubble baths (they disrupt vaginal pH).
- Wear breathable cotton underwear.
- Consult a doctor for a diagnosis. BV is highly treatable with prescription oral or gel antibiotics (like Metronidazole or Clindamycin).

✅ **Self-Care Recommended** alongside doctor consultation for prescription treatment.`
  },
  {
    id: 'infertility_female',
    name: 'Female Infertility',
    keywords: ['cannot conceive', 'female infertility', 'difficulty getting pregnant'],
    triage: 'consult',
    response: `**Female Infertility Evaluation**

Infertility is defined as the inability to conceive after 12 months (or 6 months if age >35) of regular, unprotected intercourse.

**Common causes:**
- Ovulation disorders (e.g., PCOS, thyroid disorders)
- Blocked fallopian tubes (often due to past infections or pelvic surgery)
- Endometriosis or uterine abnormalities
- Age-related decline in egg quality

**Recommended steps:**
- Consult a gynecologist or fertility specialist (reproductive endocrinologist).
- Diagnostics include hormone profile tests (AMH, FSH, Thyroid), follicular study ultrasound, and a Hysterosalpingography (HSG) dye test for tube patency.
- Maintain a healthy weight, quit smoking/alcohol, and track ovulation.

🩺 **Doctor Consultation Advised** for diagnostic evaluation.`
  },
  {
    id: 'infertility_male',
    name: 'Male Infertility',
    keywords: ['male infertility', 'low sperm count', 'difficulty fathering child'],
    triage: 'consult',
    response: `**Male Infertility Evaluation**

Male infertility refers to a male's inability to cause pregnancy in a fertile female, contributing to about 40–50% of infertility cases.

**Common causes:**
- Abnormal sperm production or function (low sperm count, poor motility/shape)
- Varicocele (swollen veins in the scrotum heating the testicles)
- Hormonal imbalances or genetic factors
- Lifestyle factors (obesity, smoking, alcohol, hot baths, tight underwear)

**Recommended steps:**
- Consult a urologist or andrologist.
- **Key Test**: **Semen Analysis** (abstain from ejaculation for 2-5 days before the test).
- Lifestyle changes: Avoid heat exposure to testicles, take antioxidant supplements (like Coenzyme Q10, Zinc), quit smoking, and maintain a healthy weight.

🩺 **Doctor Consultation Required** for semen analysis and diagnosis.`
  },
  {
    id: 'hydrocele',
    name: 'Hydrocele',
    keywords: ['hydrocele', 'fluid around testicle', 'swollen scrotum'],
    triage: 'consult',
    response: `**Hydrocele Assessment**

A hydrocele is a painless accumulation of fluid around one or both testicles, causing the scrotum to swell. It is common in newborns and can occur in adults due to inflammation or injury.

**Common symptoms:**
- **Painless swelling of one or both testicles**.
- Scrotum feels heavy or enlarged, but usually has no severe pain.

**Recommended steps:**
- Consult a urologist or general surgeon to rule out hernia or testicular tumor.
- Confirmation is done using a scrotal ultrasound.
- In adults, hydroceles often resolve on their own, but large, uncomfortable ones may require a simple surgical procedure (hydrocelectomy).

🩺 **Doctor Consultation Advised** to rule out other causes of testicular swelling.`
  },
  {
    id: 'varicocele',
    name: 'Varicocele',
    keywords: ['varicocele', 'enlarged scrotal veins', 'testicle heaviness'],
    triage: 'consult',
    response: `**Varicocele Assessment**

A varicocele is an enlargement of the veins within the scrotum, similar to varicose veins in the legs. It can cause low sperm production and decreased sperm quality.

**Common symptoms:**
- **Dull, aching testicle pain or heaviness**, often worse after standing or physical exertion and relieved when lying down.
- Veins in the scrotum that look or feel like a "bag of worms."
- Testicular shrinkage on the affected side (usually left).

**Recommended steps:**
- Consult a urologist. Diagnosis is confirmed via a physical exam and scrotal Doppler ultrasound.
- Wear supportive underwear (like briefs or athletic supporters) to relieve aching.
- Take OTC pain relievers if needed. Surgery (varicocelectomy) is considered if it causes severe pain, testicular atrophy, or infertility.

🩺 **Doctor Consultation Required** to evaluate semen quality and pain management.`
  },
  {
    id: 'sickle_cell_disease',
    name: 'Sickle Cell Disease',
    keywords: ['sickle cell', 'pain crisis', 'abnormal red blood cells', 'chronic anemia'],
    triage: 'consult',
    response: `**Sickle Cell Disease Assessment**

Sickle cell disease is an inherited red blood cell disorder where cells become crescent-shaped, blocking blood flow and leading to oxygen depletion, severe pain, and organ damage.

**Common symptoms:**
- **Vaso-occlusive pain crises** (sudden, severe pain in bones, chest, or joints).
- Chronic anemia, fatigue, and jaundice.
- Swelling in hands and feet (dactylitis) in children.

**Recommended steps:**
- Consult a hematologist regularly.
- **During a pain crisis**: Stay well-hydrated, keep warm, and take prescribed pain medications.
- **🚨 Go to Emergency immediately if** you experience chest pain with breathing difficulty (acute chest syndrome), high fever, or stroke symptoms.

🩺 **Doctor Consultation Required** for specialist hematology management.`
  },
  {
    id: 'thalassemia',
    name: 'Thalassemia',
    keywords: ['thalassemia', 'genetic anemia', 'low hemoglobin inherited'],
    triage: 'consult',
    response: `**Thalassemia Assessment**

Thalassemia is an inherited blood disorder causing your body to have less hemoglobin than normal, leading to mild or severe anemia.

**Common symptoms:**
- Fatigue, weakness, pale skin, or yellowish eyes.
- Slow growth and bone deformities (especially facial bones) in severe types (Thalassemia Major).
- Dark urine.

**Recommended steps:**
- Consult a hematologist. Diagnosis is made using hemoglobin electrophoresis.
- **Caution**: Do NOT take iron supplements unless prescribed, as thalassemia patients are at risk of iron overload.
- Thalassemia Major requires regular blood transfusions and iron chelation therapy.

🩺 **Doctor Consultation Required** for diagnosis and management.`
  },
  {
    id: 'hemophilia',
    name: 'Hemophilia',
    keywords: ['hemophilia', 'bleeding disorder', 'excessive bleeding', 'blood clotting problem'],
    triage: 'consult',
    response: `**Hemophilia Assessment**

Hemophilia is a rare inherited bleeding disorder in which the blood doesn't clot normally because it lacks sufficient blood-clotting proteins (factors).

**Common symptoms:**
- **Excessive bleeding or bruising** from minor cuts or dental work.
- Pain, swelling, or stiffness in joints (knees, elbows) due to internal bleeding.
- Unexplained nosebleeds.

**Recommended steps:**
- Consult a hematologist.
- Avoid activities that carry a high risk of injury.
- Do NOT take Aspirin or NSAIDs (like Ibuprofen), as they increase bleeding risk. Use Paracetamol for pain.
- **🚨 Seek Emergency Care immediately if** you experience bleeding that won't stop, severe joint swelling, severe headaches, or blood in urine/stool.

🩺 **Doctor Consultation Required** for clotting factor replacement therapy.`
  },
  {
    id: 'leukemia',
    name: 'Leukemia',
    keywords: ['leukemia', 'blood cancer', 'frequent infections', 'easy bruising', 'persistent fatigue cancer'],
    triage: 'consult',
    response: `**Leukemia Assessment**

Leukemia is cancer of the body's blood-forming tissues, including the bone marrow and the lymphatic system, causing abnormal white blood cells.

**Common symptoms:**
- **Persistent fatigue, weakness, or pale skin** (anemia).
- **Frequent infections** or fever.
- **Easy bruising or bleeding** (e.g., bleeding gums, tiny red spots on skin).
- Swollen lymph nodes, enlarged liver/spleen, and night sweats.

**Recommended steps:**
- Consult an oncologist or hematologist immediately.
- Diagnostics include a Complete Blood Count (CBC), peripheral blood smear, and bone marrow biopsy.

🩺 **Oncologist/Hematologist Consultation Required** for immediate diagnosis.`
  },
  {
    id: 'lymphoma',
    name: 'Lymphoma',
    keywords: ['lymphoma', 'swollen lymph nodes', 'night sweats cancer', 'lymph cancer'],
    triage: 'consult',
    response: `**Lymphoma Assessment**

Lymphoma is a cancer of the lymphatic system, which is part of the body's germ-fighting network (includes lymph nodes, spleen, and bone marrow).

**Common symptoms:**
- **Painless swelling of lymph nodes** in your neck, armpits, or groin.
- **Drenching night sweats** and persistent fever.
- Unexplained weight loss and severe fatigue.

**Recommended steps:**
- Consult an oncologist or hematologist.
- Diagnostic testing involves a lymph node biopsy, blood tests, and imaging (CT or PET scan).
- Do not ignore painless swollen lumps that persist for more than 2-3 weeks.

🩺 **Oncologist Consultation Required** for lymph node biopsy and workup.`
  },
  {
    id: 'oral_cancer',
    name: 'Oral Cancer',
    keywords: ['oral cancer', 'mouth ulcer not healing', 'tongue lump', 'mouth growth'],
    triage: 'consult',
    response: `**Oral Cancer Assessment**

Oral cancer includes cancers of the lips, tongue, cheeks, floor of the mouth, hard and soft palate, and throat. Tobacco chewing (paan, gutkha) and smoking are major risk factors in India.

**Common symptoms:**
- **Mouth sore/ulcer that does not heal** within 2 weeks.
- A white or red patch on the gums, tongue, or lining of the mouth.
- A lump, thickening, or growth inside the mouth or neck.
- Difficulty chewing, swallowing, or moving the jaw.

**Recommended steps:**
- Consult a dentist, ENT specialist, or oncologist immediately.
- A biopsy is required to confirm oral cancer.
- Quit all tobacco and alcohol use immediately.

🩺 **ENT/Oncologist Consultation Required** for biopsy of non-healing lesions.`
  },
  {
    id: 'skin_cancer',
    name: 'Skin Cancer (Melanoma / Carcinoma)',
    keywords: ['skin cancer', 'changing mole', 'bleeding mole', 'abnormal skin growth'],
    triage: 'consult',
    response: `**Skin Cancer Assessment**

Skin cancer is the abnormal growth of skin cells, most commonly developing on skin exposed to the sun, but can also occur on unexposed areas.

**Common symptoms (ABCDE rule for moles):**
- **Asymmetry**: One half of the mole does not match the other.
- **Border**: Edges are irregular, ragged, or blurred.
- **Color**: Color is uneven (shades of black, brown, red, or blue).
- **Diameter**: Mole is larger than 6mm (pencil eraser).
- **Evolving**: The mole is changing in size, shape, color, or is bleeding/itching.
- Any new, firm, skin growth or non-healing sore.

**Recommended steps:**
- Consult a dermatologist for a skin examination and biopsy.
- Practice strict sun protection.

🩺 **Dermatologist Consultation Required** for biopsy of suspicious growths.`
  },
  {
    id: 'cervical_cancer',
    name: 'Cervical Cancer',
    keywords: ['cervical cancer', 'bleeding after intercourse', 'pelvic pain cancer', 'abnormal vaginal bleeding'],
    triage: 'consult',
    response: `**Cervical Cancer Assessment**

Cervical cancer occurs in the cells of the cervix, the lower part of the uterus. It is highly preventable with HPV vaccination and regular Pap smear screenings.

**Common symptoms:**
- **Abnormal vaginal bleeding** (between periods, after menopause, or after intercourse).
- Foul-smelling watery or bloody vaginal discharge.
- Pelvic pain or pain during intercourse.

**Recommended steps:**
- Consult a gynecologist immediately.
- Diagnostics include a Pap smear, HPV DNA test, or colposcopy with biopsy.
- Prevention: HPV vaccine (e.g., Cervavax, Gardasil) is highly recommended for girls and women.

🩺 **Gynecologist Consultation Required** for screening and evaluation.`
  },
  {
    id: 'prostate_cancer',
    name: 'Prostate Cancer',
    keywords: ['prostate cancer', 'difficulty urinating cancer', 'blood in semen', 'pelvic discomfort male'],
    triage: 'consult',
    response: `**Prostate Cancer Assessment**

Prostate cancer develops in the prostate gland in men, typically growing slowly and occurring in older age.

**Common symptoms (similar to benign prostate enlargement):**
- **Difficulty urinating** (weak flow, frequent urination at night).
- **Blood in urine or semen**.
- Dull pain in the pelvis, lower back, or upper thighs.

**Recommended steps:**
- Consult a urologist.
- Screening tests include a digital rectal exam (DRE) and a **PSA (Prostate-Specific Antigen) blood test**.
- Elevated PSA requires further evaluation (MRI or biopsy) to rule out cancer.

🩺 **Urologist Consultation Required** for PSA testing and rectal examination.`
  },
  {
    id: 'retinal_detachment',
    name: 'Retinal Detachment',
    keywords: ['retinal detachment', 'sudden vision loss', 'floaters vision', 'curtain over vision'],
    triage: 'emergency',
    response: `🚨 **Retinal Detachment — EMERGENCY**

Retinal detachment is a critical eye emergency where the thin layer of tissue (retina) at the back of the eye pulls away from its normal position, causing permanent vision loss if not treated within 24–48 hours.

**Warning Signs:**
- **Sudden increase in floaters** (specks/cobwebs in vision).
- **Flashes of light** in one or both eyes.
- A dark, **shadow or curtain-like block** spreading across your visual field.
- Sudden blurriness or loss of vision.

**🚨 Urgent Actions:**
- **Go to an eye hospital or emergency department immediately.**
- Do NOT rub your eyes. Keep head movement to a minimum.
- Requires urgent surgical repair by an ophthalmologist.

🚨 **Emergency — Seek Immediate Ophthalmologist Care.`
  },
  {
    id: 'color_blindness',
    name: 'Color Blindness',
    keywords: ['color blindness', 'difficulty seeing colors', 'cannot distinguish colors'],
    triage: 'self-care',
    response: `**Color Blindness Assessment**

Color blindness (color vision deficiency) is typically an inherited genetic condition where you see colors differently than most people, most commonly making it hard to distinguish red and green.

**Common symptoms:**
- **Difficulty distinguishing between red, green, blue, or yellow** colors.
- Seeing colors as washed out or identical.

**Self-care steps:**
- Use specialized color-correcting glasses or contact lenses (e.g., EnChroma) under advice.
- Use labeling apps or smart device settings to help identify colors in daily life.
- Consult an optometrist or ophthalmologist for a formal diagnostic test (Ishihara plate test).

✅ **Self-Care Recommended** for managing daily activities.`
  },
  {
    id: 'laryngitis',
    name: 'Laryngitis',
    keywords: ['laryngitis', 'hoarse voice', 'voice loss', 'inflamed voice box'],
    triage: 'self-care',
    response: `**Laryngitis Assessment**

Laryngitis is inflammation of your voice box (larynx) from overuse, irritation, or an infection, usually viral.

**Common symptoms:**
- **Hoarseness or weak voice** (sometimes complete voice loss).
- Tickling sensation, rawness, or dry throat.
- Dry cough.

**Self-care steps:**
- **Rest your voice completely**: Avoid talking or whispering (whispering strains the vocal cords more than speaking).
- Stay hydrated by drinking warm water, herbal teas, or warm broths.
- Inhale steam twice daily.
- Avoid throat clearing, caffeine, and smoking.

✅ **Self-Care Recommended** for acute laryngitis. See doctor if hoarseness lasts >2 weeks.`
  },
  {
    id: 'deviated_septum',
    name: 'Deviated Septum',
    keywords: ['deviated_septum', 'deviated septum', 'blocked nostril', 'difficulty breathing nose'],
    triage: 'consult',
    response: `**Deviated Septum Assessment**

A deviated septum occurs when the thin wall (nasal septum) between your nasal passages is displaced to one side, making one nasal passage smaller.

**Common symptoms:**
- **Obstruction of one or both nostrils**, making it difficult to breathe through the nose.
- Frequent nosebleeds or sinus infections.
- Snoring or loud breathing during sleep.

**Recommended steps:**
- Consult an ENT specialist.
- Manage symptoms with saline nasal sprays or adhesive nasal strips.
- Correcting the deviation requires a minor surgical procedure called septoplasty, which is recommended if symptoms severely impact breathing.

🩺 **ENT Doctor Consultation Advised** for breathing evaluation.`
  },
  {
    id: 'nasal_polyps',
    name: 'Nasal Polyps',
    keywords: ['nasal polyps', 'loss of smell', 'nasal blockage', 'polyps nose'],
    triage: 'consult',
    response: `**Nasal Polyps Assessment**

Nasal polyps are soft, painless, non-cancerous growths on the lining of your nasal passages or sinuses, often associated with chronic inflammation, asthma, or allergies.

**Common symptoms:**
- **Chronic nasal blockage / stuffiness**.
- **Loss of sense of smell** (anosmia) or taste.
- Postnasal drip, runny nose, or facial pressure.

**Recommended steps:**
- Consult an ENT specialist.
- Nasal corticosteroid sprays (like Fluticasone) are commonly prescribed to shrink polyps and reduce inflammation.
- Large polyps that block breathing may require endoscopic sinus surgery.

🩺 **ENT Doctor Consultation Advised** for nasal endoscopy and management.`
  },
  {
    id: 'septic_shock',
    name: 'Septic Shock',
    keywords: ['septic shock', 'severe infection low blood pressure', 'confusion infection', 'rapid breathing infection', 'organ failure infection'],
    triage: 'emergency',
    response: `🚨 **Septic Shock — EMERGENCY**

Septic shock is a life-threatening, critical condition characterized by a severe drop in blood pressure due to a systemic infection (sepsis), leading to multi-organ failure.

**Warning Signs:**
- **Extremely low blood pressure** (hypotension) that doesn't respond to fluids.
- **Confusion, disorientation, or altered mental state**.
- Rapid breathing, fever or hypothermia (low body temp), and cold, clammy, mottled skin.

**🚨 Urgent Actions:**
- **Call 112 or go to the nearest emergency department immediately.**
- Requires immediate ICU admission, IV antibiotics, and vasopressors to maintain blood pressure.

🚨 **Emergency — Seek Immediate Medical Treatment.`
  },
  {
    id: 'multi_organ_failure',
    name: 'Multi Organ Failure',
    keywords: ['multi organ failure', 'multiple organs failing', 'critical organ dysfunction'],
    triage: 'emergency',
    response: `🚨 **Multi-Organ Failure — EMERGENCY**

Multiple Organ Dysfunction Syndrome (MODS) is the progressive failure of two or more critical organ systems (e.g., kidneys, lungs, liver, heart) due to severe illness, trauma, or sepsis.

**Warning Signs:**
- Minimal or no urine output (kidney failure).
- Severe shortness of breath or blue lips (respiratory failure).
- Yellowing of skin and eyes (liver failure).
- Confusion, rapid heart rate, or bleeding disorders.

**🚨 Urgent Actions:**
- **Call 112 or go to the nearest emergency hospital immediately.**
- Requires advanced life support and intensive care management.

🚨 **Emergency — Immediate ICU Care Required.`
  },
  {
    id: 'brain_hemorrhage',
    name: 'Brain Hemorrhage',
    keywords: ['brain hemorrhage', 'sudden severe headache', 'bleeding in brain', 'loss consciousness stroke'],
    triage: 'emergency',
    response: `🚨 **Brain Hemorrhage — EMERGENCY**

A brain hemorrhage is a type of stroke caused by a ruptured artery in the brain, leading to localized bleeding and pressure on brain tissues.

**Warning Signs (FAST Stroke signs):**
- **Sudden, severe headache** (worst headache of your life).
- Sudden weakness, numbness, or paralysis on one side of the face or body.
- Sudden difficulty speaking, slurred speech, or vision loss.
- Loss of consciousness, seizures, or vomiting.

**🚨 Urgent Actions:**
- **Call 112 immediately.**
- Keep the person calm and do not give them food, drink, or medications.

🚨 **Emergency — Call 112 and Seek Immediate Care.`
  },
  {
    id: 'subarachnoid_hemorrhage',
    name: 'Subarachnoid Hemorrhage',
    keywords: ['worst headache of life', 'subarachnoid hemorrhage', 'sudden thunderclap headache'],
    triage: 'emergency',
    response: `🚨 **Subarachnoid Hemorrhage — EMERGENCY**

A subarachnoid hemorrhage is a life-threatening type of stroke caused by bleeding into the space surrounding the brain, often from a ruptured brain aneurysm.

**Warning Signs:**
- **Sudden "thunderclap" headache** — described as the "worst headache of your life," reaching maximum intensity within seconds.
- Stiff neck, sensitivity to light (photophobia), nausea, and vomiting.
- Double vision, confusion, or loss of consciousness.

**🚨 Urgent Actions:**
- **Call 112 immediately.** Do not wait to see if the headache improves.

🚨 **Emergency — Sudden Thunderclap Headache Requires Immediate Care.`
  },
  {
    id: 'transient_ischemic_attack',
    name: 'Transient Ischemic Attack',
    keywords: ['tia', 'mini stroke', 'temporary weakness', 'temporary speech difficulty'],
    triage: 'emergency',
    response: `🚨 **Transient Ischemic Attack (TIA) — EMERGENCY**

A TIA, or "mini-stroke," is a temporary blockage of blood flow to the brain, causing stroke-like symptoms that resolve completely within minutes to hours. It is a critical warning sign of an impending full stroke.

**Warning Signs (FAST):**
- **Temporary weakness or numbness** in the face, arm, or leg (especially on one side).
- **Temporary speech difficulty** or slurring.
- Sudden, temporary vision changes or loss of balance.

**🚨 Urgent Actions:**
- **Call 112 immediately.** Even if symptoms disappear, a TIA is a warning sign that requires urgent diagnostic workup.

🚨 **Emergency — Seek Immediate Stroke Evaluation.`
  },
  {
    id: 'cerebral_palsy',
    name: 'Cerebral Palsy',
    keywords: ['cerebral palsy', 'movement disorder child', 'muscle stiffness child', 'developmental motor problem'],
    triage: 'consult',
    response: `**Cerebral Palsy Assessment**

Cerebral Palsy (CP) is a group of permanent movement disorders that appear in early childhood, caused by abnormal development or damage to parts of the brain that control movement and posture.

**Common symptoms in children:**
- **Delayed motor milestones** (sitting, crawling, walking).
- **Stiff muscles (spasticity)**, floppy muscles, or coordination problems.
- Walking on toes, asymmetrical gait, or difficulty swallowing/speaking.

**Recommended steps:**
- Consult a pediatrician, pediatric neurologist, and developmental specialist.
- Tailored management involves physiotherapy, occupational therapy, speech therapy, and orthotics.

🩺 **Pediatric Specialist Consultation Required** for early intervention.`
  },
  {
    id: 'muscular_dystrophy',
    name: 'Muscular Dystrophy',
    keywords: ['muscular dystrophy', 'progressive muscle weakness', 'difficulty walking child'],
    triage: 'consult',
    response: `**Muscular Dystrophy Assessment**

Muscular Dystrophy (MD) is a group of inherited genetic diseases characterized by progressive weakness and wasting of the muscles that control movement.

**Common symptoms:**
- **Progressive muscle weakness** (especially in hips, pelvis, and shoulders).
- Difficulty walking, frequent falls, and trouble running or jumping (often noticed in early childhood).
- Waddling gait, muscle stiffness, or enlarged calf muscles (pseudohypertrophy).

**Recommended steps:**
- Consult a pediatric neurologist or geneticist. Diagnosis is confirmed via genetic testing or muscle biopsy.
- Support includes physical therapy, braces, and cardiovascular monitoring.

🩺 **Neurologist Consultation Required** for genetic diagnosis and support.`
  },
  {
    id: 'als',
    name: 'Amyotrophic Lateral Sclerosis',
    keywords: ['als', 'lou gehrig disease', 'muscle wasting', 'progressive paralysis'],
    triage: 'consult',
    response: `**Amyotrophic Lateral Sclerosis (ALS) Assessment**

ALS (Lou Gehrig's disease) is a progressive neurodegenerative disease that affects nerve cells in the brain and spinal cord, leading to loss of muscle control.

**Common symptoms:**
- **Progressive muscle weakness and wasting** (atrophy) starting in hands, feet, or limbs.
- Tripping, dropping things, muscle cramps, and twitching (fasciculations).
- Difficulty speaking, swallowing, or breathing as the disease progresses.

**Recommended steps:**
- Consult a neurologist specializing in neuromuscular disorders. Diagnosis involves electromyography (EMG) and MRI.
- Multidisciplinary care is essential for speech, swallowing, and breathing support.

🩺 **Neurologist Consultation Required** for diagnostic workup.`
  },
  {
    id: 'narcolepsy',
    name: 'Narcolepsy',
    keywords: ['narcolepsy', 'sudden sleep attacks', 'daytime sleep episodes'],
    triage: 'self-care',
    response: `**Narcolepsy Assessment**

Narcolepsy is a chronic neurological sleep disorder characterized by overwhelming daytime drowsiness and sudden, irresistible attacks of sleep.

**Common symptoms:**
- **Sudden sleep attacks** during daytime activities.
- Cataplexy (sudden, temporary loss of muscle tone triggered by strong emotions).
- Sleep paralysis and hallucinations while falling asleep or waking up.

**Self-care steps:**
- **Schedule short, regular naps** (15–20 minutes) during the day.
- Maintain a strict, consistent sleep schedule.
- Avoid caffeine, alcohol, and heavy meals close to bedtime.
- Consult a sleep specialist; medications (stimulants/sodium oxybate) can help.

✅ **Self-Care Recommended** along with a sleep specialist consultation.`
  },
  {
    id: 'somnambulism',
    name: 'Sleepwalking',
    keywords: ['sleepwalking', 'walking during sleep', 'somnambulism'],
    triage: 'self-care',
    response: `**Sleepwalking (Somnambulism) Assessment**

Sleepwalking is a behavior disorder originating during deep sleep, resulting in walking or performing other complex behaviors while asleep. It is common in children and usually harmless.

**Common symptoms:**
- **Walking or sitting up during sleep** with eyes open but a blank look.
- Not responding to others or waking up confused when interrupted.

**Self-care steps:**
- **Safety proof the bedroom**: Lock windows, doors, and clear the floor of obstacles to prevent falls or injury.
- Avoid sleep deprivation and maintain a regular sleep schedule.
- Manage stress and wind down before bed.
- Gently guide a sleepwalker back to bed without forcefully waking them up.

✅ **Self-Care Recommended** for managing home safety.`
  },
  {
    id: 'bruxism',
    name: 'Bruxism',
    keywords: ['bruxism', 'teeth grinding', 'jaw clenching during sleep'],
    triage: 'self-care',
    response: `**Bruxism (Teeth Grinding) Assessment**

Bruxism is a condition in which you grind, gnash, or clench your teeth, often unconsciously during sleep (sleep bruxism) or while awake.

**Common symptoms:**
- **Teeth grinding or clenching** (may wake up partners).
- Flattened, fractured, or loose teeth.
- Jaw muscle tightness, soreness, or dull headache starting in the temples.

**Self-care steps:**
- Use a **custom mouthguard or night splint** (fitted by a dentist) to protect teeth.
- Practice stress-reduction techniques (meditation, massage, or warm baths before bed).
- Avoid chewing gums, and limit alcohol/caffeine which can worsen clenching.

✅ **Self-Care Recommended** with dental follow-up.`
  },
  {
    id: 'tmj_lockjaw',
    name: 'TMJ Lockjaw',
    keywords: ['lockjaw tmj', 'jaw locking', 'cannot open mouth fully'],
    triage: 'consult',
    response: `**TMJ Lockjaw Assessment**

TMJ Lockjaw refers to a temporary inability to fully open or close the mouth due to spasm of the jaw muscles or displacement of the temporomandibular joint (TMJ) disc.

**Common symptoms:**
- **Jaw locking** in an open or closed position.
- **Inability to open the mouth fully**.
- Sharp jaw pain, clicking sounds, and headache.

**Recommended steps:**
- Apply a warm compress to the jaw muscles to relieve spasm.
- Eat soft foods and avoid wide yawning or chewing gum.
- Consult a dentist or TMJ specialist. They may recommend splint therapy, physiotherapy, or muscle relaxants.
- *Note*: Ensure this is not tetanus-related lockjaw (associated with recent wounds or systemic muscle spasms).

🩺 **Dental or ENT Consultation Advised** for TMJ evaluation.`
  },
  {
    id: 'dry_socket',
    name: 'Dry Socket',
    keywords: ['dry socket', 'pain after tooth extraction', 'exposed bone tooth removal'],
    triage: 'consult',
    response: `**Dry Socket (Alveolar Osteitis) Assessment**

Dry socket is a painful dental condition that can occur after a tooth extraction, when the blood clot that normally forms in the socket is dislodged or dissolves, exposing the underlying bone and nerves.

**Common symptoms:**
- **Severe, throbbing pain** starting 1–3 days after tooth extraction.
- Visible empty socket with **exposed bone**.
- Pain radiating to the ear, temple, or neck on the same side.
- Bad breath or unpleasant taste.

**Recommended steps:**
- Do not touch the socket with your tongue or fingers.
- Avoid smoking or drinking through a straw, which can worsen it.
- Consult your dentist immediately. They will clean the socket and apply a medicated dressing to relieve pain instantly.

🩺 **Dentist Consultation Required** for medicated socket dressing.`
  },
  {
    id: 'gingivitis',
    name: 'Gingivitis',
    keywords: ['gingivitis', 'bleeding gums', 'gum inflammation', 'swollen gums'],
    triage: 'self-care',
    response: `**Gingivitis Assessment**

Gingivitis is a common and mild form of gum disease (periodontal disease) that causes irritation, redness, and swelling of your gums, primarily due to poor oral hygiene. It is fully reversible.

**Common symptoms:**
- **Gums that bleed easily** during brushing or flossing.
- Swollen, tender, or puffy red gums.
- Bad breath.

**Self-care steps:**
- Brush your teeth twice daily with fluoride toothpaste and floss daily.
- Use an antiseptic mouthwash (e.g., Chlorhexidine rinse) for 1–2 weeks.
- **Get a professional dental cleaning (scaling)** to remove plaque and tartar.
- Quit tobacco use.

✅ **Self-Care & Dental Cleaning Recommended** to reverse gum irritation.`
  },
  {
    id: 'periodontitis',
    name: 'Periodontitis',
    keywords: ['periodontitis', 'gum disease', 'loose teeth', 'receding gums'],
    triage: 'consult',
    response: `**Periodontitis Assessment**

Periodontitis is a serious, inflammatory gum infection that damages the soft tissue and, without treatment, can destroy the bone that supports your teeth, leading to loose teeth.

**Common symptoms:**
- **Loose or shifting teeth**.
- Receding gums (making teeth look longer) and swollen, bleeding gums.
- Pain when chewing, bad breath, or pus between teeth and gums.

**Recommended steps:**
- Consult a dentist or periodontist immediately.
- Treatment involves deep cleaning (scaling and root planing), local antibiotics, or gum surgery.
- Maintain strict oral hygiene.

🩺 **Dentist Consultation Required** to prevent tooth loss.`
  },
  {
    id: 'wisdom_tooth_impaction',
    name: 'Wisdom Tooth Impaction',
    keywords: ['wisdom tooth pain', 'impacted wisdom tooth', 'jaw swelling wisdom tooth'],
    triage: 'consult',
    response: `**Wisdom Tooth Impaction Assessment**

Wisdom teeth become impacted when they don't have enough room to emerge or grow normally, remaining trapped under the gums or bone, which can cause pain and infection.

**Common symptoms:**
- **Red, swollen, or bleeding gums at the back of the jaw**.
- Jaw pain, swelling around the jaw, and difficulty opening your mouth.
- Bad breath or unpleasant taste when chewing.

**Recommended steps:**
- Rinse with warm salt water to soothe inflammation.
- Take OTC pain relievers (like Ibuprofen) for temporary pain relief.
- Consult a dentist. Diagnosis is confirmed via a dental X-ray. Impacted wisdom teeth often require surgical extraction.

🩺 **Dentist Consultation Required** for X-ray and surgical extraction evaluation.`
  },
  {
    id: 'sjogrens_syndrome',
    name: 'Sjogren Syndrome',
    keywords: ['sjogrens syndrome', 'dry mouth autoimmune', 'dry eyes autoimmune'],
    triage: 'consult',
    response: `**Sjogren's Syndrome Assessment**

Sjogren's syndrome is an autoimmune disorder characterized by the destruction of moisture-producing glands, primarily leading to dry eyes and a dry mouth.

**Common symptoms:**
- **Severe dry eyes** (burning, gritty feeling).
- **Severe dry mouth** (difficulty swallowing, speaking, or chewing).
- Joint pain, stiffness, and vaginal dryness.

**Recommended steps:**
- Consult a rheumatologist. Diagnosis involves blood tests (SSA/SSB antibodies), Schirmer's eye test, and salivary gland evaluation.
- Use preservative-free artificial tears and artificial saliva sprays.
- Maintain meticulous oral hygiene (dry mouth increases tooth decay risk).

🩺 **Rheumatologist Consultation Required** for diagnosis and systemic therapy.`
  },
  {
    id: 'ankylosing_spondylitis',
    name: 'Ankylosing Spondylitis',
    keywords: ['ankylosing spondylitis', 'stiff lower back', 'morning back stiffness'],
    triage: 'consult',
    response: `**Ankylosing Spondylitis Assessment**

Ankylosing Spondylitis (AS) is a chronic inflammatory arthritis that primarily affects the spine and large joints, leading to stiffness and possible fusion of the vertebrae.

**Common symptoms:**
- **Chronic lower back and hip stiffness**, which is characteristically **worse in the morning** or after periods of inactivity, and **improves with exercise**.
- Pain that wakes you up in the second half of the night.
- Restricted chest expansion.

**Recommended steps:**
- Consult a rheumatologist. Diagnosis involves HLA-B27 genetic testing, X-rays, or MRI of the sacroiliac joints.
- Exercises/physiotherapy and NSAIDs (like Indomethacin) are the mainstays of management.

🩺 **Rheumatologist Consultation Required** for inflammatory arthritis management.`
  },
  {
    id: 'vasculitis',
    name: 'Vasculitis',
    keywords: ['vasculitis', 'inflamed blood vessels', 'autoimmune vessel inflammation'],
    triage: 'consult',
    response: `**Vasculitis Assessment**

Vasculitis is an autoimmune condition characterized by inflammation of the blood vessels, which restricts blood flow and can cause organ damage.

**Common symptoms:**
- Fever, fatigue, and weight loss.
- Purpura (purple-red spots on skin that don't fade when pressed).
- Numbness, weakness, or joint pain depending on which organs are affected.

**Recommended steps:**
- Consult a rheumatologist or physician immediately.
- Diagnostics include blood tests (ESR, CRP, ANCA), urine tests, and tissue biopsy.
- Treatment typically involves steroids or immunosuppressant medications.

🩺 **Specialist Consultation Required** for blood vessel inflammation evaluation.`
  },
  {
    id: 'sarcoidosis',
    name: 'Sarcoidosis',
    keywords: ['sarcoidosis', 'lung granulomas', 'persistent cough granuloma'],
    triage: 'consult',
    response: `**Sarcoidosis Assessment**

Sarcoidosis is an inflammatory disease characterized by the growth of tiny collections of inflammatory cells (granulomas) in any part of your body — most commonly the lungs and lymph nodes.

**Common symptoms:**
- **Persistent dry cough** and shortness of breath.
- Fatigue, fever, and swollen lymph nodes.
- Red bumps or patches on the skin.

**Recommended steps:**
- Consult a pulmonologist. Diagnostics involve chest X-ray, CT scan, pulmonary function tests, and biopsy.
- Treatment typically involves corticosteroids (like Prednisolone) to reduce inflammation.

🩺 **Pulmonologist Consultation Required** for diagnostic workup.`
  },
  {
    id: 'celiac_sprue',
    name: 'Celiac Sprue',
    keywords: ['celiac sprue', 'gluten sensitivity', 'malabsorption gluten'],
    triage: 'consult',
    response: `**Celiac Sprue Assessment**

Celiac sprue is an autoimmune reaction to eating gluten (a protein found in wheat, barley, and rye) that damages the small intestine lining, causing malabsorption.

**Common symptoms:**
- Diarrhea, bloating, gas, fatigue, and weight loss.
- Abdominal pain, nausea, and foul-smelling stools.
- Anemia or osteoporosis due to malabsorption.

**Recommended steps:**
- Consult a gastroenterologist. Diagnosis involves celiac blood tests (tTG-IgA) and an upper endoscopy with biopsy.
- **Strict, lifelong gluten-free diet** is the only treatment.
- *Caution*: Do NOT start a gluten-free diet before testing, as it can cause false-negative results.

🩺 **Gastroenterologist Consultation Required** for diagnostic testing.`
  },
  {
    id: 'gastroparesis',
    name: 'Gastroparesis',
    keywords: ['gastroparesis', 'slow stomach emptying', 'full quickly eating', 'vomiting undigested food'],
    triage: 'consult',
    response: `**Gastroparesis Assessment**

Gastroparesis is a chronic condition in which the stomach cannot empty itself of food in a normal fashion, often caused by damage to the vagus nerve (common in long-term diabetes).

**Common symptoms:**
- **Vomiting undigested food** hours after eating.
- Feeling **full very quickly** after starting a meal.
- Nausea, bloating, and acid reflux.

**Recommended steps:**
- Consult a gastroenterologist. A gastric emptying study is the definitive test.
- Eat smaller, more frequent, low-fat, low-fiber meals.
- Manage blood sugar levels strictly if diabetic.
- Medications like Metoclopramide or Domperidone may be prescribed.

🩺 **Gastroenterologist Consultation Required** for diagnosis and therapy.`
  },
  {
    id: 'achalasia',
    name: 'Achalasia',
    keywords: ['achalasia', 'difficulty swallowing liquids', 'food stuck esophagus'],
    triage: 'consult',
    response: `**Achalasia Assessment**

Achalasia is a rare swallowing disorder caused by damage to the nerves in the esophagus, preventing the lower esophageal sphincter from relaxing and food from moving into the stomach.

**Common symptoms:**
- **Difficulty swallowing both solids and liquids** (dysphagia).
- Feeling that **food is stuck in your esophagus**.
- Regurgitation of undigested food, chest pain, and weight loss.

**Recommended steps:**
- Consult a gastroenterologist. Diagnostics include esophageal manometry, barium swallow, or endoscopy.
- Treatments include balloon dilation, botox injections, or surgery (Heller myotomy).

🩺 **Gastroenterologist Consultation Required** for esophageal manometry.`
  },
  {
    id: 'esophageal_spasm',
    name: 'Esophageal Spasm',
    keywords: ['esophageal spasm', 'pain swallowing', 'chest pain swallowing'],
    triage: 'consult',
    response: `**Esophageal Spasm Assessment**

Esophageal spasms are painful contractions of the muscles in the esophagus, which can cause difficulty swallowing and sudden chest pain.

**Common symptoms:**
- **Sudden, severe chest pain** (often mimicking a heart attack).
- **Pain or difficulty when swallowing**.
- A feeling that something is caught in the throat.

**Recommended steps:**
- Consult a doctor to rule out cardiac causes first.
- Avoid extremely hot or cold foods/liquids if they trigger spasms.
- Treatment includes muscle relaxants (nitrates, calcium channel blockers) or lifestyle changes to reduce stress.

🩺 **Doctor Consultation Required** — rule out cardiac chest pain first.`
  },
  {
    id: 'barretts_esophagus',
    name: "Barrett's Esophagus",
    keywords: ['barretts esophagus', 'chronic acid reflux damage', 'precancerous esophagus'],
    triage: 'consult',
    response: `**Barrett's Esophagus Assessment**

Barrett's esophagus is a condition in which the flat lining of the esophagus becomes damaged by chronic acid reflux (GERD), causing the lining to thicken and become red. It is a precancerous condition.

**Common symptoms (relate to severe GERD):**
- Frequent, chronic heartburn and difficulty swallowing.
- Less commonly, chest pain or vomiting blood.

**Recommended steps:**
- Consult a gastroenterologist. Diagnosis requires an upper endoscopy and biopsy.
- Manage acid reflux strictly with prescribed PPIs (like Pantoprazole) and lifestyle measures.
- Requires regular surveillance endoscopies to monitor for cellular changes (dysplasia).

🩺 **Gastroenterologist Consultation Required** for surveillance endoscopy.`
  },
  {
    id: 'fatty_liver_disease',
    name: 'Fatty Liver Disease',
    keywords: ['fatty liver', 'liver fat accumulation', 'non alcoholic fatty liver'],
    triage: 'consult',
    response: `**Fatty Liver Disease Assessment**

Non-Alcoholic Fatty Liver Disease (NAFLD) is an accumulation of excess fat in liver cells, highly linked to obesity, diabetes, and metabolic syndrome. It is extremely common in India.

**Common symptoms:**
- Often silent (no symptoms) in early stages.
- Fatigue or a dull ache in the upper right side of the abdomen.

**Recommended steps:**
- Consult a physician or gastroenterologist. Diagnosed via ultrasound abdomen or Liver Function Tests (LFT).
- **Lifestyle intervention is key**: Lose weight gradually (5–10% of body weight), exercise 150 min/week, and eat a low-carb diet.
- Avoid alcohol completely.

🩺 **Physician Consultation Advised** for monitoring and lifestyle guidance.`
  },
  {
    id: 'cirrhosis',
    name: 'Cirrhosis',
    keywords: ['cirrhosis', 'liver scarring', 'fluid abdomen liver', 'chronic liver disease'],
    triage: 'consult',
    response: `**Cirrhosis Assessment**

Cirrhosis is late-stage scarring (fibrosis) of the liver caused by chronic liver diseases (like hepatitis, chronic alcohol abuse, or fatty liver), leading to liver dysfunction.

**Common symptoms:**
- Fatigue, easy bruising, jaundice (yellow skin/eyes), and itchy skin.
- **Fluid accumulation in the abdomen** (ascites) or legs (edema).
- Confusion, drowsiness, or slurred speech (hepatic encephalopathy).

**Recommended steps:**
- Consult a hepatologist or gastroenterologist immediately.
- Avoid all alcohol and hepatotoxic medications.
- Diagnostics include USG/CT abdomen, fibroscan, and LFTs.

🩺 **Hepatologist Consultation Required** to manage liver failure complications.`
  },
  {
    id: 'portal_hypertension',
    name: 'Portal Hypertension',
    keywords: ['portal hypertension', 'enlarged abdominal veins', 'liver pressure veins'],
    triage: 'consult',
    response: `**Portal Hypertension Assessment**

Portal hypertension is an increase in the blood pressure within the portal vein system (which carries blood from digestive organs to the liver), most commonly caused by cirrhosis.

**Common symptoms:**
- Gastrointestinal bleeding (vomiting blood or black stools due to ruptured esophageal varices).
- Ascites (fluid buildup in the abdomen).
- Enlarged veins visible on the abdominal wall (caput medusae).

**Recommended steps:**
- Consult a gastroenterologist/hepatologist immediately.
- **🚨 Seek emergency care if** you vomit blood or pass black stools.
- Treatments include beta-blockers to lower pressure, endoscopic banding, or a TIPS procedure.

🩺 **Gastroenterologist Consultation Required** to prevent variceal bleeding.`
  },
  {
    id: 'metabolic_syndrome',
    name: 'Metabolic Syndrome',
    keywords: ['metabolic syndrome', 'high sugar obesity', 'high blood pressure obesity'],
    triage: 'consult',
    response: `**Metabolic Syndrome Assessment**

Metabolic syndrome is a cluster of conditions (increased blood pressure, high blood sugar, excess body fat around the waist, and abnormal cholesterol levels) that occur together, increasing risk of heart disease, stroke, and type 2 diabetes.

**Diagnostic criteria (any 3 of):**
- Waist circumference >90cm (men), >80cm (women in India).
- Triglycerides ≥150 mg/dL.
- HDL cholesterol <40 mg/dL (men), <50 mg/dL (women).
- Blood pressure ≥130/85 mmHg.
- Fasting glucose ≥100 mg/dL.

**Recommended steps:**
- Consult a physician for a lipid profile and sugar check.
- Focus on regular aerobic exercise, weight loss, and a Mediterranean-style diet (low refined carbs, high fiber).

🩺 **Physician Consultation Advised** for comprehensive metabolic screening.`
  },
  {
    id: 'insulin_resistance',
    name: 'Insulin Resistance',
    keywords: ['insulin resistance', 'prediabetes', 'dark neck skin', 'high insulin'],
    triage: 'consult',
    response: `**Insulin Resistance Assessment**

Insulin resistance is a state in which your body's cells don't respond well to insulin, making it harder for glucose to enter cells, which eventually leads to prediabetes and type 2 diabetes.

**Common signs:**
- **Acanthosis Nigricans** — dark, velvety patches of skin on the neck, armpits, or groin.
- Increased abdominal fat and fatigue.

**Recommended steps:**
- Consult a physician or endocrinologist. Check HbA1c and fasting insulin.
- **Reverse via lifestyle**: Exercise regularly (resistance training improves insulin sensitivity), adopt a low-glycemic index diet, and lose abdominal weight.

🩺 **Endocrinologist/Physician Consultation Advised** to prevent diabetes progression.`
  },
  {
    id: 'hyperparathyroidism',
    name: 'Hyperparathyroidism',
    keywords: ['hyperparathyroidism', 'high calcium', 'bone pain calcium'],
    triage: 'consult',
    response: `**Hyperparathyroidism Assessment**

Hyperparathyroidism is an excess of parathyroid hormone in the bloodstream, leading to calcium being pulled out of the bones and into the blood.

**Common symptoms:**
- **Bone pain and joint pain** (due to bone thinning/osteoporosis).
- Kidney stones (caused by high calcium levels in urine).
- Muscle weakness, fatigue, abdominal pain, or depression ("bones, stones, groans, and psychic overtones").

**Recommended steps:**
- Consult an endocrinologist.
- Diagnostics: Serum Calcium, PTH levels, Vitamin D level, and bone density scan (DEXA).
- Treatment may involve surgery (parathyroidectomy) or monitoring.

🩺 **Endocrinologist Consultation Required** for diagnosis and management.`
  },
  {
    id: 'pituitary_tumor',
    name: 'Pituitary Tumor',
    keywords: ['pituitary tumor', 'hormonal imbalance tumor', 'vision problems pituitary'],
    triage: 'consult',
    response: `**Pituitary Tumor Assessment**

Pituitary tumors are abnormal growths that develop in your pituitary gland (at the base of the brain), which can cause hormonal imbalances and press on the optic nerve.

**Common symptoms:**
- Vision changes (specifically loss of peripheral vision, double vision).
- Persistent headaches.
- Hormonal changes: irregular periods, unexplained breast milk production (prolactinoma), or unexplained weight changes.

**Recommended steps:**
- Consult an endocrinologist and neurosurgeon.
- Diagnostics include a brain MRI and a comprehensive hormone blood panel.

🩺 **Specialist Consultation Required** for pituitary MRI and endocrine testing.`
  },
  {
    id: 'adrenal_crisis',
    name: 'Adrenal Crisis',
    keywords: ['adrenal crisis', 'severe low cortisol', 'shock adrenal insufficiency'],
    triage: 'emergency',
    response: `🚨 **Adrenal Crisis — EMERGENCY**

An adrenal crisis is a life-threatening medical emergency caused by a severe lack of cortisol (adrenal insufficiency), often triggered by stress, infection, or suddenly stopping steroid medications.

**Warning Signs:**
- **Severe vomiting and diarrhea** leading to dehydration.
- **Extremely low blood pressure** (hypotension) and shock.
- Sudden severe pain in the lower back, abdomen, or legs.
- Confusion, severe weakness, or loss of consciousness.

**🚨 Urgent Actions:**
- **Call 112 or go to the nearest emergency department immediately.**
- Requires immediate injection of hydrocortisone and IV fluids.

🚨 **Emergency — Seek Immediate Hydrocortisone Treatment.`
  },
  {
    id: 'osteopenia',
    name: 'Osteopenia',
    keywords: ['osteopenia', 'low bone density', 'bone thinning'],
    triage: 'consult',
    response: `**Osteopenia Assessment**

Osteopenia is a condition in which bone mineral density is lower than normal, but not low enough to be classified as osteoporosis. It is a precursor to osteoporosis.

**Common symptoms:**
- Typically silent (no pain or symptoms) until a bone fractures.

**Recommended steps:**
- Consult a physician. Diagnosed using a **DEXA scan** (T-score between -1.0 and -2.5).
- Diet: Increase calcium (milk, curd, ragi, green leafy veg) and Vitamin D intake.
- Exercise: Do weight-bearing and muscle-strengthening exercises (like walking, light weights).
- Take calcium and Vitamin D supplements as prescribed.

🩺 **Physician Consultation Advised** for bone density review and supplementation.`
  },
  {
    id: 'avascular_necrosis',
    name: 'Avascular Necrosis',
    keywords: ['avascular necrosis', 'bone tissue death', 'hip pain reduced blood supply'],
    triage: 'consult',
    response: `**Avascular Necrosis (AVN) Assessment**

AVN (osteonecrosis) is the death of bone tissue due to a temporary or permanent loss of blood supply to the bone, most commonly affecting the hip joint. Risk factors include steroid use, alcohol, and trauma.

**Common symptoms:**
- **Deep groin or hip pain**, especially when bearing weight, which gradually worsens over time.
- Limited range of motion in the hip joint.

**Recommended steps:**
- Consult an orthopedic surgeon immediately. Early-stage AVN can be managed to prevent joint collapse.
- Diagnostics include an MRI scan (most sensitive test for early AVN) and X-rays.
- Avoid putting weight on the affected joint.

🩺 **Orthopedic Consultation Required** — obtain a hip MRI scan.`
  },
  {
    id: 'bursitis',
    name: 'Bursitis',
    keywords: ['bursitis', 'joint swelling inflammation', 'painful shoulder movement'],
    triage: 'self-care',
    response: `**Bursitis Assessment**

Bursitis is painful inflammation of the bursa — a small, fluid-filled sac that cushions the bones, tendons, and muscles near your joints, commonly affecting the shoulder, elbow, or hip.

**Common symptoms:**
- Joint pain, stiffness, and aching, especially with movement or pressure.
- Swelling and redness over the affected joint.

**Self-care steps (R.I.C.E):**
- **Rest**: Avoid repetitive movements that trigger the pain.
- **Ice**: Apply cold packs for 15 minutes, 3–4 times daily.
- Take OTC anti-inflammatories like **Combiflam (Ibuprofen + Paracetamol)** for pain and swelling.
- Avoid sleeping directly on the painful joint.

✅ **Self-Care Recommended** for mild joint bursitis. See doctor if pain is severe or accompanied by fever.`
  },
  {
    id: 'plantar_fasciitis',
    name: 'Plantar Fasciitis',
    keywords: ['plantar fasciitis', 'heel pain morning', 'foot arch pain'],
    triage: 'self-care',
    response: `**Plantar Fasciitis Assessment**

Plantar fasciitis is one of the most common causes of heel pain, involving inflammation of a thick band of tissue (plantar fascia) that runs across the bottom of your foot.

**Common symptoms:**
- **Stabbing heel pain with the first steps in the morning** or after resting, which decreases as you walk but may return after prolonged standing.
- Pain in the foot arch.

**Self-care steps:**
- Perform gentle calf and plantar fascia stretches before stepping out of bed.
- Wear supportive, cushioned footwear (avoid walking barefoot, especially on hard floors).
- Apply ice to the heel for 15 minutes (rolling a frozen water bottle under your foot is highly effective).
- Use silicone heel cups or orthotic insoles.

✅ **Self-Care Recommended** for morning heel pain.`
  },
  {
    id: 'shin_splints',
    name: 'Shin Splints',
    keywords: ['shin splints', 'shin pain running', 'lower leg exercise pain'],
    triage: 'self-care',
    response: `**Shin Splints Assessment**

Shin splints (medial tibial stress syndrome) refer to pain along the inner edge of the shinbone (tibia) caused by repetitive stress, common in runners or after sudden increases in activity.

**Common symptoms:**
- **Aching or throbbing pain along the front or inner side of the shinbone** during or after running or exercise.
- Mild swelling or tenderness to pressure along the bone.

**Self-care steps:**
- **Rest**: Stop running or high-impact activities for 1–2 weeks; switch to swimming or cycling.
- Apply **ice packs** to the shins for 15 minutes after exercise.
- Wear supportive athletic shoes with proper shock absorption.
- Stretch your calves and shins regularly.

✅ **Self-Care Recommended** with temporary activity modification.`
  },
  {
    id: 'compartment_syndrome',
    name: 'Compartment Syndrome',
    keywords: ['compartment syndrome', 'severe limb swelling', 'pain out of proportion injury'],
    triage: 'emergency',
    response: `🚨 **Compartment Syndrome — EMERGENCY**

Compartment syndrome is a painful and potentially life-threatening emergency caused by pressure buildup within a confined muscle compartment, typically after a fracture, crush injury, or tight casting.

**Warning Signs (The 5 Ps):**
- **Pain out of proportion** to the injury that worsens with passive stretching.
- **Paresthesia** (pins and needles or numbness in the limb).
- **Pale** or cold skin below the injury site.
- **Pulselessness** (weak or absent pulse in the hand/foot).
- **Paralysis** (inability to move fingers or toes).
- Severe, tight swelling of the limb.

**🚨 Urgent Actions:**
- **Go to the nearest emergency department immediately.** Delay can lead to permanent muscle/nerve damage or amputation.

🚨 **Emergency — Seek Immediate Orthopedic Surgical Evaluation.`
  },
  {
    id: 'flat_feet',
    name: 'Flat Feet',
    keywords: ['flat feet', 'fallen arches', 'foot arch collapse'],
    triage: 'self-care',
    response: `**Flat Feet Assessment**

Flat feet (pes planus) is a common, usually painless condition where the arches on the inside of your feet flatten, allowing the entire sole to touch the floor when standing.

**Common symptoms:**
- Most have no symptoms.
- Foot fatigue, arch pain, or heel pain after prolonged standing or running.
- Pain in the calves, knees, or lower back.

**Self-care steps:**
- Wear supportive shoes with built-in **arch supports** or custom orthotics.
- Do foot-strengthening exercises (like towel scrunches or marble pickups with toes).
- Perform calf stretches.
- Maintain a healthy weight to reduce pressure on the feet.

✅ **Self-Care Recommended** for managing mild arch discomfort.`
  },
  {
    id: 'clubfoot',
    name: 'Clubfoot',
    keywords: ['clubfoot', 'twisted foot birth', 'congenital foot deformity'],
    triage: 'consult',
    response: `**Clubfoot Assessment**

Clubfoot (talipes equinovarus) is a congenital birth defect where an infant's foot is twisted out of shape or position, pointing downward and inward.

**Common symptoms:**
- The top of the foot is usually twisted downward and inward, increasing the arch and turning the heel inward.
- The calf muscles in the affected leg are typically underdeveloped.

**Recommended steps:**
- Consult a pediatric orthopedic doctor early (treatment should begin in the first 1–2 weeks of life).
- The standard treatment is the **Ponseti method** (a series of gentle weekly manipulations and plaster casts, followed by a minor tendon release and bracing).

🩺 **Pediatric Orthopedic Consultation Required** in early infancy.`
  },
  {
    id: 'rsv_infection',
    name: 'RSV Infection',
    keywords: ['rsv', 'respiratory syncytial virus', 'baby wheezing infection'],
    triage: 'consult',
    response: `**Possible RSV (Respiratory Syncytial Virus) Infection**

RSV is a common respiratory virus that causes mild, cold-like symptoms in adults but can cause severe lung infections (bronchiolitis/pneumonia) in infants and elderly.

**Common symptoms:**
- Runny nose, cough, sneezing, and low-grade fever.
- **Wheezing or rapid breathing** (especially in infants).

**🚨 Go to Emergency immediately if (especially for infants):**
- Fast breathing, flaring nostrils, or chest caving in (grunting/retractions).
- Blue lips or face (lack of oxygen).
- Extreme lethargy or poor feeding.

**Recommended steps:**
- Use a cool-mist humidifier and saline nasal drops with a bulb syringe to clear infant nasal passages.
- Keep the child well-hydrated.

🩺 **Pediatric Consultation Advised** for infant wheezing or persistent cough.`
  },
  {
    id: 'croup',
    name: 'Croup',
    keywords: ['croup', 'barking cough', 'child noisy breathing'],
    triage: 'emergency',
    response: `🚨 **Croup — URGENT PED EVALUATION — EMERGENCY**

Croup is a viral infection in young children (under 5) that causes swelling around the vocal cords and windpipe, leading to characteristic breathing sounds.

**Warning Signs:**
- **Barking cough** (resembling a seal's bark).
- **Stridor** (a high-pitched, squeaking or whistling sound when the child inhales).
- Noisy, rapid, or labored breathing.

**🚨 Urgent Actions:**
- Take the child into a steamy bathroom (run hot shower) or outside into cool night air for 10 minutes to help soothe the airways.
- **Go to the nearest clinic or emergency room immediately.** A single dose of oral steroid (Dexamethasone) prescribed by a doctor reduces swelling rapidly.
- *🚨 Emergency*: If the child has blue lips, severe breathing struggle, or starts drooling/cannot swallow, seek emergency care immediately.

🚨 **Emergency — Barking Cough and Noisy Breathing Require Immediate Evaluation.`
  },
  {
    id: 'hand_foot_mouth_disease',
    name: 'Hand Foot Mouth Disease',
    keywords: ['hand foot mouth disease', 'mouth sores child', 'rash hands feet'],
    triage: 'self-care',
    response: `**Hand, Foot, and Mouth Disease (HFMD) Assessment**

HFMD is a highly contagious, self-limiting viral infection common in young children (caused by Coxsackievirus).

**Common symptoms:**
- **Painful sores in the mouth or tongue** (makes eating/drinking difficult).
- **Red skin rash with tiny blisters** on the palms of hands, soles of feet, and buttocks.
- Low-grade fever and sore throat.

**Self-care steps:**
- Stay hydrated: Give cool liquids, coconut water, or popsicles (avoid citrus, spicy, or salty foods).
- Use **Paracetamol** for fever and mouth sore pain.
- Keep the child isolated from school/daycare until all blisters dry up to prevent spreading.

✅ **Self-Care Recommended** — focus on hydration and pain relief.`
  },
  {
    id: 'febrile_seizure',
    name: 'Febrile Seizure',
    keywords: ['febrile seizure', 'child seizure fever', 'convulsion with fever child'],
    triage: 'emergency',
    response: `🚨 **Febrile Seizure — EMERGENCY**

A febrile seizure is a convulsion in a child (usually ages 6 months to 5 years) triggered by a rapid spike in body temperature/fever, usually due to a viral infection.

**Warning Signs during the fit:**
- Loss of consciousness, eyes rolling back.
- Jerking or stiffening of the arms and legs.
- Foam at the mouth or turning pale/blue.
- Fit typically lasts 1–5 minutes.

**🚨 Urgent Actions:**
- **Keep calm and stay with the child.**
- Place the child on their side on a soft surface to prevent choking and clear the airway.
- Do NOT put anything in the child's mouth during the seizure.
- **Seek immediate medical evaluation at a hospital** to confirm the source of the fever and rule out meningitis.

🚨 **Emergency — Lay Child on Side and Seek Immediate Medical Evaluation.`
  },
  {
    id: 'failure_to_thrive',
    name: 'Failure To Thrive',
    keywords: ['failure to thrive', 'poor growth child', 'underweight infant'],
    triage: 'consult',
    response: `**Failure to Thrive (FTT) Assessment**

Failure to thrive refers to a child's weight or rate of weight gain being significantly below that of other children of similar age and sex, indicating inadequate nutrition or developmental progress.

**Common signs:**
- **Weight below the 3rd percentile** or a sudden drop in weight gain on growth charts.
- Delayed physical milestones (sitting, standing) or lack of vocalization/social responsiveness.

**Recommended steps:**
- Consult a pediatrician immediately.
- Diagnostics involve nutritional assessments, feeding observation, and blood tests to rule out malabsorption or thyroid issues.
- Keep a detailed log of the child's daily food and milk intake.

🩺 **Pediatrician Consultation Required** to investigate growth delays.`
  }
];

// ─── Multi-Symptom Combination Rules ─────────────────────────────────────────
export interface SymptomCombo {
  id: string;
  name: string;
  triggers: string[][];
  triage: TriageLevel;
  response: string;
}

export const SYMPTOM_COMBOS: SymptomCombo[] = [
  {
    id: 'dengue_cluster',
    name: 'Dengue Symptom Cluster',
    triggers: [['fever','body ache','rash'],['fever','bone pain'],['fever','eye pain'],['fever','platelet'],['high fever','joint','rash']],
    triage: 'consult',
    response: `**⚠️ Dengue Symptom Cluster Detected**

Fever + body/joint ache + rash is the classic dengue triad. Get **Dengue NS1 + CBC with platelet count** today.

- Take **Paracetamol only** — ❌ NO Aspirin or Ibuprofen
- Drink 3–4L ORS/coconut water/day
- 🚨 **Emergency if:** Bleeding gums/nose, severe abdominal pain, vomiting >3x, cold clammy skin, platelets <50,000

🩺 **Doctor Consultation TODAY.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'cardiac_cluster',
    name: 'Cardiac Emergency Cluster',
    triggers: [['chest pain','left arm'],['chest pain','jaw'],['chest','sweating','nausea'],['chest tightness','breathless'],['chest pain','shoulder']],
    triage: 'emergency',
    response: `🚨 **CARDIAC EMERGENCY — Call 112 NOW**

Chest pain + radiating symptoms or breathlessness matches a heart attack pattern.

1. Call 112 immediately — do NOT drive yourself
2. Sit or lie in comfortable position
3. Loosen tight clothing
4. Chew (don't swallow) **Aspirin 325mg** if available and not allergic
5. Unlock door for paramedics, note exact time symptoms started

🚨 **Call 112 RIGHT NOW. Every minute counts.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'meningitis_cluster',
    name: 'Meningitis Suspect',
    triggers: [['headache','neck stiff','fever'],['stiff neck','fever','light'],['headache','rash','fever'],['neck pain','high fever','vomit']],
    triage: 'emergency',
    response: `🚨 **POSSIBLE MENINGITIS — EMERGENCY**

Fever + severe headache + neck stiffness is the meningitis triad — a life-threatening emergency.

Cannot touch chin to chest = neck stiffness. Rash that doesn't fade when a glass is pressed = meningococcal septicemia.

🚨 **Go to the nearest Emergency Department immediately. Do not wait.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'sepsis_cluster',
    name: 'Sepsis Suspect',
    triggers: [['high fever','confusion'],['fever','rapid breathing','confused'],['chills','fever','very weak'],['fever','cannot stand','extreme']],
    triage: 'emergency',
    response: `🚨 **POSSIBLE SEPSIS — EMERGENCY**

High fever + confusion/extreme weakness/rapid breathing suggests a serious systemic infection (sepsis). Organ failure can develop within hours.

🚨 **Call 112 or go to the nearest Emergency Department immediately.**

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'hypothyroid_cluster',
    name: 'Hypothyroidism Cluster',
    triggers: [['fatigue', 'weight gain', 'cold'], ['hair loss', 'fatigue', 'cold'], ['weight gain', 'feeling cold', 'sluggish']],
    triage: 'consult',
    response: `**Thyroid Assessment (Hypothyroidism)**

Your combination of symptoms — fatigue, weight gain, and sensitivity to cold — is highly suggestive of an underactive thyroid (hypothyroidism).

- **Recommended Test:** Serum TSH (Thyroid Stimulating Hormone)
- **Common Treatment:** Levothyroxine (Thyronorm), usually taken on an empty stomach daily.

🩺 **Doctor Consultation Required** to confirm with a blood test.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'gastro_cluster',
    name: 'Severe Gastroenteritis Cluster',
    triggers: [['vomiting', 'diarrhea', 'fever'], ['stomach cramps', 'loose motions', 'vomiting']],
    triage: 'self-care',
    response: `**Gastroenteritis Assessment**

This combination of vomiting, diarrhea, and cramps suggests an infection of the digestive tract (stomach flu).

**Immediate Care:**
- **ORS (Electral)** is vital — drink small sips continuously.
- **Probiotics** (Darolac/Econorm) can help restore gut health.
- Avoid solid foods until vomiting stops.

**⚠️ Go to Emergency if:** You cannot keep any fluids down, see blood in stool, or have a very high fever.

🩺 **Consult a doctor** if symptoms persist beyond 48 hours.

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
  {
    id: 'heatstroke_cluster',
    name: 'Heat Exhaustion Cluster',
    triggers: [['dizzy', 'headache', 'hot'], ['fatigue', 'cramps', 'sun']],
    triage: 'self-care',
    response: `**Heat Exhaustion Assessment**

Given the heat and your symptoms (dizziness, headache, fatigue), you may be suffering from heat exhaustion.

**Steps to take:**
- Move to a cool, shaded area immediately.
- Drink plenty of water or ORS.
- Apply cool, wet cloths to your skin.

**🚨 Emergency if:** Confusion, loss of consciousness, or temperature >104°F (Heat Stroke).

⚕️ *AI assistant — not a substitute for a doctor.*`
  },
];

// Emergency keywords — always escalate regardless of other matching
export const EMERGENCY_KEYWORDS = [
  'can\'t breathe', 'cannot breathe', 'not breathing', 'stopped breathing',
  'unconscious', 'unresponsive', 'fainted', 'collapsed',
  'heart attack', 'stroke', 'seizure', 'convulsion', 'fitting',
  'suicide', 'want to die', 'kill myself', 'end my life',
  'severe bleeding', 'heavy bleeding', 'blood won\'t stop',
  'poisoning', 'overdose', 'swallowed poison',
  'anaphylaxis', 'allergic reaction severe', 'throat swelling', 'throat closing',
  'not responding', 'blue lips', 'turning blue', 'won\'t wake up',
];

export const EMERGENCY_RESPONSE = `🚨 **This sounds like a medical emergency.**

**Call 112 immediately (India Emergency Services)**

Other emergency numbers:
- Ambulance: **102**
- Police: **100**
- Women helpline: **181**

**While waiting for help:**
- Stay calm and keep the person still
- Do not give food or water
- Note time symptoms started
- Unlock your door for paramedics

🚨 **Call 112 NOW — do not delay.**`;

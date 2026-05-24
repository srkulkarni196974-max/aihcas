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

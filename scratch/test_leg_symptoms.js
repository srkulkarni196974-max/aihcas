const { getChatResponse } = require('../src/lib/custom-ai');

async function testClassification() {
  const query = "I have selected the following symptoms on the interactive anatomical locator: [Front View Symptoms] • Swollen Ankles (Legs (Front)) • Leg Cramps (Legs (Front)) [Back View Symptoms] • Hamstring Strain (Legs (Back)) Please perform a clinical risk triage, map out potential causes, and advise on immediate next steps.";

  console.log("--- TESTING CHAT CLASSIFICATION ---");
  console.log("Input Query:\n", query);

  const history = [
    {
      role: 'user',
      parts: [{ text: query }]
    }
  ];

  try {
    const response = await getChatResponse(query, [], null);
    console.log("\nResponse:\n", response);
    
    if (response.includes("stomach") || response.includes("stomach_pain") || response.includes("abdomen")) {
      console.log("\n❌ FAIL: Still classified as stomach pain!");
    } else if (response.includes("leg pain") || response.includes("cramps") || response.includes("swelling")) {
      console.log("\n✅ SUCCESS: Correctly classified under leg symptoms!");
    } else {
      console.log("\n⚠️ UNKNOWN CLASSIFICATION:", response);
    }
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

testClassification();

import { getChatResponse } from '../src/lib/custom-ai';

async function runTests() {
  console.log('Running Fever Temperature Flow Tests...\n');

  // Test Case 1: Initial fever query without temperature
  console.log('Test Case 1: "I have a fever" (No temperature)');
  const history1: any[] = [];
  const res1 = await getChatResponse('I have a fever', history1);
  console.log('Response:', res1);
  if (res1.includes('tell me your current body temperature?')) {
    console.log('✅ Success: Asked for temperature.');
  } else {
    console.log('❌ Failure: Did not ask for temperature.');
  }
  console.log('--------------------------------------------------\n');

  // Test Case 2: User provides temperature in the next turn
  console.log('Test Case 2: Provide temperature on second turn');
  const history2 = [
    { role: 'user', parts: [{ text: 'I have a fever' }] },
    { role: 'model', parts: [{ text: 'I understand you are experiencing a fever. To give you the best guidance, could you please tell me your current body temperature?' }] }
  ];
  const res2 = await getChatResponse('It is 101.5 F', history2);
  console.log('Response:', res2);
  if (res2.includes('moderate fever') && res2.includes('101.5') && res2.includes('How long')) {
    console.log('✅ Success: Extracted temperature, gave moderate fever advice, and asked follow-up.');
  } else {
    console.log('❌ Failure: Incorrect flow or advice.');
  }
  console.log('--------------------------------------------------\n');

  // Test Case 3: User provides temperature in the first message
  console.log('Test Case 3: "I have a fever of 103" (Immediate temperature)');
  const history3: any[] = [];
  const res3 = await getChatResponse('I have a fever of 103', history3);
  console.log('Response:', res3);
  if (res3.includes('high fever') && res3.includes('103') && res3.includes('How long')) {
    console.log('✅ Success: Extracted temperature, gave high fever advice, and asked follow-up immediately.');
  } else {
    console.log('❌ Failure: Incorrect flow or advice.');
  }
  console.log('--------------------------------------------------\n');

  // Test Case 4: User says they don't know temperature
  console.log('Test Case 4: User does not know temperature');
  const history4 = [
    { role: 'user', parts: [{ text: 'I have a fever' }] },
    { role: 'model', parts: [{ text: 'I understand you are experiencing a fever. To give you the best guidance, could you please tell me your current body temperature?' }] }
  ];
  const res4 = await getChatResponse("I don't know my temp but my head hurts a lot", history4);
  console.log('Response:', res4);
  if (!res4.includes('tell me your current body temperature?')) {
    console.log('✅ Success: Bypassed infinite loop, proceeded with normal diagnostic flow.');
  } else {
    console.log('❌ Failure: Stuck in temperature query loop.');
  }
  console.log('--------------------------------------------------\n');
}

runTests().catch(console.error);

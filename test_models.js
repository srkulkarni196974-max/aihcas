const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel(modelName) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
  const apiKey = apiKeyLine.split('=')[1].trim();

  try {
    console.log(`Testing model: ${modelName}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, world!");
    console.log(`Success for ${modelName}:`, result.response.text());
  } catch (err) {
    console.error(`Failed for ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel('gemini-2.0-flash-lite');
  await testModel('gemini-2.5-flash-lite');
  await testModel('gemini-flash-lite-latest');
  await testModel('gemini-2.5-flash');
}
run();

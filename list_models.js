const fs = require('fs');

async function listModels() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
  const apiKey = apiKeyLine.split('=')[1].trim();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch (err) {
    console.error(err);
  }
}
listModels();

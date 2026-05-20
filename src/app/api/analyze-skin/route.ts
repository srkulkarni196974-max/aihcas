import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const additionalNotes = formData.get('notes') as string || '';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Read the file into base64
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');
    const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp';

    // Use gemini-1.5-flash for vision analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a dermatology AI assistant integrated into a clinical healthcare platform. 
Analyze this skin image carefully and provide a structured dermatological observation report.

IMPORTANT DISCLAIMER: Always state clearly this is NOT a medical diagnosis and professional consultation is required.

Patient notes: ${additionalNotes || 'None provided'}

Perform a thorough visual assessment using the ABCDE melanoma detection checklist AND general dermatological evaluation.

Respond ONLY in the following exact JSON format (no markdown, no extra text):
{
  "overallRiskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "primaryObservation": "brief 1-sentence description of what is visible",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "abcde": {
    "asymmetry": { "score": 0-10, "observation": "description", "concern": "LOW"|"MODERATE"|"HIGH" },
    "border": { "score": 0-10, "observation": "description", "concern": "LOW"|"MODERATE"|"HIGH" },
    "color": { "score": 0-10, "observation": "description", "concern": "LOW"|"MODERATE"|"HIGH" },
    "diameter": { "score": 0-10, "observation": "description", "concern": "LOW"|"MODERATE"|"HIGH" },
    "evolving": { "score": 0-10, "observation": "Cannot be determined from single image — patient should monitor for changes over time", "concern": "LOW"|"MODERATE"|"HIGH" }
  },
  "skinCharacteristics": {
    "texture": "description",
    "colorPattern": "description",
    "borders": "description",
    "surfaceFeatures": "description"
  },
  "visualConcerns": ["concern1", "concern2"],
  "reassuringFeatures": ["feature1", "feature2"],
  "recommendedActions": [
    { "action": "description", "urgency": "IMMEDIATE"|"WITHIN_WEEK"|"WITHIN_MONTH"|"ROUTINE", "reason": "why" }
  ],
  "specialistReferral": "URGENT"|"RECOMMENDED"|"OPTIONAL"|"NOT_INDICATED",
  "selfCareAdvice": ["tip1", "tip2"],
  "redFlagWarnings": ["warning1"] or [],
  "disclaimer": "This AI analysis is for informational purposes only and does NOT constitute a medical diagnosis. Please consult a qualified dermatologist or healthcare professional for proper evaluation and treatment."
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        }
      },
      prompt
    ]);

    const responseText = result.response.text().trim();
    
    // Extract JSON from response (handle cases where model adds extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ 
      success: true, 
      analysis,
      processedAt: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Skin analysis error:', err);
    
    if (err.message?.includes('SAFETY')) {
      return NextResponse.json({ 
        error: 'Image could not be processed due to content policy. Please upload a clear clinical skin image.' 
      }, { status: 422 });
    }
    
    return NextResponse.json({ 
      error: err.message || 'Analysis failed. Please try again.' 
    }, { status: 500 });
  }
}

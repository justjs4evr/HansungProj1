import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free';

  if (!apiKey) {
    return NextResponse.json({
      model,
      principles: [
        "1. Specificity & Detail: Reward reviews containing rich, experience-specific observations over vague generalities.",
        "2. Factual Consistency: Cross-examine review claims against verified hotel amenities and structural metadata.",
        "3. Anti-Spam & Template Detection: Flag repetitive phrasing, excessive promotional language, or copy-pasted templates.",
        "4. Non-Discriminatory Evaluation: Assess content behavior exclusively, ignoring user demographics."
      ],
      generatedByAI: false
    });
  }

  const prompt = `
You are the NVIDIA Nemotron 3.5 AI powering a trust-aware hotel review platform.
List the top 4 core principles you use to evaluate whether hotel reviews are authentic, truthful, or deceptive spam.
Return your answer strictly as a JSON array of strings under the key "principles".
Example:
{
  "principles": [
    "Principle 1 description...",
    "Principle 2 description..."
  ]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter status ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const parsed = JSON.parse(content);

    return NextResponse.json({
      model,
      principles: parsed.principles || parsed,
      generatedByAI: true
    });
  } catch (error) {
    console.error('Failed to get AI principles', error);
    return NextResponse.json({
      model,
      principles: [
        "1. Specificity & Detail: Reward reviews containing rich, experience-specific observations over vague generalities.",
        "2. Factual Consistency: Cross-examine review claims against verified hotel amenities and structural metadata.",
        "3. Anti-Spam & Template Detection: Flag repetitive phrasing, excessive promotional language, or copy-pasted templates.",
        "4. Non-Discriminatory Evaluation: Assess content behavior exclusively, ignoring user demographics."
      ],
      generatedByAI: false
    });
  }
}

export async function calculateTrustScore(reviewData) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free';

  if (!apiKey) {
    // Fallback Mock Logic
    console.warn('OPENROUTER_API_KEY not found. Using mock fallback for trust score.');
    return {
      specificity: 0.85,
      consistency: 0.90,
      spam_likelihood: 0.05,
      template_likelihood: 0.10,
      hotel_fact_consistency: 0.88,
      reasoning_summary: "Review appears detailed and matches known hotel amenities.",
      overallScore: 86
    };
  }

  const prompt = `
You are an AI tasked with analyzing hotel reviews to detect spam, deceptive patterns, and authenticity.
Analyze the following review:
Text: "${reviewData.text}"
Rating: ${reviewData.rating}
Hotel Amenities Context: ${reviewData.hotelAmenities ? reviewData.hotelAmenities.join(', ') : 'Unknown'}

Provide a structured JSON output evaluating the review. Use values between 0.0 and 1.0.
Output ONLY JSON, no markdown formatting blocks, no explanations.

{
  "specificity": number,
  "consistency": number,
  "spam_likelihood": number,
  "template_likelihood": number,
  "hotel_fact_consistency": number,
  "is_about_hotel_experience": boolean,
  "reasoning_summary": "string"
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
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    let resultContent = data.choices[0].message.content;
    
    // Attempt to parse JSON safely
    try {
      if (resultContent.startsWith('\`\`\`json')) {
         resultContent = resultContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      }
      const parsed = JSON.parse(resultContent);
      
      // Calculate overall score (simplified heuristic)
      let score = Math.round(
        ((parsed.specificity * 0.20) + 
        (parsed.consistency * 0.25) + 
        ((1 - parsed.spam_likelihood) * 0.25) + 
        ((1 - parsed.template_likelihood) * 0.15) + 
        (parsed.hotel_fact_consistency * 0.15)) * 100
      );

      // Strict Validation Check
      if (parsed.is_about_hotel_experience === false) {
        score = 0;
        parsed.reasoning_summary = "FLAGGED: Irrelevant content detected. Review does not appear to describe a hotel experience.";
        parsed.spam_likelihood = 1.0;
      }

      parsed.overallScore = Math.min(100, Math.max(0, score));
      return parsed;

    } catch (e) {
      console.error('Failed to parse LLM JSON output', resultContent);
      throw e;
    }

  } catch (error) {
    console.error('Error calculating trust score:', error);
    throw error;
  }
}

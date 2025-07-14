import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, description, category } = req.body;

    const prompt = `Based on the following job information, suggest the most appropriate destination zones (countries or regions) for this position. Consider factors like market demand, talent availability, and business needs. Return only the country codes in a JSON array format.

Job Title: ${title}
Category: ${category}
Description: ${description}

Example response format: ["US", "CA", "UK", "DE"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests appropriate destination zones for job postings based on the job details provided. IMPORTANT: All responses MUST be in English only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0].message.content;
    const suggestions = JSON.parse(response);

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
} 
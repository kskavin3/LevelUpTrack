'use server'

import { Anthropic } from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePlaylistIdeas(theme) {
  console.log('Generating playlist ideas for theme:', theme);

  const prompt = `Generate a list of 5 YouTube video ideas for a playlist based on the theme: "${theme}". Return only the video titles, separated by newlines.`;

  console.log('Sending prompt to Anthropic API:', prompt);

  const response = await anthropicClient.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  console.log('Received response from Anthropic API:', response);

  const allIdeas = response.content[0].type === 'text' 
    ? response.content[0].text.trim().split('\n')
    : [];
  const ideas = allIdeas.slice(-5);
  console.log('Generated playlist ideas:', ideas);

  return ideas;
} 
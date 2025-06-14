import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const KolSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  avatar: z.string(),
  followersTwitter: z.number(),
  followersKOL: z.number(),
  riskRecommendation: z.string(),
  avgProfitD: z.number(),
  rankFollowersKOL: z.number(),
  rankAvgProfitD: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tweets: z.array(
    z.object({
      id: z.number(),
      tokenId: z.number(),
      content: z.string(),
      signal: z.string(),
      risk: z.string(),
      timestamp: z.string(),
      expired: z.boolean(),
      valid: z.boolean(),
      kolId: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
      token: z.object({
        id: z.number(),
        addressToken: z.string(),
        symbol: z.string(),
        name: z.string(),
        decimals: z.number(),
        chain: z.string(),
        logo: z.string(),
        priceChange24H: z.number(),
        tags: z.array(z.string()),
      }),
    }),
  ),
});

@Injectable()
export class OpenAiService {
  async analyzeKolData(kolData: z.infer<typeof KolSchema>) {
    const prompt = `Analyze the following KOL data and return a summary in this format (as JSON):\n\n${JSON.stringify(
      kolData,
    )}\n\nFormat:\n{\n  id, name, username, avatar, followersTwitter, followersKOL, riskRecommendation, avgProfitD, rankFollowersKOL, rankAvgProfitD, createdAt, updatedAt, tweets: [ ... ]\n}`;

    try {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: KolSchema,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for crypto KOL analysis.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });

      if (result.object) {
        return result.object;
      } else {
        return { error: 'No object returned', raw: result };
      }
    } catch {
      return {
        error: 'Failed to call OpenAI API',
      };
    }
  }
}

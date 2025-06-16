import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Sentiment, Tweet } from '@prisma/client';
import 'dotenv/config';
import { convertBigIntToString } from './app.controller';

// Define the TweetSchema based on the Prisma Tweet model
export const TweetSchema = z.object({
  id: z.string(),
  tweetId: z.string().nullable(),
  bookmarkCount: z.number().nullable(),
  conversationId: z.string().nullable(),
  hashtags: z.array(z.string()),
  html: z.string().nullable(),
  isQuoted: z.boolean().nullable(),
  isPin: z.boolean().nullable(),
  isReply: z.boolean().nullable(),
  isRetweet: z.boolean().nullable(),
  isSelfThread: z.boolean().nullable(),
  likes: z.number().nullable(),
  name: z.string().nullable(),
  permanentUrl: z.string().nullable(),
  replies: z.number().nullable(),
  retweets: z.number().nullable(),
  text: z.string().nullable(),
  timeParsed: z.string().nullable(), // DateTime as string
  timestamp: z.string().nullable(), // BigInt as string
  urls: z.array(z.string()),
  userId: z.string().nullable(),
  username: z.string().nullable(),
  views: z.number().nullable(),
  sensitiveContent: z.boolean().nullable(),
  inReplyToStatusId: z.string().nullable(),
  quotedStatusId: z.string().nullable(),
  retweetedStatusId: z.string().nullable(),
  parentThreadId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string().nullable(),
  contractAddress: z.string(),
  marketCap: z.string().nullable(),
  chain: z.string().nullable(),
  decimals: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sentiment: z.nativeEnum(Sentiment),
});

@Injectable()
export class OpenAiService {
  async analyzeTweetData(tweetData: Tweet) {
    const prompt = `Given the following tweet data, return the exact same data strictly matching this schema. Do not summarize or change the structure. Ensure the output is fully compatible with the provided schema. If the tweet data is not related to a coin, return an object with all fields set to null.`;

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: CoinSchema,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for crypto coin analysis.',
        },
        {
          role: 'user',
          content:
            prompt + JSON.stringify(convertBigIntToString(tweetData), null, 2),
        },
      ],
      providerOptions: {
        openai: {
          store: true,
          metadata: {
            custom: 'value',
          },
        },
      },

      temperature: 0.2,
    });

    if (result.object) {
      return result.object;
    }

    throw new Error('No object returned');
  }
}

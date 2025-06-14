import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

function convertBigIntToString(obj: unknown): unknown {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj instanceof Date) {
    return obj.toISOString();
  } else if (obj && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      newObj[key] = convertBigIntToString(
        (obj as Record<string, unknown>)[key],
      );
    }
    return newObj;
  }
  return obj;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World';
  }

  @Get('tweets')
  async getTweets(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 200;
    const tweets = await this.prisma.tweet.findMany({
      orderBy: { timestamp: 'desc' },
      take,
      include: {
        mentions: true,
        photos: true,
        videos: true,
        quotedStatus: true,
        retweetedStatus: true,
        replies_to: true,
        threadReplies: true,
      },
    });

    return convertBigIntToString(tweets);
  }
}

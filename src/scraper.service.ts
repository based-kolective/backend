import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OpenAiService } from './openai.service';
import { ScraperAuthService } from './scraper-auth.service';
import { Scraper, SearchMode, Tweet } from 'agent-twitter-client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
    private readonly scraperAuthService: ScraperAuthService,
  ) {}

  kols = ['Keeper_Degen', 'CryptoBionic', 'whalehamlux'];

  async runScraperTask(): Promise<void> {
    this.logger.log('Starting scraper task');

    try {
      const scraper = await this.scraperAuthService.getScraper();

      for (const kol of this.kols) {
        await this.processTweetsForKol(scraper, kol);
      }
    } catch (error) {
      this.logger.error('Scraper task failed:', error);
      throw error;
    }
  }

  private async processTweetsForKol(
    scraper: Scraper,
    kol: string,
  ): Promise<void> {
    this.logger.log(`Fetching tweets for: ${kol}`);

    const tweetGen = scraper.searchTweets(
      `-is:retweet (from:${kol}) -filter:replies`,
      10,
      SearchMode.Latest,
    );

    for await (const tweet of tweetGen) {
      this.logger.log(`Processing tweet ID: ${tweet.id}`);

      try {
        const tweetData = await this.processTweet(tweet);

        const analyze = await this.openAiService.analyzeTweetData(
          tweetData.tweet,
        );

        if (
          analyze &&
          typeof analyze.symbol === 'string' &&
          analyze.symbol.trim().length > 0 &&
          tweetData?.tweet?.id
        ) {
          const { symbol, chain, contractAddress, decimals, marketCap, name } =
            analyze;

          const existingCoin = await this.prisma.coin.findFirst({
            where: {
              symbol: symbol.toLowerCase(),
              OR: [
                { contractAddress: contractAddress.toLowerCase() },
                { contractAddress: undefined }, // for coins that are not on the blockchain
              ],
            },
          });

          if (!existingCoin) {
            await this.prisma.coin.create({
              data: {
                symbol,
                chain,
                contractAddress,
                decimals,
                marketCap,
                name,
                tweets: {
                  connect: { id: tweetData.tweet.id },
                },
              },
            });
          } else {
            await this.prisma.coin.update({
              where: { id: existingCoin.id },
              data: {
                tweets: { connect: { id: tweetData.tweet.id } },
              },
            });
          }
        }

        this.logger.log(`Successfully processed tweet ${tweet.id}`);
      } catch (error) {
        this.logger.error(`Failed to process tweet ${tweet.id}:`, error);
      }
    }
  }

  private async processTweet(tweet: Tweet) {
    console.log(tweet.id);
    const tweetData = this.buildTweetData(tweet);

    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // Handle main tweet
      const upsertedTweet = await this.upsertTweet(tx, tweet.id, tweetData);

      // Handle related data in parallel where possible
      const promise = await Promise.all([
        this.processThreadChildren(tx, tweet),
        this.processMentions(tx, tweet),
        this.processPhotos(tx, tweet),
        this.processVideos(tx, tweet),
      ]);

      return {
        tweet: upsertedTweet,
        threadChildren: promise[0],
        mentions: promise[1],
        photos: promise[2],
        videos: promise[3],
      };
    });
  }

  private buildTweetData(tweet: Tweet): Prisma.TweetCreateInput {
    return {
      tweetId: tweet.id,
      text: tweet.text,
      username: tweet.username,
      userId: tweet.userId,
      likes: tweet.likes,
      retweets: tweet.retweets,
      replies: tweet.replies,
      timestamp: tweet.timestamp ? BigInt(tweet.timestamp) : undefined,
      hashtags: tweet.hashtags || [],
      urls: tweet.urls || [],
      permanentUrl: tweet.permanentUrl,
      isRetweet: tweet.isRetweet,
      isReply: tweet.isReply,
      isQuoted: tweet.isQuoted,
      isPin: tweet.isPin,
      isSelfThread: tweet.isSelfThread,
      views: tweet.views,
      sensitiveContent: tweet.sensitiveContent,
      conversationId: tweet.conversationId,
      name: tweet.name,
      html: tweet.html,
      timeParsed: tweet.timeParsed,
      bookmarkCount: tweet.bookmarkCount,
    };
  }

  private async upsertTweet(
    tx: Prisma.TransactionClient,
    tweetId: string | undefined,
    tweetData: Prisma.TweetCreateInput,
  ) {
    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    return await tx.tweet.upsert({
      where: { tweetId },
      create: tweetData,
      update: tweetData,
    });
  }

  private async processThreadChildren(
    tx: Prisma.TransactionClient,
    tweet: Tweet,
  ): Promise<void> {
    if (!tweet.thread?.length) return;

    for (const child of tweet.thread) {
      const childData = {
        tweetId: child.id,
        text: child.text,
        username: child.username,
        userId: child.userId,
        likes: child.likes,
        retweets: child.retweets,
        replies: child.replies,
        parentThread: { connect: { tweetId: tweet.id } },
      };

      await tx.tweet.upsert({
        where: { tweetId: child.id },
        create: childData,
        update: {
          parentThread: { connect: { tweetId: tweet.id } },
        },
      });
    }
  }

  private async processMentions(
    tx: Prisma.TransactionClient,
    tweet: Tweet,
  ): Promise<void> {
    if (!tweet.mentions?.length) return;

    for (const mention of tweet.mentions) {
      const mentionData: Prisma.MentionCreateInput = {
        tweet: { connect: { tweetId: tweet.id } },
        name: mention.name,
        username: mention.username,
        userId: mention.id,
      };

      const existingMention = await tx.mention.findFirst({
        where: { username: mention.username, tweetId: tweet.id },
      });

      if (existingMention) {
        await tx.mention.update({
          where: { id: existingMention.id },
          data: mentionData,
        });
      } else {
        await tx.mention.create({ data: mentionData });
      }
    }
  }

  private async processPhotos(
    tx: Prisma.TransactionClient,
    tweet: Tweet,
  ): Promise<void> {
    if (!tweet.photos?.length) return;

    for (const photo of tweet.photos) {
      const photoData: Prisma.PhotoCreateInput = {
        url: photo.url,
        photoId: photo.id,
        altText: photo.alt_text,
        tweet: { connect: { tweetId: tweet.id } },
      };

      const existingPhoto = await tx.photo.findFirst({
        where: { photoId: photo.id },
      });

      if (existingPhoto) {
        await tx.photo.update({
          where: { id: existingPhoto.id },
          data: photoData,
        });
      } else {
        await tx.photo.create({ data: photoData });
      }
    }
  }

  private async processVideos(
    tx: Prisma.TransactionClient,
    tweet: Tweet,
  ): Promise<void> {
    if (!tweet.videos?.length) return;

    for (const video of tweet.videos) {
      const existingVideo = await tx.video.findFirst({
        where: { videoId: video.id },
      });

      const videoData: Prisma.VideoCreateInput = {
        videoId: video.id,
        url: video.url,
        preview: video.preview,
        tweet: { connect: { tweetId: tweet.id } },
      };

      if (existingVideo) {
        await tx.video.update({
          where: { id: existingVideo.id },
          data: videoData,
        });
      } else {
        await tx.video.create({ data: videoData });
      }
    }
  }
}

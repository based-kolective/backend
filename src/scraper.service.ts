import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OpenAiService } from './openai.service';
import { ScraperAuthService } from './scraper-auth.service';
import { Scraper, Tweet } from '@the-convocation/twitter-scraper';
import { Prisma } from '@prisma/client';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
    private readonly scraperAuthService: ScraperAuthService,
  ) {}

  kols = [
    'GiganticRebirth',
    'cobie',
    'Husslin_',
    'IamNomad',
    'insiliconot',
    'CC2Ventures',
    'crypto_linn',
    'S4mmyEth',
    '0xNairolf',
    'stacy_muur',
    'arndxt_xo',
    'poopmandefi',
    'Hercules_Defi',
    'mztacat',
    'wyckoffweb',
    'Zun2025',
    'DeFiMinty',
    '0xMoei',
    'OxJoshyy',
    '0xxbeacon',
    'Tanaka_L2',
    '73lV_',
    '0xdetweiler',
    '0xdahua',
    'TheBigNie',
    'PinkBrains_io',
    'DefiIgnas',
    'NiphermeDave',
    'heycape_',
    'ripchillpill',
    'PowerPasheur',
    'jessepollak',
    'OxTochi',
    'RBCHI',
    'AnonVee_',
    'apixtwts',
    'tier10k',
    '0xWenMoon',
    'Airdropfinds',
    'GuarEmperor',
    'satyaXBT',
    'eli5_defi',
    'AlwaysBeenChoze',
    'Autosultan_team',
    'syaerulid',
    'canducrypto',
    'zerokn0wledge_',
    'rektdiomedes',
    'wacy_time1',
    'thedefiedge',
    'alpha_pls',
    'crypthoem',
    'QwQiao',
    'ahboyash',
    'JackNiewold',
    '2lambro',
    '0xRainandCoffee',
    '0xsmallbrain',
    'AKAKAY04',
    'hmalviya9',
    'LuciusFang10',
    'Louround_',
    'Slappjakke',
    'CryptoKoryo',
    'HsakaTrades',
    'Awawat_Trades',
    'EmperorBTC',
    'smartestmoney_',
    'assasin_eth',
    '0xENAS',
    'ericonomic',
    'maruushae',
    'hyde6000',
    'TraderMagus',
    'Exoticktrades',
    'HighStakesCap',
  ];

  async onModuleInit() {
    await this.runScraperTask();
  }

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

    const tweetGen = scraper.getTweets(kol, 2);

    for await (const tweet of tweetGen) {
      this.logger.log(`Processing tweet ID: ${tweet.id}`);

      try {
        await this.processTweet(tweet);
        this.logger.log(`Successfully processed tweet ${tweet.id}`);
      } catch (error) {
        this.logger.error(`Failed to process tweet ${tweet.id}:`, error);
      }
    }
  }

  private async processTweet(tweet: Tweet): Promise<void> {
    console.log(tweet.id);
    const tweetData = this.buildTweetData(tweet);

    // Use transaction to ensure data consistency
    await this.prisma.$transaction(async (tx) => {
      // Handle main tweet
      await this.upsertTweet(tx, tweet.id, tweetData);

      // Handle related data in parallel where possible
      await Promise.all([
        this.processThreadChildren(tx, tweet),
        this.processMentions(tx, tweet),
        this.processPhotos(tx, tweet),
        this.processVideos(tx, tweet),
      ]);
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
  ): Promise<void> {
    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    await tx.tweet.upsert({
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

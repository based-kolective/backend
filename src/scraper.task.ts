import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from './scraper.service';

@Injectable()
export class ScraperTask {
  private readonly logger = new Logger(ScraperTask.name);

  constructor(private readonly scraperService: ScraperService) {
    this.logger.log(
      'ScraperTask initialized - Cron job will run every 10 seconds',
    );
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    waitForCompletion: true,
    unrefTimeout: true,
  })
  async handleCron() {
    const timestamp = new Date().toISOString();
    this.logger.log(`[${timestamp}] Starting scheduled scraper task`);

    try {
      await this.scraperService.runScraperTask();
      this.logger.log(`[${timestamp}] Scraper task completed successfully`);
    } catch (error) {
      this.logger.error(`[${timestamp}] Scraper task failed:`, error);
    }
  }
}

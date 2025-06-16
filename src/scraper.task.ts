import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from './scraper.service';

@Injectable()
export class ScraperTask {
  constructor(private readonly scraperService: ScraperService) {
    console.log('ScraperTask constructor');
  }

  @Cron(CronExpression.EVERY_HOUR, {
    waitForCompletion: true,
    unrefTimeout: true,
  })
  async handleCron() {
    await this.scraperService.runScraperTask();
  }
}

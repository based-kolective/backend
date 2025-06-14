import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { ScraperTask } from 'src/scraper.task';
import { ScraperService } from 'src/scraper.service';
import { OpenAiService } from './openai.service';
import { ScraperAuthService } from './scraper-auth.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ScraperTask,
    ScraperService,
    OpenAiService,
    ScraperAuthService,
  ],
})
export class AppModule {}

import { Injectable, Logger } from '@nestjs/common';
import { Scraper } from '@the-convocation/twitter-scraper';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Cookie } from 'tough-cookie';

dotenv.config();

@Injectable()
export class ScraperAuthService {
  private readonly logger = new Logger(ScraperAuthService.name);
  private scraper: Scraper | null = null;

  private get username() {
    return process.env.TWITTER_USERNAME!;
  }
  private get password() {
    return process.env.TWITTER_PASSWORD!;
  }
  private get email() {
    return process.env.TWITTER_EMAIL!;
  }

  private get cookiesDir() {
    return path.join(process.cwd(), 'cookies');
  }

  private get cookiePath() {
    return path.join(this.cookiesDir, `${this.username}.cookies.json`);
  }

  private async saveCookiesToFile(cookies: Cookie[]): Promise<void> {
    await fs.mkdir(this.cookiesDir, { recursive: true });
    await fs.writeFile(
      this.cookiePath,
      JSON.stringify(cookies, null, 2),
      'utf8',
    );
    this.logger.log(`Cookies saved for user ${this.username}`);
  }

  private async loadCookiesFromFile(): Promise<Cookie[] | null> {
    try {
      await fs.access(this.cookiePath);
      const cookiesData = await fs.readFile(this.cookiePath, 'utf8');
      this.logger.log(`Cookies loaded for user ${this.username}`);

      const json = JSON.parse(cookiesData) as Cookie[];
      return json;
    } catch {
      return null;
    }
  }

  async getScraper(): Promise<Scraper> {
    if (this.scraper) return this.scraper;

    const scraper = new Scraper();
    const cookies = await this.loadCookiesFromFile();

    if (cookies) {
      try {
        try {
          const cookieObjects: Cookie[] = cookies.map(
            (cookie) =>
              new Cookie({
                key: cookie.key,
                value: cookie.value,
                domain: cookie.domain || 'twitter.com',
                path: cookie.path || '/',
                expires: cookie.expires ? new Date(cookie.expires) : undefined,
                httpOnly: !!cookie.httpOnly,
                secure: !!cookie.secure,
              }),
          );
          const jar = (
            scraper as {
              _jar?: {
                setCookie: (cookie: Cookie, url: string) => Promise<void>;
              };
            }
          )._jar;
          if (jar && typeof jar.setCookie === 'function') {
            for (const cookie of cookieObjects) {
              await jar.setCookie(cookie, 'https://twitter.com/');
            }
          } else {
            const cookieStrings = cookieObjects.map((c: Cookie) =>
              c.toString(),
            );
            await scraper.setCookies(cookieStrings);
          }
        } catch {
          const cookieStrings = cookies.map(
            (cookie) => `${cookie.key}=${cookie.value}`,
          );
          await scraper.setCookies(cookieStrings);
        }
        if (await scraper.isLoggedIn()) {
          this.scraper = scraper;
          return scraper;
        }
      } catch {
        this.logger.warn(
          'Failed to restore session from cookies, will re-login.',
        );
      }
    }

    try {
      const isLoggedIn = await scraper.isLoggedIn();
      this.logger.log(`Is logged in: ${isLoggedIn}`);

      if (isLoggedIn) {
        this.scraper = scraper;
        return scraper;
      } else {
        this.logger.log('Not logged in, logging in...');
        await scraper.login(this.username, this.password, this.email);
        const newCookies = await scraper.getCookies();
        await this.saveCookiesToFile(newCookies);
        this.scraper = scraper;
        return scraper;
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

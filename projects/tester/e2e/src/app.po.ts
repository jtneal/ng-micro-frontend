import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo(page?: string): Promise<unknown> {
    return browser.get(`${browser.baseUrl}${page}`);
  }

  async getTitleText(): Promise<string> {
    return element(by.css('h1')).getText();
  }
}

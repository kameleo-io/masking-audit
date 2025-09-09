import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";
import { setTimeout } from "timers/promises";

const kameleoCliUri = `http://localhost:5050`;

const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

/** @type {import('@kameleo/local-api-client').CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "Browserscan Test",
};

const profile = await client.profile.createProfile(createProfileRequest);

await client.profile.startProfile(profile.id, {
    arguments: ["window-size=1280,720"]
});

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);

await setTimeout(30_000);

const context = browser.contexts()[0];
const page = await context.newPage();

await page.goto("https://www.browserscan.net/");
await page.waitForSelector('.fc-button.fc-cta-consent.fc-primary-button', { state: 'visible' });
await page.click('.fc-button.fc-cta-consent.fc-primary-button');

await setTimeout(5_000);

await autoScroll(page);

await client.profile.stopProfile(profile.id);

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 15;
      const delay = 80;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });
}
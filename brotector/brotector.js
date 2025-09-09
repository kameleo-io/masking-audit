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
    name: "Brotector Test",
};

const profile = await client.profile.createProfile(createProfileRequest);

await client.profile.startProfile(profile.id, {
    arguments: ["window-size=1280,720"]
});

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);

const context = browser.contexts()[0];
const page = await context.newPage();

await page.goto("https://kaliiiiiiiiii.github.io/brotector/");

await setTimeout(5_000);

await page.mouse.move(100, 100);
await page.mouse.click(100, 100);
await page.evaluate('(async () => { return 1 })()');
await page.keyboard.type('World', { delay: 100 });

await setTimeout(5_000);

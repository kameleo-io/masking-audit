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
    name: "Cloudflare Turnstile Test",
};

const profile = await client.profile.createProfile(createProfileRequest);

await client.profile.startProfile(profile.id, {
    arguments: ["window-size=1280,840"]
});

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);

const context = browser.contexts()[0];
const page = await context.newPage();

await page.goto("https://dash.cloudflare.com/login");

await page.locator("#onetrust-accept-btn-handler").click()
await setTimeout(10_000);
await page.mouse.click(390, 596);

await setTimeout(10_000);

await client.profile.stopProfile(profile.id);
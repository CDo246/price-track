import axios from "axios";
import fs from "fs";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

type Product = {
  name: string;
  price: number;
};

function processLdJsons(allLdJson: string[]) {
  // Parse all of them into json, and skip it if it's invalid json
  const allLdJsonParsed = allLdJson
    .map((json) => {
      try {
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    })
    .filter(exists);

  // Shallow merge all of them together into one large object
  const mergedLdJson = allLdJsonParsed.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      for (const item of curr) {
        acc = { ...acc, ...item };
      }
      return acc;
    } else {
      return { ...acc, ...curr };
    }
  }, {});

  const name = mergedLdJson["name"];
  if (!name) {
    throw new Error("no name");
  }

  const offers = mergedLdJson["offers"];
  if (!offers) {
    throw new Error("no offers");
  }

  const firstOffer = Array.isArray(offers) ? offers[0] : offers;

  const price = firstOffer["price"] || firstOffer["highPrice"];
  if (firstOffer && price) {
    const priceNum = Number(price);
    if (!isNaN(priceNum)) {
      return {
        name,
        price: priceNum,
      };
    }
  }

  throw new Error("failed");
}

async function waitForLdJsonData(
  page: Page,
  abort: AbortSignal
): Promise<Product> {
  await page.waitForSelector("script[type='application/ld+json']", {
    signal: abort,
  });

  // Wait 1 second just in case
  await new Promise((r) => setTimeout(r, 1000));

  // For each ld json, find the one with the price
  const allLdJson = await page.evaluate(() => {
    const ldJson = document.querySelectorAll(
      "script[type='application/ld+json']"
    );

    return Array.from(ldJson).map((el) => el.innerHTML);
  });

  return processLdJsons(allLdJson);
}

async function tryGetLdJsonWithoutBrowser(url: string): Promise<Product> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Wget/1.21.2",
      Accept: "*/*",
    },
  });
  const html = response.data;

  const document = cheerio.load(html);
  const ldJson = document("script[type='application/ld+json']");
  const allLdJson = ldJson.map((_, el) => document(el).html()).get();

  return processLdJsons(allLdJson);
}

async function waitForMicrodata(
  page: Page,
  abort: AbortSignal
): Promise<Product> {
  await page.waitForSelector("[itemprop='price']", {
    signal: abort,
  });

  await page.waitForSelector("[itemprop='name']", {
    signal: abort,
  });

  // Wait 1 second just in case
  await new Promise((r) => setTimeout(r, 1000));

  const product = await page.evaluate(() => {
    const getMicrocodeValue = (el: Element) => {
      const value = el.getAttribute("content");
      if (value) {
        return value;
      } else {
        return el.innerHTML;
      }
    };

    // There should only be 1 price field
    const price = document.querySelector("[itemprop='price']");

    // For name, we need to make sure it's not contained within other itemprop tags
    const nameTags = document.querySelectorAll("[itemprop='name']");
    const name = Array.from(nameTags).find((el) => {
      // Check if a parent contains itemprop attribute
      let curr = el;
      while (curr.parentElement) {
        if (curr.parentElement.hasAttribute("itemprop")) {
          return false;
        }
        curr = curr.parentElement;
      }

      return true;
    });

    if (!price || !name) {
      return null;
    }

    const priceText = getMicrocodeValue(price);
    const nameText = getMicrocodeValue(name);

    if (isNaN(Number(priceText))) {
      return null;
    } else {
      return {
        name: nameText,
        price: Number(priceText),
      };
    }
  });

  if (product) {
    return product;
  }

  throw new Error("failed");
}

function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const mobile = {
  name: "Nexus 5X",
  userAgent:
    "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
  viewport: {
    width: 412,
    height: 732,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    isLandscape: false,
  },
};

export async function fetchProduct(url: string): Promise<Product | null> {
  try {
    const product = await tryGetLdJsonWithoutBrowser(url);
    return product;
  } catch (e) {
    // Failed to do it the naive way, do it the complex way
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.emulate(mobile);

  await page.goto(url, { waitUntil: "load" });

  const abort = new AbortController();

  const dataFetchers = [
    waitForLdJsonData(page, abort.signal),
    waitForMicrodata(page, abort.signal),
  ];

  // Abort after 30 seconds
  setTimeout(() => {
    abort.abort();
  }, 30000);

  let result: Product | null = null;
  try {
    const finalResult = await Promise.any(dataFetchers);
    abort.abort();
    result = finalResult;
  } catch {
    // We failed to get the data
    abort.abort();
  }

  await page.close();
  await browser.close();

  return result;
}

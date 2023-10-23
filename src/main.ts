import axios from "axios";
import puppeteer, { Page } from "puppeteer";

type Product = {
  name: string;
  price: number;
};

async function waitForLdJsonData(page: Page): Promise<Product> {
  await page.waitForSelector("script[type='application/ld+json']");

  // For each ld json, find the one with the price

  const allLdJson = page.evaluate(() => {
    const ldJson = document.querySelectorAll(
      "script[type='application/ld+json']"
    );

    return Array.from(ldJson).map((el) => el.innerHTML);
  });

  
}

async function main() {
  // try {
  //   const result = await axios.get(
  //     "https://www.bunnings.com.au/pinnacle-1830-x-1820-x-540mm-4-tier-heavy-duty-shelving-unit-1830-x-1820-x-540mm_p2582967"
  //   );
  //   const html = cheerio.load(result.data);
  //   const piss = html("script[type='application/ld+json']");
  //   piss.each((i, el) => {
  //     console.log(el.children[0].data);
  //   })
  //   console.log(piss.html());
  // } catch (e) {
  //   console.log(e);
  // }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(
    "https://www.bunnings.com.au/pinnacle-1830-x-1820-x-540mm-4-tier-heavy-duty-shelving-unit-1830-x-1820-x-540mm_p2582967"
  );
  await Promise.any([
    await page.waitForSelector("script[type='application/ld+json']"),
  ]);
  const html = await page.content();
  const $ = cheerio.load(html);
  const piss = $("script[type='application/ld+json']");
  console.log(piss.html());
}

main();

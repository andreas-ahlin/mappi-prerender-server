const express = require("express");
const puppeteer = require("puppeteer");
const userAgent = require("user-agent");

const app = express();
const PORT = process.env.PORT || 3000;

// List of search engine bots
const botList = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Twitterbot",
  "FacebookExternalHit",
];

// Check if the request is from a bot
const isBot = (userAgentString) =>
  botList.some((bot) => userAgentString.includes(bot));

app.use(async (req, res, next) => {
  const userAgentString = req.headers["user-agent"] || "";

  if (!isBot(userAgentString)) {
    return next(); // Serve normal React app for regular users
  }

  console.log(`Pre-rendering for: ${req.url} (Bot detected: ${userAgentString})`);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  try {
    await page.goto(`https://www.mappi.ai${req.url}`, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });


    const html = await page.content();
    await browser.close();

    res.send(html);
  } catch (error) {
    console.error("Error pre-rendering:", error);
    res.status(500).send("Error pre-rendering page.");
  }
});

// Default response for normal users
app.get("*", (req, res) => {
  res.send("Render Pre-Rendering Server Running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Pre-render server running on port ${PORT}`);
});

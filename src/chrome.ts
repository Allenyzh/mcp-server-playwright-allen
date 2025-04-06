import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { chromium, BrowserContext, Page } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

let browserContext: null | BrowserContext = null;

// Initialize context
async function initializeContext(url?: string): Promise<CallToolResult> {
  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const userDataDir = process.env.USER_DATA_DIR || 'userdata/chrome-user-data';

  let message = "";

  if (browserContext) {
    message = "Browser is already open.";
  } else {
    try {
      browserContext = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        executablePath: chromePath,
      });
      message = "Browser opened successfully.";

      if (url) {
        const page = await browserContext.newPage();
        await page.goto(url);
        message += ` Opened URL: ${url}`;
      }
    }
    catch (error: any) {
      message = `Failed to open browser: ${error.message}`;
    }
  }

  return {
    content: [
      {
        type: "text",
        text: message,
      }
    ],
  };
}

async function closeContext(): Promise<CallToolResult> {
  let message;

  if (!browserContext) {
    message = "No browser is currently open.";
  } else {
    try {
      await browserContext.close();
      browserContext = null;
      message = "Browser closed successfully.";
    } catch (error: any) {
      message = `Failed to close browser: ${error.message}`;
    }
  }

  return {
    content: [
      {
        type: "text",
        text: message,
      }
    ],
  };
}

async function navigateToPage(url: string): Promise<CallToolResult> {
  if (!browserContext) {
    const msg = await initializeContext();
    if (!browserContext) {
      return msg;
    }
  }
  let message = "";
  try {
    const pages = browserContext.pages();
    if (pages.length > 0) {
      const page = pages[0];
      await page.goto(url);
      let pageTitle = "";
      try {
        pageTitle = await page.title();
      } catch (titleError) {
        pageTitle = "[Unable to retrieve page title]";
      }
      message = `Successfully navigated to ${url}. Page title: ${pageTitle}`;
    } else {
      message = "No open pages to navigate.";
    }
  } catch (error: any) {
    message = `Failed to navigate to ${url}: ${error.message}`;
  }
  return {
    content: [
      {
        type: "text",
        text: message,
      }
    ],
  };
}

async function getCurrentPage(): Promise<Page | null> {
  if (!browserContext) {
    const msg = await initializeContext();
    if (!browserContext) {
      return null;
    }
  }
  const pages = browserContext.pages();
  if (pages.length > 0) {
    return pages[0];
  } else {
    return null;
  }
}


async function getPageContent(): Promise<CallToolResult> {
  const page = await getCurrentPage();

  let message = "";
  if (!page) {
    message = "No open pages to retrieve content from.";
  } else {
    try {
      const rawHtml = await page.content();
      const dom = new JSDOM(rawHtml, { url: page.url() });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (article && article.textContent) {
        message = article.textContent;
      }
      else {
        message = "Failed to parse article content.";
      }
    } catch (error: any) {
      message = `Failed to retrieve page content: ${error.message}`;
    }
  }
  return {
    content: [
      {
        type: "text",
        text: message,
      }
    ],
  };
}


// Create a new page and navigate to specified URL
async function createAndNavigateToPage(url: string): Promise<CallToolResult> {
  if (!browserContext) {
    const msg = await initializeContext();
    if (!browserContext) {
      return msg;
    }
  }

  let message = "";
  try {
    const page = await browserContext.newPage();
    await page.goto(url);
    let pageTitle = "";
    try {
      pageTitle = await page.title();
    }
    catch (titleError) {
      pageTitle = "[Unable to retrieve page title]";
    }
    message = `Successfully navigated to ${url}. Page title: ${pageTitle}`;
  }
  catch (error: any) {
    message = `Failed to navigate to ${url}: ${error.message}`;
  }
  return {
    content: [
      {
        type: "text",
        text: message,
      }
    ],
  };
}

// Return list of all open pages
async function getOpenPages(): Promise<CallToolResult> {
  if (!browserContext) {
    const msg = await initializeContext();
    if (!browserContext) {
      return msg;
    }
  }

  const pages = browserContext.pages();
  const pageInfo = await Promise.all(
    pages.map(async (page, index) => {
      let title = "[Unknown title]";
      let url = "[Unknown URL]";

      try {
        title = await page.title();
      } catch (titleError) {
        title = "[Unable to retrieve title]";
      }

      try {
        url = page.url();
      } catch (urlError) {
        url = "[Unable to retrieve URL]";
      }

      return `Page ${index + 1}: "${title}" - ${url}`;
    })
  );

  return {
    content: [
      {
        type: "text",
        text: pageInfo.length > 0
          ? `Open pages:\n${pageInfo.join('\n')}`
          : "No pages are currently open."
      }
    ],
  };
}



export { initializeContext, createAndNavigateToPage, getOpenPages, closeContext, navigateToPage, getPageContent };
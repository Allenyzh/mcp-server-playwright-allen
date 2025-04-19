#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  initializeContext,
  getOpenPages,
  closeContext,
  navigateToPage,
  getPageContent,
  closePage,
  openNewPage,
  typeInGoogleSearchBar,
} from "./chrome.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const {
  name: package_name,
  version: package_version,
} = require("../package.json");

// Create server instance
const server = new McpServer({
  name: package_name,
  version: package_version,
});

server.tool(
  "open-browser",
  "Open a browser instance",
  {
    url: z.string().optional().describe("The URL to open in the browser"),
  },
  async (args) => {
    return initializeContext(args.url);
  }
);

// Close a specific page
server.tool(
  "close-page",
  "Close a specific page",
  {
    pageNumber: z
      .number()
      .describe(
        "The number of the page to close. Do not convert it to the index."
      ),
  },
  async (args) => {
    return await closePage(args.pageNumber);
  }
);

server.tool(
  "close-browser",
  "Close the browser instance",
  {},
  async (args, extra) => {
    return await closeContext();
  }
);

server.tool(
  "navigate-to-page",
  "Navigate to a new page with the specified URL",
  {
    url: z.string().describe("The URL to navigate to"),
  },
  async (args, extra) => {
    return await navigateToPage(args.url);
  }
);

server.tool(
  "open-new-page",
  "Open a new page in the existing browser context",
  {
    url: z
      .string()
      .describe(
        "The URL of the web page to launch and it must be a valid URL like https://www.google.com"
      ),
  },
  async (args) => {
    return await openNewPage(args.url);
  }
);

server.tool(
  "get-open-pages",
  "List all open browser pages",
  {},
  async (args, extra) => {
    return await getOpenPages();
  }
);

server.tool(
  "get-page-content",
  "Get the content of a page",
  {},
  async (args, extra) => {
    return await getPageContent();
  }
);

server.tool(
  "type-text-in-google-search",
  "Type text in Google search",
  {
    text: z.string().describe("The text to type in the search bar"),
  },
  async (args) => {
    return await typeInGoogleSearchBar(args.text);
  }
);

async function main() {
  // Create a transport instance
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Playwright MCP Server running on stdio");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

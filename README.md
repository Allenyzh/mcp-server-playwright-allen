# mcp-server-playwright

This project is an experimental project aimed at manipulating a browser through MCP using Playwright, in order to implement a feature to control the browser through AI.

## Tools

- open-browser(url) : Open a browser with the specified URL(option).
- close-browser() : Close the browser.
- navigate-to-page(url) : Navigate to the specified URL.
- get-page-content() : Get the readability content of the current page.


## Usage

### Install dependencies

- bun
- pnpm
  
```bash
pnpm install
```

### MCP Configuration

```json
{
  "mcpServers": {
    "mcp-server-playwright":{
        "command": "bun",
        "args": ["yourpath/mcp-server-playwright/src/index.ts"],
        "env": {
          "CHROME_PATH": "your_chrome_path",
          "MUSER_DATA_DIR": "your_chrome_user_data_path",
        },
    }
  }
}
```

Have fun!
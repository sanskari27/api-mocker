# API Mocker Chrome Extension

A powerful Chrome extension built with Manifest V3 that allows you to mock API requests with custom responses on a per-tab basis.

## Features

- 🚀 **Per-tab mocking**: Enable/disable mocking for individual tabs
- 🎯 **Multiple API rules**: Support for multiple API endpoints with different mock responses
- 💾 **Persistent storage**: Rules and tab states are saved using `chrome.storage.local`
- 🎨 **Modern UI**: Built with React, Chakra UI, and TailwindCSS
- ⚡ **TypeScript**: Fully typed for better development experience
- 🔄 **Real-time updates**: Changes are applied immediately without page refresh

## Tech Stack

- **Manifest V3** Chrome Extension
- **TypeScript** for type safety
- **React** for the popup UI
- **Chakra UI** for UI components
- **TailwindCSS** for styling
- **Webpack** for bundling

## Installation

### Development Setup

1. **Clone and install dependencies:**

   ```bash
   cd api-mocker
   npm install
   ```

2. **Build the extension:**

   ```bash
   npm run build
   ```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Development Mode

For development with auto-rebuild:

```bash
npm run dev
```

## Usage

### Basic Setup

1. **Click the extension icon** in your Chrome toolbar
2. **Use the Play/Pause button** (▶️/⏸️) to enable/disable mocking for the current tab
3. **Use the action buttons** in the header:
   - **Info icon** (ℹ️) to add an example rule
   - **Plus icon** (➕) to create a new rule
4. **Configure each rule** using the accordion interface:
   - **URL Pattern**: Define which URLs to intercept (supports wildcards)
   - **HTTP Method**: Choose specific method or "Any"
   - **Response Code**: Set the HTTP status code (default: 200)
   - **Response Headers & Body**: Use tabs to switch between headers and response body configuration

### Rule Configuration

Each rule consists of:

- **URL Pattern**: `/api/user`, `*api*`, `user*`, etc.
- **HTTP Method**: `ANY`, `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- **Response Code**: HTTP status code (100-599)
- **Response Headers**: Custom headers like `Content-Type`, `Authorization`
- **Response Body**: JSON object, array, or plain text

### Example Rules

**User API Rule:**

- URL: `/api/user`
- Method: `GET`
- Status: `200`
- Headers: `Content-Type: application/json`
- Body: `{"id": 123, "name": "Mock User", "email": "mock@example.com"}`

**Products API Rule:**

- URL: `*products*`
- Method: `ANY`
- Status: `200`
- Headers: `Content-Type: application/json`
- Body: `[{"id": 1, "title": "Product 1", "price": 29.99}]`

### URL Pattern Matching

- **Exact match**: `/api/user` matches exactly `/api/user`
- **Contains**: `/api/user` also matches `https://example.com/api/user`
- **Wildcards**:
  - `*user` matches any URL ending with "user"
  - `user*` matches any URL starting with "user"

### Features in Action

- **Per-tab isolation**: Mocking enabled on one tab doesn't affect others
- **Persistent state**: Your rules and tab states survive browser restarts
- **Real-time application**: Changes apply immediately without page refresh
- **Method-specific matching**: Match specific HTTP methods or use "Any"
- **Custom headers**: Set response headers for each rule
- **Flexible URL patterns**: Support for wildcards and contains matching
- **Both fetch and XMLHttpRequest**: Supports modern fetch API and legacy XMLHttpRequest
- **Streamlined UI**: Clean interface with icon-based Play/Pause toggle and action buttons in header
- **Icon-based controls**: Intuitive icons with tooltips for all actions
- **Tabbed configuration**: Switch between Headers and Response Body tabs for each rule

## File Structure

```
api-mocker/
├── src/
│   ├── background.ts          # Background service worker
│   ├── content.ts             # Content script for API interception
│   ├── manifest.json          # Extension manifest
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── popup/
│       ├── index.tsx         # React entry point
│       ├── App.tsx           # Main popup component
│       ├── popup.html        # Popup HTML template
│       └── styles.css        # TailwindCSS styles
├── dist/                     # Built extension files
├── webpack.config.js         # Webpack configuration
├── tailwind.config.js        # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run build` - Build for production
- `npm run dev` - Development mode with watch
- `npm run type-check` - TypeScript type checking

### Architecture

1. **Background Service Worker** (`background.ts`):

   - Manages storage operations
   - Handles communication between popup and content scripts
   - Maintains per-tab state

2. **Content Script** (`content.ts`):

   - Intercepts `fetch` and `XMLHttpRequest` calls
   - Applies mock rules when mocking is enabled
   - Communicates with background script for rule updates

3. **Popup UI** (`popup/`):
   - React-based interface with Accordion layout
   - Real-time toggle for enabling/disabling mocking
   - Individual rule editors with form controls
   - Headers editor with key-value pairs
   - Method selection and status code configuration

### Storage Schema

```typescript
interface MockRule {
	id: string;
	url: string;
	method: 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	responseCode: number;
	responseHeaders: Record<string, string>;
	responseBody: string;
}

interface StorageData {
	globalRules: MockRule[];
	tabStates: {
		[tabId: string]: {
			enabled: boolean;
			rules: MockRule[];
		};
	};
}
```

## Troubleshooting

### Extension Not Working

- Check that the extension is enabled in `chrome://extensions/`
- Verify that the extension has the necessary permissions
- Check the browser console for any error messages

### Rules Not Applying

- Ensure mocking is enabled for the current tab
- Verify JSON syntax in the rules editor
- Check that URL patterns match the actual request URLs
- Look at the browser console for interception logs

### Performance Considerations

- The extension only intercepts requests on tabs where mocking is enabled
- Mock responses are served immediately without network requests
- Storage operations are optimized for minimal impact

## License

MIT License - feel free to use this project for your own purposes.

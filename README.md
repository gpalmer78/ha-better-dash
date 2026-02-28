# 🖥️ BetterDash Card for Home Assistant

A HACS-compatible Lovelace card that connects to your [BetterDash](https://github.com/gpalmer78/betterdash) server and displays your homelab services as an interactive dashboard inside Home Assistant.

![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)

## Features

- **Live Server Connection** — Connects to your BetterDash instance via REST API
- **Status Monitoring** — Real-time online/offline indicators with pulse animation
- **Visual Config Editor** — Full GUI editor with server connection test, item selection, and display settings
- **Item Selection** — Fetch items from BetterDash and choose which to display on the card
- **Category Grouping** — Collapsible groups matching your BetterDash categories
- **Search & Filter** — Quickly find services by name, description, or category
- **selfh.st Icons** — Automatic icon resolution via selfh.st CDN
- **Responsive Grid** — 1-6 configurable columns, adapts to mobile
- **Themeable** — Inherits your HA theme colors automatically

## Installation

### HACS (Recommended)

1. Open HACS → Frontend → ⋮ → **Custom repositories**
2. Add: `https://github.com/gpalmer78/betterdash-card`
3. Category: **Dashboard**
4. Click **Download** → Restart Home Assistant

### Manual

1. Download `betterdash-card.js` from [Releases](https://github.com/gpalmer78/betterdash-card/releases)
2. Copy to `/config/www/community/betterdash-card/`
3. Add resource: Settings → Dashboards → Resources → Add `/hacsfiles/betterdash-card/betterdash-card.js` (JavaScript Module)

## Configuration

### Visual Editor

Add the card to any dashboard → click "BetterDash Card" → configure:

| Setting | Description | Default |
|---------|-------------|---------|
| Server URL | Your BetterDash server address | — |
| API Key | Optional auth token | — |
| Title | Card header text | BetterDash |
| Columns | Grid columns (1-6) | 3 |
| Show Search | Search/filter bar | ✅ |
| Group by Category | Collapsible category groups | ✅ |
| Show Status | Online/offline indicators | ✅ |
| Poll Interval | Refresh rate in seconds | 30 |
| Open in New Tab | Link behavior | ✅ |
| Selected Items | Which items to display | All |

### YAML

```yaml
type: custom:betterdash-card
server_url: http://192.168.1.100:3000
title: My Homelab
columns: 3
show_search: true
show_categories: true
```

## BetterDash Server Requirements

Your BetterDash server needs to expose these API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Connection test |
| `GET /api/items` | List all services/items |
| `GET /api/status` | Batch status for all items |
| `GET /api/categories` | List categories |

CORS must be enabled. See [API Specification](docs/API_SPEC.md) for full details and a reference Express.js implementation.

## License

MIT

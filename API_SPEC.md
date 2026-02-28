# BetterDash API Specification

This document defines the REST API endpoints that BetterDash must expose to support the Home Assistant HACS card.

## Base URL

All endpoints are relative to the BetterDash server URL, e.g. `http://192.168.1.100:3000`.

## Authentication

If the server is configured with an API key, all requests include:
```
Authorization: Bearer <api_key>
```

If no API key is set, requests are unauthenticated.

---

## Endpoints

### `GET /api/health`

Health check endpoint. Used by the card editor's "Test Connection" button.

**Response (200):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 86400
}
```

---

### `GET /api/items`

Returns all services/items configured on the BetterDash server.

**Response (200):**
```json
{
  "items": [
    {
      "id": "proxmox",
      "name": "Proxmox VE",
      "description": "Main hypervisor",
      "url": "https://192.168.1.10:8006",
      "category": "Infrastructure",
      "icon_slug": "proxmox",
      "icon_url": null,
      "icon": "server",
      "tags": ["hypervisor", "core"],
      "sort_order": 0
    },
    {
      "id": "portainer",
      "name": "Portainer",
      "description": "Docker management",
      "url": "https://192.168.1.10:9443",
      "category": "Infrastructure",
      "icon_slug": "portainer",
      "icon_url": null,
      "icon": "docker",
      "tags": ["docker"],
      "sort_order": 1
    }
  ]
}
```

**Item fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the item |
| `name` | string | ✅ | Display name |
| `description` | string | ❌ | Short description/subtitle |
| `url` | string | ❌ | Launch URL (clicked to open) |
| `category` | string | ❌ | Category name for grouping |
| `icon_slug` | string | ❌ | selfh.st icon slug (e.g. "proxmox", "grafana") |
| `icon_url` | string | ❌ | Full URL to a custom icon image |
| `icon` | string | ❌ | MDI icon name fallback (without "mdi:" prefix) |
| `tags` | string[] | ❌ | Tags for filtering/display |
| `sort_order` | number | ❌ | Sort priority (lower = first) |

**Icon resolution priority:** `icon_url` → `icon_slug` (selfh.st CDN) → `icon` (MDI) → default server icon

---

### `GET /api/items/:id/status`

Get the live status for a single item.

**Response (200):**
```json
{
  "id": "proxmox",
  "status": "online",
  "latency_ms": 12,
  "last_checked": "2026-02-28T19:30:00Z"
}
```

**Status values:** `"online"` | `"offline"` | `"unknown"`

---

### `GET /api/status`

Batch status check for all items. More efficient than calling per-item.

**Response (200):**
```json
{
  "statuses": [
    { "id": "proxmox", "status": "online", "latency_ms": 12 },
    { "id": "portainer", "status": "online", "latency_ms": 8 },
    { "id": "grafana", "status": "offline", "latency_ms": null }
  ],
  "checked_at": "2026-02-28T19:30:00Z"
}
```

---

### `GET /api/categories`

List all categories (useful for the editor to pre-populate filters).

**Response (200):**
```json
{
  "categories": [
    { "name": "Infrastructure", "icon": "server-network", "count": 5 },
    { "name": "Monitoring", "icon": "chart-line", "count": 3 },
    { "name": "Media", "icon": "play-circle", "count": 4 }
  ]
}
```

---

## CORS

BetterDash must include CORS headers to allow the Home Assistant frontend to make requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, OPTIONS
```

Or more restrictively, set `Access-Control-Allow-Origin` to your HA instance URL.

---

## Implementation Notes

If BetterDash is currently a client-side-only app (no backend API), these endpoints can be added as a lightweight Express/Fastify route layer that reads from the existing config file (e.g. `config.json` or `settings.yaml`).

Example Express implementation:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Load items from BetterDash config
const config = require('./config.json');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/api/items', (req, res) => {
  res.json({ items: config.servers || config.items || [] });
});

app.get('/api/status', async (req, res) => {
  const items = config.servers || config.items || [];
  const statuses = await Promise.all(items.map(async (item) => {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 5000);
      const resp = await fetch(item.url, { signal: ctrl.signal, method: 'HEAD' });
      clearTimeout(timeout);
      return { id: item.id, status: resp.ok ? 'online' : 'offline' };
    } catch {
      return { id: item.id, status: 'offline' };
    }
  }));
  res.json({ statuses, checked_at: new Date().toISOString() });
});

app.get('/api/categories', (req, res) => {
  const items = config.servers || config.items || [];
  const catMap = {};
  items.forEach(i => {
    const cat = i.category || 'Uncategorized';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  res.json({
    categories: Object.entries(catMap).map(([name, count]) => ({ name, count }))
  });
});

app.listen(3000, () => console.log('BetterDash API running on :3000'));
```

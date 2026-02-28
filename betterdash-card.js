/**
 * BetterDash Card for Home Assistant
 * A HACS-compatible Lovelace card that connects to a BetterDash server instance.
 * Fetches services/items from BetterDash and renders them as an interactive dashboard
 * within Home Assistant, with a full visual config editor.
 *
 * Version: 1.0.0
 * License: MIT
 */

const BETTERDASH_VERSION = '1.0.0';

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_STYLES = `
  :host {
    --bd-primary: var(--primary-color, #4dd0e1);
    --bd-bg: var(--ha-card-background, var(--card-background-color, #1a1a2e));
    --bd-text: var(--primary-text-color, #e0e0e0);
    --bd-text-secondary: var(--secondary-text-color, #9e9e9e);
    --bd-border: var(--divider-color, rgba(255,255,255,0.08));
    --bd-online: #4caf50;
    --bd-offline: #f44336;
    --bd-warning: #ff9800;
    --bd-unknown: #9e9e9e;
    --bd-card-bg: rgba(255,255,255,0.04);
    --bd-card-hover: rgba(255,255,255,0.08);
    --bd-radius: 12px;
    --bd-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Card Container ── */
  .bd-card {
    padding: 16px;
    font-family: var(--ha-card-header-font-family, inherit);
  }

  /* ── Header ── */
  .bd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
  }
  .bd-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .bd-logo {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--bd-primary), color-mix(in srgb, var(--bd-primary) 60%, #000));
    flex-shrink: 0;
  }
  .bd-logo svg {
    width: 16px;
    height: 16px;
    fill: #fff;
  }
  .bd-title {
    font-size: 1.1em;
    font-weight: 600;
    color: var(--bd-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bd-connection-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 20px;
    flex-shrink: 0;
    font-weight: 600;
  }
  .bd-connection-badge.connected {
    background: rgba(76, 175, 80, 0.15);
    color: var(--bd-online);
  }
  .bd-connection-badge.disconnected {
    background: rgba(244, 67, 54, 0.15);
    color: var(--bd-offline);
  }
  .bd-connection-badge.loading {
    background: rgba(255, 152, 0, 0.15);
    color: var(--bd-warning);
  }
  .bd-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .bd-connection-badge.connected .bd-status-dot {
    animation: bd-pulse 2s ease-in-out infinite;
  }

  /* ── Search ── */
  .bd-search {
    margin-bottom: 14px;
  }
  .bd-search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid var(--bd-border);
    border-radius: 8px;
    background: var(--bd-card-bg);
    color: var(--bd-text);
    font-size: 0.85em;
    outline: none;
    transition: border-color var(--bd-transition);
    box-sizing: border-box;
  }
  .bd-search-input:focus {
    border-color: var(--bd-primary);
  }
  .bd-search-wrap {
    position: relative;
  }
  .bd-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--bd-text-secondary);
    pointer-events: none;
    width: 16px;
    height: 16px;
  }

  /* ── Category ── */
  .bd-category {
    margin-bottom: 16px;
  }
  .bd-category-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    cursor: pointer;
    user-select: none;
    color: var(--bd-text-secondary);
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }
  .bd-category-header:hover {
    color: var(--bd-text);
  }
  .bd-category-chevron {
    transition: transform var(--bd-transition);
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  .bd-category-chevron.collapsed {
    transform: rotate(-90deg);
  }
  .bd-category-line {
    flex: 1;
    height: 1px;
    background: var(--bd-border);
  }
  .bd-category-count {
    font-size: 0.9em;
    opacity: 0.6;
  }

  /* ── Grid ── */
  .bd-grid {
    display: grid;
    grid-template-columns: repeat(var(--bd-columns, 3), 1fr);
    gap: 10px;
  }

  /* ── Service Card ── */
  .bd-service {
    background: var(--bd-card-bg);
    border: 1px solid var(--bd-border);
    border-radius: var(--bd-radius);
    padding: 14px;
    cursor: pointer;
    transition: all var(--bd-transition);
    position: relative;
    overflow: hidden;
  }
  .bd-service:hover {
    background: var(--bd-card-hover);
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-1px);
  }
  .bd-service-top {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 6px;
  }
  .bd-service-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.06);
    flex-shrink: 0;
    overflow: hidden;
  }
  .bd-service-icon img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  .bd-service-icon .mdi {
    font-size: 20px;
    color: var(--bd-primary);
  }
  .bd-service-info {
    flex: 1;
    min-width: 0;
  }
  .bd-service-name {
    font-size: 0.9em;
    font-weight: 600;
    color: var(--bd-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bd-service-desc {
    font-size: 0.72em;
    color: var(--bd-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }
  .bd-service-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }
  .bd-service-status.online {
    background: var(--bd-online);
    box-shadow: 0 0 6px rgba(76,175,80,0.5);
  }
  .bd-service-status.offline {
    background: var(--bd-offline);
    box-shadow: 0 0 6px rgba(244,67,54,0.4);
  }
  .bd-service-status.unknown {
    background: var(--bd-unknown);
  }

  .bd-service-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .bd-service-tag {
    font-size: 0.65em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.06);
    color: var(--bd-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* ── Loading / Error ── */
  .bd-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    color: var(--bd-text-secondary);
    font-size: 0.85em;
  }
  .bd-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--bd-border);
    border-top-color: var(--bd-primary);
    border-radius: 50%;
    animation: bd-spin 0.8s linear infinite;
  }
  .bd-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    gap: 8px;
    color: var(--bd-offline);
    font-size: 0.85em;
    text-align: center;
  }
  .bd-error-icon {
    font-size: 2em;
    margin-bottom: 4px;
  }
  .bd-retry-btn {
    margin-top: 8px;
    padding: 6px 16px;
    border: 1px solid var(--bd-border);
    border-radius: 6px;
    background: var(--bd-card-bg);
    color: var(--bd-text);
    cursor: pointer;
    font-size: 0.85em;
    transition: all var(--bd-transition);
  }
  .bd-retry-btn:hover {
    background: var(--bd-card-hover);
    border-color: var(--bd-primary);
  }

  /* ── Empty state ── */
  .bd-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    gap: 8px;
    color: var(--bd-text-secondary);
    font-size: 0.85em;
    text-align: center;
  }

  /* ── Animations ── */
  @keyframes bd-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bd-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes bd-fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .bd-animate-in {
    animation: bd-fadeIn 0.3s ease forwards;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .bd-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 400px) {
    .bd-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Editor Styles ────────────────────────────────────────────────────────────
const EDITOR_STYLES = `
  :host {
    --bd-primary: var(--primary-color, #4dd0e1);
    --bd-bg: var(--ha-card-background, var(--card-background-color, #1a1a2e));
    --bd-text: var(--primary-text-color, #e0e0e0);
    --bd-text-secondary: var(--secondary-text-color, #9e9e9e);
    --bd-border: var(--divider-color, rgba(255,255,255,0.12));
    --bd-card-bg: rgba(255,255,255,0.04);
  }

  .editor {
    padding: 16px;
    font-family: var(--ha-card-header-font-family, inherit);
  }

  /* ── Sections ── */
  .editor-section {
    margin-bottom: 20px;
    border: 1px solid var(--bd-border);
    border-radius: 10px;
    overflow: hidden;
  }
  .editor-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: var(--bd-card-bg);
    font-weight: 600;
    font-size: 0.9em;
    color: var(--bd-text);
    cursor: pointer;
    user-select: none;
  }
  .editor-section-header:hover {
    background: rgba(255,255,255,0.06);
  }
  .editor-section-body {
    padding: 14px;
  }
  .editor-section-body.collapsed {
    display: none;
  }

  /* ── Form Fields ── */
  .field {
    margin-bottom: 14px;
  }
  .field:last-child {
    margin-bottom: 0;
  }
  .field-label {
    display: block;
    font-size: 0.78em;
    font-weight: 600;
    color: var(--bd-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .field-hint {
    font-size: 0.72em;
    color: var(--bd-text-secondary);
    opacity: 0.7;
    margin-top: 4px;
  }
  .field-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .field-row .field {
    flex: 1;
  }

  input[type="text"],
  input[type="number"],
  input[type="url"],
  input[type="password"],
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--bd-border);
    border-radius: 8px;
    background: var(--bd-card-bg);
    color: var(--bd-text);
    font-size: 0.85em;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    font-family: inherit;
  }
  input:focus, select:focus {
    border-color: var(--bd-primary);
  }
  input::placeholder {
    color: var(--bd-text-secondary);
    opacity: 0.5;
  }

  /* ── Toggle ── */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
  }
  .toggle-label {
    font-size: 0.85em;
    color: var(--bd-text);
  }
  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
    cursor: pointer;
  }
  .toggle-switch input {
    display: none;
  }
  .toggle-track {
    position: absolute;
    inset: 0;
    border-radius: 11px;
    background: var(--bd-border);
    transition: background 0.2s;
  }
  .toggle-switch input:checked + .toggle-track {
    background: var(--bd-primary);
  }
  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
    pointer-events: none;
  }
  .toggle-switch input:checked ~ .toggle-thumb {
    transform: translateX(18px);
  }

  /* ── Connection Test ── */
  .test-btn {
    padding: 8px 16px;
    border: 1px solid var(--bd-primary);
    border-radius: 8px;
    background: transparent;
    color: var(--bd-primary);
    cursor: pointer;
    font-size: 0.82em;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .test-btn:hover {
    background: rgba(77, 208, 225, 0.1);
  }
  .test-btn.success {
    border-color: #4caf50;
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
  }
  .test-btn.error {
    border-color: #f44336;
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
  }

  /* ── Items List ── */
  .items-list {
    border: 1px solid var(--bd-border);
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
  }
  .items-list-empty {
    padding: 20px;
    text-align: center;
    color: var(--bd-text-secondary);
    font-size: 0.82em;
  }
  .item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--bd-border);
    transition: background 0.15s;
  }
  .item-row:last-child {
    border-bottom: none;
  }
  .item-row:hover {
    background: var(--bd-card-bg);
  }
  .item-check {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid var(--bd-border);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .item-check.checked {
    background: var(--bd-primary);
    border-color: var(--bd-primary);
  }
  .item-check svg {
    width: 12px;
    height: 12px;
    fill: #fff;
    opacity: 0;
  }
  .item-check.checked svg {
    opacity: 1;
  }
  .item-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .item-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .item-info {
    flex: 1;
    min-width: 0;
  }
  .item-name {
    font-size: 0.85em;
    font-weight: 500;
    color: var(--bd-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-url {
    font-size: 0.7em;
    color: var(--bd-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-category {
    font-size: 0.65em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.06);
    color: var(--bd-text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .fetch-items-btn {
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--bd-border);
    border-radius: 8px;
    background: transparent;
    color: var(--bd-text-secondary);
    cursor: pointer;
    font-size: 0.82em;
    transition: all 0.2s;
    margin-top: 10px;
  }
  .fetch-items-btn:hover {
    border-color: var(--bd-primary);
    color: var(--bd-primary);
  }

  .select-all-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid var(--bd-border);
    background: var(--bd-card-bg);
    font-size: 0.78em;
    color: var(--bd-text-secondary);
  }
  .select-all-row button {
    background: none;
    border: none;
    color: var(--bd-primary);
    cursor: pointer;
    font-size: 1em;
    padding: 2px 6px;
    font-family: inherit;
  }
  .select-all-row button:hover {
    text-decoration: underline;
  }
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SVG = {
  logo: `<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4V4m10 0h6v6h-6V4M4 14h6v6H4v-6m10 0h6v6h-6v-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 1h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2m0 14h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m2-8a1 1 0 100-2 1 1 0 000 2m0 14a1 1 0 100-2 1 1 0 000 2"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
};

// ─── BetterDash API Client ────────────────────────────────────────────────────

class BetterDashAPI {
  constructor(baseUrl, apiKey = null) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  async _fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Accept': 'application/json',
      ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}),
      ...(options.headers || {}),
    };
    const resp = await fetch(url, { ...options, headers, mode: 'cors' });
    if (!resp.ok) {
      throw new Error(`BetterDash API error: ${resp.status} ${resp.statusText}`);
    }
    return resp.json();
  }

  /** GET /api/health — check server connectivity */
  async health() {
    return this._fetch('/api/health');
  }

  /** GET /api/items — list all services/items on the BetterDash server */
  async getItems() {
    return this._fetch('/api/items');
  }

  /** GET /api/items/:id/status — get live status for a single item */
  async getItemStatus(id) {
    return this._fetch(`/api/items/${encodeURIComponent(id)}/status`);
  }

  /** GET /api/categories — list all categories */
  async getCategories() {
    return this._fetch('/api/categories');
  }

  /** GET /api/status — batch status for all items */
  async getAllStatus() {
    return this._fetch('/api/status');
  }
}

// ─── Main Card ────────────────────────────────────────────────────────────────

class BetterDashCard extends HTMLElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._items = [];
    this._statuses = {};
    this._connectionState = 'loading'; // 'connected' | 'disconnected' | 'loading'
    this._error = null;
    this._searchTerm = '';
    this._collapsedCategories = new Set();
    this._pollTimer = null;
    this._api = null;
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    if (!config.server_url) {
      throw new Error('Please configure a BetterDash server URL');
    }
    this._config = {
      title: 'BetterDash',
      server_url: '',
      api_key: '',
      columns: 3,
      show_search: true,
      show_categories: true,
      show_status: true,
      poll_interval: 30,
      selected_items: [], // empty = show all
      open_in_new_tab: true,
      ...config,
    };
    this._api = new BetterDashAPI(this._config.server_url, this._config.api_key);
    this._fetchData();
  }

  connectedCallback() {
    this._startPolling();
  }

  disconnectedCallback() {
    this._stopPolling();
  }

  _startPolling() {
    this._stopPolling();
    const interval = Math.max(10, this._config.poll_interval || 30) * 1000;
    this._pollTimer = setInterval(() => this._fetchData(), interval);
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  async _fetchData() {
    if (!this._api || !this._config.server_url) return;
    try {
      this._connectionState = 'loading';
      this._render();

      const [itemsResp, statusResp] = await Promise.all([
        this._api.getItems().catch(() => null),
        this._api.getAllStatus().catch(() => null),
      ]);

      if (itemsResp) {
        // Normalize: API might return { items: [...] } or just [...]
        this._items = Array.isArray(itemsResp) ? itemsResp : (itemsResp.items || []);
      }

      if (statusResp) {
        const statuses = Array.isArray(statusResp) ? statusResp : (statusResp.statuses || statusResp);
        if (Array.isArray(statuses)) {
          this._statuses = {};
          statuses.forEach(s => { this._statuses[s.id] = s.status; });
        } else if (typeof statuses === 'object') {
          this._statuses = statuses;
        }
      }

      this._connectionState = 'connected';
      this._error = null;
    } catch (err) {
      this._connectionState = 'disconnected';
      this._error = err.message;
    }
    this._render();
  }

  _getFilteredItems() {
    let items = [...this._items];

    // Only show items the user has explicitly selected
    if (!this._config.selected_items || this._config.selected_items.length === 0) {
      return [];
    }
    const selectedSet = new Set(this._config.selected_items);
    items = items.filter(i => selectedSet.has(i.id));

    // Search filter
    if (this._searchTerm) {
      const term = this._searchTerm.toLowerCase();
      items = items.filter(i =>
        (i.name || '').toLowerCase().includes(term) ||
        (i.description || '').toLowerCase().includes(term) ||
        (i.category || '').toLowerCase().includes(term) ||
        (i.url || '').toLowerCase().includes(term)
      );
    }

    return items;
  }

  _getGroupedItems(items) {
    const groups = {};
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }

  _getStatusClass(item) {
    const status = this._statuses[item.id];
    if (!status) return 'unknown';
    if (status === 'online' || status === 'healthy' || status === true) return 'online';
    if (status === 'offline' || status === 'unhealthy' || status === false) return 'offline';
    return 'unknown';
  }

  _resolveIcon(item) {
    if (item.icon_url) return `<img src="${item.icon_url}" alt="">`;
    if (item.icon_slug) return `<img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${item.icon_slug}.svg" alt="">`;
    if (item.icon) return `<span class="mdi mdi-${item.icon}"></span>`;
    return `<span class="mdi mdi-server"></span>`;
  }

  _handleServiceClick(item) {
    if (item.url) {
      if (this._config.open_in_new_tab) {
        window.open(item.url, '_blank', 'noopener');
      } else {
        window.location.href = item.url;
      }
    }
  }

  _render() {
    const items = this._getFilteredItems();
    const grouped = this._config.show_categories ? this._getGroupedItems(items) : { _all: items };

    this.shadowRoot.innerHTML = `
      <style>${CARD_STYLES}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
      <ha-card>
        <div class="bd-card">
          ${this._renderHeader()}
          ${this._connectionState === 'loading' && this._items.length === 0
            ? this._renderLoading()
            : this._error && this._items.length === 0
              ? this._renderError()
              : `
                ${this._config.show_search ? this._renderSearch() : ''}
                ${items.length === 0 && this._searchTerm
                  ? `<div class="bd-empty">No items match "${this._searchTerm}"</div>`
                  : items.length === 0
                    ? `<div class="bd-empty">${SVG.server}<div>No items selected. Open card settings to choose items to display.</div></div>`
                    : this._config.show_categories
                      ? Object.entries(grouped).map(([cat, catItems]) => this._renderCategory(cat, catItems)).join('')
                      : `<div class="bd-grid" style="--bd-columns:${this._config.columns}">${items.map(i => this._renderServiceCard(i)).join('')}</div>`
                }
              `
          }
        </div>
      </ha-card>
    `;

    // Bind events
    this.shadowRoot.querySelectorAll('.bd-service').forEach(el => {
      const id = el.dataset.id;
      const item = this._items.find(i => i.id === id);
      if (item) el.addEventListener('click', () => this._handleServiceClick(item));
    });

    const searchInput = this.shadowRoot.querySelector('.bd-search-input');
    if (searchInput) {
      searchInput.value = this._searchTerm;
      searchInput.addEventListener('input', (e) => {
        this._searchTerm = e.target.value;
        this._render();
      });
    }

    this.shadowRoot.querySelectorAll('.bd-category-header').forEach(el => {
      el.addEventListener('click', () => {
        const cat = el.dataset.category;
        if (this._collapsedCategories.has(cat)) {
          this._collapsedCategories.delete(cat);
        } else {
          this._collapsedCategories.add(cat);
        }
        this._render();
      });
    });

    const retryBtn = this.shadowRoot.querySelector('.bd-retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => this._fetchData());
  }

  _renderHeader() {
    return `
      <div class="bd-header">
        <div class="bd-header-left">
          <div class="bd-logo">${SVG.logo}</div>
          <span class="bd-title">${this._config.title}</span>
        </div>
        <div class="bd-connection-badge ${this._connectionState}">
          <span class="bd-status-dot"></span>
          ${this._connectionState === 'connected' ? 'Connected' : this._connectionState === 'loading' ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>
    `;
  }

  _renderSearch() {
    return `
      <div class="bd-search">
        <div class="bd-search-wrap">
          <span class="bd-search-icon">${SVG.search}</span>
          <input type="text" class="bd-search-input" placeholder="Search services...">
        </div>
      </div>
    `;
  }

  _renderCategory(category, items) {
    const isCollapsed = this._collapsedCategories.has(category);
    return `
      <div class="bd-category">
        <div class="bd-category-header" data-category="${category}">
          <span class="bd-category-chevron ${isCollapsed ? 'collapsed' : ''}">${SVG.chevron}</span>
          <span>${category}</span>
          <span class="bd-category-line"></span>
          <span class="bd-category-count">${items.length}</span>
        </div>
        ${!isCollapsed ? `
          <div class="bd-grid" style="--bd-columns:${this._config.columns}">
            ${items.map((item, i) => this._renderServiceCard(item, i)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderServiceCard(item, index = 0) {
    const statusClass = this._config.show_status ? this._getStatusClass(item) : '';
    return `
      <div class="bd-service bd-animate-in" data-id="${item.id}" style="animation-delay:${index * 0.04}s">
        <div class="bd-service-top">
          <div class="bd-service-icon">${this._resolveIcon(item)}</div>
          <div class="bd-service-info">
            <div class="bd-service-name">${item.name || 'Unnamed'}</div>
            ${item.description ? `<div class="bd-service-desc">${item.description}</div>` : ''}
          </div>
          ${this._config.show_status ? `<div class="bd-service-status ${statusClass}"></div>` : ''}
        </div>
        ${item.tags && item.tags.length ? `
          <div class="bd-service-meta">
            ${item.tags.map(t => `<span class="bd-service-tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderLoading() {
    return `<div class="bd-loading"><div class="bd-spinner"></div><span>Connecting to BetterDash...</span></div>`;
  }

  _renderError() {
    return `
      <div class="bd-error">
        <span class="bd-error-icon">${SVG.alert}</span>
        <strong>Cannot connect to BetterDash</strong>
        <span>${this._error || 'Connection failed'}</span>
        <button class="bd-retry-btn">Retry</button>
      </div>
    `;
  }

  getCardSize() {
    return Math.max(3, Math.ceil(this._items.length / (this._config.columns || 3)) + 1);
  }

  static getConfigElement() {
    return document.createElement('betterdash-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'BetterDash',
      server_url: 'http://192.168.1.100:3000',
      columns: 3,
      show_search: true,
      show_categories: true,
      show_status: true,
      poll_interval: 30,
      selected_items: [],
      open_in_new_tab: true,
    };
  }
}

// ─── Card Editor ──────────────────────────────────────────────────────────────

class BetterDashCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._fetchedItems = [];
    this._testState = ''; // '' | 'testing' | 'success' | 'error'
    this._testMsg = '';
    this._sectionState = { server: true, display: true, items: true };
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = {
      title: 'BetterDash',
      server_url: '',
      api_key: '',
      columns: 3,
      show_search: true,
      show_categories: true,
      show_status: true,
      poll_interval: 30,
      selected_items: [],
      open_in_new_tab: true,
      ...config,
    };
    this._render();
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true,
    }));
  }

  _updateConfig(key, value) {
    this._config = { ...this._config, [key]: value };
    this._dispatch();
    this._render();
  }

  async _testConnection() {
    this._testState = 'testing';
    this._testMsg = '';
    this._render();
    try {
      const api = new BetterDashAPI(this._config.server_url, this._config.api_key);
      await api.health();
      this._testState = 'success';
      this._testMsg = 'Connected successfully!';
    } catch (err) {
      this._testState = 'error';
      this._testMsg = err.message || 'Connection failed';
    }
    this._render();
  }

  async _fetchItems() {
    try {
      const api = new BetterDashAPI(this._config.server_url, this._config.api_key);
      const resp = await api.getItems();
      this._fetchedItems = Array.isArray(resp) ? resp : (resp.items || []);
    } catch (err) {
      this._fetchedItems = [];
    }
    this._render();
  }

  _toggleItem(id) {
    const selected = new Set(this._config.selected_items || []);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this._updateConfig('selected_items', [...selected]);
  }

  _selectAll() {
    this._updateConfig('selected_items', this._fetchedItems.map(i => i.id));
  }

  _selectNone() {
    this._updateConfig('selected_items', []);
  }

  _toggleSection(section) {
    this._sectionState[section] = !this._sectionState[section];
    this._render();
  }

  _render() {
    const c = this._config;
    const selectedSet = new Set(c.selected_items || []);

    this.shadowRoot.innerHTML = `
      <style>${EDITOR_STYLES}</style>
      <div class="editor">

        <!-- Server Connection -->
        <div class="editor-section">
          <div class="editor-section-header" data-section="server">
            🔌 Server Connection
          </div>
          <div class="editor-section-body ${this._sectionState.server ? '' : 'collapsed'}">
            <div class="field">
              <label class="field-label">BetterDash Server URL</label>
              <input type="url" id="server_url" value="${c.server_url || ''}" placeholder="http://192.168.1.100:3000">
              <div class="field-hint">The URL of your BetterDash server instance</div>
            </div>
            <div class="field">
              <label class="field-label">API Key (optional)</label>
              <input type="password" id="api_key" value="${c.api_key || ''}" placeholder="Leave empty if not required">
              <div class="field-hint">Authentication key if your BetterDash server requires one</div>
            </div>
            <div class="field">
              <div class="field-row">
                <div class="field">
                  <label class="field-label">Poll Interval (seconds)</label>
                  <input type="number" id="poll_interval" value="${c.poll_interval || 30}" min="10" max="3600">
                </div>
                <button class="test-btn ${this._testState}" id="test-btn">
                  ${this._testState === 'testing' ? 'Testing...' : this._testState === 'success' ? '✓ Connected' : this._testState === 'error' ? '✗ Failed' : 'Test Connection'}
                </button>
              </div>
              ${this._testMsg ? `<div class="field-hint" style="color: ${this._testState === 'success' ? '#4caf50' : '#f44336'}">${this._testMsg}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="editor-section">
          <div class="editor-section-header" data-section="display">
            🎨 Display Settings
          </div>
          <div class="editor-section-body ${this._sectionState.display ? '' : 'collapsed'}">
            <div class="field">
              <label class="field-label">Card Title</label>
              <input type="text" id="title" value="${c.title || ''}" placeholder="BetterDash">
            </div>
            <div class="field">
              <label class="field-label">Columns</label>
              <select id="columns">
                ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${c.columns == n ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <div class="toggle-row">
                <span class="toggle-label">Show Search Bar</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="show_search" ${c.show_search ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Group by Category</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="show_categories" ${c.show_categories ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Show Status Indicators</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="show_status" ${c.show_status ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
              <div class="toggle-row">
                <span class="toggle-label">Open Links in New Tab</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="open_in_new_tab" ${c.open_in_new_tab ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Item Selection -->
        <div class="editor-section">
          <div class="editor-section-header" data-section="items">
            📋 Item Selection
          </div>
          <div class="editor-section-body ${this._sectionState.items ? '' : 'collapsed'}">
            <div class="field-hint" style="margin-bottom: 10px;">
              Select which items from your BetterDash server to display. Only checked items will be shown.
            </div>
            ${this._fetchedItems.length > 0 ? `
              <div class="items-list">
                <div class="select-all-row">
                  <span>${selectedSet.size} of ${this._fetchedItems.length} selected</span>
                  <div>
                    <button id="select-all">Select All</button>
                    <button id="select-none">Clear</button>
                  </div>
                </div>
                ${this._fetchedItems.map(item => `
                  <div class="item-row" data-id="${item.id}">
                    <div class="item-check ${selectedSet.has(item.id) ? 'checked' : ''}" data-id="${item.id}">
                      ${SVG.check}
                    </div>
                    ${item.icon_slug || item.icon_url ? `
                      <div class="item-icon">
                        <img src="${item.icon_url || `https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${item.icon_slug}.svg`}" alt="">
                      </div>
                    ` : ''}
                    <div class="item-info">
                      <div class="item-name">${item.name || item.id}</div>
                      ${item.url ? `<div class="item-url">${item.url}</div>` : ''}
                    </div>
                    ${item.category ? `<span class="item-category">${item.category}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="items-list">
                <div class="items-list-empty">
                  ${c.server_url ? 'No items fetched yet. Click below to load items from your BetterDash server.' : 'Configure a server URL first, then fetch items.'}
                </div>
              </div>
            `}
            <button class="fetch-items-btn" id="fetch-items" ${!c.server_url ? 'disabled' : ''}>
              ${this._fetchedItems.length > 0 ? '↻ Refresh Items from Server' : '↓ Fetch Items from BetterDash Server'}
            </button>
          </div>
        </div>

      </div>
    `;

    // ── Bind events ──
    const bind = (id, event, handler) => {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.addEventListener(event, handler);
    };

    bind('server_url', 'change', (e) => this._updateConfig('server_url', e.target.value.trim()));
    bind('api_key', 'change', (e) => this._updateConfig('api_key', e.target.value.trim()));
    bind('title', 'change', (e) => this._updateConfig('title', e.target.value));
    bind('columns', 'change', (e) => this._updateConfig('columns', parseInt(e.target.value)));
    bind('poll_interval', 'change', (e) => this._updateConfig('poll_interval', Math.max(10, parseInt(e.target.value) || 30)));

    bind('show_search', 'change', (e) => this._updateConfig('show_search', e.target.checked));
    bind('show_categories', 'change', (e) => this._updateConfig('show_categories', e.target.checked));
    bind('show_status', 'change', (e) => this._updateConfig('show_status', e.target.checked));
    bind('open_in_new_tab', 'change', (e) => this._updateConfig('open_in_new_tab', e.target.checked));

    bind('test-btn', 'click', () => this._testConnection());
    bind('fetch-items', 'click', () => this._fetchItems());
    bind('select-all', 'click', () => this._selectAll());
    bind('select-none', 'click', () => this._selectNone());

    // Section toggles
    this.shadowRoot.querySelectorAll('.editor-section-header').forEach(el => {
      el.addEventListener('click', () => this._toggleSection(el.dataset.section));
    });

    // Item checkboxes
    this.shadowRoot.querySelectorAll('.item-check').forEach(el => {
      el.addEventListener('click', () => this._toggleItem(el.dataset.id));
    });
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

customElements.define('betterdash-card', BetterDashCard);
customElements.define('betterdash-card-editor', BetterDashCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'betterdash-card',
  name: 'BetterDash Card',
  description: 'Connect to a BetterDash server to display your homelab services with status monitoring.',
  preview: true,
  documentationURL: 'https://github.com/gpalmer78/betterdash-card',
});

console.info(
  `%c BETTERDASH-CARD %c v${BETTERDASH_VERSION} `,
  'color: #fff; background: #4dd0e1; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #4dd0e1; background: #1a1a2e; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);

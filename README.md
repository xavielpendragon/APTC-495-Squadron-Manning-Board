# Squadron Manning Board

A browser-based, offline-first personnel readiness management system for USAF munitions units.

---

## Project Structure

```
/
├── index.html              # Entry point — UI shell, login overlay, all panels
├── style.css               # Dark-theme stylesheet
├── js/
│   ├── main.js             # Core application logic, rendering, modals, panels
│   ├── state.js            # PouchDB persistence, authentication, undo stack, What-If mode, sync engine
│   ├── config.js           # Branch definitions, section/position/qualification data
│   ├── dragDrop.js         # Drag-and-drop assignment with qualification enforcement
│   ├── importExport.js     # CSV import/export and PDF generation
│   ├── metrics.js          # Centralized readiness and manning calculations
│   └── pouchdb.min.js      # PouchDB library (bundled, no CDN required)
└── import.csv              # Sample squadron roster for import
```

---

## Running the App

Open `index.html` in a browser. No build step, no server, no install required.

> **Note:** Because the app uses ES modules (`type="module"`), it must be served
> over HTTP — not opened directly as a `file://` path. Use one of:
>
> - **VS Code Live Server** extension (recommended)
> - **Python:** `python -m http.server 8080` then open `http://localhost:8080`
> - **GitHub Pages:** push to main branch, enable Pages in repo Settings

---

## Login Credentials

| Username | Password   | Role  | Access                                          |
|----------|------------|-------|-------------------------------------------------|
| admin    | admin123   | Admin | Full access — add/delete sections, reset        |
| user     | user123    | User  | Read + add/remove personnel, no structural edits|

Credentials are defined in `js/state.js` in the `CREDENTIALS` object.
For production deployment, replace with a proper authentication backend.

---

## Features

| Feature | Description |
|---|---|
| Drag & drop assignment | Drag personnel cards between section slots and the staging pool |
| Section dropdown | Add/Edit modal includes section + slot assignment with optgroup layout |
| Section rename | Admin: click section title to rename inline |
| Slot rename | Admin: double-click slot label to rename |
| % Section Readiness | Each section shows available vs authorized in real time |
| Centralized readiness engine |
| All board and section manning calculations are performed through metrics.js to ensure consistency across dashboards, alerts, exports, and readiness displays |
| Readiness % is calculated from the personnel available and assigned. TDY, Medical, Leave, and Deployed personnel are excluded from readiness calculations |
| DEROS panel | On-demand list of personnel rotating within 12 months |
| Deployed panel | All personnel with `status: deployed` in one view |
| Action log | Session audit trail — every assign, edit, delete, import, reset |
| Undo (20 steps) | Ctrl+Z or programmatic undo across all mutations |
| What-If Mode - Create simulated board changes without affecting the live database |
| Commit or discard What-If Mode Scenarios |
| Promote simulated changes to the live board or restore the original board state |
| assignedDate | Auto-stamped when personnel are placed into a section |
| Section scroll | Sections with many slots scroll internally (max-height: 520px) |
| CSV import | Quote-aware parser supports Last, First name format |
| CSV export | Full roster download for backup and re-import |
| PDF export | Landscape A4 report with metrics, section summary, and full roster |
| PouchDB persistence | State saved to browser IndexedDB on every change |
| Remote sync | CouchDB/Cloudant sync engine — see below |
| Last Modified Tracking - Records who last saved the board and when |
| Session Persistence - Login sessions survive page refreshes using session storage |
| Unit Name Persistence - Unit title is saved and restored with board state |
| PDF exports use the editable Unit Name rather than a hardcoded squadron name
| Supports section and slot assignments during import |
| Import process can create missing sections referenced in CSV files |
| Slot/position assignments can be imported directly from CSV |

---

## Database Architecture

### Local Storage (Always Active)

The app uses **PouchDB** backed by the browser's **IndexedDB** as its primary
persistence layer. All state is stored locally under the key `manning_board_db`.

- Persists across browser sessions and page reloads
- Works fully offline — no internet connection required
- ~5MB practical limit per browser origin
- Data survives browser close; cleared only by Reset or browser cache wipe

```
User Action → state.js saveState() → PouchDB (IndexedDB) → persisted
Page Load   → state.js loadState() → PouchDB (IndexedDB) → restored
```

### Remote Sync (Optional — CouchDB / Cloudant)

The sync engine in `state.js` implements **bidirectional replication** between
the local PouchDB instance and a remote CouchDB-compatible server.

```
Local PouchDB ──────────────────────────── Remote CouchDB / Cloudant
     │                                              │
     │◄──── startSync() live bidirectional ────────►│
     │                                              │
  saveState()                               any other client
  (every mutation)                          saves a change
     │                                              │
     ▼                                              ▼
IndexedDB                                   CouchDB document
(this browser)                              (shared, persistent)
```

**Sync behaviour:**
- `live: true` — persistent connection, changes replicate within milliseconds
- `retry: true` — automatically reconnects if the network drops
- Offline-first — local writes queue and sync when connection restores
- Conflict resolution — PouchDB uses CouchDB's MVCC model (last write wins by default)

---

## Enabling Remote Sync

### Step 1 — Get a CouchDB endpoint

**Option A: IBM Cloudant (free tier, no install)**
1. Sign up at [cloudant.com](https://www.ibm.com/cloud/cloudant)
2. Create a database named `manning_board`
3. Go to **Service Credentials → New Credential → Manager role**
4. Copy the `url`, `username`, and `password` from the generated JSON

**Option B: Self-hosted CouchDB**
1. Download and install CouchDB from [couchdb.apache.org](https://couchdb.apache.org/#download)
2. Open Fauxton at `http://localhost:5984/_utils`
3. Create a database named `manning_board`
4. Note your admin username and password from setup

### Step 2 — Configure CORS on the CouchDB server

The browser will block sync requests unless CORS is enabled on the CouchDB server.

In CouchDB Fauxton → Configuration → CORS:

```
Enable CORS: ✓
Origins:     https://your-username.github.io  (or * for dev)
Methods:     GET, PUT, POST, DELETE, OPTIONS
Headers:     Accept, Authorization, Content-Type, Origin
```

For Cloudant: go to Dashboard → Account → CORS and add your origin.

### Step 3 — Edit sync-config.js

```js
export const SYNC_CONFIG = {
  SYNC_ENABLED: true,                              // ← flip to true
  REMOTE_URL:   'https://your-account.cloudant.com/manning_board',
  USERNAME:     'your-api-key-here',
  PASSWORD:     'your-api-password-here',
  LIVE:         true,
  RETRY:        true,
  DIRECTION:    'sync',                            // bidirectional
};
```

### Step 4 — Reload the app

After login, `initializeApp()` calls `startSync()` automatically.
The sync status indicator appears next to the unit name in the header:

| Indicator | Meaning |
|---|---|
| *(blank)* | Sync disabled (SYNC_ENABLED: false) |
| `⟳ Syncing` | Actively replicating changes |
| `✓ Synced` | Up to date, waiting for changes |
| `✗ Sync err` | Connection error — check console |

---

## Requirement Traceability

| Requirement | Implementation |
|---|---|
| Local database environment | PouchDB / IndexedDB in `state.js` |
| Self-contained, no external connectivity required | All JS bundled locally, PouchDB offline-first |
| Local DB-backed storage, retrieval, and persistence | `saveState()` / `loadState()` / PouchDB CRUD |
| Remote DB for consistency | `startSync()` in `state.js`, configured via `sync-config.js` |
| Authorized access only | Login overlay, session-based roles, admin gate on destructive actions |
| Qual-based assignment enforcement (REQ-4 / 5.2.2) | `validateAssignment()` in `main.js`, enforced in `dragDrop.js` and `savePerson()` |
Automated readiness calculation | metrics.js central readiness engine used by renderMetrics(), renderSections(), alerts, exports, and dashboards

---

## Development Notes

**Adding a new branch (Army, Navy, etc.):**
Add a new key to the `BRANCHES` object in `config.js` following the USAF pattern.
No other files need to change.

**Changing credentials:**
Edit the `CREDENTIALS` object in `js/state.js`.

**Adjusting section scroll height:**
Change `max-height` on `.slots-scroll` in `style.css` (currently `520px` ≈ 5 slots).

**Disabling sync:**
Set `SYNC_ENABLED: false` in `sync-config.js` — the app runs identically with local-only storage.

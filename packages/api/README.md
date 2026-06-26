# Warhammer 40k API

Community REST API for Warhammer 40,000 10th Edition game data, powered by [Wahapedia](https://wahapedia.ru/) data exports.

Built on [Cloudflare Workers](https://workers.cloudflare.com/) with [Hono](https://hono.dev/).

## Response Format

All endpoints return a consistent envelope:

```json
{
  "status": "success",
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "status": "error",
  "data": null,
  "error": "Description of what went wrong"
}
```

## Caching

All responses are cached at the Cloudflare edge for **24 hours**. Upstream data fetches from GitHub are also cached for 24 hours via Cloudflare's subrequest caching.

The `X-Cache` header indicates `HIT` or `MISS`.

---

## Endpoints

### Root

#### `GET /`

Returns API info and a list of available endpoints.

#### `GET /metadata`

Returns data version info (last update timestamp, data source, edition).

```json
{
  "lastUpdate": "2026-03-05 15:58:46",
  "generatedAt": "2026-03-06T20:29:14.972Z",
  "source": "https://wahapedia.ru/wh40k10ed/the-rules/data-export",
  "edition": "10th",
  "fileCount": 19
}
```

---

### Factions

#### `GET /factions`

Returns all factions with datasheet counts.

```json
[
  {
    "id": "SM",
    "name": "Space Marines",
    "slug": "space-marines",
    "datasheetCount": 298,
    "fun_to_play": 65,
    "ease_of_play": 85,
    "army_size": 63,
    "cost_effective": 78,
    "ease_of_painting": 85,
    "games_workshop_support": 95,
    "community": 98,
    "model_variety": 39,
    "creators_aesthetic_preference": 30,
    "color": "#3B82F6",
    "icon": "https://raw.githubusercontent.com/certseeds/wh40k-icon/master/src/svgs/human_imperium/adeptus-astartes.svg",
    "description": "There is no combat theatre in which the Space Marines cannot excel, no foe they cannot overcome, and no danger they fear to face. They are the elite shock troops of the Imperium, whose lightning-fast campaigns are conducted with such spectacular brutality that they have come to be known as the Angels of Death."
  }
]
```

**Score fields** (included on both list and detail endpoints):

| Field | Description |
|-------|-------------|
| `fun_to_play` | How fun the army is to play *against* (0–100, 100 = very fun) |
| `ease_of_play` | How easy the army is to play (0–100, 100 = very easy) |
| `army_size` | Typical model count in a 2,000 pt army (0–100, 100 = very few models, 0 = horde) |
| `cost_effective` | How affordable it is to build a full army (0–100, 100 = very cheap) |
| `ease_of_painting` | How easy the models are to paint (0–100, 100 = very easy) |
| `games_workshop_support` | How well Games Workshop supports the faction with new releases, balance, and marketing (0–100) |
| `community` | How large and active the faction's dedicated fan community is — based primarily on dedicated subreddit size/activity, plus other community signals (0–100, 100 = largest, most active community) |
| `model_variety` | How visually and creatively varied the faction's models are from one another, i.e. how different they look and paint across the army (0–100, 100 = every unit is distinct and fresh to paint, 0 = the same body/panels/scheme repeated, very repetitive). Independent of painting difficulty. |
| `creators_aesthetic_preference` | How much the API creator personally likes the army's aesthetic (0–100) |
| `color` | Hex color representing the faction (e.g. `#3B82F6`), suitable for display on dark backgrounds |
| `icon` | URL to an SVG icon/logo for the faction |
| `description` | Short lore description of the faction (1–3 sentences) |

#### `GET /factions/:slug`

Returns a faction manifest including its full datasheet index.

**Parameters:**
- `slug` — Faction slug (e.g. `space-marines`, `orks`, `necrons`)

```json
{
  "id": "ORK",
  "name": "Orks",
  "slug": "orks",
  "link": "https://wahapedia.ru/wh40k10ed/factions/orks",
  "datasheetCount": 86,
  "fun_to_play": 85,
  "ease_of_play": 65,
  "army_size": 8,
  "cost_effective": 35,
  "ease_of_painting": 63,
  "games_workshop_support": 75,
  "community": 83,
  "model_variety": 84,
  "creators_aesthetic_preference": 70,
    "color": "#22C55E",
    "icon": "https://raw.githubusercontent.com/certseeds/wh40k-icon/master/src/svgs/xenos/orks/orks.svg",
    "description": "Tough, brutal, and impossibly numerous, the Orks are one of the most dangerous species in the galaxy. Their marauding warbands and colossal hordes have threatened Humanity since before the dawn of the Imperium, for Orks thrive on battle and mayhem, roaming the stars in search of a good fight.",
    "datasheets": [
    { "id": "000000001", "name": "Warboss", "slug": "warboss", "role": "Characters" }
  ]
}
```

#### `GET /factions/:slug/datasheets`

Returns just the datasheet summary list for a faction (id, name, slug, role).

---

### Datasheets

#### `GET /datasheets/:id`

Returns a fully denormalized datasheet with all related data: model stats, wargear/weapons, abilities, keywords, options, unit composition, points costs, and leader attachments.

**Parameters:**
- `id` — Datasheet ID (e.g. `000000001`)

**Response includes:**

| Field | Description |
|-------|-------------|
| `models[]` | Model stat lines (M, T, Sv, W, Ld, OC, invulnerable save, base size) |
| `wargear[]` | Weapon profiles (range, type, attacks, BS/WS, strength, AP, damage) |
| `abilities[]` | All abilities (Core, Faction, Datasheet) with descriptions |
| `keywords[]` | Keywords and faction keywords |
| `options[]` | Wargear options / alternative loadouts |
| `unitComposition[]` | Unit composition descriptions |
| `costs[]` | Points costs per model count |
| `leaderAttachments[]` | Units this leader can attach to |

#### `GET /datasheets/search?q=query`

Search datasheets by name (case-insensitive partial match).

**Query parameters:**
- `q` (required) — Search term

```json
[
  {
    "id": "000000460",
    "name": "Hive Tyrant",
    "factionId": "TYR",
    "slug": "hive-tyrant",
    "role": "Characters"
  }
]
```

---

### Stratagems

#### `GET /stratagems`

Returns all stratagems. Supports filtering.

**Query parameters:**
- `factionId` (optional) — Filter by faction ID (e.g. `SM`, `ORK`). Also includes generic (faction-less) stratagems.
- `detachment` (optional) — Filter by detachment name (e.g. `Gladius Task Force`)

```json
{
  "id": "000008335002",
  "factionId": "ORK",
  "name": "GET STUCK IN",
  "type": "Battle Tactic Stratagem",
  "cpCost": 1,
  "legend": "...",
  "turn": "Either player's turn",
  "phase": "Fight phase",
  "detachment": "War Horde",
  "detachmentId": "000000764",
  "description": "..."
}
```

#### `GET /stratagems/:id`

Returns a single stratagem by ID.

---

### Enhancements

#### `GET /enhancements`

Returns all enhancements. Supports filtering.

**Query parameters:**
- `factionId` (optional) — Filter by faction ID
- `detachment` (optional) — Filter by detachment name

```json
{
  "id": "000008395002",
  "factionId": "AC",
  "name": "Auric Mantle",
  "cost": 15,
  "detachment": "Shield Host",
  "detachmentId": "000000765",
  "legend": "...",
  "description": "..."
}
```

#### `GET /enhancements/:id`

Returns a single enhancement by ID.

---

### Detachment Abilities

#### `GET /detachment-abilities`

Returns all detachment abilities. Supports filtering.

**Query parameters:**
- `factionId` (optional) — Filter by faction ID
- `detachment` (optional) — Filter by detachment name

#### `GET /detachment-abilities/:id`

Returns a single detachment ability by ID.

---

### Abilities

#### `GET /abilities`

Returns all shared/core abilities (e.g. Deep Strike, Stealth, Deadly Demise, Feel No Pain).

#### `GET /abilities/:id`

Returns a single ability by ID.

---

### Sources

#### `GET /sources`

Returns all rule sources (Faction Packs, Rulebooks, Expansions) with errata links.

```json
{
  "id": "000000139",
  "name": "Space Marines",
  "type": "Faction Pack",
  "edition": 10,
  "version": "1.5",
  "errataDate": "11.02.2026 0:00:00",
  "errataLink": "https://..."
}
```

---

## Faction IDs

| ID | Faction |
|----|---------|
| `AC` | Adeptus Custodes |
| `AdM` | Adeptus Mechanicus |
| `AE` | Aeldari |
| `AM` | Astra Militarum |
| `AoI` | Imperial Agents |
| `AS` | Adepta Sororitas |
| `CD` | Chaos Daemons |
| `CSM` | Chaos Space Marines |
| `DG` | Death Guard |
| `DRU` | Drukhari |
| `EC` | Emperor's Children |
| `GC` | Genestealer Cults |
| `GK` | Grey Knights |
| `LoV` | Leagues of Votann |
| `NEC` | Necrons |
| `ORK` | Orks |
| `QI` | Imperial Knights |
| `QT` | Chaos Knights |
| `SM` | Space Marines |
| `TAU` | T'au Empire |
| `TL` | Adeptus Titanicus |
| `TS` | Thousand Sons |
| `TYR` | Tyranids |
| `WE` | World Eaters |

---

## Development

```bash
# Install dependencies
npm install

# Run locally (starts data server + wrangler dev)
npm run api:dev

# Deploy to Cloudflare
npm run api:deploy
```

## Data Source

Data is sourced from the [Wahapedia Data Export](https://wahapedia.ru/wh40k10ed/the-rules/data-export) and processed by the data pipeline in `packages/pipeline/`. The pipeline downloads CSV files, strips HTML, normalizes data types, and outputs structured JSON files.

When deployed, the API reads data from the committed JSON files in the `data/` directory via GitHub's raw content URLs.

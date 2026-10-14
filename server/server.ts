import fs from "node:fs/promises";
import path from "node:path";
import { Server } from "boardgame.io/server";
import { createMyGame } from "../src/game/MyGame";
import type { Settings } from "../src/types";

const settings: Settings = {
  ui: {
    bgmEnabled: false,
    seEnabled: false,
    deviceMode: "mouse",
    deckSelected: 0,
    inputLocked: false,
    inputLockedSub: false,
    scrollY: 0,
    openDeckList: false,
    isShift: false,
    initialHandId: 2,
    changingDeck: [false, false],
    isInputActive: false,
    inputCursorPosition: 0,
    helpPage: 1,
  },

  game: {
    initialHand: 6,
    firstPlayer: 2,
    eventEnabled: true,
    shiftCardEnabled: false,
    isCPU: false,
    isOnline: true,

    deck0: [
      { attr: "des", index: 1 },
      { attr: "des", index: 1 },
      { attr: "des", index: 2 },
      { attr: "des", index: 3 },
      { attr: "gen", index: 1 },
      { attr: "gen", index: 1 },
      { attr: "gen", index: 2 },
      { attr: "gen", index: 3 },
      { attr: "gen", index: 4 },
      { attr: "gen", index: 4 },
      { attr: "gen", index: 4 },
      { attr: "dis", index: 1 },
      { attr: "dis", index: 1 },
      { attr: "dis", index: 5 },
      { attr: "dis", index: 5 },
      { attr: "sup", index: 1 },
      { attr: "sup", index: 1 },
      { attr: "sup", index: 2 },
      { attr: "sup", index: 3 },
      { attr: "sup", index: 4 },
    ],

    deck1: [],
    deck2: [],
    deck3: [],
    editDeck: [],

    deckColor0: "rainbow",
    deckColor1: "white",
    deckColor2: "white",
    deckColor3: "white",
    editDeckColor: "white",

    deckName0: "デフォルト",
    deckName1: "デッキ1",
    deckName2: "デッキ2",
    deckName3: "デッキ3",
    editDeckName: "",

    selectedDeckP: [0, 0],
  },
};

const game = createMyGame(settings);

const PORT = Number(process.env.PORT ?? 8000);
const DIST = path.resolve(import.meta.dirname, "../dist");
const ORIGINS = (process.env.ORIGINS ?? "http://localhost:5173,http://localhost:8000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const server = Server({
  games: [game],
  origins: ORIGINS,
});

// Serve built frontend (static) from the same process. Unmatched GETs -> index.html (SPA).
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

server.app.use(async (ctx, next) => {
  if (ctx.method !== "GET" && ctx.method !== "HEAD") return next();
  if (ctx.status !== 404 && ctx.body !== undefined) return next();
  const rel = decodeURIComponent(ctx.path).replace(/^\/+/, "");
  let file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) return next();
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) file = path.join(file, "index.html");
  } catch {
    file = path.join(DIST, "index.html");
  }
  try {
    const data = await fs.readFile(file);
    ctx.type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    ctx.set("Cache-Control", file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache");
    ctx.body = data;
  } catch {
    return next();
  }
});

server.run({ port: PORT, host: "0.0.0.0" });

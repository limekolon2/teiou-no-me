// ポータル（studio-portal）の観戦欄へ、いまのプレイ状態を送る。
//
// - 送り先：Supabase Realtime Broadcast（チャンネル `live`、イベント `state`）
//           ＋ テーブル `live_heartbeat` へ upsert（途中から見に来た人用・Supabase の休止防止）
// - 接続情報は環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。どちらかが無ければ何もしない
// - 送信の失敗はすべてここで握りつぶす。ゲームのプレイ・セーブには一切影響させない
// - 送る頻度は最大で3秒に1回（間に起きた変化は、最後の状態だけをまとめて送る）

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ENABLED = Boolean(URL && KEY);

const GAME_ID = "teiou-no-me";
const GAME_TITLE = "帝王の眼";
const CHANNEL = "live";
const EVENT = "state";
const TABLE = "live_heartbeat";
const MIN_INTERVAL_MS = 3000;
const MAX_LOG = 20;

let client = null;
let channel = null;
let ready = false;
let connecting = null;

let sessionId = null;
let startedAt = null;
let log = [];

let pending = null; // まだ送っていない最新の状態
let lastState = null; // 最後に送った状態（リアルタイム接続が開いた瞬間に送り直す）
let lastSentAt = 0;
let timer = null;

function newSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function connect() {
  if (!ENABLED) return Promise.resolve(false);
  if (connecting) return connecting;
  connecting = import("@supabase/supabase-js")
    .then(({ createClient }) => {
      client = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      channel = client.channel(CHANNEL);
      channel.subscribe((status) => {
        ready = status === "SUBSCRIBED";
        if (ready && lastState && !pending) {
          channel.send({ type: "broadcast", event: EVENT, payload: lastState }).catch(() => {});
        }
      });
      return true;
    })
    .catch(() => {
      client = null;
      channel = null;
      return false;
    });
  return connecting;
}

/** プレイ開始（新規・つづきから）のたびに呼ぶ */
export function liveStart() {
  if (!ENABLED) return;
  sessionId = newSessionId();
  startedAt = new Date().toISOString();
  log = [];
  connect();
}

/** 行動ログに1行足す（送信は次の liveUpdate で） */
export function liveLog(text) {
  if (!ENABLED || !text) return;
  log.push({ at: new Date().toISOString(), actor: "agent", text: String(text).slice(0, 200) });
  if (log.length > MAX_LOG) log = log.slice(-MAX_LOG);
}

/** 画面の状態が変わったら呼ぶ。screen は { stats, board, ... } */
export function liveUpdate(screen, { ended = false, commentary } = {}) {
  if (!ENABLED || !sessionId) return;
  pending = {
    game_id: GAME_ID,
    game_title: GAME_TITLE,
    session_id: sessionId,
    started_at: startedAt,
    updated_at: null, // 送る直前に入れる
    screen,
    log: [...log],
    ...(commentary ? { commentary } : {}),
    ...(ended ? { ended: true } : {}),
  };
  // 終了の合図は待たずに送る
  schedule(ended ? 0 : undefined);
}

function schedule(delay) {
  if (timer) {
    if (delay !== 0) return;
    clearTimeout(timer);
  }
  const wait = delay ?? Math.max(0, lastSentAt + MIN_INTERVAL_MS - Date.now());
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, wait);
}

async function flush() {
  if (!pending) return;
  if (!(await connect()) || !client) return;
  const state = { ...pending, updated_at: new Date().toISOString() };
  pending = null;
  lastState = state;
  lastSentAt = Date.now();
  // Broadcast はリアルタイム接続が開いているときだけ。ハートビートは接続と関係なく書く
  if (ready && channel) {
    try {
      await channel.send({ type: "broadcast", event: EVENT, payload: state });
    } catch {
      // 観戦欄に届かなくてもゲームは続ける
    }
  }
  try {
    await client.from(TABLE).upsert({
      game_id: state.game_id,
      session_id: state.session_id,
      updated_at: state.updated_at,
      state,
    });
  } catch {
    // 同上
  }
}

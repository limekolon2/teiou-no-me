import { useState, useEffect, useCallback, useRef } from "react";

const INDUSTRIES = [
  { id: "ai", name: "AI・機械学習", icon: "🤖", volatility: 0.35, baseTrend: 0.005, baseCompetition: 0.8 },
  { id: "ev", name: "EV・電動モビリティ", icon: "⚡", volatility: 0.3, baseTrend: 0.003, baseCompetition: 0.7 },
  { id: "space", name: "宇宙開発", icon: "🚀", volatility: 0.4, baseTrend: 0.0, baseCompetition: 0.3 },
  { id: "biotech", name: "バイオテクノロジー", icon: "🧬", volatility: 0.35, baseTrend: 0.002, baseCompetition: 0.5 },
  { id: "metaverse", name: "メタバース・XR", icon: "🥽", volatility: 0.4, baseTrend: -0.01, baseCompetition: 0.6 },
  { id: "fintech", name: "フィンテック", icon: "💳", volatility: 0.25, baseTrend: -0.003, baseCompetition: 0.8 },
  { id: "greentech", name: "環境・クリーンエネルギー", icon: "🌱", volatility: 0.3, baseTrend: 0.005, baseCompetition: 0.5 },
  { id: "food", name: "フードテック", icon: "🍔", volatility: 0.2, baseTrend: 0.0, baseCompetition: 0.7 },
  { id: "security", name: "サイバーセキュリティ", icon: "🛡️", volatility: 0.25, baseTrend: 0.003, baseCompetition: 0.6 },
  { id: "drone", name: "ドローン・ロボティクス", icon: "🦾", volatility: 0.3, baseTrend: 0.002, baseCompetition: 0.4 },
  { id: "medical", name: "デジタル医療", icon: "🏥", volatility: 0.3, baseTrend: 0.003, baseCompetition: 0.5 },
  { id: "realestate", name: "不動産テック", icon: "🏢", volatility: 0.2, baseTrend: -0.005, baseCompetition: 0.7 },
  { id: "gaming", name: "ゲーム・eスポーツ", icon: "🎮", volatility: 0.3, baseTrend: 0.0, baseCompetition: 0.8 },
  { id: "logistics", name: "物流DX", icon: "📦", volatility: 0.2, baseTrend: 0.002, baseCompetition: 0.6 },
  { id: "edu", name: "EdTech", icon: "📚", volatility: 0.2, baseTrend: -0.002, baseCompetition: 0.4 },
];

// Each industry values different stats (weights must sum to ~1.0)
const INDUSTRY_APTITUDE = {
  ai:        { leadership: 0.1, execution: 0.15, creativity: 0.35, negotiation: 0.05, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.1 },
  ev:        { leadership: 0.15, execution: 0.3, creativity: 0.1, negotiation: 0.15, stamina: 0.15, luck: 0.05, loyalty: 0.05, ambition: 0.05 },
  space:     { leadership: 0.15, execution: 0.15, creativity: 0.25, negotiation: 0.05, stamina: 0.1, luck: 0.15, loyalty: 0.05, ambition: 0.1 },
  biotech:   { leadership: 0.1, execution: 0.2, creativity: 0.3, negotiation: 0.05, stamina: 0.15, luck: 0.1, loyalty: 0.05, ambition: 0.05 },
  metaverse: { leadership: 0.05, execution: 0.15, creativity: 0.35, negotiation: 0.1, stamina: 0.05, luck: 0.15, loyalty: 0.05, ambition: 0.1 },
  fintech:   { leadership: 0.15, execution: 0.25, creativity: 0.1, negotiation: 0.2, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.05 },
  greentech: { leadership: 0.15, execution: 0.25, creativity: 0.15, negotiation: 0.1, stamina: 0.15, luck: 0.05, loyalty: 0.1, ambition: 0.05 },
  food:      { leadership: 0.1, execution: 0.2, creativity: 0.25, negotiation: 0.15, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.05 },
  security:  { leadership: 0.15, execution: 0.3, creativity: 0.15, negotiation: 0.05, stamina: 0.15, luck: 0.05, loyalty: 0.1, ambition: 0.05 },
  drone:     { leadership: 0.1, execution: 0.25, creativity: 0.25, negotiation: 0.05, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.1 },
  medical:   { leadership: 0.15, execution: 0.2, creativity: 0.2, negotiation: 0.1, stamina: 0.15, luck: 0.05, loyalty: 0.1, ambition: 0.05 },
  realestate:{ leadership: 0.15, execution: 0.15, creativity: 0.05, negotiation: 0.35, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.05 },
  gaming:    { leadership: 0.1, execution: 0.15, creativity: 0.35, negotiation: 0.05, stamina: 0.1, luck: 0.1, loyalty: 0.05, ambition: 0.1 },
  logistics: { leadership: 0.15, execution: 0.3, creativity: 0.05, negotiation: 0.1, stamina: 0.2, luck: 0.05, loyalty: 0.1, ambition: 0.05 },
  edu:       { leadership: 0.2, execution: 0.15, creativity: 0.25, negotiation: 0.1, stamina: 0.1, luck: 0.05, loyalty: 0.1, ambition: 0.05 },
};

function calcAptitude(sub, industryId) {
  const w = INDUSTRY_APTITUDE[industryId];
  if (!w) return sub.overall;
  let score = 0;
  for (const key of Object.keys(w)) {
    score += (sub.stats[key] || 0) * w[key];
  }
  return Math.round(score);
}

function aptitudeLabel(score) {
  if (score >= 75) return { text: "S", color: "#ffd700" };
  if (score >= 60) return { text: "A", color: "#44bb44" };
  if (score >= 45) return { text: "B", color: "#88aa88" };
  if (score >= 30) return { text: "C", color: "#aa8844" };
  return { text: "D", color: "#aa4444" };
}

// Which stats matter most for this industry (top 2)
function topStatsForIndustry(industryId) {
  const w = INDUSTRY_APTITUDE[industryId];
  if (!w) return [];
  return Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
}

const COMPANY_NAMES = {
  ai: ["ニューロリンク","シナプスAI","ディープコア","コグニション・ラボ","マインドフロー","オムニブレイン"],
  ev: ["ボルテックスモーターズ","エレクトラ・ドライブ","サンダーEV","グリーンホイール","チャージライン","パルスモビリティ"],
  space: ["スターゲイト","オービタルワン","コスモフロンティア","ルナテック","アストロノヴァ","ゼログラビティ"],
  biotech: ["ジェノミクス・ラボ","バイオスフィア","セルフォージ","ヘリックスファーマ","ミュータジェン","プロテオス"],
  metaverse: ["ミラーワールド","ホロスケープ","バーチャリオン","ネオスフィア","ディメンション・ゼロ","イマーシブ"],
  fintech: ["キャッシュフロー","ペイストリーム","コインブリッジ","フィンノヴァ","マネーグリッド","レジャーバンク"],
  greentech: ["ソラリス・エナジー","エコヴェルデ","クリーンフューチャー","ウィンドノヴァ","グリーンパルス","テラワット"],
  food: ["フレッシュラボ","テイストテック","ネオハーベスト","グルメサイエンス","プラントリー","デリバイオ"],
  security: ["サイバーフォート","シールドネット","ファイアウォーカー","ダークガード","クリプトウォール","センチネル"],
  drone: ["スカイリンク","ホバーテック","エアロノヴァ","フライトコア","プロペラワークス","ウイングス"],
  medical: ["メディコネクト","ヘルスAIラボ","ドクターリンク","バイタルクラウド","ケアノヴァ","パルスメディカル"],
  realestate: ["スマートハウジング","リアルテックJP","プロパティAI","ホームクラウド","アーバンリンク","レジデンスラボ"],
  gaming: ["ピクセルストーム","ゲームフォージ","ネオアーケード","クエストラボ","バトルフィールドテック","プレイグラウンド"],
  logistics: ["スウィフト便","ハコビヤ","デリバリーX","ルートマスター","カーゴリンク","ロジテックJP"],
  edu: ["ラーニングラボ","エデュストリーム","ブレインパス","スタディノヴァ","ナレッジリンク","アカデミアAI"],
};

function pickCompanyName(industryId) {
  const pool = COMPANY_NAMES[industryId] || ["新会社"];
  return pool[Math.floor(Math.random() * pool.length)];
}

const SYNERGIES = [
  { a: "space", b: "food", name: "宇宙農業計画", desc: "宇宙で食料を生産する壮大な計画", bonus: 0.25 },
  { a: "gaming", b: "medical", name: "ゲーミフィケーション治療", desc: "遊びながら治す次世代医療", bonus: 0.25 },
  { a: "realestate", b: "metaverse", name: "仮想不動産帝国", desc: "現実より高い仮想の土地", bonus: 0.3 },
  { a: "drone", b: "greentech", name: "空中植林プロジェクト", desc: "ドローンが種を蒔く未来の森林再生", bonus: 0.25 },
  { a: "biotech", b: "food", name: "培養肉プロジェクト", desc: "牧場のいらない食卓", bonus: 0.25 },
  { a: "fintech", b: "space", name: "宇宙保険事業", desc: "隕石衝突もカバーします", bonus: 0.3 },
  { a: "edu", b: "gaming", name: "遊んで学ぶ学校", desc: "宿題がクエストになった", bonus: 0.25 },
  { a: "ai", b: "medical", name: "AI主治医プロジェクト", desc: "診断精度は人間を超えた。でも注射は打てない", bonus: 0.25 },
  { a: "ev", b: "logistics", name: "無人配送ネットワーク", desc: "届け先に人がいないことだけが問題", bonus: 0.25 },
  { a: "security", b: "fintech", name: "量子暗号バンキング", desc: "解読に宇宙の寿命が必要な金庫", bonus: 0.3 },
  { a: "metaverse", b: "edu", name: "バーチャル留学", desc: "自室から世界中の教室へ", bonus: 0.25 },
  { a: "ai", b: "greentech", name: "地球シミュレーター", desc: "AIが気候変動の未来を予測する", bonus: 0.25 },
];

const INDUSTRY_SUFFIX = {
  ai: ["AI研究所","テクノロジーズ","インテリジェンス","ラボ"],
  ev: ["モビリティ","モーターズ","EV","ドライブ"],
  space: ["スペース","アストロ","コスモ","オービタル"],
  biotech: ["バイオ","ライフサイエンス","ゲノミクス","ファーマ"],
  metaverse: ["デジタル","XR","バーチャル","メタ"],
  fintech: ["ファイナンス","ペイメント","キャピタル","マネー"],
  greentech: ["エナジー","グリーン","エコ","クリーン"],
  food: ["フーズ","キッチン","ダイニング","テイスト"],
  security: ["セキュリティ","ガード","シールド","プロテクト"],
  drone: ["ロボティクス","エアロ","フライト","テック"],
  medical: ["メディカル","ヘルス","ケア","クリニカル"],
  realestate: ["プロパティ","ハウジング","リアルティ","アーバン"],
  gaming: ["ゲームズ","エンタメ","プレイ","スタジオ"],
  logistics: ["ロジスティクス","エクスプレス","カーゴ","デリバリー"],
  edu: ["アカデミー","エデュケーション","ラーニング","スクール"],
};

function groupCompanyName(gName, industryId) {
  const suffixes = INDUSTRY_SUFFIX[industryId] || ["事業部"];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${gName} ${suffix}`;
}

const DEFAULT_GROUP_NAMES = ["ノヴァ","アトラス","ゼノン","暁","黒鉄","アルカディア","蒼天","ヴァルハラ","オリオン","紅蓮"];

const CHARACTER_ROSTER = [
  // Male
  { name: "田中 翔太", gender: "M" }, { name: "鈴木 大輝", gender: "M" },
  { name: "佐藤 健一", gender: "M" }, { name: "山田 拓也", gender: "M" },
  { name: "渡辺 雄介", gender: "M" }, { name: "中村 直樹", gender: "M" },
  { name: "高橋 亮", gender: "M" }, { name: "小林 誠", gender: "M" },
  { name: "加藤 隆", gender: "M" }, { name: "松本 浩二", gender: "M" },
  { name: "井上 修", gender: "M" }, { name: "木村 悟", gender: "M" },
  { name: "林 慎一", gender: "M" }, { name: "山口 裕也", gender: "M" },
  { name: "斎藤 達也", gender: "M" }, { name: "森 拓海", gender: "M" },
  { name: "池田 龍之介", gender: "M" }, { name: "近藤 大地", gender: "M" },
  { name: "石川 蓮", gender: "M" }, { name: "後藤 和也", gender: "M" },
  // Female
  { name: "橋本 美咲", gender: "F" }, { name: "藤田 さくら", gender: "F" },
  { name: "岡田 葵", gender: "F" }, { name: "長谷川 陽菜", gender: "F" },
  { name: "村上 結衣", gender: "F" }, { name: "前田 彩", gender: "F" },
  { name: "遠藤 真由", gender: "F" }, { name: "青木 麻衣", gender: "F" },
  { name: "清水 千尋", gender: "F" }, { name: "伊藤 涼子", gender: "F" },
  { name: "中島 恵", gender: "F" }, { name: "吉田 綾", gender: "F" },
  { name: "西村 瞳", gender: "F" }, { name: "三浦 玲奈", gender: "F" },
  { name: "原田 杏", gender: "F" }, { name: "野口 花", gender: "F" },
  { name: "松田 凛", gender: "F" }, { name: "上田 紗希", gender: "F" },
  { name: "柴田 七海", gender: "F" }, { name: "内田 ひなた", gender: "F" },
  { name: "川口 音葉", gender: "F" }, { name: "安藤 詩月", gender: "F" },
  { name: "望月 波音", gender: "F" }, { name: "白石 月葉", gender: "F" },
  { name: "沢村 結", gender: "F" },
];
const TRAITS = [
  { name: "天才肌", desc: "閃きで突破する。ハマれば無双、外すと大惨事", color: "#ffaa00" },
  { name: "堅実", desc: "地味だが確実。大勝ちしないが大負けもしない", color: "#66aa66" },
  { name: "野心家", desc: "出世欲の塊。成功すると調子に乗る", color: "#dd6644" },
  { name: "慎重", desc: "石橋を叩いて渡る。リスク回避に全振り", color: "#6688bb" },
  { name: "ポンコツ", desc: "なぜ採用された？本人もわかっていない", color: "#aa6688" },
  { name: "カリスマ", desc: "人がついてくる。部下の部下まで動かす", color: "#cc88ff" },
  { name: "地味に有能", desc: "目立たないが数字だけは出す。飲み会は断る", color: "#88aaaa" },
  { name: "強運", desc: "実力は謎。なぜか生き残り続ける", color: "#ddbb44" },
  { name: "理論派", desc: "データで殴る。感情は持ち合わせていない", color: "#88bbdd" },
  { name: "人たらし", desc: "取引先を味方にするのが異常にうまい", color: "#ee88aa" },
  { name: "破天荒", desc: "常識を無視する。成功も失敗もスケールがでかい", color: "#ff6666" },
  { name: "職人気質", desc: "品質にこだわりすぎて納期は守らない", color: "#aa8855" },
];
const QUIRKS = [
  "会議中にスマホゲーしてる","昼休み2時間取る","部下に好かれている","部下に恐れられている",
  "メールの返信が異常に遅い","プレゼンだけ天才","経費を使いすぎる","なぜかCEO室に来たがる",
  "サボってるのにKPIだけ達成する","転職サイトを毎日見ている","社食のカレーに異常に詳しい",
  "朝が弱い","毎日スーツが違う","デスクが汚い","観葉植物を枯らす天才",
  "報連相を一切しない","週報が毎回ポエム","飲み会の幹事だけ完璧","取引先の犬の名前を全部覚えている",
  "3ヶ月で部署の雰囲気を変える","退職届を年2回出す","なぜか数字を丸める癖がある",
  "出張先で必ずラーメン屋を開拓する","金曜の午後はもう帰った顔をしている",
  "会議の最後に必ず余計な一言を言う","コーヒーマシンの前に30分いる",
  "名刺を切らしがち","スーツにカレーのシミがある",
];

const CLUBS = [
  { name: "野球部", stat: "stamina", bonus: 8, icon: "⚾" },
  { name: "サッカー部", stat: "leadership", bonus: 6, icon: "⚽" },
  { name: "バスケ部", stat: "execution", bonus: 6, icon: "🏀" },
  { name: "テニス部", stat: "stamina", bonus: 5, icon: "🎾" },
  { name: "陸上部", stat: "stamina", bonus: 10, icon: "🏃" },
  { name: "水泳部", stat: "stamina", bonus: 8, icon: "🏊" },
  { name: "柔道部", stat: "loyalty", bonus: 8, icon: "🥋" },
  { name: "剣道部", stat: "loyalty", bonus: 7, icon: "🤺" },
  { name: "吹奏楽部", stat: "leadership", bonus: 7, icon: "🎺" },
  { name: "軽音部", stat: "creativity", bonus: 8, icon: "🎸" },
  { name: "美術部", stat: "creativity", bonus: 10, icon: "🎨" },
  { name: "演劇部", stat: "negotiation", bonus: 8, icon: "🎭" },
  { name: "放送部", stat: "negotiation", bonus: 6, icon: "🎙️" },
  { name: "生徒会", stat: "leadership", bonus: 10, icon: "📋" },
  { name: "将棋部", stat: "creativity", bonus: 6, icon: "♟️" },
  { name: "科学部", stat: "execution", bonus: 8, icon: "🔬" },
  { name: "パソコン部", stat: "creativity", bonus: 7, icon: "💻" },
  { name: "写真部", stat: "creativity", bonus: 5, icon: "📷" },
  { name: "料理部", stat: "execution", bonus: 5, icon: "🍳" },
  { name: "帰宅部", stat: "luck", bonus: 10, icon: "🏠" },
  { name: "文芸部", stat: "creativity", bonus: 6, icon: "📖" },
  { name: "ダンス部", stat: "stamina", bonus: 6, icon: "💃" },
  { name: "漫画研究会", stat: "creativity", bonus: 7, icon: "✏️" },
  { name: "ラグビー部", stat: "stamina", bonus: 10, icon: "🏉" },
  { name: "弓道部", stat: "execution", bonus: 7, icon: "🏹" },
  { name: "天文部", stat: "luck", bonus: 5, icon: "🔭" },
  { name: "ボランティア部", stat: "loyalty", bonus: 8, icon: "🤝" },
  { name: "麻雀同好会", stat: "negotiation", bonus: 8, icon: "🀄" },
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

const usedRosterNames = new Set();

function generateSubordinate(id) {
  // Pick from roster, avoiding already-used names
  const available = CHARACTER_ROSTER.filter(c => !usedRosterNames.has(c.name));
  let char;
  if (available.length > 0) {
    char = available[Math.floor(Math.random() * available.length)];
  } else {
    // All used - reset and pick again
    usedRosterNames.clear();
    char = CHARACTER_ROSTER[Math.floor(Math.random() * CHARACTER_ROSTER.length)];
  }
  usedRosterNames.add(char.name);

  const isFemale = char.gender === "F";
  const trait = TRAITS[rand(0, TRAITS.length - 1)];
  const age = 25 + Math.floor(Math.random() * 30);
  const quirk = QUIRKS[rand(0, QUIRKS.length - 1)];
  const club = CLUBS[rand(0, CLUBS.length - 1)];

  let leadership = rand(10, 45);
  let execution = rand(10, 45);
  let creativity = rand(10, 45);
  let negotiation = rand(10, 45);
  let stamina = rand(15, 55);
  let luck = rand(5, 95);
  let loyalty = rand(30, 80);
  let ambition = rand(10, 70);

  // Growth tendencies: 2 stats grow fast, 1 grows slow
  const growableStats = ["leadership", "execution", "creativity", "negotiation", "stamina"];
  const shuffled = [...growableStats].sort(() => Math.random() - 0.5);
  const growthTendency = { fast: [shuffled[0], shuffled[1]], slow: shuffled[4] };

  // Club bonus
  const statMap = { leadership, execution, creativity, negotiation, stamina, luck, loyalty, ambition };
  statMap[club.stat] = (statMap[club.stat] || 0) + club.bonus;
  leadership = statMap.leadership; execution = statMap.execution;
  creativity = statMap.creativity; negotiation = statMap.negotiation;
  stamina = statMap.stamina; luck = statMap.luck;
  loyalty = statMap.loyalty; ambition = statMap.ambition;

  if (trait.name === "天才肌") { creativity += 30; execution -= 10; luck += 10; }
  if (trait.name === "堅実") { execution += 20; stamina += 15; creativity -= 15; }
  if (trait.name === "野心家") { ambition += 35; leadership += 10; loyalty -= 20; }
  if (trait.name === "慎重") { execution += 10; stamina += 10; creativity -= 20; ambition -= 15; }
  if (trait.name === "ポンコツ") { execution -= 25; leadership -= 20; luck += 15; loyalty += 15; }
  if (trait.name === "カリスマ") { leadership += 35; negotiation += 15; }
  if (trait.name === "地味に有能") { execution += 25; creativity += 10; leadership -= 15; }
  if (trait.name === "強運") { luck += 40; execution -= 15; }
  if (trait.name === "理論派") { execution += 20; creativity += 15; negotiation -= 15; }
  if (trait.name === "人たらし") { negotiation += 35; loyalty += 10; execution -= 10; }
  if (trait.name === "破天荒") { creativity += 25; luck += 15; stamina -= 10; execution -= 20; }
  if (trait.name === "職人気質") { creativity += 20; execution += 15; stamina -= 15; ambition -= 20; }

  if (age >= 45) { leadership += 10; stamina -= 10; }
  if (age < 30) { stamina += 10; leadership -= 10; ambition += 10; }

  const stats = {
    leadership: clamp(leadership, 1, 99),
    execution: clamp(execution, 1, 99),
    creativity: clamp(creativity, 1, 99),
    negotiation: clamp(negotiation, 1, 99),
    stamina: clamp(stamina, 1, 99),
    luck: clamp(luck, 1, 99),
    loyalty: clamp(loyalty, 1, 99),
    ambition: clamp(ambition, 1, 99),
  };

  const overall = Math.round(
    stats.leadership * 0.15 + stats.execution * 0.2 + stats.creativity * 0.15 +
    stats.negotiation * 0.1 + stats.stamina * 0.1 + stats.luck * 0.1 +
    stats.loyalty * 0.1 + stats.ambition * 0.1
  );

  const salary = Math.round((overall * 60 + rand(1500, 3000)) * 1000);

  return {
    id, name: char.name, gender: char.gender,
    age, trait, quirk, club, stats, overall, salary,
    assigned: null, turnsWorked: 0, mood: 70 + rand(-10, 10),
    history: [],
    growthTendency,
  };
}

const NEWS_POOL = [
  { text: "政府がAI推進政策を発表", affects: ["ai", "security"], modifier: 0.15 },
  { text: "大手EVメーカーがリコール", affects: ["ev"], modifier: -0.2 },
  { text: "宇宙旅行の商業化が加速", affects: ["space"], modifier: 0.2 },
  { text: "パンデミック懸念が再燃", affects: ["biotech", "medical"], modifier: 0.2 },
  { text: "メタバースの利用者が激減。「飽きた」との声多数", affects: ["metaverse"], modifier: -0.25 },
  { text: "仮想通貨が暴落。原因は有名CEOの誤ツイート", affects: ["fintech"], modifier: -0.2 },
  { text: "カーボンニュートラル規制強化", affects: ["greentech"], modifier: 0.2 },
  { text: "食料危機への懸念が拡大", affects: ["food"], modifier: 0.2 },
  { text: "大規模サイバー攻撃が発生。犯人はまだ中学生", affects: ["security"], modifier: 0.25 },
  { text: "物流コストが高騰", affects: ["logistics", "drone"], modifier: 0.15 },
  { text: "少子化対策に巨額予算", affects: ["edu"], modifier: 0.15 },
  { text: "不動産バブル崩壊の兆候。タワマンに空室続出", affects: ["realestate"], modifier: -0.3 },
  { text: "eスポーツがオリンピック種目に", affects: ["gaming"], modifier: 0.25 },
  { text: "世界的な景気後退。コンビニのおにぎりも値上げ", affects: INDUSTRIES.map(i => i.id), modifier: -0.1 },
  { text: "技術革新の波が到来", affects: ["ai", "biotech", "space", "drone"], modifier: 0.1 },
  { text: "半導体不足が深刻化。原因は工場の猫が機械に乗った", affects: ["ai", "ev", "drone", "gaming"], modifier: -0.15 },
  { text: "規制緩和で新興企業が急増", affects: ["fintech", "realestate", "food"], modifier: 0.12 },
  { text: "有名インフルエンサーがメタバースを絶賛。翌日に撤回", affects: ["metaverse", "gaming"], modifier: 0.08 },
  { text: "AIが書いた小説が文学賞を受賞。作家連盟が激怒", affects: ["ai", "edu"], modifier: 0.12 },
  { text: "宇宙ゴミが人工衛星に衝突。保険会社が泣いている", affects: ["space"], modifier: -0.15 },
  { text: "フードデリバリー最大手が突然の経営破綻。社長は海外逃亡", affects: ["food", "logistics"], modifier: -0.18 },
  { text: "ドローンが配達中にカラスに襲われる事件が多発", affects: ["drone", "logistics"], modifier: -0.1 },
  { text: "VRゴーグルをつけたまま出社する社員が急増", affects: ["metaverse"], modifier: 0.08 },
  { text: "医療AIが誤診。「あなたはロボットです」と診断", affects: ["medical", "ai"], modifier: -0.1 },
  { text: "不動産テック企業の社長、自社物件に住めない年収だった", affects: ["realestate"], modifier: -0.12 },
  { text: "ゲーム依存症対策法案が提出。ゲーマー連合が国会前でデモ", affects: ["gaming"], modifier: -0.15 },
  { text: "環境活動家がEV工場に突入するもドアが自動ロック", affects: ["ev", "greentech"], modifier: 0.05 },
  { text: "バイオ企業が「若返りサプリ」発表。成分はほぼビタミンC", affects: ["biotech"], modifier: -0.08 },
  { text: "サイバーセキュリティ企業自身がハッキングされる", affects: ["security"], modifier: -0.2 },
  { text: "EdTech企業の研修動画が眠すぎると話題に", affects: ["edu"], modifier: -0.1 },
  { text: "フィンテック企業のCEOがパスワードを「1234」にしていた", affects: ["fintech"], modifier: -0.15 },
  { text: "物流ロボットが倉庫内で迷子になる動画がバズる", affects: ["logistics", "drone"], modifier: -0.05 },
];

const GOSSIP_POOL = [
  "某グループ企業のCEO、社員旅行で迷子になる",
  "「うちの会社なんでまだ存在してるんですか」匿名社員の投稿が話題",
  "経営コンサルタント「正直、何もわかりません」と正直すぎる発言",
  "某社の新人研修、内容が「石を見つめる」だけだった",
  "タワマン最上階のベンチャー社長、エレベーター故障で3日出社できず",
  "AIに「うちの会社の将来性は？」と聞いたら沈黙が返ってきた",
  "某社の忘年会、CEOだけ不参加。理由は「面倒くさい」",
  "上場企業の決算資料にスペルミス47箇所。株価には影響なし",
  "「CEO、もう帰っていいですか」入社3時間の新人が話題",
  "某社の社訓「頑張らない」が若者に大ウケ",
  "経営会議の議題が「お昼のお弁当の発注先」だけだった",
  "某ベンチャーの資金調達プレゼン、5分中4分が自己紹介",
  "業界紙の「注目企業ランキング」1位が廃業していた",
  "某社のCEO室に猫が住み着く。役員より偉い扱い",
  "転職サイトのCMに出てたCEO、自分も転職してた",
  "「弊社はアットホームな職場です」と書いた会社がまた潰れた",
  "某フードテック企業の社食がカップ麺しかない",
  "上場廃止の理由が「書類をなくした」だった",
];

const BANKRUPTCY_MSGS = [
  "CEOが最後に残したのは大量のコーヒーカップだけだった",
  "最後の社員が電気を消して出ていった",
  "オフィスの観葉植物だけが生き残った",
  "CEOのデスクから「助けて」と書かれたメモが見つかった",
  "残されたホワイトボードには「なぜ…」とだけ書かれていた",
  "最後の全体会議の出席者はCEOひとりだった",
  "退職金は出なかったが、CEOの手作りクッキーが配られた",
  "倒産の知らせを聞いた元社員のコメント「知ってた」",
];

const BETRAYAL_MSGS = [
  "退職届には一言「感謝」とだけ書かれていた。筆跡がいつもより丁寧だった",
  "「CEOには悪いけど、自分のほうが上手くやれる」と言い残した。目は笑っていなかった",
  "引き継ぎ資料は完璧だった。最後まで仕事ができる人間だった",
  "最後のメールの件名が「さよなら、そしてありがとう」だった。本文は空だった",
  "「いつかまた一緒に仕事しましょう」社交辞令にしては目が本気だった",
  "退職の挨拶メールが全社員に送られた。読んだ人の半分が「かっこいい」と思ってしまった",
  "デスクに花が一輪置いてあった。誰に向けたものかは、わからない",
  "最後の日、いつもより30分早く来て、いつも通りコーヒーを淹れて、黙って出ていった",
  "「お世話になりました」。その一言に、怒りも感謝も全部入っていた",
  "辞める前夜、後輩に2時間かけて仕事を教えていたらしい。最後まで面倒見がよかった",
  "退職届を出したあと、なぜか掃除を始めた。自分のデスクだけ異様に綺麗にして去った",
  "「この会社で学んだことは全部持っていきます」。それが一番困るのだが",
  "私物を段ボール一箱にまとめるのに3分しかかからなかった。いつでも辞められる準備ができていた",
  "最終日の帰り際に「あ、自販機に忘れ物あるんで」と言い残した。缶コーヒーが1本、置いてあった。CEOがいつも飲んでるやつだった",
  "社員証を返却するとき、少しだけ手が止まった。それが唯一の迷いだった",
  "後日、元同僚に「あの会社にいた時間は無駄じゃなかった」と言っていたらしい。なぜ直接言わないのか",
];

const RIVAL_DEFEAT_MSGS = [
  "最後の日、元社員はうちのビルを見上げていたらしい。しばらく動かなかったと、警備員が言っていた",
  "「負けました」。その一言だけのメールが届いた。返信はしなかった。する必要もなかった",
  "元社員のデスクには、うちの会社にいた頃の写真が一枚だけ残っていたらしい",
  "元社員は最後まで「自分は間違っていなかった」と言っていたそうだ。でも数字は嘘をつかない",
  "潰れる前日、元社員がうちの社食に来ていた。何を食べたかは、誰も覚えていない",
  "「出ていくべきじゃなかった」と呟いたらしい。聞いた人間は、何も言えなかった",
  "取引先から「元部下の会社、潰れたらしいですね」と言われた。「そうですか」としか返せなかった",
  "会社を畳んだあと、元社員は3日間連絡が取れなかったらしい。4日目に「大丈夫です」とだけ返信があった",
];

const RIVAL_RETURN_MSGS = [
  "「…もう一度、やらせてください」。その目は、出ていったときより少しだけ大人になっていた",
  "「外で学んだことがあります。全部、ここで使わせてください」",
  "何も言わずに、かつての自分のデスクの前に立っていた。椅子はまだ空いていた",
  "「帰ってきました」。それだけ言って、翌日から普通に出社した",
  "「独立して初めてわかりました。ここがどれだけ恵まれていたか」",
];

const EMPLOYEE_VOICES = {
  champion: [
    [{ s: "A", text: "最近さ、友達に会社どこって聞かれるの嬉しいんだよね" }, { s: "B", text: "わかる。前は説明しづらかったけど、今は名前出すだけで伝わる" }],
    [{ s: "A", text: "後輩がさ、うちに入りたいって言ってくれたのよ" }, { s: "B", text: "いい会社になったよね。…いつの間にか" }],
    [{ s: "A", text: "転職サイト、最近開いてないな" }, { s: "B", text: "あー、私も。いつからだろ" }, { s: "A", text: "たぶんこの会社が好きになった頃から" }],
    [{ s: "A", text: "なんかさ、月曜がそんなに嫌じゃなくなった" }, { s: "B", text: "それって結構すごいことだよね" }, { s: "A", text: "うん。この会社に入って一番の変化かも" }],
    [{ s: "A", text: "取引先に「いい会社にお勤めですね」って言われた" }, { s: "B", text: "社交辞令じゃなくて？" }, { s: "A", text: "目が本気だった" }],
    [{ s: "A", text: "うちの会社のロゴ、最近好きになってきた" }, { s: "B", text: "わかる。名刺出すとき胸張れるようになったよね" }],
  ],
  growing: [
    [{ s: "A", text: "最近なんかいい雰囲気じゃない？うち" }, { s: "B", text: "わかる。朝来るのそんなに嫌じゃなくなった" }, { s: "A", text: "「そんなに」ってなんだよ" }],
    [{ s: "A", text: "今月もいけそうだね" }, { s: "B", text: "なんか最近、数字見るの楽しくなってきた" }, { s: "A", text: "やばいね。仕事楽しんでる" }],
    [{ s: "A", text: "この会社、入ったときと全然違うよね" }, { s: "B", text: "うん。最初は大丈夫かなって思ってたけど" }, { s: "A", text: "今は大丈夫じゃないときのほうが少ないもんね" }],
    [{ s: "A", text: "なんか最近、残業が苦じゃなくなった" }, { s: "B", text: "それ危ないやつじゃない？" }, { s: "A", text: "いや、ちゃんと帰ってるよ。ただ帰りたくない日もあるってだけ" }],
    [{ s: "A", text: "今年の目標、もう達成しちゃいそう" }, { s: "B", text: "上方修正されるやつじゃん" }, { s: "A", text: "…やめて" }],
  ],
  comfortable: [
    [{ s: "A", text: "なんかさ、最近仕事のあとに料理するようになったのよ" }, { s: "B", text: "余裕あるね。前は帰ったら死んでたのに" }, { s: "A", text: "会社が安定してると心にも余裕出るんだなって" }],
    [{ s: "A", text: "来月有給取って旅行行こうかなって" }, { s: "B", text: "いいじゃん。前は有給取れる雰囲気じゃなかったもんね" }, { s: "A", text: "今は「行ってらっしゃい」って言ってもらえる会社になった" }],
    [{ s: "A", text: "週末、趣味の時間が増えたのよ" }, { s: "B", text: "前は週末も仕事のこと考えてたもんね" }, { s: "A", text: "今は金曜の夜に「やった週末だ」って思える。それだけで幸せ" }],
    [{ s: "A", text: "友達に「最近なんかいい顔してるね」って言われた" }, { s: "B", text: "仕事が安定してるとそうなるよ" }, { s: "A", text: "顔に出るんだね。会社の調子って" }],
    [{ s: "A", text: "新人入ってきたら優しくしてあげたいよね" }, { s: "B", text: "うちらが苦労した分、あの子たちにはいい環境で働いてほしい" }, { s: "A", text: "…先輩っぽいこと言うじゃん" }, { s: "B", text: "先輩だからね" }],
    [{ s: "A", text: "なんかさ、うちの会社のこと好きだなって最近思うのよ" }, { s: "B", text: "急にどうした" }, { s: "A", text: "いや、特に理由はないんだけど。なんとなく" }, { s: "B", text: "…それが一番いい理由かもね" }],
  ],
  stable: [
    [{ s: "A", text: "今日も平和だね" }, { s: "B", text: "平和が一番よ" }, { s: "A", text: "…それはそうなんだけど、たまに刺激ほしくない？" }, { s: "B", text: "ない" }],
    [{ s: "A", text: "うちの会社の好きなとこある？" }, { s: "B", text: "社食のカレー" }, { s: "A", text: "仕事の話してくれない？" }],
    [{ s: "A", text: "可もなく不可もなくってうちのことだよね" }, { s: "B", text: "不可がないの大事だよ。前の会社不可しかなかったから" }],
  ],
  struggling: [
    [{ s: "A", text: "今月どうなんだろ…" }, { s: "B", text: "考えても仕方ないよ。やることやるだけ" }, { s: "A", text: "…それはそうなんだけどさ" }],
    [{ s: "A", text: "隣の部署の人、最近元気ないよね" }, { s: "B", text: "うちの業績知ってたらそうなるよ" }, { s: "A", text: "…知ってんだ、みんな" }],
    [{ s: "A", text: "忙しいのに数字出ないのキツいよね" }, { s: "B", text: "でもさ、やめたいかって言われたらそうでもないのよ" }, { s: "A", text: "…わかる。なんだかんだ愛着あるんだよね" }],
  ],
  crisis: [
    [{ s: "A", text: "ねえ、ボーナス出るのかな" }, { s: "B", text: "…聞かないほうがいいと思う" }],
    [{ s: "A", text: "最近CEOと目が合うと怖いんだよね" }, { s: "B", text: "売却されるかもって思ってるんでしょ" }, { s: "A", text: "思ってないけど。…思ってないけど" }],
    [{ s: "A", text: "うち大丈夫かな" }, { s: "B", text: "大丈夫だよ。…たぶん" }, { s: "A", text: "その「たぶん」が怖いのよ" }],
    [{ s: "A", text: "もしうちが潰れたらどうする？" }, { s: "B", text: "考えたくないけど…でもここで出会えた人たちは財産だと思う" }, { s: "A", text: "…急にいいこと言うじゃん" }],
  ],
};

function getEmployeeVoice(comp) {
  const rank = companyRank(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 });
  let pool;
  if (rank.tier >= 5) pool = EMPLOYEE_VOICES.champion;
  else if (comp.health < 30) pool = EMPLOYEE_VOICES.crisis;
  else if (comp.revenue < 0 && comp.health < 60) pool = EMPLOYEE_VOICES.struggling;
  else if (rank.tier >= 4 && comp.revenue >= 0) pool = EMPLOYEE_VOICES.comfortable;
  else if (comp.revenue > 0 && rank.tier >= 3) pool = EMPLOYEE_VOICES.growing;
  else pool = EMPLOYEE_VOICES.stable;
  return pool[Math.floor(Math.random() * pool.length)];
}

const HEADHUNT_ORGS = [
  "ブラックロック・キャピタル","ノヴァ・グループ","ゴールデンイーグル・ホールディングス",
  "アトラス・コーポレーション","ヴァンガード・パートナーズ","シルバーウルフ・グループ",
  "レッドフォックス・キャピタル","ブルーオーシャン・ホールディングス","サンライズ・グループ",
  "ダークホース・ベンチャーズ","フェニックス・アライアンス","ドラゴンゲート・キャピタル",
];

const SUB_COMMENTS = {
  great: [ // mood >= 80, profit > 0
    "CEO、今月も絶好調ですよ",
    "この勢いなら来月もいけます",
    "正直、自分でも驚いてます",
    "ボーナス…出ますよね？",
    "仕事が楽しいです。人生で初めて言いました",
    "ライバルなんか怖くないですよ",
    "CEOについてきてよかったです",
    "今夜は祝杯ですね",
    "数字出てるんで、今日早く帰っていいですか",
    "取引先が「おたく最近すごいね」って言ってました",
  ],
  good: [ // mood >= 60, profit > 0
    "まあまあですかね",
    "悪くないと思います",
    "地道にやってます",
    "順調です。たぶん",
    "今月は怒られずに済みそうです",
    "可もなく不可もなく…いや、可です",
    "このまま安定させたいですね",
  ],
  stressed: [ // mood >= 40, profit < 0
    "ちょっと厳しいですね…",
    "胃が痛いです",
    "なんとかします…たぶん",
    "来月は巻き返します。来月は",
    "原因は分析中です（3ヶ月目）",
    "すいません、頑張ります…",
    "CEO、ちょっと相談が…いや、なんでもないです",
    "夢に数字が出てくるようになりました",
  ],
  miserable: [ // mood < 40
    "もう無理かもしれません",
    "転職サイト見てました。すいません",
    "今朝、出社するのに3時間かかりました",
    "CEO、私の存在意義ってなんですかね",
    "正直、限界です",
    "昨日、退職届の書き方を検索しました",
    "給料分は働いてると思いたいです",
    "窓の外ばっかり見てます",
    "部下に「大丈夫ですか」って言われました",
  ],
  idle: [ // not assigned
    "暇です",
    "いつでも行けますよ",
    "待機中…ずっと待機中…",
    "CEO、私のこと忘れてません？",
    "デスクの掃除は完璧です",
    "資格の勉強でもしますか…",
    "他の人が忙しそうで申し訳ないです",
    "配属まだですか。まだですか。まだですか",
    "社食のメニュー全制覇しました",
  ],
  // Trait-specific comments (override sometimes)
  trait_ponkotsu: [
    "今日も元気に出社しました（それだけです）",
    "ミスしました。また。すいません",
    "自分でもなんで雇われたのかわかりません",
    "会議で寝てました。すいません",
    "書類を逆さに提出してました",
  ],
  trait_ambitious: [
    "CEO、次のポスト空いてませんか",
    "そろそろ取締役とか…冗談です。半分",
    "自分にはもっとできることがあると思うんです",
    "この業界、私が変えますよ",
  ],
  trait_lucky: [
    "なんか知らんけど上手くいきました",
    "正直、自分でも理由がわかりません",
    "今日も運だけで乗り切りました",
    "宝くじ買おうかな",
  ],
  trait_charisma: [
    "部下たちがついてきてくれてます",
    "チームの雰囲気は任せてください",
    "飲み会のセッティング完了してます",
  ],
  trait_reckless: [
    "CEO、ちょっとデカい勝負に出ていいですか",
    "常識とかルールとか、そういうの苦手なんですよね",
    "今月は派手にいきますよ",
  ],
};

function pickComment(sub, compRevenue) {
  // Trait-specific override (30% chance)
  if (Math.random() < 0.3) {
    let traitPool = null;
    if (sub.trait.name === "ポンコツ") traitPool = SUB_COMMENTS.trait_ponkotsu;
    if (sub.trait.name === "野心家") traitPool = SUB_COMMENTS.trait_ambitious;
    if (sub.trait.name === "強運") traitPool = SUB_COMMENTS.trait_lucky;
    if (sub.trait.name === "カリスマ") traitPool = SUB_COMMENTS.trait_charisma;
    if (sub.trait.name === "破天荒") traitPool = SUB_COMMENTS.trait_reckless;
    if (traitPool) return traitPool[Math.floor(Math.random() * traitPool.length)];
  }
  
  if (!sub.assigned) {
    return SUB_COMMENTS.idle[Math.floor(Math.random() * SUB_COMMENTS.idle.length)];
  }
  
  let pool;
  if (sub.mood >= 80 && compRevenue > 0) pool = SUB_COMMENTS.great;
  else if (sub.mood >= 60) pool = SUB_COMMENTS.good;
  else if (sub.mood >= 40) pool = SUB_COMMENTS.stressed;
  else pool = SUB_COMMENTS.miserable;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateBreakroomChats(subs, companies, currentTurn) {
  const chats = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Wrap subs with last-name-only and gender marker
  const wrap = (s) => ({ ...s, name: s.name.split(" ")[0], fullName: s.name });

  const currentMonth = ((4 - 1 + (currentTurn || 1) - 1) % 12) + 1;

  const SEASONAL_CHAT = {
    1: [(a, b) => [
      { name: a.name, text: "あけおめ。今年の目標ある？" },
      { name: b.name, text: "「定時退社」って毎年書いてる" },
      { name: a.name, text: "達成したことある？" },
      { name: b.name, text: "1月3日に一回だけ" },
    ]],
    3: [(a, b) => [
      { name: a.name, text: "来月から新人入ってくるのかな" },
      { name: b.name, text: `${b.gender === "F" ? "私" : "俺"}らも先輩になるんだね` },
      { name: a.name, text: "先輩っぽいこと何もできないけど" },
      { name: b.name, text: "「あの自販機のボタン、強く押さないと出ない」とかは教えられる" },
    ]],
    4: [(a, b) => [
      { name: a.name, text: "花見やる？今年" },
      { name: b.name, text: "CEOが場所取り担当っていう噂あるよ" },
      { name: a.name, text: "嘘でしょ" },
      { name: b.name, text: "嘘。でも言ったら本当にやりそう" },
    ]],
    6: [(a, b) => [
      { name: a.name, text: "梅雨やばいね。朝から靴びしょびしょ" },
      { name: b.name, text: "会社に置き靴してる人いるよね。あれ賢い" },
      { name: a.name, text: "でもさ、置き靴がカビてたら意味ないよね" },
      { name: b.name, text: "…確認してくる" },
    ]],
    7: [(a, b) => [
      { name: a.name, text: "夏休みどこ行くの？" },
      { name: b.name, text: "まだ決めてない。有給取れるかもわかんないし" },
      { name: a.name, text: "CEOに聞いてみれば？" },
      { name: b.name, text: "CEOは毎日が夏休みでしょ" },
    ]],
    8: [(a, b) => [
      { name: a.name, text: "暑すぎない？エアコン効いてなくない？" },
      { name: b.name, text: "経費削減で設定温度28度らしいよ" },
      { name: a.name, text: "28度って涼しくないやつじゃん" },
      { name: b.name, text: "涼しい顔して仕事してるのCEOだけ" },
    ]],
    10: [(a, b) => [
      { name: a.name, text: "ハロウィンなんかやる？" },
      { name: b.name, text: "去年誰かがスーツにカボチャのネクタイしてきた" },
      { name: a.name, text: "それで？" },
      { name: b.name, text: "それで終わり。誰も触れなかった" },
    ]],
    12: [(a, b) => [
      { name: a.name, text: "忘年会やるの？今年" },
      { name: b.name, text: "幹事やりたくないんだけど" },
      { name: a.name, text: `${a.gender === "F" ? "私" : "俺"}もやりたくない` },
      { name: b.name, text: "…じゃあ誰がやるの" },
      { name: a.name, text: "CEOにやらせよう" },
      { name: b.name, text: "予算全部高級ウイスキーに消えそう" },
    ]],
  };
  
  const OFFICE_GOSSIP = [
    (a, b) => [
      { name: a.name, text: "隣の部署の人って毎日何時に来てるか知ってる？" },
      { name: b.name, text: "知らない。でも帰りは毎日一番最後だよね" },
      { name: a.name, text: "あれ仕事してんのかな。ネットサーフィンしてんのかな" },
      { name: b.name, text: "でもさ、なんか帰りたくない日ってあるじゃん。家より会社のほうが落ち着くみたいな" },
      { name: a.name, text: "…それはちょっとわかるかもしれない" },
    ],
    (a, b) => [
      { name: a.name, text: "CEOって普段何してるんだろ" },
      { name: b.name, text: "たまに見るけど、ずっとモニター見てるよ" },
      { name: a.name, text: `それ${a.gender === "F" ? "私" : "俺"}らもだけどね` },
      { name: b.name, text: "でもあの人、たまにめっちゃ遠い目してるときあるよね" },
      { name: a.name, text: "あれ何見えてるんだろうな" },
      { name: b.name, text: "未来か、残高か" },
    ],
    (a, b) => [
      { name: a.name, text: "今日の社食なに？" },
      { name: b.name, text: "カレーとカレーうどん" },
      { name: a.name, text: "選択肢がカレーしかないじゃん" },
      { name: b.name, text: `いや${b.gender === "F" ? "私" : "俺"}ね、社食のカレーにはこだわりがあって` },
      { name: a.name, text: "出た、こだわり" },
      { name: b.name, text: "木曜のカレーだけちょっとスパイス違うのよ。気づいてた？" },
      { name: a.name, text: "気づいてない" },
      { name: b.name, text: "木曜だけクミンが強いの。だから木曜は絶対社食" },
    ],
    (a, b) => [
      { name: a.name, text: "会議長くない？今日のやつ" },
      { name: b.name, text: "途中から議題なんだったか誰もわかってなかったよね" },
      { name: a.name, text: "最後「じゃあ引き続きよろしく」で終わったの最高だった" },
      { name: b.name, text: "引き続き何をよろしくするのか誰も知らないっていう" },
    ],
    (a, b) => [
      { name: a.name, text: "エレベーター待ちのときCEOと二人きりになるの気まずい" },
      { name: b.name, text: "わかる。天気の話しかできない" },
      { name: a.name, text: "「今日暑いですね」「そうですね」で12階分もたせるの地獄" },
      { name: b.name, text: `${b.gender === "F" ? "私" : "俺"}この前7階で沈黙に耐えきれなくて「あ、ここで降ります」って言っちゃった` },
      { name: a.name, text: "7階に何もないじゃん" },
      { name: b.name, text: "階段で戻った" },
    ],
    (a, b) => [
      { name: a.name, text: "うちの会社、何の会社なのか親に説明できない" },
      { name: b.name, text: "「IT系」って言っとけば大体なんとかなるよ" },
      { name: a.name, text: "うちフードテックなんだけど" },
      { name: b.name, text: "食のIT系で" },
      { name: a.name, text: "親が「で、何作ってるの？」って聞くのよ" },
      { name: b.name, text: "何作ってるんだろうな、実際" },
    ],
    (a, b) => [
      { name: a.name, text: "金曜の午後って実質もう週末だよね" },
      { name: b.name, text: "木曜の夜からそう思ってる" },
      { name: a.name, text: "早すぎて草" },
      { name: b.name, text: "いや、でもさ。月曜の朝に「あと5日」って思う人間と、木曜の夜に「もう週末」って思う人間、どっちが幸せかって話よ" },
      { name: a.name, text: "哲学の話やめてくれない？休憩室で" },
    ],
    (a, b) => [
      { name: a.name, text: "隣の部署の人めっちゃ電話の声でかくない？" },
      { name: b.name, text: "あの人、受話器に向かって叫んでるよね" },
      { name: a.name, text: "でもさ、成績いいらしいよ" },
      { name: b.name, text: "声のデカさと成績って比例するのかな" },
      { name: a.name, text: "しないでほしい" },
    ],
    (a, b) => [
      { name: a.name, text: "経費精算まだ出してないんだけど" },
      { name: b.name, text: "先月分？" },
      { name: a.name, text: "3ヶ月前の" },
      { name: b.name, text: "経理に殺されるよ" },
      { name: a.name, text: "もう殺されたい。出すのがめんどくさすぎて" },
    ],
    (a, b) => [
      { name: a.name, text: "自販機のコーヒー値上がりしてない？" },
      { name: b.name, text: "10円上がった。会社の業績と連動してる説ある" },
      { name: a.name, text: "じゃあ来月もっと上がるじゃん" },
      { name: b.name, text: "逆に業績上がったら安くなるのかな" },
      { name: a.name, text: "それは…ならないだろうな" },
    ],
    (a, b) => [
      { name: a.name, text: "昨日帰り道にうちの会社のビル見上げたんだけどさ" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "うちのフロアだけ電気ついてたのよ" },
      { name: b.name, text: "残業してたもんね" },
      { name: a.name, text: `いや、${a.gender === "F" ? "私" : "俺"}もう帰ってたのに` },
      { name: b.name, text: "…誰がいたの？" },
      { name: a.name, text: "それが怖いのよ" },
    ],
    (a, b) => [
      { name: a.name, text: "なんかさ、仕事ってなんのためにしてるんだろうね" },
      { name: b.name, text: "急にどうした" },
      { name: a.name, text: "いや、ランチのあと毎回思うのよ" },
      { name: b.name, text: "それ眠いだけじゃない？" },
      { name: a.name, text: "…かもしれない" },
    ],
    (a, b) => [
      { name: a.name, text: "新しいウォーターサーバー入ったの気づいた？" },
      { name: b.name, text: "気づいた。お湯の温度が前より2度低い" },
      { name: a.name, text: "よく気づくね" },
      { name: b.name, text: "カップ麺の仕上がりが変わったから" },
      { name: a.name, text: "そこで気づくのがすごいわ" },
    ],
    (a, b) => [
      { name: a.name, text: "今月の目標まだ未達なんだけど" },
      { name: b.name, text: "あと何日？" },
      { name: a.name, text: "3日" },
      { name: b.name, text: "奇跡を信じよう" },
      { name: a.name, text: "奇跡に頼る経営ってどうなの" },
      { name: b.name, text: "うちの会社、わりとそれで回ってるよ" },
    ],
    // === 女子社員が絡む会話（性別不問のもの） ===
    (a, b) => [
      { name: a.name, text: "なんか今日疲れた顔してない？" },
      { name: b.name, text: "え、わかる？昨日3時まで起きてた" },
      { name: a.name, text: "何してたの？" },
      { name: b.name, text: "ドラマ一気見…" },
      { name: a.name, text: "明日に影響出るやつじゃん" },
      { name: b.name, text: "出てる。いま出てる" },
    ],
    (a, b) => [
      { name: a.name, text: "最近さ、朝のコーヒーが唯一の楽しみなのよ" },
      { name: b.name, text: "わかる。あの5分だけ人間に戻る感じ" },
      { name: a.name, text: "始業したらロボットになるもんね" },
      { name: b.name, text: "高性能ロボットだと思いたい" },
    ],
    (a, b) => [
      { name: a.name, text: "最近ハマってるものある？" },
      { name: b.name, text: "推しの配信" },
      { name: a.name, text: "あー、いいよね。誰推し？" },
      { name: b.name, text: "言ったら引かない？" },
      { name: a.name, text: "引かない引かない" },
      { name: b.name, text: "…CEO" },
      { name: a.name, text: "引いた" },
    ],
    (a, b) => [
      { name: a.name, text: "デスクに写真立て置いてる人って何なんだろ" },
      { name: b.name, text: "家族とかペットとかでしょ" },
      { name: a.name, text: "あの人のデスク、猫の写真5枚あるよ" },
      { name: b.name, text: "5枚は多いね。でもちょっと見たい" },
      { name: a.name, text: "かわいいよ。こっそり見に行こ" },
    ],
    (a, b) => [
      { name: a.name, text: "今日お弁当？" },
      { name: b.name, text: "うん。昨日の残りだけど" },
      { name: a.name, text: `えらいね。${a.gender === "F" ? "私" : "俺"}コンビニ率が上がってきて自分に引いてる` },
      { name: b.name, text: "コンビニも進化してるから" },
      { name: a.name, text: "フォローありがとう" },
    ],
    (a, b) => [
      { name: a.name, text: "有給取りたいけど取りづらくない？" },
      { name: b.name, text: "わかる。忙しい時期に申請するの勇気いるよね" },
      { name: a.name, text: "でもさ、たまには何もしない日がほしいのよ" },
      { name: b.name, text: "何もしない日に限って何かしちゃうけどね" },
      { name: a.name, text: "掃除とか始めちゃうのなんでだろ" },
    ],
  ];

  // Female-only conversations (only used when both speakers are female)
  const FEMALE_GOSSIP = [
    (a, b) => [
      { name: a.name, text: "ねえ、新しくできたランチのお店行った？" },
      { name: b.name, text: "あー、あのパスタのとこ？行った行った" },
      { name: a.name, text: "どうだった？" },
      { name: b.name, text: "おいしかったけど量が多い。女子には多い" },
      { name: a.name, text: "今度シェアしよ" },
    ],
    (a, b) => [
      { name: a.name, text: "髪切った？" },
      { name: b.name, text: "え、気づいてくれた？3センチだけなんだけど" },
      { name: a.name, text: "なんか雰囲気変わったなって" },
      { name: b.name, text: "…嬉しい。誰にも言われなかったから" },
    ],
    (a, b) => [
      { name: a.name, text: "今日の服かわいいね" },
      { name: b.name, text: "ほんと？セールで買ったやつ" },
      { name: a.name, text: "似合ってる。そのカーディガンの色すごくいい" },
      { name: b.name, text: "…もう一枚買おうかな、色違いで" },
      { name: a.name, text: "買いな買いな" },
    ],
    (a, b) => [
      { name: a.name, text: "なんか最近肌荒れひどくて" },
      { name: b.name, text: "ストレス？仕事？" },
      { name: a.name, text: "たぶん睡眠。毎日5時間くらいしか寝てない" },
      { name: b.name, text: "それは肌もそうだけど身体壊すよ" },
      { name: a.name, text: "わかってるんだけど、布団入ってからスマホ見ちゃうのよ" },
      { name: b.name, text: "…わかる" },
    ],
    (a, b) => [
      { name: a.name, text: "来週の飲み会、何着てく？" },
      { name: b.name, text: "えー、考えてなかった。仕事終わりだからそのままじゃない？" },
      { name: a.name, text: "…ちょっとだけ考えてるでしょ" },
      { name: b.name, text: "一応リップは変えようかなって" },
      { name: a.name, text: "やっぱりね" },
    ],
  ];

  const ROMANCE_GOSSIP = [
    // === 既存：直球の詮索パターン ===
    (a, b, c) => [
      { name: a.name, text: `ねえ、${c.name}さんと${b.name}さんって最近よく一緒にいない？` },
      { name: b.name, text: "え？仕事の話してるだけだけど…" },
      { name: a.name, text: "仕事の話に笑顔いらなくない？" },
      { name: b.name, text: "いるでしょ普通に。コミュニケーションとして" },
      { name: a.name, text: "他の人にはしないのに？" },
      { name: b.name, text: "……この話やめていい？" },
    ],
    (a, b) => [
      { name: a.name, text: "最近いい人いるの？" },
      { name: b.name, text: "いないよ。仕事しかしてないもん" },
      { name: a.name, text: "社内にいい人いない？" },
      { name: b.name, text: "…ノーコメントで" },
      { name: a.name, text: "いるじゃん！！！" },
      { name: b.name, text: "いや、「いい人」の定義によるじゃん" },
      { name: a.name, text: "その言い方がもう答えよ" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${c.name}さんのこと気になってるでしょ` },
      { name: b.name, text: "は？なんで？" },
      { name: a.name, text: "あの人が会議で発言するたびにメモ取ってるの見た" },
      { name: b.name, text: "それは普通に仕事では…？" },
      { name: a.name, text: "他の人のときはスマホいじってるくせに" },
      { name: b.name, text: "…あの人の発言は的確だから参考になるの" },
      { name: a.name, text: "はいはい。的確ね" },
    ],
    (a, b) => [
      { name: a.name, text: "社内恋愛ってアリ？ナシ？" },
      { name: b.name, text: "アリだと思う。出会いないし" },
      { name: a.name, text: "でもバレたら地獄だよね" },
      { name: b.name, text: "もうバレてるんだけど" },
      { name: a.name, text: "えっ、誰と？" },
      { name: b.name, text: "仕事と。毎日一緒にいるし、休日も考えてるし、たまに泣く" },
      { name: a.name, text: "それはブラック企業の話じゃん" },
    ],
    (a, b) => [
      { name: a.name, text: "好きなタイプは？" },
      { name: b.name, text: "仕事できる人。あと面白い人" },
      { name: a.name, text: "じゃあCEOは？" },
      { name: b.name, text: "面白いけど仕事してるとこ見たことない" },
      { name: a.name, text: "結構バッサリいくね" },
      { name: b.name, text: "でもなんか…不思議と安心感あるよね、あの人" },
      { name: a.name, text: "おっ？" },
      { name: b.name, text: "おっ、じゃないよ" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${c.name}さんから飲みに誘われたんだけど` },
      { name: b.name, text: "え、二人で？" },
      { name: a.name, text: "「チームで」って言ってたけどまだ他に誰も誘ってないらしい" },
      { name: b.name, text: "それ二人じゃん。おめでとう" },
      { name: a.name, text: "おめでとうじゃないが" },
      { name: b.name, text: "で、行くの？" },
      { name: a.name, text: "…行く" },
      { name: b.name, text: "おめでとう" },
    ],
    (a, b) => [
      { name: a.name, text: "バレンタイン、義理チョコ配る文化まだある？" },
      { name: b.name, text: "去年廃止になった。CEOが「めんどくさい」って" },
      { name: a.name, text: "唯一のCEOのファインプレー" },
      { name: b.name, text: "でもさ、一個だけ届いてたよ。CEOのデスクに" },
      { name: a.name, text: "えっ、誰から？" },
      { name: b.name, text: "名前なかった。包装だけめちゃくちゃ丁寧だった" },
      { name: a.name, text: "…犯人捜ししていい？" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${c.name}さんのSNS見ちゃったんだけど` },
      { name: b.name, text: "ストーカーじゃん" },
      { name: a.name, text: "違うよ。おすすめに出てきたの" },
      { name: b.name, text: "で？" },
      { name: a.name, text: "なんかオシャレなカフェの写真ばっかりで…ちょっとキュンとした" },
      { name: b.name, text: "重症だね" },
      { name: a.name, text: "あとさ、たまに空の写真載せてるのよ。夕焼けとか" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "なんかそれ見て、ああこの人もこういう空見て綺麗って思うんだなって" },
      { name: b.name, text: "…完全に恋じゃん" },
    ],
    (a, b) => [
      { name: a.name, text: "職場で告白した人いる？この会社で" },
      { name: b.name, text: "去年いたらしいよ。屋上で" },
      { name: a.name, text: "結果は？" },
      { name: b.name, text: "二人とも翌月転職した" },
      { name: a.name, text: "壮大な共倒れ" },
      { name: b.name, text: "でも二人とも同じ会社に行ったらしいよ" },
      { name: a.name, text: "…ちょっと、いい話じゃん" },
    ],
    (a, b) => [
      { name: a.name, text: "最近残業ばっかりで出会いがない" },
      { name: b.name, text: "残業中に隣で仕事してる人と仲良くなるパターンあるよ" },
      { name: a.name, text: "隣の席、CEOなんだけど" },
      { name: b.name, text: "がんばれ" },
      { name: a.name, text: "がんばれって何を" },
    ],
    (a, b) => [
      { name: a.name, text: "もしさ、社内の誰かと付き合えるとしたら誰がいい？" },
      { name: b.name, text: "難しいな…仕事とプライベートは分けたい派なんだけど" },
      { name: a.name, text: "わかる。でも仮定の話として" },
      { name: b.name, text: "仮定ね…うん、仮定ね" },
      { name: a.name, text: "今めっちゃ具体的に考えたでしょ" },
      { name: b.name, text: "考えてない" },
      { name: a.name, text: "3秒黙ったけど" },
    ],

    // === 「あれ？」系：周りが小さな変化に気づく ===
    (a, b, c) => [
      { name: a.name, text: `${c.name}さん、最近お弁当持ってくるようになったよね` },
      { name: b.name, text: "あー、気づいてた。前はコンビニだったのに" },
      { name: a.name, text: "しかもなんか彩りいいのよ。卵焼きとか入ってて" },
      { name: b.name, text: "誰かに見せたいのかな" },
      { name: a.name, text: "…誰に？" },
      { name: b.name, text: "さあ。でも休憩室で食べるようになったよね、あの人" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${b.name}さん、なんか最近髪型変えた？` },
      { name: b.name, text: "え、先週から" },
      { name: a.name, text: "先週って…あの歓迎会のあと？" },
      { name: b.name, text: "…たまたま美容室の予約がその日だっただけ" },
      { name: a.name, text: "ふーん" },
      { name: b.name, text: "その「ふーん」やめてくれない？" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${c.name}さん、最近ちょっと早く来てない？` },
      { name: b.name, text: `あ、${b.gender === "F" ? "私" : "俺"}も思ってた。前はギリギリだったのに` },
      { name: a.name, text: "誰かと朝の時間が被ってるんじゃない？" },
      { name: b.name, text: "…そういう見方する？" },
      { name: a.name, text: "だって他に理由なくない？あの人が朝型になる理由" },
      { name: b.name, text: "…確かに" },
    ],
    (a, b, c) => [
      { name: a.name, text: `最近${c.name}さんの机の上にお菓子置いてあるの見た？` },
      { name: b.name, text: "あー、あのチョコ？" },
      { name: a.name, text: "あれ、誰が置いたかわかる？" },
      { name: b.name, text: "知らない。でもいつも同じ種類だよね" },
      { name: a.name, text: "好みを知ってるってことだよね" },
      { name: b.name, text: "……なんか探偵みたいになってきたね" },
    ],

    // === 「偶然が重なる」系 ===
    (a, b, c) => [
      { name: a.name, text: `また${c.name}さんとコンビニで会ったんだけど` },
      { name: b.name, text: "何回目？" },
      { name: a.name, text: "今月3回目" },
      { name: b.name, text: "住んでる方向違うのにね" },
      { name: a.name, text: "…なんで方向知ってるの" },
      { name: b.name, text: "前に聞いたことがある。なんとなく" },
      { name: a.name, text: "「なんとなく」で人の最寄り駅覚えてるの、それはそれでどうなの" },
    ],
    (a, b, c) => [
      { name: a.name, text: `この前さ、休日に本屋にいたのよ。そしたら${c.name}さんもいて` },
      { name: b.name, text: "へえ、偶然" },
      { name: a.name, text: "で、同じ棚の前にいたの" },
      { name: b.name, text: "何のコーナー？" },
      { name: a.name, text: "…旅行ガイド" },
      { name: b.name, text: "同じ場所に行きたいのかもね" },
      { name: a.name, text: "そうじゃなくて。いや…そうなのかな" },
    ],
    (a, b) => [
      { name: a.name, text: "なんかさ、会議室の予約が毎回あの人のあとなのよ" },
      { name: b.name, text: "偶然でしょ" },
      { name: a.name, text: "3週連続で？" },
      { name: b.name, text: "…それは偶然じゃないかもね" },
      { name: a.name, text: "でもどっちが合わせてるかわかんないのよ" },
      { name: b.name, text: "両方だったりして" },
    ],

    // === 「意識してない（つもり）」系 ===
    (a, b, c) => [
      { name: a.name, text: `${b.name}さんってさ、${c.name}さんの発表のとき姿勢よくなるよね` },
      { name: b.name, text: "え、そう？" },
      { name: a.name, text: "うん。他の人のときダラダラしてるのに" },
      { name: b.name, text: "…それは、あの人の資料が見やすいから前のめりになるだけで" },
      { name: a.name, text: "前のめりね" },
      { name: b.name, text: "物理的な意味でね" },
      { name: a.name, text: "はいはい、物理的ね" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${b.name}さん、今日どこ座る？` },
      { name: b.name, text: "どこでもいいよ" },
      { name: a.name, text: `…${c.name}さんの隣空いてるけど` },
      { name: b.name, text: "じゃあそこで" },
      { name: a.name, text: "即答だね" },
      { name: b.name, text: "どこでもいいって言ったじゃん。たまたまそこが空いてたから" },
      { name: a.name, text: "毎回たまたまだよね" },
    ],
    (a, b) => [
      { name: a.name, text: "なんかさ、あの人がいる日といない日で声のトーン違う人いるよね" },
      { name: b.name, text: "え、誰のこと？" },
      { name: a.name, text: "自分で気づいてないパターンか" },
      { name: b.name, text: `…え、${b.gender === "F" ? "私" : "俺"}のこと？` },
      { name: a.name, text: "今日、声明るいなって思って" },
      { name: b.name, text: "…今日誰がいるかは関係ないけど" },
      { name: a.name, text: "誰がいるかの話はしてないよ" },
      { name: b.name, text: "…あ" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${b.name}さんって、${c.name}さんの前でだけ敬語になるよね` },
      { name: b.name, text: "ならないよ。普通だよ" },
      { name: a.name, text: `今日「あ、それいいですね」って言ってた。${a.gender === "F" ? "私" : "俺"}に同じこと言うとき「あ、いいじゃん」でしょ` },
      { name: b.name, text: "…それは相手によって言葉遣い変えるのは普通で" },
      { name: a.name, text: "なんで変えるの？" },
      { name: b.name, text: "……ほっといて" },
    ],

    // === 「お互い様」系 ===
    (a, b, c) => [
      { name: a.name, text: `昨日${c.name}さんに聞かれたんだけど、「${b.name}さんって休日何してるの？」って` },
      { name: b.name, text: `え、なんで${b.gender === "F" ? "私" : "俺"}のこと？` },
      { name: a.name, text: `知らない。でもさ、先週${b.name}さんも${a.gender === "F" ? "私" : "俺"}に聞いてこなかった？「${c.name}さんって${c.gender === "F" ? "彼氏" : "彼女"}いるの？」って` },
      { name: b.name, text: "…それとこれは別の話で" },
      { name: a.name, text: "別じゃないと思うんだけど" },
    ],
    (a, b) => [
      { name: a.name, text: "あのさ、ちょっと不思議なことがあって" },
      { name: b.name, text: "なに？" },
      { name: a.name, text: "2人の人から別々に「あの人って普段どんな感じ？」って聞かれたのよ。同じ週に" },
      { name: b.name, text: "…誰と誰？" },
      { name: a.name, text: "言わないよ。でも面白いなって。同じタイミングでお互いのこと気にしてるって" },
      { name: b.name, text: "…お互い？" },
      { name: a.name, text: "あ、言いすぎた" },
    ],

    // === 「一歩手前」系：あと一言が言えない ===
    (a, b) => [
      { name: a.name, text: "昨日さ、「今日はありがとうございました」ってLINE送ろうか30分悩んだ" },
      { name: b.name, text: "送ったの？" },
      { name: a.name, text: "送った。で、既読ついて、返信来なくて、1時間後に「こちらこそ！」って来た" },
      { name: b.name, text: "…相手も悩んだんじゃない？" },
      { name: a.name, text: "え、そういうこと？" },
      { name: b.name, text: "1時間かかってるってことは、何回も文面書き直したんでしょ" },
      { name: a.name, text: "………" },
      { name: b.name, text: "おめでとう" },
      { name: a.name, text: "まだ何も起きてないけど" },
    ],
    (a, b, c) => [
      { name: a.name, text: `帰り際に${c.name}さんに「お疲れ様です」って言ったのよ` },
      { name: b.name, text: "普通じゃん" },
      { name: a.name, text: "そのあとに「…あの」って言いかけて、やめたの" },
      { name: b.name, text: "何言おうとしたの？" },
      { name: a.name, text: "「明日も頑張りましょうね」…って、言おうとしたんだけど」" },
      { name: b.name, text: "いいじゃん、言えば" },
      { name: a.name, text: "でも「明日も」って毎日のことじゃん。なんか重くない？" },
      { name: b.name, text: "重くないよ全然。でもそうやって悩んでる時点でもう…ね" },
    ],
    (a, b) => [
      { name: a.name, text: "飲み会の帰りにさ、駅まで一緒に歩いたのよ" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "で、改札の前で「じゃあ」って言って、別れたんだけど" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "そのあとちょっとだけ振り返った" },
      { name: b.name, text: "…相手は？" },
      { name: a.name, text: "知らない。振り返ったの一瞬だったから" },
      { name: b.name, text: "…もうちょっと長く振り返ればよかったのに" },
      { name: a.name, text: "…次はそうする" },
    ],
    (a, b, c) => [
      { name: a.name, text: `${c.name}さんにコーヒー買ってきてあげようかなって思ったんだけど` },
      { name: b.name, text: "買えばいいじゃん" },
      { name: a.name, text: "でもさ、「なんで私に？」って思われたら気まずいじゃん" },
      { name: b.name, text: "「ついでに」って言えばいいよ" },
      { name: a.name, text: "自分の分と2個持って行くのに「ついで」は無理あるでしょ" },
      { name: b.name, text: `じゃあ3人分買えば。${b.gender === "F" ? "私" : "俺"}の分も。完璧な言い訳になるよ` },
      { name: a.name, text: "…天才かよ" },
    ],
    (a, b) => [
      { name: a.name, text: "あのさ、傘持ってない日に雨降ってきたことあるじゃん" },
      { name: b.name, text: "ある" },
      { name: a.name, text: "あの人が「よかったらこれ使ってください」って折り畳み傘くれたのよ" },
      { name: b.name, text: "優しいね" },
      { name: a.name, text: "でもそのあと、あの人は濡れて帰ったわけじゃん" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "翌日返しに行ったとき、「風邪ひかなかったですか」って聞いたら、ちょっと笑って「大丈夫です」って" },
      { name: b.name, text: "うん" },
      { name: a.name, text: "その笑顔がさ、まだ頭から離れないのよ" },
      { name: b.name, text: "……傘、返さないほうがよかったかもね。また会う口実になるから" },
    ],

    // === 雰囲気系 ===
    (a, b, c) => [
      { name: a.name, text: `なんか${c.name}さん、最近雰囲気変わったよね` },
      { name: b.name, text: "あー、わかる。なんか柔らかくなった" },
      { name: a.name, text: "恋してるんじゃない？" },
      { name: b.name, text: "それか新しいシャンプーか" },
      { name: a.name, text: "シャンプーで雰囲気変わる？" },
      { name: b.name, text: `変わるよ。${b.gender === "F" ? "私" : "俺"}は変わった` },
      { name: a.name, text: "…変わってないけど" },
    ],
    (a, b) => [
      { name: a.name, text: "合コンセッティングしてよ" },
      { name: b.name, text: "え、私の知り合い出していいの？" },
      { name: a.name, text: "どんな人？" },
      { name: b.name, text: "全員うちの会社の人だけど" },
      { name: a.name, text: "それ普通の飲み会じゃん" },
      { name: b.name, text: "でも普段話さない人と飲むのって新鮮じゃない？" },
      { name: a.name, text: "…それはちょっとある" },
    ],
  ];

  const TRAIT_CHAT = [
    (a, b) => b.trait.name === "ポンコツ" ? [
      { name: a.name, text: `${b.name}さん、今日もなんかやらかしてた？` },
      { name: b.name, text: "コピー機壊した。3台目" },
      { name: a.name, text: "才能だよそれ" },
      { name: b.name, text: "でもさ、壊すたびに構造に詳しくなってきた" },
      { name: a.name, text: "成長の方向がおかしいのよ" },
    ] : null,
    (a, b) => b.trait.name === "野心家" ? [
      { name: a.name, text: `${b.name}さん、またCEOに直談判してたね` },
      { name: b.name, text: "自分のビジョンを伝えないと始まらないからね" },
      { name: a.name, text: "CEOめっちゃ困った顔してたけど" },
      { name: b.name, text: "あれは「困った」じゃなくて「感心してる」顔だと思う" },
      { name: a.name, text: "ポジティブすぎない？" },
    ] : null,
    (a, b) => b.trait.name === "強運" ? [
      { name: a.name, text: `${b.name}さんってなんであんな成績出せるの` },
      { name: b.name, text: `${b.gender === "F" ? "私" : "俺"}もわかんない` },
      { name: a.name, text: "正直で草" },
      { name: b.name, text: "なんかさ、困ったら右を選ぶことにしてるのよ" },
      { name: a.name, text: "経営判断それでいいの？" },
      { name: b.name, text: "今のところいける" },
    ] : null,
    (a, b) => b.mood < 30 ? [
      { name: a.name, text: `${b.name}さん最近元気なくない？` },
      { name: b.name, text: "…別に" },
      { name: a.name, text: "目が死んでるよ。昨日より" },
      { name: b.name, text: "…昨日と比較してるんだ" },
      { name: a.name, text: "毎日見てるからね、隣の席だし" },
      { name: b.name, text: "…ありがとう" },
    ] : null,
    (a, b) => b.trait.name === "カリスマ" ? [
      { name: a.name, text: `${b.name}さんの周りだけ雰囲気違うよね` },
      { name: b.name, text: "そう？普通にしてるだけだよ" },
      { name: a.name, text: "その「普通」ができないから皆苦労してるんだよ" },
      { name: b.name, text: `でもさ、${b.gender === "F" ? "私" : "俺"}だって家帰ったら何もできないよ。洗い物とか溜まってるし` },
      { name: a.name, text: "カリスマの生活感いらないんだけど" },
    ] : null,
    (a, b) => b.trait.name === "職人気質" ? [
      { name: a.name, text: `${b.name}さん、あの資料まだ？` },
      { name: b.name, text: "フォントを選んでる" },
      { name: a.name, text: "中身は？" },
      { name: b.name, text: "まだ" },
      { name: a.name, text: "フォントより中身が先では" },
      { name: b.name, text: "フォントが決まらないと中身が書けない。器が先、中身はあと" },
      { name: a.name, text: "一理ある…のか？" },
    ] : null,
    (a, b) => b.trait.name === "理論派" ? [
      { name: a.name, text: `${b.name}さんってさ、飲み会でも数字の話するよね` },
      { name: b.name, text: "この前の二次会の一人当たり単価、適正じゃなかったから" },
      { name: a.name, text: "飲み会に適正単価とかある？" },
      { name: b.name, text: "ある。データで出せる" },
    ] : null,
    (a, b) => b.trait.name === "人たらし" ? [
      { name: a.name, text: `${b.name}さんって取引先の人に好かれすぎじゃない？` },
      { name: b.name, text: "そうかな。普通に話してるだけだよ" },
      { name: a.name, text: "先方の担当者、この前お土産持ってきてたよ。個人的に" },
      { name: b.name, text: "あれは…まあ、相手のペットの誕生日覚えてただけで" },
      { name: a.name, text: "それができるのがおかしいのよ" },
    ] : null,
    (a, b) => b.trait.name === "破天荒" ? [
      { name: a.name, text: `${b.name}さん、来月の企画書見た？` },
      { name: b.name, text: "あ、あれね。ちょっと攻めた" },
      { name: a.name, text: "「ちょっと」じゃないでしょ。予算3倍で提出してたよ" },
      { name: b.name, text: "でもリターンも3倍でしょ。たぶん" },
      { name: a.name, text: "「たぶん」で3倍の予算取りにいくの怖すぎる" },
    ] : null,
  ];

  if (subs.length < 2) return chats;
  const genderMap = {};
  subs.forEach(s => { genderMap[s.name.split(" ")[0]] = s.gender; });

  const getPair = () => {
    const a = wrap(pick(subs));
    // Prefer someone with a different last name
    const bPool = subs.filter(s => s.id !== a.id && s.name.split(" ")[0] !== a.name);
    let b = bPool.length > 0 ? wrap(pick(bPool)) : wrap(pick(subs.filter(s => s.id !== a.id)));
    if (!b) b = a;
    return [a, b];
  };

  // 1-2 general chats
  const gCount = 1 + (Math.random() < 0.4 ? 1 : 0);
  for (let i = 0; i < gCount; i++) {
    let ga, gb;
    const females = subs.filter(s => s.gender === "F");
    if (females.length >= 1 && Math.random() < 0.5) {
      ga = wrap(pick(females));
      const gbPool = subs.filter(s => s.id !== ga.id && s.name.split(" ")[0] !== ga.name);
      gb = gbPool.length > 0 ? wrap(pick(gbPool)) : wrap(pick(subs.filter(s => s.id !== ga.id)));
      if (!gb) gb = ga;
    } else {
      [ga, gb] = getPair();
    }
    const gossipPool = (ga.gender === "F" && gb.gender === "F" && FEMALE_GOSSIP.length > 0)
      ? (Math.random() < 0.6 ? FEMALE_GOSSIP : OFFICE_GOSSIP)
      : OFFICE_GOSSIP;
    chats.push({ type: "gossip", icon: "☕", label: "雑談", msgs: pick(gossipPool)(ga, gb) });
  }

  // Romance (60% chance) - prefer female participants, skip if no females
  if (Math.random() < 0.6 && subs.length >= 3) {
    const females = subs.filter(s => s.gender === "F");
    if (females.length >= 1) {
      let a, b;
      if (females.length >= 2 && Math.random() < 0.6) {
        // Two women gossiping
        a = wrap(pick(females));
        const bPool = females.filter(s => s.id !== a.id && s.name.split(" ")[0] !== a.name);
        b = bPool.length > 0 ? wrap(pick(bPool)) : wrap(pick(females.filter(s => s.id !== a.id)));
      } else {
        // One woman + one other person (different display name)
        a = wrap(pick(females));
        const bPool = subs.filter(s => s.id !== a.id && s.name.split(" ")[0] !== a.name);
        b = bPool.length > 0 ? wrap(pick(bPool)) : wrap(pick(subs.filter(s => s.id !== a.id)));
      }
      if (b && a.id !== b.id) {
        const others = subs.filter(s => s.id !== a.id && s.id !== b.id);
        const cPool = others.filter(s => s.name.split(" ")[0] !== a.name && s.name.split(" ")[0] !== b.name);
        const c = cPool.length > 0 ? wrap(pick(cPool)) : others.length > 0 ? wrap(pick(others)) : b;
        chats.push({ type: "romance", icon: "💕", label: "恋バナ", msgs: pick(ROMANCE_GOSSIP)(a, b, c) });
      }
    }
  }

  // Trait-specific (40% chance)
  if (Math.random() < 0.4) {
    const [a, b] = getPair();
    for (const t of TRAIT_CHAT) {
      const r = t(a, b);
      if (r) { chats.push({ type: "trait", icon: "👀", label: "噂話", msgs: r }); break; }
    }
  }

  // Seasonal chat
  if (SEASONAL_CHAT[currentMonth] && subs.length >= 2) {
    const [a, b] = getPair();
    const template = pick(SEASONAL_CHAT[currentMonth]);
    chats.unshift({ type: "seasonal", icon: "🗓️", label: "季節の話題", msgs: template(a, b) });
  }

  return chats.map(chat => ({
    ...chat,
    msgs: chat.msgs.map(msg => ({ ...msg, gender: genderMap[msg.name] || "M" })),
  }));
}

function formatMoney(n) {
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(1)}億`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(0)}万`;
  return `${n.toFixed(0)}`;
}

const CEO_ROOM_ITEMS = [
  { id: "desk", name: "高級デスク", icon: "🪑", price: 3000000, desc: "マホガニー製。仕事はしないけど座り心地は大事", tier: 1 },
  { id: "chair", name: "エルゴノミクスチェア", icon: "💺", price: 1500000, desc: "腰痛持ちのCEOに", tier: 1 },
  { id: "plant", name: "巨大観葉植物", icon: "🌿", price: 500000, desc: "枯らさない自信はない", tier: 1 },
  { id: "aquarium", name: "熱帯魚水槽", icon: "🐠", price: 5000000, desc: "眺めてると経営のことを忘れられる", tier: 2 },
  { id: "espresso", name: "業務用エスプレッソマシン", icon: "☕", price: 2000000, desc: "部下の士気が微妙に上がる", tier: 1, effect: { type: "mood", value: 2 } },
  { id: "art", name: "現代アート", icon: "🖼️", price: 8000000, desc: "来客に「わかってる感」を出せる", tier: 2 },
  { id: "sofa", name: "革張りソファ", icon: "🛋️", price: 4000000, desc: "仮眠用。たぶん", tier: 2 },
  { id: "whiskey", name: "ウイスキーコレクション", icon: "🥃", price: 6000000, desc: "飾るだけ。たぶん", tier: 2 },
  { id: "golf", name: "パターマット", icon: "⛳", price: 1000000, desc: "会議をサボる口実", tier: 1 },
  { id: "telescope", name: "天体望遠鏡", icon: "🔭", price: 3000000, desc: "窓から見えるのはビルだけ", tier: 2 },
  { id: "wine", name: "ワインセラー", icon: "🍷", price: 10000000, desc: "年商超えてる銘柄もある", tier: 3 },
  { id: "piano", name: "グランドピアノ", icon: "🎹", price: 15000000, desc: "弾けないけど置きたかった", tier: 3 },
  { id: "theater", name: "プライベートシアター", icon: "🎬", price: 20000000, desc: "決算発表をここで見る必要はない", tier: 3 },
  { id: "helipad", name: "屋上ヘリポート", icon: "🚁", price: 50000000, desc: "ヘリは持っていない", tier: 4 },
  { id: "zen", name: "枯山水庭園", icon: "🪨", price: 30000000, desc: "心が乱れたときに。毎日乱れてるけど", tier: 3 },
  { id: "neon", name: "ネオンサイン「EMPIRE」", icon: "💡", price: 2000000, desc: "部屋の格が上がった気がする", tier: 1 },
];

function turnToDate(turn) {
  const startYear = 2026, startMonth = 4;
  const totalMonths = startMonth - 1 + turn - 1;
  const year = startYear + Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return `${year}年${month}月`;
}

function companyRank(stats) {
  const avg = Math.round((stats.tech + stats.brand + stats.share + stats.org) / 4);
  if (avg >= 80) return { title: "業界の覇者", color: "#ffd700", tier: 5 };
  if (avg >= 60) return { title: "大手", color: "#cc88ff", tier: 4 };
  if (avg >= 40) return { title: "中堅", color: "#44bb44", tier: 3 };
  if (avg >= 20) return { title: "ベンチャー", color: "#88aacc", tier: 2 };
  return { title: "スタートアップ", color: "#8a7a6a", tier: 1 };
}

const STAT_LABELS = {
  leadership: { name: "統率力", icon: "👑", desc: "企業の組織力を成長させる" },
  execution: { name: "実行力", icon: "⚙️", desc: "企業の収益に最も影響する" },
  creativity: { name: "創造力", icon: "💡", desc: "企業の技術力を成長させる" },
  negotiation: { name: "交渉力", icon: "🤝", desc: "企業の市場シェアを伸ばす" },
  stamina: { name: "体力", icon: "💪", desc: "長期の経営に耐える力" },
  luck: { name: "運", icon: "🎲", desc: "奇跡的な取引を起こす確率" },
  loyalty: { name: "忠誠心", icon: "🫡", desc: "低いと裏切りや退職のリスク" },
  ambition: { name: "野心", icon: "🔥", desc: "高いと裏切りのリスクが上がる" },
};

function StatBar({ value }) {
  const c = value >= 75 ? "#dd9922" : value >= 50 ? "#668866" : value >= 25 ? "#666" : "#554444";
  return (
    <div style={{ width: "100%", height: 7, background: "#1a1018", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 4, background: c }} />
    </div>
  );
}

function SubordinateCard({ sub, companies, expanded, onToggle }) {
  const comp = sub.assigned ? companies.find(c => c.id === sub.assigned) : null;
  const oc = sub.overall >= 70 ? "#ffd700" : sub.overall >= 50 ? "#88aa88" : sub.overall >= 30 ? "#aa8866" : "#886666";
  return (
    <div
      onClick={onToggle}
      style={{
        background: expanded ? "linear-gradient(135deg, #22202e, #2a2538)" : "linear-gradient(135deg, #16121e, #1a1624)",
        border: `1px solid ${expanded ? "#4a3a6a" : "#2a2030"}`,
        borderRadius: 10, padding: 14, cursor: "pointer", transition: "all 0.15s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: 15, color: "#e0d8c8" }}>{sub.name}</span>
          <span style={{ fontSize: 11, color: "#6a5a4a", marginLeft: 8 }}>{sub.age}歳 {sub.gender === "F" ? "♀" : "♂"}</span>
          <span style={{
            background: `${sub.trait.color}18`, border: `1px solid ${sub.trait.color}44`,
            borderRadius: 4, padding: "1px 7px", fontSize: 11, color: sub.trait.color, fontWeight: 700, marginLeft: 8,
          }}>{sub.trait.name}</span>
        </div>
        <div style={{
          background: "#0a0810", borderRadius: 20, padding: "3px 10px",
          border: `1px solid ${oc}33`,
        }}>
          <span style={{ fontSize: 10, color: "#6a5a4a" }}>総合</span>
          <span style={{ fontSize: 17, fontWeight: 900, color: oc, marginLeft: 4 }}>{sub.overall}</span>
        </div>
      </div>

      {/* Compact info */}
      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, color: "#6a5a4a", flexWrap: "wrap" }}>
        <span>気分 {sub.mood >= 80 ? "😊" : sub.mood >= 60 ? "😐" : sub.mood >= 35 ? "😤" : "💀"}{sub.mood}</span>
        <span>年俸 {formatMoney(sub.salary)}円</span>
        {sub.club && <span>{sub.club.icon}{sub.club.name}出身</span>}
        {comp ? <span style={{ color: "#55aa55" }}>→ {comp.name}</span> : <span>待機中</span>}
      </div>

      {/* Comment */}
      {sub.comment && (
        <div style={{
          marginTop: 6, padding: "5px 9px", background: "#0e0c14",
          borderRadius: 5, borderLeft: `2px solid ${sub.mood >= 60 ? "#4a6a4a" : sub.mood >= 40 ? "#6a5a3a" : "#6a3a3a"}`,
        }}>
          <span style={{ fontSize: 11, color: "#8a7a6a", fontStyle: "italic" }}>💬 「{sub.comment}」</span>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: "#5a4a3a", fontStyle: "italic", marginBottom: 8 }}>
            「{sub.quirk}」
          </div>
          <div style={{ fontSize: 10, color: "#5a4a3a", marginBottom: 8 }}>{sub.trait.desc}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px" }}>
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 10, width: 14, textAlign: "center" }}>{label.icon}</span>
                <span style={{ fontSize: 10, color: "#6a5a4a", width: 34, flexShrink: 0 }}>{label.name}</span>
                <div style={{ flex: 1, minWidth: 0 }}><StatBar value={sub.stats[key]} /></div>
                <span style={{
                  fontSize: 11, width: 22, textAlign: "right", fontWeight: 700,
                  color: sub.stats[key] >= 75 ? "#ddaa33" : sub.stats[key] >= 50 ? "#8a8a7a" : "#5a5a5a",
                }}>{sub.stats[key]}</span>
              </div>
            ))}
          </div>

          {/* Parameter Guide */}
          <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #1a1828" }}>
            <div style={{ fontSize: 9, color: "#4a3a2a", lineHeight: 1.7 }}>
              {Object.entries(STAT_LABELS).map(([key, label]) => (
                <span key={key} style={{ marginRight: 8 }}>{label.icon}<span style={{ color: "#5a4a3a" }}>{label.desc}</span></span>
              ))}
            </div>
          </div>
          {sub.history && sub.history.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1a1828" }}>
              <div style={{ fontSize: 10, color: "#5a4a3a", letterSpacing: 1, marginBottom: 6 }}>社内履歴</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {sub.history.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "start", fontSize: 10 }}>
                    <span style={{ color: "#4a4a3a", minWidth: 54, flexShrink: 0 }}>{turnToDate(h.turn)}</span>
                    <span style={{ color: "#7a6a5a" }}>{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConglomerateCEO() {
  const [screen, setScreen] = useState("title");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [customSubName, setCustomSubName] = useState("");
  const [customSubGender, setCustomSubGender] = useState("M");
  const [groupName, setGroupName] = useState("");
  const [turn, setTurn] = useState(1);
  const [money, setMoney] = useState(50000000);
  const [companies, setCompanies] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [trends, setTrends] = useState({});
  const [turnLog, setTurnLog] = useState([]);
  const [news, setNews] = useState(null);
  const [gossip, setGossip] = useState(null);
  const [rivals, setRivals] = useState([]);
  const [headhuntOffer, setHeadhuntOffer] = useState(null);
  const [breakroomChats, setBreakroomChats] = useState([]);
  const [showCompanyDetail, setShowCompanyDetail] = useState(null);
  const [roomItems, setRoomItems] = useState([]);
  const [showEnding, setShowEnding] = useState(false);
  const [recruitBonus, setRecruitBonus] = useState(0);
  const [discoveredSynergies, setDiscoveredSynergies] = useState([]);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [trendHistory, setTrendHistory] = useState({});
  const [competition, setCompetition] = useState({});
  const [tab, setTab] = useState("companies");
  const subIdRef = useRef(0);

  const initGame = useCallback(() => {
    const gn = groupNameInput.trim() || DEFAULT_GROUP_NAMES[Math.floor(Math.random() * DEFAULT_GROUP_NAMES.length)];
    setGroupName(gn);
    usedRosterNames.clear();
    const it = {}, ih = {}, ic = {};
    INDUSTRIES.forEach(ind => {
      it[ind.id] = 0.5 + (Math.random() - 0.5) * 0.3;
      ih[ind.id] = [it[ind.id]];
      ic[ind.id] = ind.baseCompetition + (Math.random() - 0.5) * 0.2;
    });
    const subs = [];
    for (let i = 0; i < 6; i++) subs.push(generateSubordinate(subIdRef.current++));
    // Custom employee (コネ入社)
    if (customSubName.trim()) {
      const custom = generateSubordinate(subIdRef.current++);
      custom.name = customSubName.trim();
      custom.gender = customSubGender;
      custom.history = [{ turn: 1, text: "入社" }];
      subs.push(custom);
    }
    setTurn(1); setMoney(50000000); setCompanies([]); setSubordinates(subs);
    setTrends(it); setTrendHistory(ih); setCompetition(ic); setTurnLog([]); setGameOver(false); setNews(null); setGossip(null); setRivals([]); setHeadhuntOffer(null); setBreakroomChats([]); setRoomItems([]); setRecruitBonus(0); setDiscoveredSynergies([]);
    setScreen("game"); setTab("companies"); setExpandedSub(null);
  }, [groupNameInput, customSubName, customSubGender]);

  // Save/Load
  const saveGame = useCallback(() => {
    try {
      const state = {
        turn, money, companies, subordinates, trends, trendHistory, competition,
        rivals, roomItems, discoveredSynergies, recruitBonus, groupName,
        tab, breakroomChats,
      };
      localStorage.setItem("teiou-save", JSON.stringify(state));
    } catch (e) { console.error("Save failed", e); }
  }, [turn, money, companies, subordinates, trends, trendHistory, competition, rivals, roomItems, discoveredSynergies, recruitBonus, groupName, tab, breakroomChats]);

  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem("teiou-save");
      if (!raw) return false;
      const s = JSON.parse(raw);
      setTurn(s.turn); setMoney(s.money); setCompanies(s.companies); setSubordinates(s.subordinates);
      setTrends(s.trends); setTrendHistory(s.trendHistory); setCompetition(s.competition || {});
      setRivals(s.rivals || []); setRoomItems(s.roomItems || []); setDiscoveredSynergies(s.discoveredSynergies || []);
      setRecruitBonus(s.recruitBonus || 0); setGroupName(s.groupName || "");
      setTab(s.tab || "companies"); setBreakroomChats(s.breakroomChats || []);
      setTurnLog([]); setGameOver(false); setNews(null); setGossip(null); setHeadhuntOffer(null);
      setScreen("game"); setExpandedSub(null);
      // Restore used names
      usedRosterNames.clear();
      (s.subordinates || []).forEach(sub => usedRosterNames.add(sub.name));
      return true;
    } catch (e) { console.error("Load failed", e); return false; }
  }, []);

  const hasSave = typeof window !== "undefined" && !!localStorage.getItem("teiou-save");

  // Auto-save when turn changes
  useEffect(() => {
    if (screen === "game" && turn > 1) saveGame();
  }, [turn, screen, saveGame]);

  const foundCompany = (industry) => {
    if (companies.length >= 5) return;
    const cost = 5000000 + Math.floor(Math.random() * 5000000);
    if (money < cost) return;
    const comp = {
      id: Date.now(), industry: industry.id, name: groupCompanyName(groupName, industry.id),
      icon: industry.icon, founded: turn, revenue: 0, totalProfit: 0,
      manager: null, health: 100, cost,
      stats: { tech: 10 + rand(0, 15), brand: 5 + rand(0, 10), share: 5 + rand(0, 10), org: 10 + rand(0, 10) },
      profitHistory: [],
      profitStreak: 0,
      chronicle: [{ turn, text: "設立" }],
    };
    setCompanies(p => [...p, comp]);
    setMoney(p => p - cost);
    setTurnLog(p => [...p, `💼 ${comp.name}を${formatMoney(cost)}円で設立`]);
    setShowFoundModal(false);
  };

  const assignManager = (companyId, subId) => {
    const comp = companies.find(c => c.id === companyId);
    const sub = subordinates.find(s => s.id === subId);
    setSubordinates(p => p.map(s => {
      if (s.id === subId) return { ...s, assigned: companyId, history: [...(s.history || []), { turn, text: `${comp?.name || ""}に配属` }] };
      if (s.assigned === companyId) return { ...s, assigned: null, history: [...(s.history || []), { turn, text: "配属解除" }] };
      return s;
    }));
    if (comp) {
      setCompanies(p => p.map(c => c.id === companyId ? { ...c, chronicle: [...(c.chronicle || []), { turn, text: `${sub?.name || ""}を責任者に任命` }] } : c));
    }
    setShowAssignModal(null);
  };

  const removeManager = (companyId) => {
    const mgr = subordinates.find(s => s.assigned === companyId);
    setSubordinates(p => p.map(s => s.assigned === companyId ? { ...s, assigned: null, history: [...(s.history || []), { turn, text: "配属解除" }] } : s));
    if (mgr) {
      setCompanies(p => p.map(c => c.id === companyId ? { ...c, chronicle: [...(c.chronicle || []), { turn, text: `${mgr.name}が離任` }] } : c));
    }
  };

  const sellCompany = (companyId) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;
    const st = comp.stats || { tech: 10, brand: 10, share: 10, org: 10 };
    const statAvg = (st.tech + st.brand + st.share + st.org) / 4;
    const rank = companyRank(st);
    const baseVal = comp.cost || 5000000;
    const val = Math.max(1000000, Math.floor(
      baseVal * (0.5 + rank.tier * 0.5) +
      statAvg * 80000 +
      comp.health * 20000 +
      Math.max(0, comp.totalProfit) * 0.4
    ));
    setMoney(p => p + val);
    setCompanies(p => p.filter(c => c.id !== companyId));
    setSubordinates(p => p.map(s => s.assigned === companyId ? { ...s, assigned: null, history: [...(s.history || []), { turn, text: `${comp.name}売却に伴い配属解除` }] } : s));
    setTurnLog(p => [...p, `📤 ${comp.name}を${formatMoney(val)}円で売却`]);
  };

  const raiseSalary = (subId) => {
    const sub = subordinates.find(s => s.id === subId);
    if (!sub) return;
    const raiseAmount = Math.round(sub.salary * 0.15);
    const newSalary = sub.salary + raiseAmount;
    const loyaltyBoost = rand(3, 6);
    setSubordinates(p => p.map(s =>
      s.id === subId ? {
        ...s,
        salary: newSalary,
        stats: { ...s.stats, loyalty: clamp(s.stats.loyalty + loyaltyBoost, 1, 99) },
        mood: Math.min(100, s.mood + rand(3, 8)),
        history: [...(s.history || []), { turn, text: `昇給（年俸${formatMoney(newSalary)}円に）` }],
      } : s
    ));
    setTurnLog(p => [...p, `💴 ${sub.name}を昇給（+${formatMoney(raiseAmount)}円/年 → 忠誠心+${loyaltyBoost}）`]);
  };

  const fireSubordinate = (subId) => {
    const sub = subordinates.find(s => s.id === subId);
    if (!sub) return;
    const severance = Math.round(sub.salary * 0.5);
    setMoney(p => p - severance);
    setSubordinates(p => p.filter(s => s.id !== subId));
    setTurnLog(p => [...p, `🚪 ${sub.name}を解雇した（退職金: ${formatMoney(severance)}円）`]);
    setExpandedSub(null);
  };

  const acceptHeadhunt = () => {
    if (!headhuntOffer) return;
    const { target, org, offer } = headhuntOffer;
    setMoney(p => p + offer);
    setSubordinates(p => p.filter(s => s.id !== target.id));
    setTurnLog(p => [...p, `💰 ${target.name}を${org}に${formatMoney(offer)}円で売却した`]);
    setTurnLog(p => [...p, `📈 人材売却の実績が業界に広まった。優秀な人材が集まりやすくなった`]);
    setRecruitBonus(p => p + 10);
    setHeadhuntOffer(null);
  };

  const rejectHeadhunt = () => {
    if (!headhuntOffer) return;
    const { target } = headhuntOffer;
    setSubordinates(p => p.map(s =>
      s.id === target.id ? {
        ...s, mood: Math.min(100, s.mood + 5),
        stats: { ...s.stats, loyalty: Math.min(99, s.stats.loyalty + 5) },
        history: [...(s.history || []), { turn, text: `引き抜きを断ってもらえた` }],
      } : s
    ));
    setTurnLog(p => [...p, `🤝 ${target.name}の引き抜きを断った。${target.name}の忠誠心が上がった`]);
    setHeadhuntOffer(null);
  };

  const advanceTurn = () => {
    const log = [];
    let currentNews = null;
    if (Math.random() < 0.4) {
      currentNews = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
      log.push(`📰 ${currentNews.text}`);
    }

    const nt = { ...trends }, nh = { ...trendHistory }, nc_comp = { ...competition };
    INDUSTRIES.forEach(ind => {
      let ch = ind.baseTrend + (Math.random() - 0.5) * ind.volatility;
      // Mean reversion: trends pull back toward 0.5
      const reversion = (0.5 - nt[ind.id]) * 0.08;
      ch += reversion;
      if (currentNews && currentNews.affects.includes(ind.id)) ch += currentNews.modifier;
      nt[ind.id] = clamp(nt[ind.id] + ch, 0.05, 0.95);
      nh[ind.id] = [...(nh[ind.id] || []), nt[ind.id]];
      // Competition follows trend: hot industries attract competitors
      const compDrift = (nt[ind.id] - 0.5) * 0.05 + (Math.random() - 0.5) * 0.06;
      nc_comp[ind.id] = clamp((nc_comp[ind.id] || ind.baseCompetition) + compDrift, 0.1, 0.95);
    });

    // Detect synergies
    const ownedIndustries = companies.map(c => c.industry);
    const newlyDiscovered = [];
    SYNERGIES.forEach(syn => {
      if (ownedIndustries.includes(syn.a) && ownedIndustries.includes(syn.b)) {
        if (!discoveredSynergies.find(d => d.name === syn.name)) {
          newlyDiscovered.push(syn);
          log.push(`🔗 シナジー発見！「${syn.name}」（${INDUSTRIES.find(i=>i.id===syn.a)?.name}×${INDUSTRIES.find(i=>i.id===syn.b)?.name}）`);
          log.push(`　　─ ${syn.desc}`);
        }
      }
    });
    if (newlyDiscovered.length > 0) {
      setDiscoveredSynergies(p => [...p, ...newlyDiscovered]);
    }
    const activeSynergies = SYNERGIES.filter(syn =>
      ownedIndustries.includes(syn.a) && ownedIndustries.includes(syn.b)
    );
    const synergyIndustries = {};
    activeSynergies.forEach(syn => {
      synergyIndustries[syn.a] = (synergyIndustries[syn.a] || 0) + syn.bonus;
      synergyIndustries[syn.b] = (synergyIndustries[syn.b] || 0) + syn.bonus;
    });

    let totalRev = 0;
    const nc = companies.map(comp => {
      const trend = nt[comp.industry];
      const compDensity = nc_comp[comp.industry] || 0.5;
      const mgr = subordinates.find(s => s.assigned === comp.id);
      let mB = 0.1;
      if (mgr) {
        const s = mgr.stats;
        mB = (s.execution * 0.25 + s.leadership * 0.2 + s.creativity * 0.15 +
              s.negotiation * 0.15 + s.stamina * 0.1 + s.luck * 0.15) / 100;
      }

      // Rank bonus: higher rank = more base revenue
      const rank = companyRank(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 });
      const rankMultiplier = 1 + (rank.tier - 1) * 0.2;
      // Competition: high competition reduces profit, but high share offsets
      const shareOffset = ((comp.stats || {}).share || 10) / 100;
      const competitionPenalty = Math.max(0.4, 1 - compDensity * 0.6 + shareOffset * 0.4);
      const synergyBonus = 1 + (synergyIndustries[comp.industry] || 0);

      let rev = Math.floor((trend * mB + (Math.random() - 0.4) * 0.5) * 5000000 * rankMultiplier * competitionPenalty * synergyBonus);
      const opCost = 1000000 + rand(0, 500000);
      let profit = rev - opCost;
      let hp = comp.health;
      if (profit > 0) hp = Math.min(100, hp + 3);
      else hp = Math.max(0, hp - 8 - (!mgr ? 10 : 0));

      if (mgr && mgr.trait.name === "強運" && Math.random() < 0.12) {
        profit += 10000000; log.push(`🎰 ${comp.name}の${mgr.name}が奇跡的な取引！+1000万`);
      }
      if (mgr && mgr.trait.name === "破天荒" && Math.random() < 0.08) {
        const sw = Math.random() < 0.5 ? 15000000 : -8000000;
        profit += sw; log.push(`🌪️ ${mgr.name}が${sw > 0 ? "大当たり" : "大失敗"}！${sw > 0 ? "+" : ""}${formatMoney(sw)}円`);
      }

      // Grow company stats
      const st = { ...(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 }) };
      if (mgr) {
        st.tech = clamp(st.tech + Math.round((mgr.stats.creativity - 40) * 0.05 + rand(-1, 2)), 0, 99);
        st.org = clamp(st.org + Math.round((mgr.stats.leadership - 40) * 0.05 + rand(-1, 2)), 0, 99);
      } else {
        st.tech = clamp(st.tech - rand(1, 3), 0, 99);
        st.org = clamp(st.org - rand(2, 4), 0, 99);
      }

      // Brand: multi-factor growth
      let brandChange = 0;
      // 1. History: age of company (slow baseline growth)
      const monthsOld = turn - comp.founded;
      if (monthsOld > 0) brandChange += Math.min(2, monthsOld * 0.03);
      // 2. Consecutive profit streak
      const streak = profit > 0 ? (comp.profitStreak || 0) + 1 : 0;
      if (streak >= 6) brandChange += 3;
      else if (streak >= 3) brandChange += 2;
      else if (streak >= 1) brandChange += 1;
      if (profit < 0) brandChange -= rand(1, 2);
      // 3. Charisma manager
      if (mgr && mgr.trait.name === "カリスマ") brandChange += rand(1, 3);
      // 4. Resilience: recovered from crisis
      if (comp.health < 30 && hp >= 30) brandChange += 5;
      // Apply
      st.brand = clamp(st.brand + Math.round(brandChange), 0, 99);

      const negoBonus = mgr ? (mgr.stats.negotiation - 40) * 0.06 : -1;
      st.share = clamp(st.share + Math.round((trend - 0.45) * 8 + negoBonus + rand(-2, 2)), 0, 99);

      const newHistory = [...(comp.profitHistory || []), profit].slice(-24);

      // Chronicle events
      const chron = [...(comp.chronicle || [])];
      const oldRank = companyRank(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 });
      const newRank = companyRank(st);
      if (newRank.tier > oldRank.tier) chron.push({ turn, text: `${newRank.title}に昇格` });
      if (comp.totalProfit <= 0 && comp.totalProfit + profit > 0) chron.push({ turn, text: "累計損益が初めて黒字に" });
      if (hp < 30 && comp.health >= 30) chron.push({ turn, text: "経営危機に陥る" });
      if (streak === 6) chron.push({ turn, text: "6ヶ月連続黒字を達成" });

      totalRev += profit;
      log.push(`${profit > 0 ? "📈" : "📉"} ${comp.name}: ${profit > 0 ? "+" : ""}${formatMoney(profit)}円 (体力${hp})`);
      return { ...comp, revenue: profit, totalProfit: comp.totalProfit + profit, health: hp, stats: st, profitHistory: newHistory, chronicle: chron, profitStreak: streak };
    });

    const surviving = [];
    nc.forEach(comp => {
      if (comp.health <= 0) {
        log.push(`💀 ${comp.name}が倒産！ ─ ${BANKRUPTCY_MSGS[Math.floor(Math.random() * BANKRUPTCY_MSGS.length)]}`);
        setSubordinates(p => p.map(s => s.assigned === comp.id ? { ...s, assigned: null } : s));
      } else surviving.push(comp);
    });

    // Track company chronicle additions from sub events
    const companyChronicleAdds = [];

    setSubordinates(prev => {
      let updated = prev.map(sub => {
        let mood = sub.mood;
        const newStats = { ...sub.stats };
        if (sub.assigned) {
          const c = surviving.find(cc => cc.id === sub.assigned);
          if (c && c.revenue > 0) {
            mood = Math.min(100, mood + rand(2, 8));
            // Success breeds loyalty... but ambition grows faster
            newStats.loyalty = clamp(newStats.loyalty + (Math.random() < 0.4 ? 1 : 0), 1, 99);
            newStats.ambition = clamp(newStats.ambition + (Math.random() < 0.5 ? rand(1, 2) : 0), 1, 99);
          }
          else if (c && c.revenue < 0) mood = Math.max(5, mood - rand(1, 4));
        } else {
          mood = Math.max(10, mood - rand(0, 2));
        }
        // Espresso machine bonus
        if (roomItems.includes("espresso")) mood = Math.min(100, mood + 2);
        // Normal quit - very rare, only extreme cases
        if (sub.stats.loyalty < 20 && mood < 15 && Math.random() < 0.08) {
          log.push(`🚶 ${sub.name}が不満を抱えて退職した…`);
          return null;
        }
        // BETRAYAL: high ambition + low loyalty + assigned + worked long enough
        if (sub.assigned && sub.turnsWorked >= 6 && sub.stats.ambition > 65 &&
            sub.stats.loyalty < 40 && sub.overall >= 45 && Math.random() < 0.06) {
          const comp = surviving.find(cc => cc.id === sub.assigned);
          if (comp) {
            const rivalName = pickCompanyName(comp.industry);
            const msg = BETRAYAL_MSGS[Math.floor(Math.random() * BETRAYAL_MSGS.length)];
            log.push(`🗡️ ${sub.name}が裏切った！「${rivalName}」を設立して独立！`);
            log.push(`　　─ ${msg}`);
            companyChronicleAdds.push({ companyId: comp.id, entry: { turn, text: `${sub.name}が裏切り、「${rivalName}」を設立して独立` } });
            setRivals(r => [...r, {
              id: Date.now() + Math.random(),
              name: rivalName,
              industry: comp.industry,
              icon: comp.icon,
              founder: sub.name,
              founderAbility: sub.overall,
              health: 80,
              founded: turn,
              threat: Math.round(sub.overall * 0.8),
              stats: {
                tech: Math.round(sub.stats.creativity * 0.6 + rand(5, 15)),
                brand: Math.round(sub.stats.execution * 0.4 + rand(5, 10)),
                share: Math.round(sub.stats.negotiation * 0.5 + rand(5, 10)),
                org: Math.round(sub.stats.leadership * 0.5 + rand(5, 10)),
              },
            }]);
            return null;
          }
        }
        // Grow subordinate stats (newStats already declared above with loyalty/ambition changes)
        const gt = sub.growthTendency || { fast: ["execution", "leadership"], slow: "stamina" };
        const isFast = (stat) => gt.fast.includes(stat);
        const isSlow = (stat) => gt.slow === stat;
        const growRate = (stat, base) => isFast(stat) ? base * 1.8 : isSlow(stat) ? base * 0.3 : base;
        let newHistory = [...(sub.history || [])];

        if (sub.assigned) {
          // Working: grow via experience
          if (Math.random() < growRate("execution", 0.35)) newStats.execution = clamp(newStats.execution + rand(1, 2), 1, 99);
          if (Math.random() < growRate("leadership", 0.25)) newStats.leadership = clamp(newStats.leadership + rand(0, 2), 1, 99);
          if (Math.random() < growRate("negotiation", 0.2)) newStats.negotiation = clamp(newStats.negotiation + rand(0, 1), 1, 99);
          if (Math.random() < growRate("creativity", 0.1)) newStats.creativity = clamp(newStats.creativity + rand(0, 1), 1, 99);
        } else {
          // Idle: self-study + random training events
          if (Math.random() < growRate("creativity", 0.25)) newStats.creativity = clamp(newStats.creativity + rand(0, 2), 1, 99);
          if (Math.random() < growRate("execution", 0.1)) newStats.execution = clamp(newStats.execution + rand(0, 1), 1, 99);
          if (Math.random() < growRate("leadership", 0.1)) newStats.leadership = clamp(newStats.leadership + rand(0, 1), 1, 99);
          if (Math.random() < growRate("negotiation", 0.1)) newStats.negotiation = clamp(newStats.negotiation + rand(0, 1), 1, 99);
          if (Math.random() < growRate("stamina", 0.1)) newStats.stamina = clamp(newStats.stamina + rand(0, 1), 1, 99);

          // Random training events (15% chance per month while idle)
          if (Math.random() < 0.15) {
            const trainings = [
              { stat: "leadership", amount: rand(2, 5), text: "リーダーシップ研修に参加" },
              { stat: "execution", amount: rand(2, 5), text: "業務効率化セミナーを受講" },
              { stat: "creativity", amount: rand(2, 5), text: "デザイン思考ワークショップに参加" },
              { stat: "negotiation", amount: rand(2, 5), text: "交渉術研修に参加" },
              { stat: "stamina", amount: rand(2, 4), text: "社内マラソン大会に出場" },
              { stat: "leadership", amount: rand(3, 6), text: "他部署でマネジメント経験を積んだ" },
              { stat: "execution", amount: rand(3, 5), text: "プロジェクト支援チームに参加" },
              { stat: "creativity", amount: rand(3, 6), text: "社外のハッカソンに出場" },
              { stat: "negotiation", amount: rand(2, 4), text: "顧客対応の研修に参加" },
              { stat: "leadership", amount: rand(2, 4), text: "新人教育の担当を務めた" },
              { stat: "creativity", amount: rand(2, 4), text: "業界カンファレンスに参加" },
            ];
            const training = trainings[Math.floor(Math.random() * trainings.length)];
            newStats[training.stat] = clamp(newStats[training.stat] + training.amount, 1, 99);
            newHistory = [...newHistory, { turn, text: training.text }];
          }
        }
        const newOverall = Math.round(
          newStats.leadership * 0.15 + newStats.execution * 0.2 + newStats.creativity * 0.15 +
          newStats.negotiation * 0.1 + newStats.stamina * 0.1 + newStats.luck * 0.1 +
          newStats.loyalty * 0.1 + newStats.ambition * 0.1
        );

        return { ...sub, mood, turnsWorked: sub.turnsWorked + 1,
          stats: newStats, overall: newOverall, history: newHistory,
          comment: pickComment({ ...sub, mood }, sub.assigned ? (surviving.find(cc => cc.id === sub.assigned)?.revenue || 0) : 0),
        };
      }).filter(Boolean);
      // Idle subordinates get restless and may quit
      updated = updated.filter(sub => {
        if (!sub.assigned && sub.turnsWorked >= 15 && sub.mood < 20 && Math.random() < 0.08) {
          log.push(`🚶 ${sub.name}が待機に耐えかねて退職した…「もう待てません」`);
          return false;
        }
        return true;
      });
      // New hire only if under cap (12)
      if (updated.length < 12 && Math.random() < 0.25) {
        const ns = generateSubordinate(subIdRef.current++);
        if (recruitBonus > 0) {
          const boost = recruitBonus;
          for (const k of Object.keys(ns.stats)) {
            ns.stats[k] = clamp(ns.stats[k] + rand(0, boost), 1, 99);
          }
          ns.overall = Math.round(
            ns.stats.leadership * 0.15 + ns.stats.execution * 0.2 + ns.stats.creativity * 0.15 +
            ns.stats.negotiation * 0.1 + ns.stats.stamina * 0.1 + ns.stats.luck * 0.1 +
            ns.stats.loyalty * 0.1 + ns.stats.ambition * 0.1
          );
        }
        ns.history = [{ turn, text: "入社" }];
        log.push(`👤 新人材「${ns.name}」(${ns.trait.name})が応募してきた`);
        updated = [...updated, ns];
      }
      return updated;
    });

    // Process rivals: they compete with your companies
    setRivals(prev => {
      return prev.map(rival => {
        const trend = nt[rival.industry] || 0.5;
        const yourComp = surviving.find(c => c.industry === rival.industry);
        const rs = rival.stats || { tech: 20, brand: 20, share: 20, org: 20 };

        // Rival stats grow each turn
        rs.tech = clamp(rs.tech + rand(0, 3), 0, 99);
        rs.brand = clamp(rs.brand + (trend > 0.5 ? rand(0, 2) : rand(-2, 1)), 0, 99);
        rs.share = clamp(rs.share + Math.round((trend - 0.45) * 4 + rand(-1, 2)), 0, 99);
        rs.org = clamp(rs.org + rand(0, 2), 0, 99);

        let hp = rival.health;
        let newThreat = rival.threat;

        if (yourComp) {
          const cs = yourComp.stats || { tech: 10, brand: 10, share: 10, org: 10 };
          // Compare 4 stats
          let wins = 0, losses = 0;
          if (cs.tech > rs.tech) wins++; else if (cs.tech < rs.tech) losses++;
          if (cs.brand > rs.brand) wins++; else if (cs.brand < rs.brand) losses++;
          if (cs.share > rs.share) wins++; else if (cs.share < rs.share) losses++;
          if (cs.org > rs.org) wins++; else if (cs.org < rs.org) losses++;

          if (wins > losses) {
            // Your company is stronger - rival weakens
            hp -= rand(5, 12);
            rs.brand = clamp(rs.brand - rand(1, 3), 0, 99);
            log.push(`⚔️ ${yourComp.name}が「${rival.name}」を圧倒している（${wins}勝${losses}敗）`);
          } else if (losses > wins) {
            // Rival is stronger - rival grows, you take damage
            hp = Math.min(100, hp + rand(1, 4));
            newThreat = Math.min(99, newThreat + rand(1, 3));
            const damage = Math.round(newThreat * trend * 3);
            totalRev -= damage * 10000;
            log.push(`⚔️ ライバル「${rival.name}」が${yourComp.name}を圧倒！ -${formatMoney(damage * 10000)}円（${losses}勝${wins}敗）`);
          } else {
            // Tie - small damage, slow decay
            const damage = Math.round(newThreat * trend * 1);
            totalRev -= damage * 10000;
            hp -= rand(1, 3);
            log.push(`⚔️ ${yourComp.name}と「${rival.name}」が拮抗（引分）-${formatMoney(damage * 10000)}円`);
          }
        } else {
          // No competing company - rival expands freely
          hp = Math.min(100, hp + rand(1, 3));
          newThreat = Math.min(99, newThreat + rand(0, 2));
        }

        // Natural decay (no parent company resources)
        hp -= rand(1, 3);

        if (hp <= 0) {
          const defeatMsg = RIVAL_DEFEAT_MSGS[Math.floor(Math.random() * RIVAL_DEFEAT_MSGS.length)];
          log.push(`🎉 ライバル「${rival.name}」が倒れた。`);
          log.push(`　　─ ${defeatMsg}`);
          // Chronicle entry for competing company
          const yourComp2 = surviving.find(c => c.industry === rival.industry);
          if (yourComp2) {
            companyChronicleAdds.push({ companyId: yourComp2.id, entry: { turn, text: `ライバル「${rival.name}」を打倒` } });
          }
          // Founder may return (50% chance)
          if (Math.random() < 0.5) {
            const returnMsg = RIVAL_RETURN_MSGS[Math.floor(Math.random() * RIVAL_RETURN_MSGS.length)];
            const rs = rival.stats || { tech: 20, brand: 20, share: 20, org: 20 };
            const returnee = generateSubordinate(subIdRef.current++);
            returnee.name = rival.founder;
            // Boosted: gained experience from running own company
            returnee.stats.leadership = clamp(returnee.stats.leadership + rand(5, 15), 1, 99);
            returnee.stats.execution = clamp(returnee.stats.execution + rand(5, 10), 1, 99);
            returnee.stats.creativity = clamp(returnee.stats.creativity + rand(3, 8), 1, 99);
            returnee.stats.negotiation = clamp(returnee.stats.negotiation + rand(3, 8), 1, 99);
            // Loyalty: higher than before but NOT maxed. They've done it once, could do it again
            returnee.stats.loyalty = clamp(rand(45, 65), 1, 99);
            // Ambition: still high. A person who started their own company doesn't lose ambition
            returnee.stats.ambition = clamp(rand(55, 80), 1, 99);
            returnee.overall = Math.round(
              returnee.stats.leadership * 0.15 + returnee.stats.execution * 0.2 + returnee.stats.creativity * 0.15 +
              returnee.stats.negotiation * 0.1 + returnee.stats.stamina * 0.1 + returnee.stats.luck * 0.1 +
              returnee.stats.loyalty * 0.1 + returnee.stats.ambition * 0.1
            );
            returnee.history = [{ turn, text: `復帰（元ライバル「${rival.name}」創業者）` }];
            returnee.mood = 60;
            setSubordinates(p => p.length < 12 ? [...p, returnee] : p);
            log.push(`🔄 ${rival.founder}が復帰を希望している！`);
            log.push(`　　─ ${returnMsg}`);
          }
          return null;
        }
        return { ...rival, health: clamp(hp, 0, 100), threat: newThreat, stats: rs };
      }).filter(Boolean);
    });

    // Apply company chronicle additions from betrayal and rival events
    if (companyChronicleAdds.length > 0) {
      setCompanies(p => p.map(c => {
        const adds = companyChronicleAdds.filter(a => a.companyId === c.id);
        if (adds.length === 0) return c;
        return { ...c, chronicle: [...(c.chronicle || []), ...adds.map(a => a.entry)] };
      }));
    }

    // HEADHUNT OFFER (random, ~7% chance)
    if (Math.random() < 0.07 && subordinates.length > 0) {
      const targets = subordinates.filter(s => s.overall >= 40);
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const org = HEADHUNT_ORGS[Math.floor(Math.random() * HEADHUNT_ORGS.length)];
        const offer = Math.max(1000000, Math.round((() => {
          const base = target.salary * 1.2;
          const abilityBonus = Math.max(0, (target.overall - 40)) * 80000;
          const managerBonus = target.assigned ? 5000000 : 0;
          const traitBonus = ["カリスマ", "天才肌", "人たらし"].includes(target.trait.name) ? 3000000 : 0;
          return base + abilityBonus + managerBonus + traitBonus + rand(-1000000, 1500000);
        })()));
        setHeadhuntOffer({ target, org, offer });
      }
    }

    setMoney(p => p + totalRev); setCompanies(surviving);
    setTrends(nt); setTrendHistory(nh); setCompetition(nc_comp); setTurnLog(log); setTurn(p => p + 1);
    setNews(currentNews);
    setGossip(Math.random() < 0.5 ? GOSSIP_POOL[Math.floor(Math.random() * GOSSIP_POOL.length)] : null);
    setBreakroomChats(generateBreakroomChats(subordinates, surviving, turn));
    if (money + totalRev <= 0 && surviving.length === 0) setGameOver(true);
  };

  const availableIndustries = INDUSTRIES.filter(ind => !companies.find(c => c.industry === ind.id));
  const freeSubordinates = subordinates.filter(s => s.assigned === null);
  const trendLabel = (v) => {
    if (v > 0.75) return { text: "🔥急成長", color: "#ff4444" };
    if (v > 0.55) return { text: "↗成長", color: "#44bb44" };
    if (v > 0.4) return { text: "→横ばい", color: "#888" };
    if (v > 0.25) return { text: "↘下降", color: "#bb8844" };
    return { text: "💀衰退", color: "#ff4444" };
  };

  if (screen === "title") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #0a0a0f 0%, #1a1025 50%, #0a0a0f 100%)",
        fontFamily: "'Noto Sans JP', sans-serif", color: "#e0d8c8", padding: 20,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&display=swap" rel="stylesheet"/>
        <div style={{ fontSize: 14, letterSpacing: 8, color: "#8a7a6a", marginBottom: 12 }}>CONGLOMERATE</div>
        <div style={{
          fontSize: 48, fontWeight: 900,
          background: "linear-gradient(135deg, #ffd700 0%, #ffaa00 50%, #ff8800 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8,
        }}>帝王の眼</div>
        <div style={{ fontSize: 14, color: "#6a5a4a", marginBottom: 48, letterSpacing: 3 }}>─ グループ企業経営シミュレーション ─</div>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#6a5a4a", marginBottom: 8 }}>グループ名を入力</div>
          <input
            type="text"
            value={groupNameInput}
            onChange={e => setGroupNameInput(e.target.value)}
            placeholder="例: アルカディア"
            maxLength={10}
            style={{
              background: "#12101a", border: "1px solid #3a3050", borderRadius: 6,
              color: "#e0d8c8", padding: "12px 16px", fontSize: 16, fontWeight: 700,
              textAlign: "center", width: 200, outline: "none",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
          <div style={{ fontSize: 11, color: "#3a3030", marginTop: 6 }}>未入力ならランダムで決まります</div>
        </div>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#6a5a4a", marginBottom: 8 }}>コネ入社させる社員（任意）</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <input
              type="text"
              value={customSubName}
              onChange={e => setCustomSubName(e.target.value)}
              placeholder="名前"
              maxLength={8}
              style={{
                background: "#12101a", border: "1px solid #3a3050", borderRadius: 6,
                color: "#e0d8c8", padding: "10px 14px", fontSize: 14, fontWeight: 700,
                textAlign: "center", width: 140, outline: "none",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            />
            <button onClick={() => setCustomSubGender(g => g === "M" ? "F" : "M")} style={{
              background: "#12101a", border: "1px solid #3a3050", borderRadius: 6,
              color: customSubGender === "F" ? "#cc88aa" : "#8a8aaa",
              padding: "10px 14px", fontSize: 14, cursor: "pointer", fontWeight: 700,
            }}>{customSubGender === "F" ? "♀" : "♂"}</button>
          </div>
          <div style={{ fontSize: 11, color: "#3a3030", marginTop: 6 }}>未入力なら通常採用のみ</div>
        </div>
        {hasSave && (
          <button onClick={loadGame} style={{
            background: "linear-gradient(135deg, #2a3a4a, #1a2a3a)", color: "#88bbdd",
            border: "1px solid #3a4a5a", padding: "14px 48px", fontSize: 16, fontWeight: 700,
            borderRadius: 4, cursor: "pointer", letterSpacing: 4, marginBottom: 12,
          }}>続きから</button>
        )}
        <button onClick={initGame} style={{
          background: "linear-gradient(135deg, #ffd700, #ff8800)", color: "#1a1025",
          border: "none", padding: "16px 48px", fontSize: 18, fontWeight: 700,
          borderRadius: 4, cursor: "pointer", letterSpacing: 4,
          boxShadow: "0 4px 24px rgba(255,170,0,0.3)",
        }}>新規で始める</button>
        <div style={{ fontSize: 12, color: "#4a4040", marginTop: 32, textAlign: "center", lineHeight: 2 }}>
          業種を読み、会社を立て、部下のパラメータを見極めろ。<br/>初期資金: 5,000万円
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Noto Sans JP', sans-serif", color: "#d0c8b8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(90deg, #1a1520, #201828)", borderBottom: "1px solid #2a2030",
        padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#ffd700" }}>{turnToDate(turn)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#6a5a4a" }}>総資産</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: money >= 0 ? "#ffd700" : "#ff4444" }}>{formatMoney(money)}円</span>
        </div>
        <div style={{ fontSize: 11, color: "#6a5a4a" }}>{groupName}グループ / {companies.length}社 / {subordinates.length}名</div>
      </div>

      {gameOver && (
        <div style={{ background: "rgba(180,20,20,0.15)", border: "1px solid #aa3333", margin: 12, padding: 20, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#ff4444", marginBottom: 8 }}>帝国崩壊</div>
          <div style={{ color: "#aa8888", marginBottom: 12 }}>{turnToDate(turn)}まで持ちこたえた（{turn}ヶ月）</div>
          <button onClick={initGame} style={{
            background: "#ffd700", color: "#1a1025", border: "none",
            padding: "10px 28px", fontWeight: 700, borderRadius: 4, cursor: "pointer",
          }}>もう一度</button>
        </div>
      )}

      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {!gameOver && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => companies.length < 5 && setShowFoundModal(true)} style={{
              background: companies.length >= 5 ? "#1a1a1a" : "linear-gradient(135deg, #2a4a2a, #1a3a1a)",
              color: companies.length >= 5 ? "#555" : "#88cc88",
              border: `1px solid ${companies.length >= 5 ? "#222" : "#3a5a3a"}`, padding: "10px 18px", borderRadius: 4,
              cursor: companies.length >= 5 ? "default" : "pointer", fontWeight: 700, fontSize: 13,
            }}>+ 設立({companies.length}/5)</button>
            <button onClick={advanceTurn} style={{
              background: "linear-gradient(135deg, #4a3a1a, #3a2a0a)", color: "#ffd700",
              border: "1px solid #5a4a2a", padding: "10px 24px", borderRadius: 4,
              cursor: "pointer", fontWeight: 700, fontSize: 13, marginLeft: "auto",
            }}>▶ 翌月へ</button>
          </div>
        )}

        {/* NEWS BANNER */}
        {(news || gossip) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {news && (
              <div style={{
                background: "linear-gradient(135deg, #1a1520, #201828)", border: "1px solid #3a3050",
                borderRadius: 8, padding: "10px 14px",
              }}>
                <div style={{ fontSize: 10, color: "#8a6a4a", letterSpacing: 2, marginBottom: 4 }}>BREAKING NEWS</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8d8b8" }}>📰 {news.text}</div>
                <div style={{ fontSize: 11, color: news.modifier > 0 ? "#55aa55" : "#cc5544", marginTop: 4 }}>
                  影響: {news.affects.map(a => INDUSTRIES.find(i => i.id === a)?.name).filter(Boolean).join("、")}
                  <span style={{ marginLeft: 8 }}>{news.modifier > 0 ? "▲ 追い風" : "▼ 逆風"}</span>
                </div>
              </div>
            )}
            {gossip && (
              <div style={{
                background: "#11101a", border: "1px solid #22202a", borderRadius: 6, padding: "8px 12px",
              }}>
                <span style={{ fontSize: 10, color: "#6a5a4a", letterSpacing: 1, marginRight: 8 }}>GOSSIP</span>
                <span style={{ fontSize: 12, color: "#8a7a6a", fontStyle: "italic" }}>🗞️ {gossip}</span>
              </div>
            )}
          </div>
        )}

        {turnLog.length > 0 && (
          <div style={{ background: "#12101a", border: "1px solid #2a2030", borderRadius: 8, padding: 10, maxHeight: 140, overflowY: "auto" }}>
            <div style={{ fontSize: 10, color: "#6a5a4a", marginBottom: 4, letterSpacing: 2 }}>{turnToDate(turn)} レポート</div>
            {turnLog.map((l, i) => <div key={i} style={{ fontSize: 12, color: "#a09888", lineHeight: 1.7 }}>{l}</div>)}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #2a2030", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { key: "companies", label: "🏢企業" },
            { key: "people", label: `👤人材(${subordinates.length})` },
            { key: "market", label: "📊市場" },
            { key: "breakroom", label: "☕休憩室" },
            { key: "ceoroom", label: "🏠CEO室" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #ffd700" : "2px solid transparent",
              color: tab === t.key ? "#ffd700" : "#6a5a4a",
              padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>

        {/* COMPANIES TAB */}
        {tab === "companies" && (
          companies.length === 0 ? (
            <div style={{ color: "#3a3030", fontSize: 13, padding: 20, textAlign: "center" }}>まだ会社がない。</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Active Synergies */}
              {(() => {
                const ownedInds = companies.map(c => c.industry);
                const active = SYNERGIES.filter(s => ownedInds.includes(s.a) && ownedInds.includes(s.b));
                return active.length > 0 ? (
                  <div style={{ background: "linear-gradient(135deg, #1a1820, #201828)", border: "1px solid #2a2840", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 10, color: "#8a7acc", letterSpacing: 2, marginBottom: 6 }}>🔗 発動中のシナジー</div>
                    {active.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#aa99cc", marginBottom: 2 }}>
                        <span style={{ fontWeight: 700 }}>{s.name}</span>
                        <span style={{ color: "#6a5a7a", fontSize: 10, marginLeft: 6 }}>+{Math.round(s.bonus * 100)}%</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
              {companies.map(comp => {
                const mgr = subordinates.find(s => s.assigned === comp.id);
                const trend = trendLabel(trends[comp.industry]);
                const rank = companyRank(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 });
                return (
                  <div key={comp.id} onClick={() => setShowCompanyDetail(comp.id)} style={{
                    background: "linear-gradient(135deg, #18141e, #1e1828)",
                    border: `1px solid ${comp.health < 30 ? "#aa3333" : "#2a2030"}`,
                    borderRadius: 8, padding: 12, cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 16, marginRight: 6 }}>{comp.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{comp.name}</span>
                        <span style={{ fontSize: 11, color: "#6a5a4a", marginLeft: 6 }}>{INDUSTRIES.find(i => i.id === comp.industry)?.name}</span>
                      </div>
                      <span style={{
                        fontSize: 10, color: rank.color, fontWeight: 700,
                        background: `${rank.color}15`, border: `1px solid ${rank.color}33`,
                        borderRadius: 4, padding: "2px 8px",
                      }}>{rank.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
                      <div>
                        <span style={{ color: "#6a5a4a" }}>体力 </span>
                        <span style={{ color: comp.health > 60 ? "#44aa44" : comp.health > 30 ? "#aaaa44" : "#aa4444", fontWeight: 700 }}>{comp.health}</span>
                      </div>
                      <div><span style={{ color: "#6a5a4a" }}>業界 </span><span style={{ color: trend.color }}>{trend.text}</span></div>
                      <div>
                        <span style={{ color: "#6a5a4a" }}>損益 </span>
                        <span style={{ color: comp.revenue >= 0 ? "#44aa44" : "#aa4444" }}>{comp.revenue >= 0 ? "+" : ""}{formatMoney(comp.revenue)}円</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      <span style={{ color: "#6a5a4a" }}>責任者: </span>
                      {mgr ? (
                        <span>
                          <span style={{ color: "#ccbb88", fontWeight: 700 }}>{mgr.name}</span>
                          <span style={{ color: "#6a5a4a" }}> ({mgr.trait.name}/総合{mgr.overall})</span>
                        </span>
                      ) : <span style={{ color: "#aa4444" }}>不在</span>}
                    </div>
                    {mgr && mgr.comment && (
                      <div style={{
                        marginTop: 6, padding: "6px 10px", background: "#0e0c14",
                        borderRadius: 6, borderLeft: `2px solid ${mgr.mood >= 60 ? "#4a6a4a" : mgr.mood >= 40 ? "#6a5a3a" : "#6a3a3a"}`,
                      }}>
                        <span style={{ fontSize: 11, color: "#8a7a6a", fontStyle: "italic" }}>
                          💬 「{mgr.comment}」
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* RIVALS (shown in companies tab) */}
        {tab === "companies" && rivals.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, color: "#aa4444", letterSpacing: 2, marginBottom: 6 }}>⚔️ ライバル企業</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rivals.map(rival => {
                const ind = INDUSTRIES.find(i => i.id === rival.industry);
                const rs = rival.stats || { tech: 20, brand: 20, share: 20, org: 20 };
                const yourComp = companies.find(c => c.industry === rival.industry);
                const cs = yourComp?.stats || null;
                return (
                  <div key={rival.id} style={{
                    background: "linear-gradient(135deg, #1e1418, #221820)",
                    border: "1px solid #3a2028", borderRadius: 8, padding: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{rival.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#cc8888" }}>{rival.name}</span>
                      <span style={{ fontSize: 11, color: "#6a4a4a" }}>{ind?.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 11 }}>
                      <span style={{ color: "#8a5a5a" }}>元{rival.founder}</span>
                      <span style={{ color: "#8a5a5a" }}>脅威<span style={{ color: rival.threat > 50 ? "#dd5544" : "#aa8855", fontWeight: 700 }}>{rival.threat}</span></span>
                      <span style={{ color: "#8a5a5a" }}>体力<span style={{ color: rival.health > 50 ? "#888" : "#aa5544" }}>{rival.health}</span></span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px", marginTop: 6, fontSize: 10 }}>
                      {[
                        { key: "tech", name: "技術", icon: "🔬" },
                        { key: "brand", name: "ブランド", icon: "✨" },
                        { key: "share", name: "シェア", icon: "📊" },
                        { key: "org", name: "組織", icon: "🏛️" },
                      ].map(s => {
                        const rv = rs[s.key] || 0;
                        const mv = cs ? cs[s.key] || 0 : null;
                        const winning = mv !== null && mv > rv;
                        const losing = mv !== null && mv < rv;
                        return (
                          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span>{s.icon}</span>
                            <span style={{ color: "#6a4a4a", width: 30 }}>{s.name}</span>
                            <span style={{ color: losing ? "#dd5544" : winning ? "#55aa55" : "#888", fontWeight: 700 }}>{rv}</span>
                            {mv !== null && <span style={{ color: "#4a3a3a", fontSize: 9 }}>({winning ? "勝" : losing ? "負" : "="})</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PEOPLE TAB */}
        {tab === "people" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {subordinates.length === 0 ? (
              <div style={{ color: "#3a3030", fontSize: 13, padding: 20, textAlign: "center" }}>人材がいない</div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "#5a4a3a", marginBottom: 2 }}>タップで詳細パラメータを表示</div>
                {[...subordinates].sort((a, b) => b.overall - a.overall).map(sub => (
                  <SubordinateCard
                    key={sub.id} sub={sub} companies={companies}
                    expanded={expandedSub === sub.id}
                    onToggle={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                  />
                ))}
                {expandedSub && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => raiseSalary(expandedSub)} style={{
                      flex: 1, background: "linear-gradient(135deg, #2a3a1a, #1a2a0a)", color: "#aacc66",
                      border: "1px solid #3a4a2a", borderRadius: 6, padding: "8px 16px",
                      cursor: "pointer", fontSize: 13, fontWeight: 700,
                    }}>💴 昇給（忠誠心↑）</button>
                    <button onClick={() => fireSubordinate(expandedSub)} style={{
                      background: "#2a1a1a", color: "#aa4444", border: "1px solid #4a2020",
                      borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    }}>🚪 解雇</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MARKET TAB */}
        {tab === "market" && (
          <div style={{ background: "#12101a", border: "1px solid #2a2030", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {INDUSTRIES.map(ind => {
              const val = trends[ind.id] || 0.5;
              const t = trendLabel(val);
              const owned = companies.find(c => c.industry === ind.id);
              const comp_d = competition[ind.id] || ind.baseCompetition;
              const compLabel = comp_d >= 0.75 ? "激戦" : comp_d >= 0.5 ? "混戦" : comp_d >= 0.3 ? "穏やか" : "ブルーオーシャン";
              const compColor = comp_d >= 0.75 ? "#dd5544" : comp_d >= 0.5 ? "#aa8844" : comp_d >= 0.3 ? "#668866" : "#4488aa";
              const hist = trendHistory[ind.id] || [];
              const prev = hist.length >= 2 ? hist[hist.length - 2] : val;
              const diff = val - prev;
              const diffStr = diff > 0.001 ? `+${(diff*100).toFixed(0)}` : diff < -0.001 ? `${(diff*100).toFixed(0)}` : "";
              const diffColor = diff > 0.001 ? "#44bb44" : diff < -0.001 ? "#dd5544" : "#666";
              // Trend prediction based on recent momentum
              const recent = hist.slice(-6);
              const momentum = recent.length >= 3 ? (recent[recent.length - 1] - recent[0]) / recent.length : 0;
              const prediction = momentum > 0.02 ? "▲" : momentum < -0.02 ? "▼" : "─";
              const predColor = momentum > 0.02 ? "#44bb44" : momentum < -0.02 ? "#dd5544" : "#555";
              // Sparkline: show month-over-month changes
              const spark = hist.slice(-17);
              const deltas = [];
              for (let i = 1; i < spark.length; i++) deltas.push(spark[i] - spark[i - 1]);
              const maxDelta = deltas.length > 0 ? Math.max(...deltas.map(Math.abs), 0.01) : 0.01;
              return (
                <div key={ind.id} style={{ padding: "6px 0", borderBottom: "1px solid #1a1828" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ fontSize: 14 }}>{ind.icon}</span>
                    <span style={{ color: "#a09888", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ind.name}</span>
                    {owned && <span style={{ fontSize: 9, color: "#ffd70088" }}>参入中</span>}
                    <span style={{ color: t.color, fontWeight: 700, fontSize: 11, width: 48, textAlign: "right" }}>{t.text}</span>
                    <span style={{ color: diffColor, fontSize: 11, fontWeight: 700, width: 24, textAlign: "right" }}>{diffStr}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginLeft: 22 }}>
                    {/* Sparkline */}
                    <div style={{ display: "flex", gap: 1, height: 20, flex: 1, position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 1, background: "#2a2030" }} />
                      {deltas.map((d, i) => {
                        const h = Math.max(1, Math.abs(d) / maxDelta * 9);
                        return (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 3, height: 20 }}>
                            <div style={{ height: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                              {d >= 0 && <div style={{ width: "100%", height: h, background: i === deltas.length - 1 ? "#44aa44" : "#2a5a2a", borderRadius: 1 }} />}
                            </div>
                            <div style={{ height: 10, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                              {d < 0 && <div style={{ width: "100%", height: h, background: i === deltas.length - 1 ? "#dd5544" : "#5a2a2a", borderRadius: 1 }} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: 10, color: predColor, width: 40, textAlign: "right" }}>
                      予測{prediction}
                    </span>
                    <span style={{ fontSize: 9, color: compColor, width: 48, textAlign: "right", fontWeight: 700 }}>
                      {compLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BREAKROOM TAB */}
        {tab === "breakroom" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "#12101a", border: "1px solid #2a2030", borderRadius: 10,
              padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>☕</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a09080" }}>休憩室</div>
              <div style={{ fontSize: 11, color: "#5a4a3a", marginTop: 4 }}>社員たちの会話が聞こえてくる…</div>
            </div>

            {breakroomChats.length === 0 ? (
              <div style={{ color: "#3a3030", fontSize: 13, padding: 20, textAlign: "center" }}>
                まだ誰も話していない。翌月に進むと会話が聞こえてくるよ。
              </div>
            ) : (
              breakroomChats.map((chat, ci) => (
                <div key={ci} style={{
                  background: "linear-gradient(135deg, #14121a, #181622)",
                  border: "1px solid #22202a", borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{
                    fontSize: 10, color: chat.type === "romance" ? "#cc88aa" : chat.type === "trait" ? "#88aacc" : "#8a7a6a",
                    letterSpacing: 2, marginBottom: 8,
                  }}>
                    {chat.icon} {chat.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {chat.msgs.map((msg, mi) => (
                      <div key={mi} style={{ display: "flex", gap: 8, alignItems: "start" }}>
                        <span style={{
                          fontSize: 11, color: msg.gender === "F" ? "#cc88aa" : "#8a8aaa", fontWeight: 700,
                          minWidth: 56, flexShrink: 0, textAlign: "right",
                        }}>
                          {msg.name}{msg.gender === "F" ? "♀" : "♂"}
                        </span>
                        <span style={{
                          fontSize: 12, color: "#c0b8a8", lineHeight: 1.6,
                          background: "#1e1c28", borderRadius: 8, padding: "4px 10px",
                          borderTopLeftRadius: 2,
                        }}>
                          {msg.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CEO ROOM TAB */}
        {tab === "ceoroom" && (() => {
          const owned = roomItems;
          const roomTier = owned.length === 0 ? "殺風景なオフィス" :
            owned.length <= 3 ? "それなりの部屋" :
            owned.length <= 7 ? "立派な執務室" :
            owned.length <= 11 ? "豪華なCEOスイート" : "もはや宮殿";
          const totalSpent = CEO_ROOM_ITEMS.filter(i => owned.includes(i.id)).reduce((s, i) => s + i.price, 0);
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "linear-gradient(135deg, #18141e, #201828)", border: "1px solid #2a2030",
              borderRadius: 10, padding: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏢</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e0d8c8" }}>{roomTier}</div>
              <div style={{ fontSize: 11, color: "#6a5a4a", marginTop: 4 }}>
                所有アイテム {owned.length}/{CEO_ROOM_ITEMS.length} ─ 投資総額 {formatMoney(totalSpent)}円
              </div>
              {owned.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
                  {CEO_ROOM_ITEMS.filter(i => owned.includes(i.id)).map(item => (
                    <span key={item.id} style={{ fontSize: 22 }} title={item.name}>{item.icon}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: "#6a5a4a", letterSpacing: 2 }}>購入可能</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CEO_ROOM_ITEMS.filter(i => !owned.includes(i.id)).map(item => {
                const canBuy = money >= item.price;
                return (
                  <div key={item.id} style={{
                    background: "linear-gradient(135deg, #14121a, #1a1624)",
                    border: "1px solid #2a2030", borderRadius: 8, padding: "10px 14px",
                    opacity: canBuy ? 1 : 0.5,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#d0c8b8" }}>{item.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!canBuy) return;
                          setMoney(p => p - item.price);
                          setRoomItems(p => [...p, item.id]);
                          setTurnLog(p => [...p, `🛒 ${item.name}を購入（${formatMoney(item.price)}円）`]);
                        }}
                        disabled={!canBuy}
                        style={{
                          background: canBuy ? "linear-gradient(135deg, #3a3a1a, #2a2a0a)" : "#1a1a1a",
                          color: canBuy ? "#ffd700" : "#444",
                          border: `1px solid ${canBuy ? "#5a5a2a" : "#222"}`,
                          borderRadius: 4, padding: "4px 12px", fontSize: 12,
                          cursor: canBuy ? "pointer" : "default", fontWeight: 700,
                        }}
                      >{formatMoney(item.price)}円</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#6a5a4a", marginTop: 4, marginLeft: 26 }}>{item.desc}</div>
                    {item.effect && (
                      <div style={{ fontSize: 10, color: "#88aa66", marginTop: 2, marginLeft: 26 }}>
                        効果: 全社員の気分+{item.effect.value}/月
                      </div>
                    )}
                  </div>
                );
              })}
              {CEO_ROOM_ITEMS.filter(i => !owned.includes(i.id)).length === 0 && (
                <div style={{ color: "#6a5a4a", fontSize: 13, padding: 20, textAlign: "center" }}>
                  全アイテム購入済み。もはや宮殿。
                </div>
              )}
            </div>

            {owned.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: "#6a5a4a", letterSpacing: 2 }}>所有アイテム</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {CEO_ROOM_ITEMS.filter(i => owned.includes(i.id)).map(item => (
                    <div key={item.id} style={{
                      background: "#12101a", border: "1px solid #22202a", borderRadius: 6,
                      padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: "#a09888", flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 10, color: "#4a4a3a" }}>{formatMoney(item.price)}円</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Synergy Collection */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#8a7acc", letterSpacing: 2, marginBottom: 8 }}>🔗 発見したシナジー ({discoveredSynergies.length}/{SYNERGIES.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SYNERGIES.map((syn, i) => {
                  const found = discoveredSynergies.find(d => d.name === syn.name);
                  return (
                    <div key={i} style={{
                      background: found ? "#14121e" : "#0e0c10",
                      border: `1px solid ${found ? "#2a2840" : "#1a1820"}`,
                      borderRadius: 6, padding: "6px 10px",
                    }}>
                      {found ? (
                        <div>
                          <div style={{ fontSize: 12, color: "#aa99cc", fontWeight: 700 }}>{syn.name}</div>
                          <div style={{ fontSize: 10, color: "#6a5a7a" }}>
                            {INDUSTRIES.find(ii=>ii.id===syn.a)?.name}×{INDUSTRIES.find(ii=>ii.id===syn.b)?.name} ─ {syn.desc}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#2a2830" }}>？？？</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ending Button */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a1828", textAlign: "center" }}>
              <button onClick={() => setShowEnding(true)} style={{
                background: "none", border: "1px solid #2a2030", borderRadius: 8,
                color: "#4a4a3a", padding: "12px 24px", fontSize: 12, cursor: "pointer",
                letterSpacing: 2,
              }}>この物語を終える</button>
              <div style={{ fontSize: 10, color: "#2a2a2a", marginTop: 6 }}>※ゲームは終了しません</div>
            </div>
          </div>
          );
        })()}

      </div>

      {/* ENDING MODAL */}
      {showEnding && (() => {
        const monthsPlayed = turn - 1;
        const totalCompanies = companies.length;
        const totalSubs = subordinates.length;
        const happySubs = subordinates.filter(s => s.mood >= 60).length;
        const assignedSubs = subordinates.filter(s => s.assigned).length;
        const totalRoomItems = roomItems.length;
        const highestRank = companies.reduce((best, c) => {
          const r = companyRank(c.stats || { tech: 10, brand: 10, share: 10, org: 10 });
          return r.tier > best.tier ? r : best;
        }, { tier: 0, title: "なし" });

        return (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#0a0a0f", overflowY: "auto", zIndex: 300,
          display: "flex", justifyContent: "center",
        }}>
          <div style={{
            maxWidth: 480, width: "100%", padding: "60px 24px",
            color: "#a09888", fontSize: 14, lineHeight: 2.2,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 12, color: "#4a4a3a", letterSpacing: 6, marginBottom: 12 }}>ENDING</div>
              <div style={{
                fontSize: 28, fontWeight: 900,
                background: "linear-gradient(135deg, #ffd700, #ff8800)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>帝王の眼</div>
            </div>

            <div style={{ color: "#6a5a4a", marginBottom: 24 }}>
              {turnToDate(turn)}。
            </div>

            <div style={{ marginBottom: 20 }}>
              あなたはモニターの前に座っている。
              いつもと同じ椅子に、いつもと同じ姿勢で。
            </div>

            <div style={{ marginBottom: 20 }}>
              {monthsPlayed}ヶ月の間に、{totalCompanies}つの会社を束ね、
              {totalSubs}人の人間と関わった。
              数字が上がる日もあれば、下がる日もあった。
              裏切られたこともあったし、助けられたこともあった。
            </div>

            <div style={{ marginBottom: 20 }}>
              あなたは何をしただろう。
              会社を立てて、人を配置して、翌月ボタンを押した。
              それだけだ。それだけのことを、ずっと繰り返した。
            </div>

            <div style={{ marginBottom: 20 }}>
              でも、その間に部下たちは勝手に成長していた。
              休憩室でくだらない話をしていた。
              誰かを好きになったり、なりかけたりしていた。
              {happySubs > 0 && `今、${happySubs}人が笑っている。`}
            </div>

            <div style={{ marginBottom: 20 }}>
              {totalRoomItems > 0
                ? `あなたの部屋には${totalRoomItems}個のアイテムがある。グランドピアノがあるかもしれないし、ヘリポートがあるかもしれない。でも結局、一番使ったのはたぶんエスプレッソマシンだ。`
                : "あなたの部屋には何もない。殺風景なデスクと、モニターだけ。でも、それで十分だった。"
              }
            </div>

            <div style={{ marginBottom: 20 }}>
              {highestRank.tier >= 4
                ? "帝国は完成した。あなたの眼は、すべてを見渡せる場所にある。"
                : highestRank.tier >= 2
                ? "帝国はまだ途中だ。でも、途中であることが悪いとは限らない。"
                : "帝国はまだ始まったばかりだ。でも、始めたということが、もう十分すごい。"
              }
            </div>

            <div style={{ marginBottom: 20, color: "#5a4a3a" }}>
              ──
            </div>

            <div style={{ marginBottom: 20 }}>
              帝王の眼とは何だったのか。
            </div>

            <div style={{ marginBottom: 20 }}>
              支配する目ではなかった。
              数字を追う目でもなかった。
            </div>

            <div style={{ marginBottom: 40 }}>
              たぶん、見守る目だった。
            </div>

            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#3a3a3a", letterSpacing: 4, marginBottom: 24 }}>FIN</div>
              <div style={{ fontSize: 11, color: "#3a3030" }}>
                {turnToDate(turn)} / {groupName}グループ / 総資産 {formatMoney(money)}円 / 傘下{totalCompanies}社 / 社員{totalSubs}名
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => setShowEnding(false)} style={{
                background: "none", border: "1px solid #2a2030", borderRadius: 8,
                color: "#6a5a4a", padding: "12px 32px", fontSize: 13, cursor: "pointer",
              }}>戻る</button>
            </div>

            <div style={{ height: 60 }} />
          </div>
        </div>
        );
      })()}

      {/* COMPANY DETAIL MODAL */}
      {showCompanyDetail && (() => {
        const comp = companies.find(c => c.id === showCompanyDetail);
        if (!comp) return null;
        const mgr = subordinates.find(s => s.assigned === comp.id);
        const ind = INDUSTRIES.find(i => i.id === comp.industry);
        const trend = trendLabel(trends[comp.industry]);
        const rank = companyRank(comp.stats || { tech: 10, brand: 10, share: 10, org: 10 });
        const compRivals = rivals.filter(r => r.industry === comp.industry);
        const hist = comp.profitHistory || [];
        const maxProfit = hist.length > 0 ? Math.max(...hist.map(Math.abs), 1) : 1;
        const monthsActive = turn - comp.founded;

        const COMP_STATS = [
          { key: "tech", name: "技術力", icon: "🔬", desc: "責任者の創造力で成長" },
          { key: "brand", name: "ブランド力", icon: "✨", desc: "歴史・連続黒字・カリスマ・逆境復活で成長" },
          { key: "share", name: "市場シェア", icon: "📊", desc: "交渉力+業界トレンドで成長" },
          { key: "org", name: "組織力", icon: "🏛️", desc: "責任者の統率力で成長" },
        ];

        return (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "start", justifyContent: "center",
          padding: "40px 16px 16px", zIndex: 100, overflowY: "auto",
        }} onClick={() => setShowCompanyDetail(null)}>
          <div style={{
            background: "linear-gradient(135deg, #14121a, #1a1828)",
            border: "1px solid #2a2030", borderRadius: 14,
            padding: 20, maxWidth: 480, width: "100%",
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 24, marginRight: 8 }}>{comp.icon}</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: "#e8d8c8" }}>{comp.name}</span>
                <div style={{ fontSize: 12, color: "#6a5a4a", marginTop: 2 }}>{ind?.name}</div>
              </div>
              <span style={{
                fontSize: 12, color: rank.color, fontWeight: 700,
                background: `${rank.color}18`, border: `1px solid ${rank.color}44`,
                borderRadius: 6, padding: "4px 12px",
              }}>{rank.title}</span>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #22202a" }}>
              <div><span style={{ color: "#6a5a4a" }}>設立 </span><span style={{ color: "#aaa" }}>{turnToDate(comp.founded)}</span></div>
              <div><span style={{ color: "#6a5a4a" }}>経過 </span><span style={{ color: "#aaa" }}>{monthsActive}ヶ月</span></div>
              <div><span style={{ color: "#6a5a4a" }}>体力 </span><span style={{ color: comp.health > 60 ? "#44aa44" : comp.health > 30 ? "#aaaa44" : "#aa4444", fontWeight: 700 }}>{comp.health}</span></div>
              <div><span style={{ color: "#6a5a4a" }}>業界 </span><span style={{ color: trend.color }}>{trend.text}</span></div>
            </div>

            {/* Company Growth Stats */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#6a5a4a", letterSpacing: 2, marginBottom: 8 }}>企業ステータス</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {COMP_STATS.map(cs => {
                  const val = (comp.stats || {})[cs.key] || 0;
                  const col = val >= 70 ? "#dd9922" : val >= 40 ? "#668866" : "#555";
                  return (
                    <div key={cs.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, width: 18, textAlign: "center" }}>{cs.icon}</span>
                      <span style={{ fontSize: 11, color: "#8a7a6a", width: 56, flexShrink: 0 }}>{cs.name}</span>
                      <div style={{ flex: 1, height: 8, background: "#1a1018", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${val}%`, height: "100%", borderRadius: 4, background: col }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: col, width: 24, textAlign: "right" }}>{val}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: "#4a3a2a", marginTop: 6, textAlign: "right" }}>
                次の格: {rank.tier < 5 ? ["ベンチャー","中堅","大手","業界の覇者"][rank.tier - 1] : "─"} (平均{rank.tier < 5 ? [20,40,60,80][rank.tier - 1] : "MAX"}以上)
              </div>
            </div>

            {/* Profit History Chart */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#6a5a4a", letterSpacing: 2, marginBottom: 8 }}>損益推移</div>
              {hist.length === 0 ? (
                <div style={{ fontSize: 12, color: "#3a3030", padding: 12, textAlign: "center" }}>データなし（翌月からグラフが表示されます）</div>
              ) : (
                <div style={{ display: "flex", gap: 2, height: 80, padding: "0 4px", position: "relative" }}>
                  {/* Center line */}
                  <div style={{ position: "absolute", left: 0, right: 0, top: 40, height: 1, background: "#2a2030" }} />
                  {hist.map((p, i) => {
                    const h = Math.max(2, Math.abs(p) / maxProfit * 36);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 4, height: 80 }}>
                        {/* Top half: profit bars grow upward */}
                        <div style={{ height: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                          {p >= 0 && <div style={{ width: "100%", height: h, background: "#2a6a2a", borderRadius: 2 }} />}
                        </div>
                        {/* Bottom half: loss bars grow downward */}
                        <div style={{ height: 40, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                          {p < 0 && <div style={{ width: "100%", height: h, background: "#6a2a2a", borderRadius: 2 }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
                <div><span style={{ color: "#6a5a4a" }}>直近損益 </span><span style={{ color: comp.revenue >= 0 ? "#44aa44" : "#aa4444", fontWeight: 700 }}>{comp.revenue >= 0 ? "+" : ""}{formatMoney(comp.revenue)}円</span></div>
                <div><span style={{ color: "#6a5a4a" }}>累計 </span><span style={{ color: comp.totalProfit >= 0 ? "#88aa88" : "#aa6666", fontWeight: 700 }}>{comp.totalProfit >= 0 ? "+" : ""}{formatMoney(comp.totalProfit)}円</span></div>
              </div>
            </div>

            {/* Chronicle */}
            {comp.chronicle && comp.chronicle.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#6a5a4a", letterSpacing: 2, marginBottom: 8 }}>沿革</div>
                <div style={{
                  background: "#0e0c14", borderRadius: 8, padding: "10px 12px",
                  borderLeft: "2px solid #2a2040",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {comp.chronicle.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 11 }}>
                        <span style={{ color: "#4a4a3a", minWidth: 60, flexShrink: 0 }}>{turnToDate(c.turn)}</span>
                        <span style={{ color: "#8a7a6a" }}>{c.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rivals */}
            {compRivals.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#aa5544", letterSpacing: 2, marginBottom: 8 }}>⚔️ 競合ライバル</div>
                {compRivals.map(r => {
                  const rs = r.stats || { tech: 20, brand: 20, share: 20, org: 20 };
                  const cs = comp.stats || { tech: 10, brand: 10, share: 10, org: 10 };
                  const statList = [
                    { key: "tech", name: "技術力", icon: "🔬" },
                    { key: "brand", name: "ブランド", icon: "✨" },
                    { key: "share", name: "シェア", icon: "📊" },
                    { key: "org", name: "組織力", icon: "🏛️" },
                  ];
                  const wins = statList.filter(s => cs[s.key] > rs[s.key]).length;
                  const losses = statList.filter(s => cs[s.key] < rs[s.key]).length;
                  return (
                  <div key={r.id} style={{
                    background: "#1a1218", border: "1px solid #2a1820", borderRadius: 6, padding: "10px 12px", marginBottom: 6,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "#cc8888", fontWeight: 700 }}>{r.name}</span>
                      <span style={{ color: "#8a5a5a", fontSize: 11 }}>脅威{r.threat} / 体力{r.health}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#6a4a4a", marginBottom: 6 }}>元{r.founder}</div>
                    {statList.map(s => {
                      const rv = rs[s.key] || 0;
                      const mv = cs[s.key] || 0;
                      const total = Math.max(rv + mv, 1);
                      return (
                        <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, fontSize: 10 }}>
                          <span style={{ width: 14, textAlign: "center" }}>{s.icon}</span>
                          <span style={{ color: mv > rv ? "#55aa55" : "#888", width: 18, textAlign: "right", fontWeight: 700 }}>{mv}</span>
                          <div style={{ flex: 1, height: 6, background: "#1a1018", borderRadius: 3, display: "flex", overflow: "hidden" }}>
                            <div style={{ width: `${(mv / total) * 100}%`, height: "100%", background: "#2a5a2a" }} />
                            <div style={{ width: `${(rv / total) * 100}%`, height: "100%", background: "#5a2a2a" }} />
                          </div>
                          <span style={{ color: rv > mv ? "#dd5544" : "#888", width: 18, fontWeight: 700 }}>{rv}</span>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 10, color: wins > losses ? "#55aa55" : losses > wins ? "#dd5544" : "#888", marginTop: 4, textAlign: "right" }}>
                      {wins > losses ? `自社優勢（${wins}勝${losses}敗）` : losses > wins ? `ライバル優勢（${losses}勝${wins}敗）` : "拮抗"}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Employee Voices */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#6a5a4a", letterSpacing: 2, marginBottom: 8 }}>💬 社員の声</div>
              <div style={{
                background: "#0e0c14", borderRadius: 8, padding: "10px 12px",
                borderLeft: `2px solid ${rank.tier >= 5 ? "#4a6a4a" : comp.health < 30 ? "#6a3a3a" : "#2a2040"}`,
              }}>
                {getEmployeeVoice(comp).map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "start", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#4a4a3a", minWidth: 28, flexShrink: 0, textAlign: "right" }}>社員{msg.s}</span>
                    <span style={{ fontSize: 11, color: "#8a7a6a", lineHeight: 1.6 }}>{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); setShowCompanyDetail(null); setShowAssignModal(comp.id); }} style={{
                flex: 1, background: "#2a2040", color: "#aaa", border: "1px solid #3a3050",
                borderRadius: 6, padding: "10px", fontSize: 13, cursor: "pointer", fontWeight: 700,
              }}>👤 責任者を配置</button>
              <button onClick={(e) => { e.stopPropagation(); sellCompany(comp.id); setShowCompanyDetail(null); }} style={{
                flex: 1, background: "#2a1a1a", color: "#aa6666", border: "1px solid #3a2020",
                borderRadius: 6, padding: "10px", fontSize: 13, cursor: "pointer", fontWeight: 700,
              }}>📤 売却</button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* FOUND MODAL */}
      {showFoundModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }} onClick={() => setShowFoundModal(false)}>
          <div style={{ background: "#1a1520", border: "1px solid #2a2030", borderRadius: 12, padding: 20, maxWidth: 500, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", marginBottom: 10 }}>新会社設立</div>
            <div style={{ fontSize: 12, color: "#6a5a4a", marginBottom: 12 }}>設立費用: 約500〜1000万円</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {availableIndustries.map(ind => {
                const t = trendLabel(trends[ind.id]);
                const comp_d = competition[ind.id] || ind.baseCompetition;
                const compLabel = comp_d >= 0.75 ? "激戦" : comp_d >= 0.5 ? "混戦" : comp_d >= 0.3 ? "穏やか" : "ブルーオーシャン";
                const compColor = comp_d >= 0.75 ? "#dd5544" : comp_d >= 0.5 ? "#aa8844" : comp_d >= 0.3 ? "#668866" : "#4488aa";
                return (
                  <button key={ind.id} onClick={() => foundCompany(ind)} style={{
                    background: "#12101a", border: "1px solid #2a2030", borderRadius: 6,
                    padding: "10px 14px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{ind.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#d0c8b8", fontWeight: 700, fontSize: 14 }}>{ind.name}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: t.color, fontSize: 11 }}>{t.text}</span>
                        <span style={{ color: compColor, fontSize: 10, fontWeight: 700 }}>{compLabel}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (() => {
        const targetComp = companies.find(c => c.id === showAssignModal);
        const industryId = targetComp?.industry;
        const topStats = topStatsForIndustry(industryId);
        return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }} onClick={() => setShowAssignModal(null)}>
          <div style={{ background: "#1a1520", border: "1px solid #2a2030", borderRadius: 12, padding: 20, maxWidth: 420, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", marginBottom: 4 }}>責任者を配置</div>
            <div style={{ fontSize: 12, color: "#6a5a4a", marginBottom: 4 }}>{targetComp?.icon} {targetComp?.name}</div>
            <div style={{ fontSize: 11, color: "#5a4a3a", marginBottom: 10 }}>
              重要スキル: {topStats.map(k => STAT_LABELS[k]).filter(Boolean).map(l => `${l.icon}${l.name}`).join("・")}
            </div>
            <button onClick={() => { removeManager(showAssignModal); setShowAssignModal(null); }} style={{
              background: "#2a1a1a", color: "#aa6666", border: "1px solid #3a2020",
              borderRadius: 6, padding: "8px 14px", cursor: "pointer", width: "100%", marginBottom: 8, fontSize: 12,
            }}>責任者を外す</button>
            {freeSubordinates.length === 0 ? (
              <div style={{ color: "#555", fontSize: 13, padding: 8 }}>待機中の人材がいない</div>
            ) : [...freeSubordinates].sort((a, b) => calcAptitude(b, industryId) - calcAptitude(a, industryId)).map(sub => {
              const apt = calcAptitude(sub, industryId);
              const rank = aptitudeLabel(apt);
              return (
              <button key={sub.id} onClick={() => assignManager(showAssignModal, sub.id)} style={{
                background: "#12101a", border: "1px solid #2a2030", borderRadius: 6,
                padding: "10px 14px", cursor: "pointer", width: "100%", textAlign: "left", marginBottom: 4,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#ccbb88", fontWeight: 700, fontSize: 14 }}>{sub.name}</span>
                    <span style={{ fontSize: 11, color: "#6a5a4a", marginLeft: 6 }}>{sub.age}歳</span>
                    <span style={{
                      marginLeft: 6, fontSize: 11, color: sub.trait.color,
                    }}>{sub.trait.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#6a5a4a" }}>総合<span style={{ fontWeight: 700, color: "#aaa" }}>{sub.overall}</span></span>
                    <div style={{
                      background: `${rank.color}18`, border: `1px solid ${rank.color}44`,
                      borderRadius: 4, padding: "2px 8px", minWidth: 40, textAlign: "center",
                    }}>
                      <span style={{ fontSize: 10, color: "#6a5a4a" }}>適性</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: rank.color, marginLeft: 4 }}>{rank.text}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, fontSize: 10, color: "#5a4a3a", flexWrap: "wrap" }}>
                  {topStats.map(k => {
                    const label = STAT_LABELS[k];
                    const val = sub.stats[k];
                    const valColor = val >= 70 ? "#ddaa33" : val >= 45 ? "#8a8a7a" : "#5a4a4a";
                    return (
                      <span key={k}>{label?.icon}<span style={{ color: valColor, fontWeight: 700 }}>{val}</span></span>
                    );
                  })}
                  <span style={{ marginLeft: "auto", color: "#5a5a4a" }}>適性値{apt}</span>
                </div>
              </button>
              );
            })}
          </div>
        </div>
        );
      })()}

      {/* HEADHUNT OFFER MODAL */}
      {headhuntOffer && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, zIndex: 200,
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1828, #201828)", border: "1px solid #3a3050",
            borderRadius: 12, padding: 24, maxWidth: 420, width: "100%",
          }}>
            <div style={{ fontSize: 11, color: "#8a6a4a", letterSpacing: 2, marginBottom: 8 }}>HEADHUNT OFFER</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8d8b8", marginBottom: 12 }}>
              引き抜きのオファーが届いた
            </div>
            <div style={{ fontSize: 13, color: "#a09888", marginBottom: 16, lineHeight: 1.8 }}>
              <span style={{ color: "#cc88ff", fontWeight: 700 }}>{headhuntOffer.org}</span>から、
              <span style={{ color: "#ffd700", fontWeight: 700 }}>{headhuntOffer.target.name}</span>
              （{headhuntOffer.target.trait.name}/総合{headhuntOffer.target.overall}）を
              <span style={{ color: "#44bb44", fontWeight: 700 }}>{formatMoney(headhuntOffer.offer)}円</span>
              で譲ってほしいとの申し出。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={acceptHeadhunt} style={{
                flex: 1, background: "linear-gradient(135deg, #2a4a2a, #1a3a1a)", color: "#88cc88",
                border: "1px solid #3a5a3a", padding: "12px", borderRadius: 6,
                cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}>💰 売却する</button>
              <button onClick={rejectHeadhunt} style={{
                flex: 1, background: "linear-gradient(135deg, #4a2a2a, #3a1a1a)", color: "#cc8888",
                border: "1px solid #5a3a3a", padding: "12px", borderRadius: 6,
                cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}>🤝 断る</button>
            </div>
            <div style={{ fontSize: 11, color: "#5a4a3a", marginTop: 10, lineHeight: 1.6 }}>
              売却: 移籍金+今後の新入社員が優秀になる<br/>
              断る: 人材を守り、忠誠心が少し上がる
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

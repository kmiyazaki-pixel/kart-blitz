# Kart Blitz — プロジェクト構成

## フォルダ構造

```
kart-blitz/
├── index.html          ← コース選択メニュー（ここを開く）
├── game.html           ← ゲーム本体（?course=xxx で起動）
├── js/
│   ├── engine.js       ← 物理・カメラ・HUD・CPU AIの共通エンジン
│   ├── kart.js         ← カートの3Dモデル生成
│   └── textures.js     ← テクスチャ生成（アスファルト・草・縁石など）
└── courses/
    ├── practice.js     ← 練習コース（シンプルな楕円）
    ├── desert.js       ← 砂漠コース（TODO）
    ├── snow.js         ← 雪山コース（TODO）
    └── city.js         ← 夜の都市コース（TODO）
```

## 遊び方

1. `index.html` をブラウザで開く（ローカルサーバーを使うと確実）
2. コースを選択
3. WASD または 矢印キーで操作、Space でアイテム使用

> **注意**: ローカルファイルから直接開く場合、ブラウザのCORSポリシーで
> `<script src="...">` の動的読み込みがブロックされることがあります。
> VSCode の "Live Server" 拡張や `python -m http.server` でローカルサーバーを
> 立ち上げて開いてください。

## 新しいコースの作り方

`courses/practice.js` をコピーして以下を変更するだけ！

### 最低限変えるもの
```js
var Course = {
  id:   'mycourse',           // コースID（URLパラメータと一致させる）
  name: '私のコース',
  controlPoints: [...],       // コースの形を定義する [x, z] 座標の配列
  startX: 0, startZ: 4,      // スタート位置
  startAngle: Math.PI/2,     // スタート向き
  gateX: 3,                  // ラップゲートのX座標
  skyColor: 0x55aaee,        // 空の色
  groundTex: 'grass',        // 地面テクスチャ ('grass'|'sand'|'snow')
  buildScenery: function(scene) { ... }  // 木・山・建物などを配置
};
```

### index.html に追加
```html
<a class="card" href="game.html?course=mycourse">
  <div class="card-icon">🏝</div>
  <div class="card-name">私のコース</div>
  ...
</a>
```

## エンジン機能一覧 (engine.js)

| 機能 | 説明 |
|------|------|
| `Engine.catmull(cps, t)` | Catmull-Romスプライン補間 |
| `Engine.bakeTrack(cps, segs)` | トラック中心点の事前計算 |
| `Engine.buildRoad(scene, tpts, tw, tex)` | 路面メッシュ生成 |
| `Engine.buildCurbs(scene, tpts, tw, tex)` | 縁石メッシュ生成 |
| `Engine.buildItemBoxes(scene, cps, positions)` | アイテムボックス配置 |
| `Engine.PlayerController(config)` | プレイヤー物理コントローラー |
| `Engine.CpuController(cps, startT, maxSpd)` | CPU AIコントローラー |
| `Engine.drawMinimap(ctx, ...)` | ミニマップ描画 |

## テクスチャ一覧 (textures.js)

| キー | 説明 |
|------|------|
| `Textures.asphalt()` | アスファルト路面 |
| `Textures.grass()` | 緑の草 |
| `Textures.curb(segs)` | 赤白縁石 |
| `Textures.checker()` | チェッカーフラッグ |
| `Textures.sand()` | 砂漠の砂 |
| `Textures.snow()` | 雪 |

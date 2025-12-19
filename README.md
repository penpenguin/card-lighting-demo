# Card Lighting Demo

カード表面のホロ表現とライト追従の立体感を、単一ページで再現するデモです。
Astro + TypeScript で構成し、Tweakpane からカードのエフェクトと情報を切り替えられます。

## 特徴

- ポインター追従による傾き・ライトの変化
- レアリティごとのホロ/縁の表現プリセット
- カード番号・名義・期限のライブ編集（Tweakpane）
- GitHub Pages 配信を想定した base/site 設定

## 主要ファイル

- `src/pages/index.astro`：カードのマークアップとスタイル
- `src/scripts/card-lighting.ts`：ポインター追従と Tweakpane 設定
- `src/__tests__/index.test.ts`：構成の回帰テスト（Vitest）

## セットアップ

```sh
npm install
```

## 開発コマンド

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `npm run dev`   | 開発サーバーを起動（`localhost:4321`）      |
| `npm run build` | 本番ビルド（`./dist/`）                     |
| `npm run preview` | ビルド結果をローカルで確認                |
| `npm run bundle` | `card-lighting.ts` をJSにバンドル         |
| `npm test`      | Vitest のテストを実行                       |
| `npm run check` | Astro の型/構文チェック                     |

## GitHub Pages 配信

GitHub Pages 配下ではルートが `/<repo>` になるため、`base` と `site` を環境変数で指定します。

例（`https://<user>.github.io/<repo>/` で配信する場合）:

```sh
BASE_PATH=/<repo> SITE_URL=https://<user>.github.io npm run build
```

`npm run dev` / `npm run build` の前に `npm run bundle` が自動実行され、`public/scripts/card-lighting.js` が生成されます。
`src/pages/index.astro` では `import.meta.env.BASE_URL` を使って `scripts/card-lighting.js` を参照します。

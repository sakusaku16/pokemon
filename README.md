# Pokemon Battle Hub

ポケモン対戦向け情報サイトです。  
フロントエンド（React）と専用バックエンド（Express）を同一プロジェクトで管理しています。

## 構成

- `frontend/`: フロントエンド
- `backend/`: 専用バックエンドAPI

## 反映内容

Googleスプレッドシートの「構成シート以降」をベースに、以下を反映済みです。

- 画面構成（左上/左下/右上/右下の4分割UI）
- DB設計（M_TYPE, M_ABILITIES, M_REGIONS, M_POKEMON, M_POKEMON_FORMS, R_POKEMON_DEX）
- モックAPI（検索、詳細、技一覧、ダメージ試算）

## フロントエンド起動

```bash
cd frontend
npm install
npm start
```

- URL: `http://localhost:3000`

## バックエンド起動

```bash
cd backend
npm install
npm run dev
```

- URL: `http://localhost:4000`

## API

- `GET /api/v1/health`
- `GET /api/v1/meta`
- `GET /api/v1/masters`
- `GET /api/v1/schema`
- `GET /api/v1/pokemon?q=<name>`
- `GET /api/v1/pokemon/:id`
- `GET /api/v1/pokemon/:id/moves`
- `POST /api/v1/damage/preview`

## 本番ビルド（フロントエンド）

```bash
cd frontend
npm run build
```

# Pokemon Battle Hub

ポケモン対戦向け情報サイトです。  
フロントエンド（React）に加えて、将来のDB連携を見据えた専用バックエンドを同梱しています。

## 構成

- `src/`: フロントエンド
- `backend/`: 専用バックエンドAPI（Express）

## フロントエンド起動

```bash
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
- `GET /api/v1/pokemon`
- `GET /api/v1/pokemon/:id`

## DB連携について

現在はモックデータを返す構成です。  
DB設計完了後は `backend/src/repositories/pokemonRepository.js` をDB実装へ差し替えることで、
Service/Controllerの再利用を前提に移行できます。

## 本番ビルド（フロントエンド）

```bash
npm run build
```

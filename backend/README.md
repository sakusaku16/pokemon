# Backend API

Pokemon Battle Hub 用の専用バックエンドです。

## 起動

```bash
cd backend
npm install
npm run dev
```

デフォルト: `http://localhost:4000`

## エンドポイント

- `GET /api/v1/health`
- `GET /api/v1/meta`
- `GET /api/v1/pokemon`
- `GET /api/v1/pokemon/:id`

## DB移行方針

現在は `src/repositories/pokemonRepository.js` がモックデータを返します。  
DB設計が固まり次第、このRepositoryをDB実装に差し替えるだけでService/Controllerは再利用できます。

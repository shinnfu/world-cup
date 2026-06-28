# World Cup 2026 Vote App

FIFA World Cup 2026 の決勝トーナメント予想サイトです。  
フロントエンドは静的配信し、認証と投票データは Firebase を使います。

## Stack

- React
- Vite
- Firebase Auth
- Firebase Realtime Database
- GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

Firebase を使う場合は `.env.example` を元に `.env.local` を作成してください。  
設定が無い場合は demo mode で動きます。

## Build

```bash
npm run build
```

ビルド前に大会データを整形し、`dist/` に静的ファイルを出力します。

## Data

元データは `data/source/` に置きます。

- `world_cup_2026_tournament.json`
- `world_cup_2026_teams.json`
- `world_cup_2026_users.json`
- `world_cup_2026_matches.json`

詳細は [data/README.md](data/README.md) にあります。

## Deploy

`main` ブランチへの push で GitHub Pages にデプロイします。  
workflow は [deploy-pages.yml](.github/workflows/deploy-pages.yml) にあります。

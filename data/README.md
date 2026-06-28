# Data

このプロジェクトでは、手編集しやすい元データを `data/source/` に置き、表示用データをビルドで生成します。

## Source Files

- `world_cup_2026_tournament.json`
- `world_cup_2026_teams.json`
- `world_cup_2026_users.json`
- `world_cup_2026_matches.json`

## Build Flow

```bash
npm run build:data
```

生成先:

- `public/data/tournament.json`

## Notes

- チーム名や国旗パスは `world_cup_2026_teams.json` で管理します
- 試合データは `team1Code` `team2Code` と勝ち上がり参照を持ちます
- 投票締切は常に `kickoffAt` と同じです
- 画面表示用のステータスは保存せず、アプリ側で導出します

#!/bin/sh
# 設問やデザインを修正したあとに実行する。ブラウザが古いファイルを使い回さないよう、読み込みURLの末尾の番号を更新する
cd "$(dirname "$0")/.." || exit 1
V=$(date +%Y%m%d%H%M)
for f in *.html; do
  sed -i '' -E "s#(href|src)=\"(assets/style\.css|config\.js|assets/surveys\.js|assets/form\.js)(\?v=[0-9]+)?\"#\1=\"\2?v=$V\"#g" "$f"
done
echo "version: $V"

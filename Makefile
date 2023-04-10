push:
	git add docs
	git commit -m "update ノートを更新した。"
	git push

format:
	find ./* -name "*.md" -type f | xargs sed -i '' -e 's/）/) /g'  -e 's/（/ (/g'

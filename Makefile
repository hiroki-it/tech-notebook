push:
	git pull
	git add docs
	git commit -m "ノートの内容を更新した"
	git push

format:
	find ./* -name "*.md" -type f | xargs sed -i '' -e 's/）/) /g'  -e 's/（/ (/g'

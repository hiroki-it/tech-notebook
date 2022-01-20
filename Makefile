serve:
	find docs/* -name "*.md" -type f | xargs sed -i '' -e 's/，/、/g' -e 's/．/。/g'
	mkdocs serve

push:
	git add docs
	git commit -m "update ノートを更新した．"
	git push

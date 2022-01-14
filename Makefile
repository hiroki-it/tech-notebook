deploy:
	find docs/md/* -name "*.md" -type f | xargs sed -i '' -e 's/，/、/g' -e 's/．/。/g'
	git checkout main
	git add docs/md
	git commit -m "update ノートを更新した．"
	git push
	mkdocs gh-deploy

"use strict";

const fs = require("fs");
const { globSync } = require("glob");

const patterns = process.argv.slice(2);
const targetPatterns = patterns.length > 0 ? patterns : ["src/**/*.md"];

const existingConnectivePattern =
  /^(また|さらに|一方で|ただし|しかし|そのため|そこで|つまり|例えば|なお|このとき|ここでは|次に|結果として|これにより|この場合)[、,]?/;

const relationCuePattern =
  /(ため|ので|だから|結果|つながります|必要があります|できません|できるようになります|一方|対して|異なります|しかし|ただし|にもかかわらず|とは異なり|制限|例外|非推奨|推奨|課題|問題|危険|注意)/;

const previousReasonPattern =
  /(ため|ので|から|課題|問題|危険|必要|できません|ありません|異なります|制限|非推奨|推奨|過負荷|失敗|拒否|遮断|遅延|例外)/;

const exampleCuePattern =
  /(比較できる具体的なツールには|具体的なツールには|具体例には|例として|代表例には|選択肢には|種類には|次のような|次のツール|たとえば|例えば|例：)/;

const exampleListPattern =
  /には、[^。]*(?:、|，)[^。]*(?:があります|です|含まれます|挙げられます)/;

const previousAbstractPattern =
  /(手法|方法|ツール|種類|選択肢|パターン|方式|構成|技術要素|リソース|設定項目|要件|課題|ロジック).*?(あります|できます|必要です|使用します|実装できます|選択肢です)/;

const candidateStarterPattern =
  /^(Kubernetes|Istio|Envoy|istio|サービスメッシュ|マイクロサービス|通信|認証|認可|テレメトリー|障害|リトライ|タイムアウト|サーキット|レート|アンビエント|サイドカー|この|これ|設定|設計|実装|使用|比較|特に|現場|執筆時点)/;

const boilerplatePatterns = [
  /図\s*\d{2}-\d{2}(?:-\d{2})?.*示します。?$/,
  /表\s*\d{2}-\d{2}(?:-\d{2})?.*示します。?$/,
  /図\s*\d{2}-\d{2}(?:-\d{2})?.*確認してみてください。?$/,
  /表\s*\d{2}-\d{2}(?:-\d{2})?.*確認してみてください。?$/,
  /(?:\d+\s*章|章|節|編).*解説します。?$/,
  /(?:\d+\s*章|章|節|編).*解説しています。?$/,
  /(?:\d+\s*章|章|節|編).*確認してみてください。?$/,
  /設定例を確認してみてください。?$/,
  /設定方法を解説します。?$/,
  /実装方法を解説します。?$/,
  /設計例や実装方法は.*解説しています。?$/,
  /仕組みを.*示します。?$/,
  /様子を.*示します。?$/,
  /種類を.*示します。?$/,
  /比較を.*示します。?$/,
  /確認できます。?$/,
  /確認してみてください。?$/,
  /1\s*つの選択肢です。?$/,
  /次のコードブロックのとおりです。?$/,
  /次の図\s*\d{2}-\d{2}(?:-\d{2})?\s*です。?$/,
  /次の表\s*\d{2}-\d{2}(?:-\d{2})?\s*です。?$/,
];

const shouldSkipParagraph = (paragraph) => {
  return /^(\s*```|\s*\||\s*#|\s*!\[|\s*図\s*\d|\s*表\s*\d|\s*>)/m.test(
    paragraph,
  );
};

const shouldSkipSentence = (sentence) => {
  if (!sentence || existingConnectivePattern.test(sentence)) {
    return true;
  }

  if (/^(たとえば|例えば|例：)/.test(sentence)) {
    return true;
  }

  return boilerplatePatterns.some((pattern) => pattern.test(sentence));
};

const findCandidates = (file) => {
  const text = fs.readFileSync(file, "utf8");
  const paragraphs = text.split(/\n\s*\n/);
  const candidates = [];
  let line = 1;

  for (const paragraph of paragraphs) {
    const startLine = line;
    line += paragraph.split("\n").length + 1;

    if (shouldSkipParagraph(paragraph)) {
      continue;
    }

    const sentences = paragraph
      .replace(/\n/g, "")
      .split(/(?<=。)/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    if (sentences.length < 3) {
      continue;
    }

    for (let index = 1; index < sentences.length; index += 1) {
      const sentence = sentences[index];
      if (shouldSkipSentence(sentence)) {
        continue;
      }

      const previousSentence = sentences[index - 1] ?? "";
      const hasRelationCue =
        relationCuePattern.test(sentence) ||
        previousReasonPattern.test(previousSentence);
      const hasExampleCue =
        (exampleCuePattern.test(sentence) || exampleListPattern.test(sentence)) &&
        previousAbstractPattern.test(previousSentence);

      if (hasRelationCue && candidateStarterPattern.test(sentence)) {
        candidates.push({
          file,
          line: startLine,
          category: "relation",
          sentence,
        });
      } else if (hasExampleCue) {
        candidates.push({
          file,
          line: startLine,
          category: "example",
          sentence,
        });
      }
    }
  }

  return candidates;
};

const files = [
  ...new Set(
    targetPatterns.flatMap((pattern) =>
      globSync(pattern, {
        nodir: true,
      }).filter((file) => file.endsWith(".md")),
    ),
  ),
].sort();

let found = false;
for (const file of files) {
  for (const candidate of findCandidates(file)) {
    found = true;
    console.log(
      `${candidate.file}:${candidate.line}: [${candidate.category}] ${candidate.sentence}`,
    );
  }
}

process.exit(found ? 1 : 0);

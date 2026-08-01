"use strict";

const japanese = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}";
const halfWidth = "A-Za-z0-9";
const missingSpacePattern = new RegExp(
  `([${japanese}])([${halfWidth}])|([${halfWidth}])([${japanese}])`,
  "gu",
);

const maskNonProse = (text) => {
  return text
    .replace(/\S*https?:\/\/\S+/g, (value) => " ".repeat(value.length))
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, (value) => " ".repeat(value.length))
    .replace(/(?:^|\s)\/?[\w.-]+(?:\/[\w.-]+)+/g, (value) =>
      " ".repeat(value.length),
    );
};

const getYamlComment = (line) => {
  let quote = null;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? null : quote === null ? char : quote;
      continue;
    }

    if (char === "#" && quote === null) {
      return { text: line.slice(index + 1), offset: index + 1 };
    }
  }

  return null;
};

const reporter = (context) => {
  const { Syntax, RuleError, report, fixer, locator } = context;

  const check = (node) => {
    const language = String(node.lang ?? "").toLowerCase();
    if (language !== "yaml" && language !== "yml") {
      return;
    }

    const valueOffset = node.raw.indexOf(node.value);
    let lineOffset = valueOffset;
    for (const line of node.value.split("\n")) {
      const comment = getYamlComment(line);
      if (comment) {
        const masked = maskNonProse(comment.text);
        for (const match of masked.matchAll(missingSpacePattern)) {
          const boundary = match[2] ? 1 : 1;
          const index = lineOffset + comment.offset + (match.index ?? 0) + boundary;
          report(
            node,
            new RuleError(
              "YAML コメント内の日本語と半角英数字の間に半角スペースを入れてください。",
              {
                padding: locator.at(index),
                fix: fixer.insertTextAfterRange([index - 1, index], " "),
              },
            ),
          );
        }
      }
      lineOffset += line.length + 1;
    }
  };

  return {
    [Syntax.CodeBlock]: check,
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};

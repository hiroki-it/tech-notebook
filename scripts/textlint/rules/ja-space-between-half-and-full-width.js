"use strict";

const japanese = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}";
const missingSpacePattern = new RegExp(
  `([A-Za-z0-9])([${japanese}])|([${japanese}])([A-Za-z0-9])`,
  "gu",
);
const allowedPatterns = [/第?\d+章/g];

const isAllowed = (text, index) =>
  allowedPatterns.some((pattern) =>
    [...text.matchAll(pattern)].some((match) => {
      const start = match.index ?? 0;
      return start <= index && index < start + match[0].length;
    }),
  );

const reporter = (context) => {
  const { Syntax, RuleError, report, fixer, locator } = context;

  const check = (node) => {
    if (typeof node.value !== "string") {
      return;
    }

    for (const match of node.value.matchAll(missingSpacePattern)) {
      const index = (match.index ?? 0) + 1;
      if (isAllowed(node.value, index)) {
        continue;
      }
      report(
        node,
        new RuleError(
          "日本語と半角英数字の間に半角スペースを入れてください。",
          {
            padding: locator.at(index),
            fix: fixer.insertTextAfterRange([index - 1, index], " "),
          },
        ),
      );
    }
  };

  return {
    [Syntax.Str]: check,
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};

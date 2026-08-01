"use strict";

const reporter = (context) => {
  const { Syntax, RuleError, report, locator } = context;
  const pattern = /[A-Za-z0-9]内|[A-Za-z0-9]外/g;

  const check = (node) => {
    if (typeof node.value !== "string") {
      return;
    }

    for (const match of node.value.matchAll(pattern)) {
      const index = (match.index ?? 0) + 1;
      report(
        node,
        new RuleError(
          `半角英数字と「${node.value[index]}」の間に半角スペースを入れてください。`,
          {
            padding: locator.range([index, index + 1]),
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

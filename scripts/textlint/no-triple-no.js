"use strict";

const defaultOptions = {
  max: 2,
};

const ignoredTypes = new Set([
  "Code",
  "Image",
  "Link",
  "BlockQuote",
  "Emphasis",
  "Strong",
]);

const collectTextSegments = (node, segments = []) => {
  if (!node || ignoredTypes.has(node.type)) {
    return segments;
  }

  if (node.type === "Str" && typeof node.value === "string") {
    segments.push({
      value: node.value,
      start: node.range ? node.range[0] : undefined,
    });
    return segments;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectTextSegments(child, segments);
    }
  }

  return segments;
};

const isPlainBodyParagraph = (node) => {
  if (!Array.isArray(node.children)) {
    return false;
  }

  if (node.children.some((child) => child.type === "Table")) {
    return false;
  }

  const firstText = node.children
    .filter((child) => child.type === "Str")
    .map((child) => child.value)
    .join("")
    .trimStart();

  if (!firstText) {
    return false;
  }

  if (/^(図|表)\s*\d{2}-\d{2}/.test(firstText)) {
    return false;
  }

  if (/^\|/.test(firstText)) {
    return false;
  }

  return true;
};

const isCheckableNode = (node, Syntax) => {
  if (node.type === Syntax.Header) {
    return true;
  }

  if (node.type === Syntax.Paragraph) {
    return isPlainBodyParagraph(node);
  }

  return false;
};

const buildTextAndIndexMap = (segments) => {
  let text = "";
  const indexMap = [];

  for (const segment of segments) {
    if (text.length > 0) {
      text += "";
    }

    for (let index = 0; index < segment.value.length; index += 1) {
      text += segment.value[index];
      indexMap.push(
        segment.start === undefined ? undefined : segment.start + index,
      );
    }
  }

  return { text, indexMap };
};

const maskTableLines = (text, indexMap) => {
  const maskedChars = [...text];
  const linePattern = /^.*$/gm;

  for (const match of text.matchAll(linePattern)) {
    const line = match[0];
    if (!line.includes("|")) {
      continue;
    }

    const lineStart = match.index ?? 0;
    for (let index = 0; index < line.length; index += 1) {
      maskedChars[lineStart + index] = "ー";
      indexMap[lineStart + index] = undefined;
    }
  }

  return maskedChars.join("");
};

const splitIntoPhrases = (text) => {
  return text.matchAll(/[^\s、。！？!?|\nはがをにでとへもやからまでより]+/g);
};

const reporter = (context, options = {}) => {
  const { Syntax, RuleError, report, locator } = context;
  const max = Number.isInteger(options.max) ? options.max : defaultOptions.max;

  const checkNode = (node) => {
    if (!isCheckableNode(node, Syntax)) {
      return;
    }

    const { text: rawText, indexMap } = buildTextAndIndexMap(
      collectTextSegments(node),
    );
    const text = maskTableLines(rawText, indexMap);
    const matches = splitIntoPhrases(text);

    for (const match of matches) {
      const phrase = match[0];
      const phraseStart = match.index ?? 0;
      const noMatches = [...phrase.matchAll(/の/g)];

      if (noMatches.length <= max) {
        continue;
      }

      const extraNo = noMatches[max];
      const originalIndex = indexMap[phraseStart + (extraNo.index ?? 0)];
      if (originalIndex === undefined) {
        continue;
      }

      report(
        node,
        new RuleError(
          `ひとまとまりの語句に助詞「の」が${max + 1}回以上使われています。「の」は${max}回までにしてください。`,
          {
            padding: locator.range([
              originalIndex - node.range[0],
              originalIndex - node.range[0] + 1,
            ]),
          },
        ),
      );
    }
  };

  return {
    [Syntax.Paragraph]: checkNode,
    [Syntax.Header]: checkNode,
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};

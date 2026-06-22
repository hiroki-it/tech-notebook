#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { globSync } = require("glob");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/textlint-with-quotes.js <textlint args...>");
  process.exit(2);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-quotes-"));
const temporaryPathMap = new Map();

const stripBlockQuoteMarks = (content) => {
  return content.replace(/^([ \t]{0,3})> ?/gm, "$1");
};

const materializeFile = (filePath) => {
  const relativePath = path.relative(process.cwd(), path.resolve(filePath));
  const outputPath = path.join(tmpDir, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const content = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(outputPath, stripBlockQuoteMarks(content));
  temporaryPathMap.set(outputPath, filePath);
  return outputPath;
};

const materializeArg = (arg) => {
  if (arg.endsWith(".md") && fs.existsSync(arg) && fs.statSync(arg).isFile()) {
    return [materializeFile(arg)];
  }

  if (arg.includes("*")) {
    const matchedFiles = globSync(arg, {
      cwd: process.cwd(),
      nodir: true,
      absolute: false,
    }).filter((filePath) => filePath.endsWith(".md"));

    if (matchedFiles.length > 0) {
      return matchedFiles.map(materializeFile);
    }
  }

  return [arg];
};

const textlintBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "textlint.cmd" : "textlint",
);

const textlintArgs = [
  "--config",
  ".textlintrc.local.json",
  ...args.flatMap(materializeArg),
];

const result = spawnSync(textlintBin, textlintArgs, {
  cwd: process.cwd(),
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 50,
  shell: false,
});

if (args.includes("--fix")) {
  for (const [temporaryPath, originalPath] of temporaryPathMap.entries()) {
    if (fs.existsSync(temporaryPath)) {
      fs.copyFileSync(temporaryPath, originalPath);
    }
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

const rewriteOutput = (output) => {
  if (!output) {
    return "";
  }

  let rewritten = output;
  for (const [temporaryPath, originalPath] of temporaryPathMap.entries()) {
    rewritten = rewritten.split(temporaryPath).join(originalPath);
  }
  return rewritten;
};

process.stdout.write(rewriteOutput(result.stdout));
process.stderr.write(rewriteOutput(result.stderr));

process.exit(result.status ?? 1);

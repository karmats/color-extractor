#!/usr/bin/env node
import fs from "fs";
import glob from "glob";

const PROJECT_ARG = "--project";
/* Catches all hex and rgb(a) colors */
const COLOR_REGEX = /(#[0-9a-fA-F]{3,}|rgba?\(\d+,\s?\d+,\s?\d+,?\s?\d?\))/gm;
const extractCurrentFilename = (path: string): string => {
  const splitted = path.split("/");
  return splitted[splitted.length - 1];
};

const projectArg = process.argv.find((arg) => arg.startsWith(PROJECT_ARG));
if (!projectArg) {
  throw new Error(
    `Please supply an argument named '${PROJECT_ARG}' with the project you want to check. Example '--project=some/project'`
  );
}

const projectPath = projectArg.split("=")[1];
const result: { file: string; colors: string[] }[] = [];
const uniqueColors: string[] = [];
glob(`${projectPath}/!(node_modules)/**/*.{css,scss}`, (err, filePaths) => {
  if (err) {
    throw new Error(`Failed to read project files: ${err.message}`);
  }
  for (const filePath of filePaths) {
    const file = fs.readFileSync(filePath, "utf-8");
    const matches = file.matchAll(COLOR_REGEX);
    if (COLOR_REGEX.test(file)) {
      const colors = [];
      for (const match of matches) {
        const color = match[0];
        colors.push(color);
        if (!uniqueColors.includes(color)) {
          uniqueColors.push(color);
        }
      }
      result.push({ file: extractCurrentFilename(filePath), colors });
    }
  }
  result.sort((a, b) => a.file.localeCompare(b.file));
  console.log(
    `# ${extractCurrentFilename(projectPath)}

## Unique colors

<div style='background:#777'>
  ${uniqueColors
    .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
    .map((c) => `<div style="color: ${c}">${c}</div>`)
    .join("")}
</div>

## Colors per file

${result.map((r) => `- ${r.file}\n  - ${r.colors.join("\n  - ")}\n`).join("")}
`
  );
});

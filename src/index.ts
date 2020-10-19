#!/usr/bin/env node
import fs from "fs";
import glob from "glob";

const PROJECT_ARG = "--project";
const COLOR_REGEX = /(#[0-9a-fA-F]{3,})/gm;

const projectArg = process.argv.find((arg) => arg.startsWith(PROJECT_ARG));
if (!projectArg) {
  throw new Error(
    `Please supply an argument named '${PROJECT_ARG}' with the project you want to check. Example '--project=some/project'`
  );
}

const projectPath = projectArg.split("=")[1];
const result: { file: string; color: string }[] = [];
glob(`${projectPath}/!(node_modules)/**/*.{css,scss}`, (err, fileNames) => {
  if (err) {
    throw new Error(`Failed to read project files: ${err.message}`);
  }
  for (const fileName of fileNames) {
    const file = fs.readFileSync(fileName, "utf-8");
    const res = COLOR_REGEX.exec(file);
    if (res && res.length) {
      result.push({ file: fileName, color: res[0] });
    }
  }
  console.log(result);
});

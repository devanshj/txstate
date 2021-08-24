// @ts-check
const sh = require("shelljs")
const rl = require("readline-sync");

if (!rl.keyInYNStrict("you sure?")) process.exit();

sh.ls().includes("dist") && sh.rm("-r", "dist");
sh.exec("yarn tsc")
sh.cp("LICENSE", "dist/LICENSE")
sh.cp("README.md", "dist/README.md");
sh.cp("package.json", "dist/package.json");
sh.cd("dist");
sh.echo([
  "*.spec.js",
  "*.spec.d.ts",
  "*.test.js",
  "*.test.d.ts"
].join("\n")).to(".npmignore")
sh.exec("npm publish")
sh.cd("..")
sh.rm("-r", "dist")

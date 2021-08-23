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
sh.exec("npm publish")
sh.rm("-r", "dist")

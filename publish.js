// @ts-check
const sh = require("shelljs")
const rl = require("readline-sync");

if (!rl.keyInYNStrict("you sure?")) process.exit();

sh.ls().includes("dist") && sh.rm("-r", "dist");
sh.exec("yarn tsc")
sh.cp("LICENSE", "dist/LICENSE")
sh.cp("README.md", "dist/README.md");
sh.cp("package.json", "dist/package.json");
sh.exec("npm publish dist")
sh.exec(`git tag ${
  sh.cat("package.json")
  .grep("version")
  .sed(/.*"version": "(.*)".*/, "v$1")
  .toString()
}`)
sh.rm("-r", "dist")

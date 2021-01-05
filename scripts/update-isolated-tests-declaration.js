// @ts-check

const fs = require("fs").promises;
const main = async () => {
  let rootDir = __dirname + "/..";
  let testsDir = rootDir + "/isolated-tests";
  fs.writeFile(testsDir + "/txstate.d.ts",
    `declare module "txstate" {\n` +
    "  " + (await fs.readFile(rootDir + "/index.ts", "utf8"))
    .replace(/\n/g, "\n  ") + `\n` +
    `}`
  )
}
main();

// @ts-check

const fs = require("fs").promises;
const main = async () => {
  for (let f of await fs.readdir(__dirname + "/../")) {
    if (!(f.endsWith(".spec.ts") || f.endsWith(".test.ts"))) continue;
    let p = __dirname + "/../" + f;
    
    (async () => fs.writeFile(p, (await fs.readFile(p, "utf8"))
      .replace(/\/\/ \@ts-expect-error/g, "// @\\ts-expect-error")
    ))();
  }
}
main();

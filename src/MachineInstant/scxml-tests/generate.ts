import { toMachine } from "xstate-monorepo/packages/core/src/scxml";
import endent from "endent";
import { mapValuesDeep, findPathDeep } from "deepdash/standalone";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util"
import _glob from "glob";
const glob = promisify(_glob)


let TEST_GLOBS = [
  "basic/*.scxml"
]

const main = async () => {
  let scxmlPaths = (await Promise.all(
    TEST_GLOBS
    .map(g => glob(__dirname + "/../node_modules/@scion-scxml/test-framework/test/" + g))
  )).flat();
  
  scxmlPaths.forEach(async scxmlPath => {
    let scionPath =
      path.dirname(scxmlPath) + "/" + path.basename(scxmlPath).replace(path.extname(scxmlPath), ".json")

    let testContent = await Promise.all([
        fs.readFile(scxmlPath, "utf-8"),
        fs.readFile(scionPath, "utf-8")
      ])
      .then(([scxml, scion]) => ({ scxml, scion: JSON.parse(scion) }))
      .then(createTestFile)

    let [filename, category] = [...scxmlPath.split(/[/\\]/g)].reverse()
    let name = filename.replace(/\..*/g, "");

    fs.writeFile(`${__dirname}/${category}.${name}.ts`, testContent);
    console.log(`generated ${category}.${name}.ts`)
  })
}

const createTestFile = ({ scxml, scion }: {
  scxml: string,
  scion: {
    initialConfiguration: string[],
    events: Array<{
      after?: number,
      event: { name: string },
      nextConfiguration: string[],
    }>
  }
}) => {
  let definition = toDefinition(scxml);
  scion = mapValuesDeep(
    scion,
    (value, key) =>
      key === "initialConfiguration" || key === "nextConfiguration"
        ? (xs => xs.length === 1 ? xs[0] : xs)((value as string[]).map(id =>
            (findPathDeep(
              definition,
              (value, key) => key === "id" && value === id,
              { pathFormat: "array" }
            ) as string[])
            .filter(p => p !== "states" && p !== "id")
            .join(".")
          ))
        : value
  )

  return endent`
  import MachineInstant from "..";
  import { O, Test } from "../../extras";

  type Definition = ${endent.pretty(definition)}

  type Instant0 = MachineInstant.InitialState<Definition>
  ${scion.events.map(({ event }, i) =>
    `type Instant${i + 1} = MachineInstant.Transition<Instant${i}, "${event.name}">`
  ).join("\n")}

  Test.checks([
    Test.check<O.Prop<Instant0, "state">, "${scion.initialConfiguration}", Test.Pass>(),
    ${scion.events.map(({ nextConfiguration }, i) =>
    `Test.check<O.Prop<Instant${i+1}, "state">, "${nextConfiguration}", Test.Pass>()`
    ).join(",\n")}
  ])
  `
}

const toDefinition = (scxml: string) =>
  mapValuesDeep(
    toMachine(scxml, { delimiter: "." }).config,
    (value, key, parentValue) =>
      key !== "initial" ? value :
      value === undefined ? undefined :
      parentValue.type === "parallel" ? undefined :
      value[0].replace("#", "")
  )

main();

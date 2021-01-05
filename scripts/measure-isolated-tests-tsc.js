console.time("tsc");

require("child_process")
.exec("yarn tsc --noEmit", { cwd: __dirname + "/../isolated-tests/" })
.on("exit", () => console.timeEnd("tsc"));

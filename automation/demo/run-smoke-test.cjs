/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const ts = require("typescript")
const tsconfigPaths = require("tsconfig-paths")

tsconfigPaths.register({
  baseUrl: path.resolve(__dirname, "..", ".."),
  paths: {
    "@/*": ["./*"],
  },
})

require.extensions[".ts"] = function registerTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  })

  module._compile(outputText, filename)
}

require("./run-smoke-test.ts")

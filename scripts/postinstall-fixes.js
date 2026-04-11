"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const helperDir = path.join(rootDir, "node_modules", "iconv-lite", "lib", "helpers");
const helperFile = path.join(helperDir, "merge-exports.js");

const mergeExportsSource = `"use strict"

var hasOwn = typeof Object.hasOwn === "undefined" ? Function.call.bind(Object.prototype.hasOwnProperty) : Object.hasOwn

function mergeModules (target, module) {
  for (var key in module) {
    if (hasOwn(module, key)) {
      target[key] = module[key]
    }
  }
}

module.exports = mergeModules
`;

function ensureIconvLiteHelper() {
  const iconvLiteRoot = path.join(rootDir, "node_modules", "iconv-lite");

  if (!fs.existsSync(iconvLiteRoot)) {
    console.warn("[postinstall] iconv-lite is not installed, skipping repair.");
    return;
  }

  fs.mkdirSync(helperDir, { recursive: true });

  if (!fs.existsSync(helperFile)) {
    fs.writeFileSync(helperFile, mergeExportsSource, "utf8");
    console.log("[postinstall] Restored iconv-lite helper: lib/helpers/merge-exports.js");
  }
}

ensureIconvLiteHelper();

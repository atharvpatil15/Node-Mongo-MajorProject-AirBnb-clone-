"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const iconvHelperDir = path.join(rootDir, "node_modules", "iconv-lite", "lib", "helpers");
const iconvHelperFile = path.join(iconvHelperDir, "merge-exports.js");
const cloudinarySdkAnalyticsDir = path.join(
  rootDir,
  "node_modules",
  "cloudinary",
  "lib",
  "utils",
  "encoding",
  "sdkAnalytics"
);
const cloudinarySdkVersionsFile = path.join(
  cloudinarySdkAnalyticsDir,
  "getSDKVersions.js"
);

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

  fs.mkdirSync(iconvHelperDir, { recursive: true });

  if (!fs.existsSync(iconvHelperFile)) {
    fs.writeFileSync(iconvHelperFile, mergeExportsSource, "utf8");
    console.log("[postinstall] Restored iconv-lite helper: lib/helpers/merge-exports.js");
  }
}

const cloudinarySdkVersionsSource = `let fs = require('fs');
let path = require('path');
let sdkCode = 'M'; // Constant per SDK

/**
 * @description Gets the relevant versions of the SDK(package version, node version and sdkCode)
 * @param {'default' | 'x.y.z' | 'x.y' | string} useSDKVersion Default uses package.json version
 * @param {'default' | 'x.y.z' | 'x.y' | string} useNodeVersion Default uses process.versions.node
 * @return {{sdkSemver:string, techVersion:string, sdkCode:string}} A map of relevant versions and codes
 */
function getSDKVersions(useSDKVersion = 'default', useNodeVersion = 'default') {
  let pkgJSONFile = fs.readFileSync(path.join(__dirname, '../../../../package.json'), 'utf-8');

  // allow to pass a custom SDKVersion
  let sdkSemver = useSDKVersion === 'default' ? JSON.parse(pkgJSONFile).version : useSDKVersion;

  // allow to pass a custom techVersion (Node version)
  let techVersion = useNodeVersion === 'default' ? process.versions.node : useNodeVersion;

  return {
    sdkSemver,
    techVersion,
    sdkCode
  };
}

module.exports = getSDKVersions;
`;

function ensureCloudinarySdkAnalyticsHelper() {
  const cloudinaryRoot = path.join(rootDir, "node_modules", "cloudinary");

  if (!fs.existsSync(cloudinaryRoot)) {
    console.warn("[postinstall] cloudinary is not installed, skipping repair.");
    return;
  }

  fs.mkdirSync(cloudinarySdkAnalyticsDir, { recursive: true });

  if (!fs.existsSync(cloudinarySdkVersionsFile)) {
    fs.writeFileSync(cloudinarySdkVersionsFile, cloudinarySdkVersionsSource, "utf8");
    console.log("[postinstall] Restored cloudinary helper: lib/utils/encoding/sdkAnalytics/getSDKVersions.js");
  }
}

ensureIconvLiteHelper();
ensureCloudinarySdkAnalyticsHelper();

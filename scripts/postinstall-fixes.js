"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const repairManifest = [
  {
    packageDir: path.join(rootDir, "node_modules", "iconv-lite"),
    relativeFile: path.join("lib", "helpers", "merge-exports.js"),
    description: "iconv-lite helper",
    contents: `"use strict"

var hasOwn = typeof Object.hasOwn === "undefined" ? Function.call.bind(Object.prototype.hasOwnProperty) : Object.hasOwn

function mergeModules (target, module) {
  for (var key in module) {
    if (hasOwn(module, key)) {
      target[key] = module[key]
    }
  }
}

module.exports = mergeModules
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "encoding", "base64Encode.js"),
    description: "cloudinary encoding helper",
    contents: `function base64Encode(input) {
  if (!(input instanceof Buffer)) {
    input = Buffer.from(String(input), 'binary');
  }
  return input.toString('base64');
}

module.exports.base64Encode = base64Encode;
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "encoding", "base64EncodeURL.js"),
    description: "cloudinary encoding helper",
    contents: `const { base64Encode } = require('./base64Encode')

function base64EncodeURL(sourceUrl) {
  try {
    sourceUrl = decodeURI(sourceUrl);
  } catch (error) {
    // ignore errors
  }
  sourceUrl = encodeURI(sourceUrl);
  return base64Encode(sourceUrl)
    .replace(/\\+/g, '-') // Convert '+' to '-'
    .replace(/\\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '=';
}

module.exports.base64EncodeURL = base64EncodeURL;
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "encoding", "encodeDoubleArray.js"),
    description: "cloudinary encoding helper",
    contents: `const isArray = require('lodash/isArray');
const toArray = require('../parsing/toArray');

/**
 * Serialize an array of arrays into a string
 * @param {string[] | Array.<Array.<string>>} array - An array of arrays.
 *                          If the first element is not an array the argument is wrapped in an array.
 * @returns {string} A string representation of the arrays.
 */
function encodeDoubleArray(array) {
  array = toArray(array);
  if (!isArray(array[0])) {
    array = [array];
  }
  return array.map(e => toArray(e).join(",")).join("|");
}

module.exports = encodeDoubleArray;
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "encoding", "smart_escape.js"),
    description: "cloudinary encoding helper",
    contents: `// Based on CGI::unescape. In addition does not escape / :
// smart_escape = (string) => encodeURIComponent(string).replace(/%3A/g, ":").replace(/%2F/g, "/")
function smart_escape(string, unsafe = /([^a-zA-Z0-9_.\\-\\/:]+)/g) {
  return string.replace(unsafe, function (match) {
    return match.split("").map(function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    }).join("");
  });
}

module.exports = smart_escape;
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "encoding", "sdkAnalytics", "getSDKVersions.js"),
    description: "cloudinary sdk analytics helper",
    contents: `let fs = require('fs');
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
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "parsing", "consumeOption.js"),
    description: "cloudinary parsing helper",
    contents: `/**
 * Deletes \`option_name\` from \`options\` and return the value if present.
 * If \`options\` doesn't contain \`option_name\` the default value is returned.
 * @param {Object} options a collection
 * @param {String} option_name the name (key) of the desired value
 * @param {*} [default_value] the value to return is option_name is missing
 */

function consumeOption(options, option_name, default_value) {
  let result = options[option_name];
  delete options[option_name];
  return result != null ? result : default_value;
}

module.exports = consumeOption;
`,
  },
  {
    packageDir: path.join(rootDir, "node_modules", "cloudinary"),
    relativeFile: path.join("lib", "utils", "parsing", "toArray.js"),
    description: "cloudinary parsing helper",
    contents: `const isArray = require('lodash/isArray');

/**
 * @desc Turns arguments that aren't arrays into arrays
 * @param arg
 * @returns { any | any[] }
 */
function toArray(arg) {
  switch (true) {
  case arg == null:
    return [];
  case isArray(arg):
    return arg;
  default:
    return [arg];
  }
}

module.exports = toArray;
`,
  },
];

function ensureFile({ packageDir, relativeFile, description, contents }) {
  if (!fs.existsSync(packageDir)) {
    console.warn(`[postinstall] ${path.basename(packageDir)} is not installed, skipping ${description}.`);
    return;
  }

  const targetFile = path.join(packageDir, relativeFile);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });

  if (!fs.existsSync(targetFile)) {
    fs.writeFileSync(targetFile, contents, "utf8");
    console.log(`[postinstall] Restored ${description}: ${relativeFile}`);
  }
}

repairManifest.forEach(ensureFile);

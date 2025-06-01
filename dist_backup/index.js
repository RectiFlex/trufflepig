var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS({
  "node_modules/fast-xml-parser/src/util.js"(exports) {
    "use strict";
    var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
    var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
    var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
    var regexName = new RegExp("^" + nameRegexp + "$");
    var getAllMatches = function(string, regex) {
      const matches = [];
      let match = regex.exec(string);
      while (match) {
        const allmatches = [];
        allmatches.startIndex = regex.lastIndex - match[0].length;
        const len = match.length;
        for (let index = 0; index < len; index++) {
          allmatches.push(match[index]);
        }
        matches.push(allmatches);
        match = regex.exec(string);
      }
      return matches;
    };
    var isName = function(string) {
      const match = regexName.exec(string);
      return !(match === null || typeof match === "undefined");
    };
    exports.isExist = function(v) {
      return typeof v !== "undefined";
    };
    exports.isEmptyObject = function(obj) {
      return Object.keys(obj).length === 0;
    };
    exports.merge = function(target, a, arrayMode) {
      if (a) {
        const keys = Object.keys(a);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          if (arrayMode === "strict") {
            target[keys[i]] = [a[keys[i]]];
          } else {
            target[keys[i]] = a[keys[i]];
          }
        }
      }
    };
    exports.getValue = function(v) {
      if (exports.isExist(v)) {
        return v;
      } else {
        return "";
      }
    };
    exports.isName = isName;
    exports.getAllMatches = getAllMatches;
    exports.nameRegexp = nameRegexp;
  }
});

// node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS({
  "node_modules/fast-xml-parser/src/validator.js"(exports) {
    "use strict";
    var util = require_util();
    var defaultOptions2 = {
      allowBooleanAttributes: false,
      //A tag can have attributes without any value
      unpairedTags: []
    };
    exports.validate = function(xmlData, options) {
      options = Object.assign({}, defaultOptions2, options);
      const tags = [];
      let tagFound = false;
      let reachedRoot = false;
      if (xmlData[0] === "\uFEFF") {
        xmlData = xmlData.substr(1);
      }
      for (let i = 0; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
          i += 2;
          i = readPI(xmlData, i);
          if (i.err) return i;
        } else if (xmlData[i] === "<") {
          let tagStartPos = i;
          i++;
          if (xmlData[i] === "!") {
            i = readCommentAndCDATA(xmlData, i);
            continue;
          } else {
            let closingTag = false;
            if (xmlData[i] === "/") {
              closingTag = true;
              i++;
            }
            let tagName = "";
            for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
              tagName += xmlData[i];
            }
            tagName = tagName.trim();
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substring(0, tagName.length - 1);
              i--;
            }
            if (!validateTagName(tagName)) {
              let msg;
              if (tagName.trim().length === 0) {
                msg = "Invalid space after '<'.";
              } else {
                msg = "Tag '" + tagName + "' is an invalid name.";
              }
              return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
            }
            const result = readAttributeStr(xmlData, i);
            if (result === false) {
              return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
            }
            let attrStr = result.value;
            i = result.index;
            if (attrStr[attrStr.length - 1] === "/") {
              const attrStrStart = i - attrStr.length;
              attrStr = attrStr.substring(0, attrStr.length - 1);
              const isValid = validateAttributeString(attrStr, options);
              if (isValid === true) {
                tagFound = true;
              } else {
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
              }
            } else if (closingTag) {
              if (!result.tagClosed) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
              } else if (attrStr.trim().length > 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
              } else if (tags.length === 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
              } else {
                const otg = tags.pop();
                if (tagName !== otg.tagName) {
                  let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
                  return getErrorObject(
                    "InvalidTag",
                    "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                    getLineNumberForPosition(xmlData, tagStartPos)
                  );
                }
                if (tags.length == 0) {
                  reachedRoot = true;
                }
              }
            } else {
              const isValid = validateAttributeString(attrStr, options);
              if (isValid !== true) {
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
              }
              if (reachedRoot === true) {
                return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
              } else if (options.unpairedTags.indexOf(tagName) !== -1) {
              } else {
                tags.push({ tagName, tagStartPos });
              }
              tagFound = true;
            }
            for (i++; i < xmlData.length; i++) {
              if (xmlData[i] === "<") {
                if (xmlData[i + 1] === "!") {
                  i++;
                  i = readCommentAndCDATA(xmlData, i);
                  continue;
                } else if (xmlData[i + 1] === "?") {
                  i = readPI(xmlData, ++i);
                  if (i.err) return i;
                } else {
                  break;
                }
              } else if (xmlData[i] === "&") {
                const afterAmp = validateAmpersand(xmlData, i);
                if (afterAmp == -1)
                  return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
                i = afterAmp;
              } else {
                if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
                  return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
                }
              }
            }
            if (xmlData[i] === "<") {
              i--;
            }
          }
        } else {
          if (isWhiteSpace(xmlData[i])) {
            continue;
          }
          return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
        }
      }
      if (!tagFound) {
        return getErrorObject("InvalidXml", "Start tag expected.", 1);
      } else if (tags.length == 1) {
        return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
      } else if (tags.length > 0) {
        return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
      }
      return true;
    };
    function isWhiteSpace(char) {
      return char === " " || char === "	" || char === "\n" || char === "\r";
    }
    function readPI(xmlData, i) {
      const start = i;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] == "?" || xmlData[i] == " ") {
          const tagname = xmlData.substr(start, i - start);
          if (i > 5 && tagname === "xml") {
            return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
          } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
            i++;
            break;
          } else {
            continue;
          }
        }
      }
      return i;
    }
    function readCommentAndCDATA(xmlData, i) {
      if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
        for (i += 3; i < xmlData.length; i++) {
          if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
            i += 2;
            break;
          }
        }
      } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
        let angleBracketsCount = 1;
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            angleBracketsCount++;
          } else if (xmlData[i] === ">") {
            angleBracketsCount--;
            if (angleBracketsCount === 0) {
              break;
            }
          }
        }
      } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
            i += 2;
            break;
          }
        }
      }
      return i;
    }
    var doubleQuote = '"';
    var singleQuote = "'";
    function readAttributeStr(xmlData, i) {
      let attrStr = "";
      let startChar = "";
      let tagClosed = false;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
          if (startChar === "") {
            startChar = xmlData[i];
          } else if (startChar !== xmlData[i]) {
          } else {
            startChar = "";
          }
        } else if (xmlData[i] === ">") {
          if (startChar === "") {
            tagClosed = true;
            break;
          }
        }
        attrStr += xmlData[i];
      }
      if (startChar !== "") {
        return false;
      }
      return {
        value: attrStr,
        index: i,
        tagClosed
      };
    }
    var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
    function validateAttributeString(attrStr, options) {
      const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
      const attrNames = {};
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][1].length === 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
        } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
        } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
          return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
        }
        const attrName = matches[i][2];
        if (!validateAttrName(attrName)) {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
        }
        if (!attrNames.hasOwnProperty(attrName)) {
          attrNames[attrName] = 1;
        } else {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
        }
      }
      return true;
    }
    function validateNumberAmpersand(xmlData, i) {
      let re = /\d/;
      if (xmlData[i] === "x") {
        i++;
        re = /[\da-fA-F]/;
      }
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === ";")
          return i;
        if (!xmlData[i].match(re))
          break;
      }
      return -1;
    }
    function validateAmpersand(xmlData, i) {
      i++;
      if (xmlData[i] === ";")
        return -1;
      if (xmlData[i] === "#") {
        i++;
        return validateNumberAmpersand(xmlData, i);
      }
      let count = 0;
      for (; i < xmlData.length; i++, count++) {
        if (xmlData[i].match(/\w/) && count < 20)
          continue;
        if (xmlData[i] === ";")
          break;
        return -1;
      }
      return i;
    }
    function getErrorObject(code, message, lineNumber) {
      return {
        err: {
          code,
          msg: message,
          line: lineNumber.line || lineNumber,
          col: lineNumber.col
        }
      };
    }
    function validateAttrName(attrName) {
      return util.isName(attrName);
    }
    function validateTagName(tagname) {
      return util.isName(tagname);
    }
    function getLineNumberForPosition(xmlData, index) {
      const lines = xmlData.substring(0, index).split(/\r?\n/);
      return {
        line: lines.length,
        // column number is last line's length + 1, because column numbering starts at 1:
        col: lines[lines.length - 1].length + 1
      };
    }
    function getPositionFromMatch(match) {
      return match.startIndex + match[1].length;
    }
  }
});

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var require_OptionsBuilder = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js"(exports) {
    var defaultOptions2 = {
      preserveOrder: false,
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      removeNSPrefix: false,
      // remove NS from tag name or attribute name if true
      allowBooleanAttributes: false,
      //a tag can have attributes without any value
      //ignoreRootElement : false,
      parseTagValue: true,
      parseAttributeValue: false,
      trimValues: true,
      //Trim string values of tag and attributes
      cdataPropName: false,
      numberParseOptions: {
        hex: true,
        leadingZeros: true,
        eNotation: true
      },
      tagValueProcessor: function(tagName, val2) {
        return val2;
      },
      attributeValueProcessor: function(attrName, val2) {
        return val2;
      },
      stopNodes: [],
      //nested tags will not be parsed even for errors
      alwaysCreateTextNode: false,
      isArray: () => false,
      commentPropName: false,
      unpairedTags: [],
      processEntities: true,
      htmlEntities: false,
      ignoreDeclaration: false,
      ignorePiTags: false,
      transformTagName: false,
      transformAttributeName: false,
      updateTag: function(tagName, jPath, attrs) {
        return tagName;
      }
      // skipEmptyListItem: false
    };
    var buildOptions = function(options) {
      return Object.assign({}, defaultOptions2, options);
    };
    exports.buildOptions = buildOptions;
    exports.defaultOptions = defaultOptions2;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var require_xmlNode = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/xmlNode.js"(exports, module) {
    "use strict";
    var XmlNode = class {
      constructor(tagname) {
        this.tagname = tagname;
        this.child = [];
        this[":@"] = {};
      }
      add(key, val2) {
        if (key === "__proto__") key = "#__proto__";
        this.child.push({ [key]: val2 });
      }
      addChild(node) {
        if (node.tagname === "__proto__") node.tagname = "#__proto__";
        if (node[":@"] && Object.keys(node[":@"]).length > 0) {
          this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
        } else {
          this.child.push({ [node.tagname]: node.child });
        }
      }
    };
    module.exports = XmlNode;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var require_DocTypeReader = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js"(exports, module) {
    var util = require_util();
    function readDocType(xmlData, i) {
      const entities = {};
      if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
        i = i + 9;
        let angleBracketsCount = 1;
        let hasBody = false, comment = false;
        let exp = "";
        for (; i < xmlData.length; i++) {
          if (xmlData[i] === "<" && !comment) {
            if (hasBody && isEntity(xmlData, i)) {
              i += 7;
              [entityName, val, i] = readEntityExp(xmlData, i + 1);
              if (val.indexOf("&") === -1)
                entities[validateEntityName(entityName)] = {
                  regx: RegExp(`&${entityName};`, "g"),
                  val
                };
            } else if (hasBody && isElement(xmlData, i)) i += 8;
            else if (hasBody && isAttlist(xmlData, i)) i += 8;
            else if (hasBody && isNotation(xmlData, i)) i += 9;
            else if (isComment) comment = true;
            else throw new Error("Invalid DOCTYPE");
            angleBracketsCount++;
            exp = "";
          } else if (xmlData[i] === ">") {
            if (comment) {
              if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
                comment = false;
                angleBracketsCount--;
              }
            } else {
              angleBracketsCount--;
            }
            if (angleBracketsCount === 0) {
              break;
            }
          } else if (xmlData[i] === "[") {
            hasBody = true;
          } else {
            exp += xmlData[i];
          }
        }
        if (angleBracketsCount !== 0) {
          throw new Error(`Unclosed DOCTYPE`);
        }
      } else {
        throw new Error(`Invalid Tag instead of DOCTYPE`);
      }
      return { entities, i };
    }
    function readEntityExp(xmlData, i) {
      let entityName2 = "";
      for (; i < xmlData.length && (xmlData[i] !== "'" && xmlData[i] !== '"'); i++) {
        entityName2 += xmlData[i];
      }
      entityName2 = entityName2.trim();
      if (entityName2.indexOf(" ") !== -1) throw new Error("External entites are not supported");
      const startChar = xmlData[i++];
      let val2 = "";
      for (; i < xmlData.length && xmlData[i] !== startChar; i++) {
        val2 += xmlData[i];
      }
      return [entityName2, val2, i];
    }
    function isComment(xmlData, i) {
      if (xmlData[i + 1] === "!" && xmlData[i + 2] === "-" && xmlData[i + 3] === "-") return true;
      return false;
    }
    function isEntity(xmlData, i) {
      if (xmlData[i + 1] === "!" && xmlData[i + 2] === "E" && xmlData[i + 3] === "N" && xmlData[i + 4] === "T" && xmlData[i + 5] === "I" && xmlData[i + 6] === "T" && xmlData[i + 7] === "Y") return true;
      return false;
    }
    function isElement(xmlData, i) {
      if (xmlData[i + 1] === "!" && xmlData[i + 2] === "E" && xmlData[i + 3] === "L" && xmlData[i + 4] === "E" && xmlData[i + 5] === "M" && xmlData[i + 6] === "E" && xmlData[i + 7] === "N" && xmlData[i + 8] === "T") return true;
      return false;
    }
    function isAttlist(xmlData, i) {
      if (xmlData[i + 1] === "!" && xmlData[i + 2] === "A" && xmlData[i + 3] === "T" && xmlData[i + 4] === "T" && xmlData[i + 5] === "L" && xmlData[i + 6] === "I" && xmlData[i + 7] === "S" && xmlData[i + 8] === "T") return true;
      return false;
    }
    function isNotation(xmlData, i) {
      if (xmlData[i + 1] === "!" && xmlData[i + 2] === "N" && xmlData[i + 3] === "O" && xmlData[i + 4] === "T" && xmlData[i + 5] === "A" && xmlData[i + 6] === "T" && xmlData[i + 7] === "I" && xmlData[i + 8] === "O" && xmlData[i + 9] === "N") return true;
      return false;
    }
    function validateEntityName(name) {
      if (util.isName(name))
        return name;
      else
        throw new Error(`Invalid entity name ${name}`);
    }
    module.exports = readDocType;
  }
});

// node_modules/strnum/strnum.js
var require_strnum = __commonJS({
  "node_modules/strnum/strnum.js"(exports, module) {
    var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
    var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
    var consider = {
      hex: true,
      // oct: false,
      leadingZeros: true,
      decimalPoint: ".",
      eNotation: true
      //skipLike: /regex/
    };
    function toNumber(str, options = {}) {
      options = Object.assign({}, consider, options);
      if (!str || typeof str !== "string") return str;
      let trimmedStr = str.trim();
      if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
      else if (str === "0") return 0;
      else if (options.hex && hexRegex.test(trimmedStr)) {
        return parse_int(trimmedStr, 16);
      } else if (trimmedStr.search(/[eE]/) !== -1) {
        const notation = trimmedStr.match(/^([-\+])?(0*)([0-9]*(\.[0-9]*)?[eE][-\+]?[0-9]+)$/);
        if (notation) {
          if (options.leadingZeros) {
            trimmedStr = (notation[1] || "") + notation[3];
          } else {
            if (notation[2] === "0" && notation[3][0] === ".") {
            } else {
              return str;
            }
          }
          return options.eNotation ? Number(trimmedStr) : str;
        } else {
          return str;
        }
      } else {
        const match = numRegex.exec(trimmedStr);
        if (match) {
          const sign = match[1];
          const leadingZeros = match[2];
          let numTrimmedByZeros = trimZeros(match[3]);
          if (!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".") return str;
          else if (!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".") return str;
          else if (options.leadingZeros && leadingZeros === str) return 0;
          else {
            const num = Number(trimmedStr);
            const numStr = "" + num;
            if (numStr.search(/[eE]/) !== -1) {
              if (options.eNotation) return num;
              else return str;
            } else if (trimmedStr.indexOf(".") !== -1) {
              if (numStr === "0" && numTrimmedByZeros === "") return num;
              else if (numStr === numTrimmedByZeros) return num;
              else if (sign && numStr === "-" + numTrimmedByZeros) return num;
              else return str;
            }
            if (leadingZeros) {
              return numTrimmedByZeros === numStr || sign + numTrimmedByZeros === numStr ? num : str;
            } else {
              return trimmedStr === numStr || trimmedStr === sign + numStr ? num : str;
            }
          }
        } else {
          return str;
        }
      }
    }
    function trimZeros(numStr) {
      if (numStr && numStr.indexOf(".") !== -1) {
        numStr = numStr.replace(/0+$/, "");
        if (numStr === ".") numStr = "0";
        else if (numStr[0] === ".") numStr = "0" + numStr;
        else if (numStr[numStr.length - 1] === ".") numStr = numStr.substr(0, numStr.length - 1);
        return numStr;
      }
      return numStr;
    }
    function parse_int(numStr, base) {
      if (parseInt) return parseInt(numStr, base);
      else if (Number.parseInt) return Number.parseInt(numStr, base);
      else if (window && window.parseInt) return window.parseInt(numStr, base);
      else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
    }
    module.exports = toNumber;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var require_OrderedObjParser = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js"(exports, module) {
    "use strict";
    var util = require_util();
    var xmlNode = require_xmlNode();
    var readDocType = require_DocTypeReader();
    var toNumber = require_strnum();
    var OrderedObjParser = class {
      constructor(options) {
        this.options = options;
        this.currentNode = null;
        this.tagsNodeStack = [];
        this.docTypeEntities = {};
        this.lastEntities = {
          "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
          "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
          "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
          "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
        };
        this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
        this.htmlEntities = {
          "space": { regex: /&(nbsp|#160);/g, val: " " },
          // "lt" : { regex: /&(lt|#60);/g, val: "<" },
          // "gt" : { regex: /&(gt|#62);/g, val: ">" },
          // "amp" : { regex: /&(amp|#38);/g, val: "&" },
          // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
          // "apos" : { regex: /&(apos|#39);/g, val: "'" },
          "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
          "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
          "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
          "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
          "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
          "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
          "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
          "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => String.fromCharCode(Number.parseInt(str, 10)) },
          "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => String.fromCharCode(Number.parseInt(str, 16)) }
        };
        this.addExternalEntities = addExternalEntities;
        this.parseXml = parseXml;
        this.parseTextData = parseTextData;
        this.resolveNameSpace = resolveNameSpace;
        this.buildAttributesMap = buildAttributesMap;
        this.isItStopNode = isItStopNode;
        this.replaceEntitiesValue = replaceEntitiesValue;
        this.readStopNodeData = readStopNodeData;
        this.saveTextToParentTag = saveTextToParentTag;
        this.addChild = addChild;
      }
    };
    function addExternalEntities(externalEntities) {
      const entKeys = Object.keys(externalEntities);
      for (let i = 0; i < entKeys.length; i++) {
        const ent = entKeys[i];
        this.lastEntities[ent] = {
          regex: new RegExp("&" + ent + ";", "g"),
          val: externalEntities[ent]
        };
      }
    }
    function parseTextData(val2, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
      if (val2 !== void 0) {
        if (this.options.trimValues && !dontTrim) {
          val2 = val2.trim();
        }
        if (val2.length > 0) {
          if (!escapeEntities) val2 = this.replaceEntitiesValue(val2);
          const newval = this.options.tagValueProcessor(tagName, val2, jPath, hasAttributes, isLeafNode);
          if (newval === null || newval === void 0) {
            return val2;
          } else if (typeof newval !== typeof val2 || newval !== val2) {
            return newval;
          } else if (this.options.trimValues) {
            return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
          } else {
            const trimmedVal = val2.trim();
            if (trimmedVal === val2) {
              return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
            } else {
              return val2;
            }
          }
        }
      }
    }
    function resolveNameSpace(tagname) {
      if (this.options.removeNSPrefix) {
        const tags = tagname.split(":");
        const prefix = tagname.charAt(0) === "/" ? "/" : "";
        if (tags[0] === "xmlns") {
          return "";
        }
        if (tags.length === 2) {
          tagname = prefix + tags[1];
        }
      }
      return tagname;
    }
    var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
    function buildAttributesMap(attrStr, jPath, tagName) {
      if (!this.options.ignoreAttributes && typeof attrStr === "string") {
        const matches = util.getAllMatches(attrStr, attrsRegx);
        const len = matches.length;
        const attrs = {};
        for (let i = 0; i < len; i++) {
          const attrName = this.resolveNameSpace(matches[i][1]);
          let oldVal = matches[i][4];
          let aName = this.options.attributeNamePrefix + attrName;
          if (attrName.length) {
            if (this.options.transformAttributeName) {
              aName = this.options.transformAttributeName(aName);
            }
            if (aName === "__proto__") aName = "#__proto__";
            if (oldVal !== void 0) {
              if (this.options.trimValues) {
                oldVal = oldVal.trim();
              }
              oldVal = this.replaceEntitiesValue(oldVal);
              const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
              if (newVal === null || newVal === void 0) {
                attrs[aName] = oldVal;
              } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
                attrs[aName] = newVal;
              } else {
                attrs[aName] = parseValue(
                  oldVal,
                  this.options.parseAttributeValue,
                  this.options.numberParseOptions
                );
              }
            } else if (this.options.allowBooleanAttributes) {
              attrs[aName] = true;
            }
          }
        }
        if (!Object.keys(attrs).length) {
          return;
        }
        if (this.options.attributesGroupName) {
          const attrCollection = {};
          attrCollection[this.options.attributesGroupName] = attrs;
          return attrCollection;
        }
        return attrs;
      }
    }
    var parseXml = function(xmlData) {
      xmlData = xmlData.replace(/\r\n?/g, "\n");
      const xmlObj = new xmlNode("!xml");
      let currentNode = xmlObj;
      let textData = "";
      let jPath = "";
      for (let i = 0; i < xmlData.length; i++) {
        const ch = xmlData[i];
        if (ch === "<") {
          if (xmlData[i + 1] === "/") {
            const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
            let tagName = xmlData.substring(i + 2, closeIndex).trim();
            if (this.options.removeNSPrefix) {
              const colonIndex = tagName.indexOf(":");
              if (colonIndex !== -1) {
                tagName = tagName.substr(colonIndex + 1);
              }
            }
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            if (currentNode) {
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
            }
            const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
            if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
              throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
            }
            let propIndex = 0;
            if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
              propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
              this.tagsNodeStack.pop();
            } else {
              propIndex = jPath.lastIndexOf(".");
            }
            jPath = jPath.substring(0, propIndex);
            currentNode = this.tagsNodeStack.pop();
            textData = "";
            i = closeIndex;
          } else if (xmlData[i + 1] === "?") {
            let tagData = readTagExp(xmlData, i, false, "?>");
            if (!tagData) throw new Error("Pi Tag is not closed.");
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
            } else {
              const childNode = new xmlNode(tagData.tagName);
              childNode.add(this.options.textNodeName, "");
              if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
              }
              this.addChild(currentNode, childNode, jPath);
            }
            i = tagData.closeIndex + 1;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
            if (this.options.commentPropName) {
              const comment = xmlData.substring(i + 4, endIndex - 2);
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
            }
            i = endIndex;
          } else if (xmlData.substr(i + 1, 2) === "!D") {
            const result = readDocType(xmlData, i);
            this.docTypeEntities = result.entities;
            i = result.i;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
            const tagExp = xmlData.substring(i + 9, closeIndex);
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            let val2 = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
            if (val2 == void 0) val2 = "";
            if (this.options.cdataPropName) {
              currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
            } else {
              currentNode.add(this.options.textNodeName, val2);
            }
            i = closeIndex + 2;
          } else {
            let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
            let tagName = result.tagName;
            const rawTagName = result.rawTagName;
            let tagExp = result.tagExp;
            let attrExpPresent = result.attrExpPresent;
            let closeIndex = result.closeIndex;
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            if (currentNode && textData) {
              if (currentNode.tagname !== "!xml") {
                textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
              }
            }
            const lastTag = currentNode;
            if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
              currentNode = this.tagsNodeStack.pop();
              jPath = jPath.substring(0, jPath.lastIndexOf("."));
            }
            if (tagName !== xmlObj.tagname) {
              jPath += jPath ? "." + tagName : tagName;
            }
            if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
              let tagContent = "";
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                i = result.closeIndex;
              } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                i = result.closeIndex;
              } else {
                const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
                if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
                i = result2.i;
                tagContent = result2.tagContent;
              }
              const childNode = new xmlNode(tagName);
              if (tagName !== tagExp && attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
              }
              if (tagContent) {
                tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
              }
              jPath = jPath.substr(0, jPath.lastIndexOf("."));
              childNode.add(this.options.textNodeName, tagContent);
              this.addChild(currentNode, childNode, jPath);
            } else {
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                if (this.options.transformTagName) {
                  tagName = this.options.transformTagName(tagName);
                }
                const childNode = new xmlNode(tagName);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                }
                this.addChild(currentNode, childNode, jPath);
                jPath = jPath.substr(0, jPath.lastIndexOf("."));
              } else {
                const childNode = new xmlNode(tagName);
                this.tagsNodeStack.push(currentNode);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                }
                this.addChild(currentNode, childNode, jPath);
                currentNode = childNode;
              }
              textData = "";
              i = closeIndex;
            }
          }
        } else {
          textData += xmlData[i];
        }
      }
      return xmlObj.child;
    };
    function addChild(currentNode, childNode, jPath) {
      const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
      if (result === false) {
      } else if (typeof result === "string") {
        childNode.tagname = result;
        currentNode.addChild(childNode);
      } else {
        currentNode.addChild(childNode);
      }
    }
    var replaceEntitiesValue = function(val2) {
      if (this.options.processEntities) {
        for (let entityName2 in this.docTypeEntities) {
          const entity = this.docTypeEntities[entityName2];
          val2 = val2.replace(entity.regx, entity.val);
        }
        for (let entityName2 in this.lastEntities) {
          const entity = this.lastEntities[entityName2];
          val2 = val2.replace(entity.regex, entity.val);
        }
        if (this.options.htmlEntities) {
          for (let entityName2 in this.htmlEntities) {
            const entity = this.htmlEntities[entityName2];
            val2 = val2.replace(entity.regex, entity.val);
          }
        }
        val2 = val2.replace(this.ampEntity.regex, this.ampEntity.val);
      }
      return val2;
    };
    function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
      if (textData) {
        if (isLeafNode === void 0) isLeafNode = Object.keys(currentNode.child).length === 0;
        textData = this.parseTextData(
          textData,
          currentNode.tagname,
          jPath,
          false,
          currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false,
          isLeafNode
        );
        if (textData !== void 0 && textData !== "")
          currentNode.add(this.options.textNodeName, textData);
        textData = "";
      }
      return textData;
    }
    function isItStopNode(stopNodes, jPath, currentTagName) {
      const allNodesExp = "*." + currentTagName;
      for (const stopNodePath in stopNodes) {
        const stopNodeExp = stopNodes[stopNodePath];
        if (allNodesExp === stopNodeExp || jPath === stopNodeExp) return true;
      }
      return false;
    }
    function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
      let attrBoundary;
      let tagExp = "";
      for (let index = i; index < xmlData.length; index++) {
        let ch = xmlData[index];
        if (attrBoundary) {
          if (ch === attrBoundary) attrBoundary = "";
        } else if (ch === '"' || ch === "'") {
          attrBoundary = ch;
        } else if (ch === closingChar[0]) {
          if (closingChar[1]) {
            if (xmlData[index + 1] === closingChar[1]) {
              return {
                data: tagExp,
                index
              };
            }
          } else {
            return {
              data: tagExp,
              index
            };
          }
        } else if (ch === "	") {
          ch = " ";
        }
        tagExp += ch;
      }
    }
    function findClosingIndex(xmlData, str, i, errMsg) {
      const closingIndex = xmlData.indexOf(str, i);
      if (closingIndex === -1) {
        throw new Error(errMsg);
      } else {
        return closingIndex + str.length - 1;
      }
    }
    function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
      const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
      if (!result) return;
      let tagExp = result.data;
      const closeIndex = result.index;
      const separatorIndex = tagExp.search(/\s/);
      let tagName = tagExp;
      let attrExpPresent = true;
      if (separatorIndex !== -1) {
        tagName = tagExp.substring(0, separatorIndex);
        tagExp = tagExp.substring(separatorIndex + 1).trimStart();
      }
      const rawTagName = tagName;
      if (removeNSPrefix) {
        const colonIndex = tagName.indexOf(":");
        if (colonIndex !== -1) {
          tagName = tagName.substr(colonIndex + 1);
          attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
        }
      }
      return {
        tagName,
        tagExp,
        closeIndex,
        attrExpPresent,
        rawTagName
      };
    }
    function readStopNodeData(xmlData, tagName, i) {
      const startIndex = i;
      let openTagCount = 1;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<") {
          if (xmlData[i + 1] === "/") {
            const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
            let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
            if (closeTagName === tagName) {
              openTagCount--;
              if (openTagCount === 0) {
                return {
                  tagContent: xmlData.substring(startIndex, i),
                  i: closeIndex
                };
              }
            }
            i = closeIndex;
          } else if (xmlData[i + 1] === "?") {
            const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
            i = closeIndex;
          } else {
            const tagData = readTagExp(xmlData, i, ">");
            if (tagData) {
              const openTagName = tagData && tagData.tagName;
              if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
                openTagCount++;
              }
              i = tagData.closeIndex;
            }
          }
        }
      }
    }
    function parseValue(val2, shouldParse, options) {
      if (shouldParse && typeof val2 === "string") {
        const newval = val2.trim();
        if (newval === "true") return true;
        else if (newval === "false") return false;
        else return toNumber(val2, options);
      } else {
        if (util.isExist(val2)) {
          return val2;
        } else {
          return "";
        }
      }
    }
    module.exports = OrderedObjParser;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var require_node2json = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/node2json.js"(exports) {
    "use strict";
    function prettify(node, options) {
      return compress(node, options);
    }
    function compress(arr, options, jPath) {
      let text;
      const compressedObj = {};
      for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const property = propName(tagObj);
        let newJpath = "";
        if (jPath === void 0) newJpath = property;
        else newJpath = jPath + "." + property;
        if (property === options.textNodeName) {
          if (text === void 0) text = tagObj[property];
          else text += "" + tagObj[property];
        } else if (property === void 0) {
          continue;
        } else if (tagObj[property]) {
          let val2 = compress(tagObj[property], options, newJpath);
          const isLeaf = isLeafTag(val2, options);
          if (tagObj[":@"]) {
            assignAttributes(val2, tagObj[":@"], newJpath, options);
          } else if (Object.keys(val2).length === 1 && val2[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
            val2 = val2[options.textNodeName];
          } else if (Object.keys(val2).length === 0) {
            if (options.alwaysCreateTextNode) val2[options.textNodeName] = "";
            else val2 = "";
          }
          if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
            if (!Array.isArray(compressedObj[property])) {
              compressedObj[property] = [compressedObj[property]];
            }
            compressedObj[property].push(val2);
          } else {
            if (options.isArray(property, newJpath, isLeaf)) {
              compressedObj[property] = [val2];
            } else {
              compressedObj[property] = val2;
            }
          }
        }
      }
      if (typeof text === "string") {
        if (text.length > 0) compressedObj[options.textNodeName] = text;
      } else if (text !== void 0) compressedObj[options.textNodeName] = text;
      return compressedObj;
    }
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== ":@") return key;
      }
    }
    function assignAttributes(obj, attrMap, jpath, options) {
      if (attrMap) {
        const keys = Object.keys(attrMap);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          const atrrName = keys[i];
          if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
            obj[atrrName] = [attrMap[atrrName]];
          } else {
            obj[atrrName] = attrMap[atrrName];
          }
        }
      }
    }
    function isLeafTag(obj, options) {
      const { textNodeName } = options;
      const propCount = Object.keys(obj).length;
      if (propCount === 0) {
        return true;
      }
      if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
        return true;
      }
      return false;
    }
    exports.prettify = prettify;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var require_XMLParser = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/XMLParser.js"(exports, module) {
    var { buildOptions } = require_OptionsBuilder();
    var OrderedObjParser = require_OrderedObjParser();
    var { prettify } = require_node2json();
    var validator = require_validator();
    var XMLParser2 = class {
      constructor(options) {
        this.externalEntities = {};
        this.options = buildOptions(options);
      }
      /**
       * Parse XML dats to JS object 
       * @param {string|Buffer} xmlData 
       * @param {boolean|Object} validationOption 
       */
      parse(xmlData, validationOption) {
        if (typeof xmlData === "string") {
        } else if (xmlData.toString) {
          xmlData = xmlData.toString();
        } else {
          throw new Error("XML data is accepted in String or Bytes[] form.");
        }
        if (validationOption) {
          if (validationOption === true) validationOption = {};
          const result = validator.validate(xmlData, validationOption);
          if (result !== true) {
            throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
          }
        }
        const orderedObjParser = new OrderedObjParser(this.options);
        orderedObjParser.addExternalEntities(this.externalEntities);
        const orderedResult = orderedObjParser.parseXml(xmlData);
        if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
        else return prettify(orderedResult, this.options);
      }
      /**
       * Add Entity which is not by default supported by this library
       * @param {string} key 
       * @param {string} value 
       */
      addEntity(key, value) {
        if (value.indexOf("&") !== -1) {
          throw new Error("Entity value can't have '&'");
        } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
          throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
        } else if (value === "&") {
          throw new Error("An entity with value '&' is not permitted");
        } else {
          this.externalEntities[key] = value;
        }
      }
    };
    module.exports = XMLParser2;
  }
});

// node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
var require_orderedJs2Xml = __commonJS({
  "node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js"(exports, module) {
    var EOL = "\n";
    function toXml(jArray, options) {
      let indentation = "";
      if (options.format && options.indentBy.length > 0) {
        indentation = EOL;
      }
      return arrToStr(jArray, options, "", indentation);
    }
    function arrToStr(arr, options, jPath, indentation) {
      let xmlStr = "";
      let isPreviousElementTag = false;
      for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const tagName = propName(tagObj);
        if (tagName === void 0) continue;
        let newJPath = "";
        if (jPath.length === 0) newJPath = tagName;
        else newJPath = `${jPath}.${tagName}`;
        if (tagName === options.textNodeName) {
          let tagText = tagObj[tagName];
          if (!isStopNode(newJPath, options)) {
            tagText = options.tagValueProcessor(tagName, tagText);
            tagText = replaceEntitiesValue(tagText, options);
          }
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += tagText;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.cdataPropName) {
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.commentPropName) {
          xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
          isPreviousElementTag = true;
          continue;
        } else if (tagName[0] === "?") {
          const attStr2 = attr_to_str(tagObj[":@"], options);
          const tempInd = tagName === "?xml" ? "" : indentation;
          let piTextNodeName = tagObj[tagName][0][options.textNodeName];
          piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
          xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
          isPreviousElementTag = true;
          continue;
        }
        let newIdentation = indentation;
        if (newIdentation !== "") {
          newIdentation += options.indentBy;
        }
        const attStr = attr_to_str(tagObj[":@"], options);
        const tagStart = indentation + `<${tagName}${attStr}`;
        const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
        if (options.unpairedTags.indexOf(tagName) !== -1) {
          if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
          else xmlStr += tagStart + "/>";
        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
          xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
          xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
          xmlStr += tagStart + ">";
          if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
            xmlStr += indentation + options.indentBy + tagValue + indentation;
          } else {
            xmlStr += tagValue;
          }
          xmlStr += `</${tagName}>`;
        }
        isPreviousElementTag = true;
      }
      return xmlStr;
    }
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!obj.hasOwnProperty(key)) continue;
        if (key !== ":@") return key;
      }
    }
    function attr_to_str(attrMap, options) {
      let attrStr = "";
      if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
          if (!attrMap.hasOwnProperty(attr)) continue;
          let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
          attrVal = replaceEntitiesValue(attrVal, options);
          if (attrVal === true && options.suppressBooleanAttributes) {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
          } else {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
          }
        }
      }
      return attrStr;
    }
    function isStopNode(jPath, options) {
      jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
      let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
      for (let index in options.stopNodes) {
        if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName) return true;
      }
      return false;
    }
    function replaceEntitiesValue(textValue, options) {
      if (textValue && textValue.length > 0 && options.processEntities) {
        for (let i = 0; i < options.entities.length; i++) {
          const entity = options.entities[i];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    }
    module.exports = toXml;
  }
});

// node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var require_json2xml = __commonJS({
  "node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js"(exports, module) {
    "use strict";
    var buildFromOrderedJs = require_orderedJs2Xml();
    var defaultOptions2 = {
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      cdataPropName: false,
      format: false,
      indentBy: "  ",
      suppressEmptyNode: false,
      suppressUnpairedNode: true,
      suppressBooleanAttributes: true,
      tagValueProcessor: function(key, a) {
        return a;
      },
      attributeValueProcessor: function(attrName, a) {
        return a;
      },
      preserveOrder: false,
      commentPropName: false,
      unpairedTags: [],
      entities: [
        { regex: new RegExp("&", "g"), val: "&amp;" },
        //it must be on top
        { regex: new RegExp(">", "g"), val: "&gt;" },
        { regex: new RegExp("<", "g"), val: "&lt;" },
        { regex: new RegExp("'", "g"), val: "&apos;" },
        { regex: new RegExp('"', "g"), val: "&quot;" }
      ],
      processEntities: true,
      stopNodes: [],
      // transformTagName: false,
      // transformAttributeName: false,
      oneListGroup: false
    };
    function Builder(options) {
      this.options = Object.assign({}, defaultOptions2, options);
      if (this.options.ignoreAttributes || this.options.attributesGroupName) {
        this.isAttribute = function() {
          return false;
        };
      } else {
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
      }
      this.processTextOrObjNode = processTextOrObjNode;
      if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = ">\n";
        this.newLine = "\n";
      } else {
        this.indentate = function() {
          return "";
        };
        this.tagEndChar = ">";
        this.newLine = "";
      }
    }
    Builder.prototype.build = function(jObj) {
      if (this.options.preserveOrder) {
        return buildFromOrderedJs(jObj, this.options);
      } else {
        if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
          jObj = {
            [this.options.arrayNodeName]: jObj
          };
        }
        return this.j2x(jObj, 0).val;
      }
    };
    Builder.prototype.j2x = function(jObj, level) {
      let attrStr = "";
      let val2 = "";
      for (let key in jObj) {
        if (!Object.prototype.hasOwnProperty.call(jObj, key)) continue;
        if (typeof jObj[key] === "undefined") {
          if (this.isAttribute(key)) {
            val2 += "";
          }
        } else if (jObj[key] === null) {
          if (this.isAttribute(key)) {
            val2 += "";
          } else if (key[0] === "?") {
            val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
          } else {
            val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
          }
        } else if (jObj[key] instanceof Date) {
          val2 += this.buildTextValNode(jObj[key], key, "", level);
        } else if (typeof jObj[key] !== "object") {
          const attr = this.isAttribute(key);
          if (attr) {
            attrStr += this.buildAttrPairStr(attr, "" + jObj[key]);
          } else {
            if (key === this.options.textNodeName) {
              let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
              val2 += this.replaceEntitiesValue(newval);
            } else {
              val2 += this.buildTextValNode(jObj[key], key, "", level);
            }
          }
        } else if (Array.isArray(jObj[key])) {
          const arrLen = jObj[key].length;
          let listTagVal = "";
          let listTagAttr = "";
          for (let j = 0; j < arrLen; j++) {
            const item = jObj[key][j];
            if (typeof item === "undefined") {
            } else if (item === null) {
              if (key[0] === "?") val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
              else val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            } else if (typeof item === "object") {
              if (this.options.oneListGroup) {
                const result = this.j2x(item, level + 1);
                listTagVal += result.val;
                if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
                  listTagAttr += result.attrStr;
                }
              } else {
                listTagVal += this.processTextOrObjNode(item, key, level);
              }
            } else {
              if (this.options.oneListGroup) {
                let textValue = this.options.tagValueProcessor(key, item);
                textValue = this.replaceEntitiesValue(textValue);
                listTagVal += textValue;
              } else {
                listTagVal += this.buildTextValNode(item, key, "", level);
              }
            }
          }
          if (this.options.oneListGroup) {
            listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
          }
          val2 += listTagVal;
        } else {
          if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
            const Ks = Object.keys(jObj[key]);
            const L = Ks.length;
            for (let j = 0; j < L; j++) {
              attrStr += this.buildAttrPairStr(Ks[j], "" + jObj[key][Ks[j]]);
            }
          } else {
            val2 += this.processTextOrObjNode(jObj[key], key, level);
          }
        }
      }
      return { attrStr, val: val2 };
    };
    Builder.prototype.buildAttrPairStr = function(attrName, val2) {
      val2 = this.options.attributeValueProcessor(attrName, "" + val2);
      val2 = this.replaceEntitiesValue(val2);
      if (this.options.suppressBooleanAttributes && val2 === "true") {
        return " " + attrName;
      } else return " " + attrName + '="' + val2 + '"';
    };
    function processTextOrObjNode(object, key, level) {
      const result = this.j2x(object, level + 1);
      if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
        return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
      } else {
        return this.buildObjectNode(result.val, key, result.attrStr, level);
      }
    }
    Builder.prototype.buildObjectNode = function(val2, key, attrStr, level) {
      if (val2 === "") {
        if (key[0] === "?") return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
        else {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        }
      } else {
        let tagEndExp = "</" + key + this.tagEndChar;
        let piClosingChar = "";
        if (key[0] === "?") {
          piClosingChar = "?";
          tagEndExp = "";
        }
        if ((attrStr || attrStr === "") && val2.indexOf("<") === -1) {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val2 + tagEndExp;
        } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
          return this.indentate(level) + `<!--${val2}-->` + this.newLine;
        } else {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val2 + this.indentate(level) + tagEndExp;
        }
      }
    };
    Builder.prototype.closeTag = function(key) {
      let closeTag = "";
      if (this.options.unpairedTags.indexOf(key) !== -1) {
        if (!this.options.suppressUnpairedNode) closeTag = "/";
      } else if (this.options.suppressEmptyNode) {
        closeTag = "/";
      } else {
        closeTag = `></${key}`;
      }
      return closeTag;
    };
    Builder.prototype.buildTextValNode = function(val2, key, attrStr, level) {
      if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
        return this.indentate(level) + `<![CDATA[${val2}]]>` + this.newLine;
      } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
        return this.indentate(level) + `<!--${val2}-->` + this.newLine;
      } else if (key[0] === "?") {
        return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
      } else {
        let textValue = this.options.tagValueProcessor(key, val2);
        textValue = this.replaceEntitiesValue(textValue);
        if (textValue === "") {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        } else {
          return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
        }
      }
    };
    Builder.prototype.replaceEntitiesValue = function(textValue) {
      if (textValue && textValue.length > 0 && this.options.processEntities) {
        for (let i = 0; i < this.options.entities.length; i++) {
          const entity = this.options.entities[i];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    };
    function indentate(level) {
      return this.options.indentBy.repeat(level);
    }
    function isAttribute(name) {
      if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
        return name.substr(this.attrPrefixLen);
      } else {
        return false;
      }
    }
    module.exports = Builder;
  }
});

// node_modules/fast-xml-parser/src/fxp.js
var require_fxp = __commonJS({
  "node_modules/fast-xml-parser/src/fxp.js"(exports, module) {
    "use strict";
    var validator = require_validator();
    var XMLParser2 = require_XMLParser();
    var XMLBuilder = require_json2xml();
    module.exports = {
      XMLParser: XMLParser2,
      XMLValidator: validator,
      XMLBuilder
    };
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer8 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer8.from && Buffer8.alloc && Buffer8.allocUnsafe && Buffer8.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer8(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer8.prototype);
    copyProps(Buffer8, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer8(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer8(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer8(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/base-x/src/index.js
var require_src = __commonJS({
  "node_modules/base-x/src/index.js"(exports, module) {
    "use strict";
    var _Buffer = require_safe_buffer().Buffer;
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE2 = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE2) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE2);
      function encode(source) {
        if (Array.isArray(source) || source instanceof Uint8Array) {
          source = _Buffer.from(source);
        }
        if (!_Buffer.isBuffer(source)) {
          throw new TypeError("Expected Buffer");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE2 >>> 0;
            carry = carry / BASE2 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return _Buffer.alloc(0);
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (psz < source.length) {
          var charCode = source.charCodeAt(psz);
          if (charCode > 255) {
            return;
          }
          var carry = BASE_MAP[charCode];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
            carry += BASE2 * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
        vch.fill(0, 0, zeroes);
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE2 + " character");
      }
      return {
        encode,
        decodeUnsafe,
        decode
      };
    }
    module.exports = base;
  }
});

// node_modules/bs58/index.js
var require_bs58 = __commonJS({
  "node_modules/bs58/index.js"(exports, module) {
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module.exports = basex(ALPHABET);
  }
});

// src/index.ts
import fs2 from "node:fs";
import path3 from "node:path";
import dotenv2 from "dotenv";

// src/init.ts
import {
  ChannelType,
  Role,
  createUniqueUuid,
  initializeOnboarding,
  logger as logger2
} from "@elizaos/core";
var initCharacter = async ({
  runtime,
  config: config3,
  actions,
  providers,
  evaluators
}) => {
  if (actions) {
    for (const action of actions) {
      runtime.registerAction(action);
    }
  }
  if (providers) {
    for (const provider of providers) {
      runtime.registerProvider(provider);
    }
  }
  if (evaluators) {
    for (const evaluator of evaluators) {
      runtime.registerEvaluator(evaluator);
    }
  }
  runtime.registerEvent("DISCORD_WORLD_JOINED", async (params) => {
    await initializeAllSystems(runtime, [params.server], config3);
  });
  runtime.registerEvent("DISCORD_SERVER_CONNECTED", async (params) => {
    await initializeAllSystems(runtime, [params.server], config3);
  });
  runtime.registerEvent(
    "TELEGRAM_WORLD_JOINED",
    async (params) => {
      await initializeOnboarding(runtime, params.world, config3);
      await startTelegramOnboarding(
        runtime,
        params.world,
        params.chat,
        params.entities,
        params.botUsername
      );
    }
  );
};
async function initializeAllSystems(runtime, servers, config3) {
  await new Promise((resolve) => setTimeout(resolve, 2e3));
  try {
    for (const server of servers) {
      const worldId = createUniqueUuid(runtime, server.id);
      const ownerId = createUniqueUuid(runtime, server.ownerId);
      const existingWorld = await runtime.getWorld(worldId);
      if (!existingWorld) {
        logger2.debug("Onboarding not initialized for server", server.id);
        continue;
      }
      if (existingWorld?.metadata?.settings) {
        logger2.debug("Onboarding already initialized for server", server.id);
        continue;
      }
      const world = {
        id: worldId,
        name: server.name,
        serverId: server.id,
        agentId: runtime.agentId,
        metadata: {
          roles: {
            [ownerId]: Role.OWNER
          },
          ownership: {
            ownerId
          }
        }
      };
      await runtime.ensureWorldExists(world);
      console.log("world", world);
    }
  } catch (error) {
    logger2.error("Error initializing systems:", error);
    throw error;
  }
}
async function startTelegramOnboarding(runtime, world, chat, entities, botUsername) {
  let ownerId = null;
  let ownerUsername = null;
  entities.forEach((entity) => {
    if (entity.metadata?.telegram?.adminTitle === "Owner") {
      ownerId = entity?.metadata?.telegram?.id;
      ownerUsername = entity?.metadata?.telegram?.username;
    }
  });
  if (!ownerId) {
    logger2.warn("no ownerId found");
  }
  const telegramClient = runtime.getService("telegram");
  const onboardingMessageDeepLink = [
    `Hello @${ownerUsername}! Could we take a few minutes to get everything set up?`,
    `Please click this link to start chatting with me: https://t.me/${botUsername}?start=onboarding`
  ].join(" ");
  await telegramClient.messageManager.sendMessage(chat.id, { text: onboardingMessageDeepLink });
  logger2.info(`Sent deep link to group chat ${chat.id} for owner ${ownerId || "unknown"}`);
}

// src/plugins/communityInvestor/reports.ts
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price < 1 ? 6 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  }).format(price);
}
function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}
function formatDate(dateString) {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return date.toLocaleString();
}
function normalizeBalance(balanceStr, decimals) {
  const balance = typeof balanceStr === "string" ? BigInt(balanceStr) : balanceStr;
  return Number(balance) / 10 ** decimals;
}
function calculateTradeMetrics(transactions, token) {
  let totalBought = 0;
  let totalBoughtValue = 0;
  let totalSold = 0;
  let totalSoldValue = 0;
  let totalTransferIn = 0;
  let totalTransferOut = 0;
  let volumeUsd = 0;
  let firstTradeTime = /* @__PURE__ */ new Date();
  let lastTradeTime = /* @__PURE__ */ new Date(0);
  for (const tx of transactions) {
    const normalizedAmount = normalizeBalance(tx.amount, token.decimals);
    const price = tx.price ? Number.parseFloat(tx.price) : 0;
    const value = normalizedAmount * price;
    if (tx.timestamp < firstTradeTime) firstTradeTime = new Date(tx.timestamp);
    if (tx.timestamp > lastTradeTime) lastTradeTime = new Date(tx.timestamp);
    switch (tx.type) {
      case "BUY":
        totalBought += normalizedAmount;
        totalBoughtValue += value;
        volumeUsd += value;
        break;
      case "SELL":
        totalSold += normalizedAmount;
        totalSoldValue += value;
        volumeUsd += value;
        break;
      case "transfer_in":
        totalTransferIn += normalizedAmount;
        break;
      case "transfer_out":
        totalTransferOut += normalizedAmount;
        break;
    }
  }
  const averageEntryPrice = totalBought > 0 ? totalBoughtValue / totalBought : 0;
  const averageExitPrice = totalSold > 0 ? totalSoldValue / totalSold : 0;
  const realizedPnL = totalSoldValue - totalSold * averageEntryPrice;
  const realizedPnLPercent = averageEntryPrice > 0 ? (averageExitPrice - averageEntryPrice) / averageEntryPrice * 100 : 0;
  return {
    totalBought,
    totalBoughtValue,
    totalSold,
    totalSoldValue,
    totalTransferIn,
    totalTransferOut,
    averageEntryPrice,
    averageExitPrice,
    realizedPnL,
    realizedPnLPercent,
    volumeUsd,
    firstTradeTime,
    lastTradeTime
  };
}
function calculatePositionPerformance(position, token, transactions) {
  const normalizedBalance = normalizeBalance(position.balance, token.decimals);
  const initialPrice = Number.parseFloat(position.initialPrice);
  const currentPrice = token.price;
  const trades = calculateTradeMetrics(transactions, token);
  const currentValue = normalizedBalance * currentPrice;
  const initialValue = normalizedBalance * initialPrice;
  const costBasis = normalizedBalance * trades.averageEntryPrice;
  const unrealizedPnL = currentValue - costBasis;
  const unrealizedPnLPercent = trades.averageEntryPrice > 0 ? (currentPrice - trades.averageEntryPrice) / trades.averageEntryPrice * 100 : 0;
  const totalPnL = trades.realizedPnL + unrealizedPnL;
  const totalCost = trades.totalBought * trades.averageEntryPrice;
  const totalPnLPercent = totalCost > 0 ? totalPnL / totalCost * 100 : 0;
  const profitLoss = currentValue - initialValue;
  const profitLossPercentage = profitLoss / initialValue * 100;
  const priceChange = currentPrice - initialPrice;
  const priceChangePercentage = priceChange / initialPrice * 100;
  return {
    ...position,
    token,
    currentValue,
    initialValue,
    profitLoss,
    profitLossPercentage,
    priceChange,
    priceChangePercentage,
    normalizedBalance,
    trades,
    unrealizedPnL,
    unrealizedPnLPercent,
    totalPnL,
    totalPnLPercent
  };
}
function formatTokenPerformance(token) {
  return `
  Token: ${token.name} (${token.symbol})
  Address: ${token.address}
  Chain: ${token.chain}
  Last Updated: ${formatDate(token.updatedAt)}
  Price: ${formatPrice(token.price)} (24h: ${formatPercent(token.price24hChange)})
  Volume: ${formatPrice(token.volume)} (24h: ${formatPercent(token.volume24hChange)})
  Liquidity: ${formatPrice(token.liquidity)}
  Holders: ${formatNumber(token.holders)} (24h: ${formatPercent(token.holders24hChange)})
  Trades: ${formatNumber(token.trades)}
  Security Info:
  - Creator: ${token.metadata.security.creatorAddress}
  - Creation Time: ${new Date(token.metadata.security.creationTime * 1e3).toLocaleString()}
  - Total Supply: ${formatNumber(token.metadata.security.totalSupply)}
  - Top 10 Holders: ${formatPercent(token.metadata.security.top10HolderPercent)}
  - Token Standard: ${token.metadata.security.isToken2022 ? "Token-2022" : "SPL Token"}
      `.trim();
}
function formatTransactionHistory(transactions, token) {
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((tx) => {
    const normalizedAmount = normalizeBalance(tx.amount, token.decimals);
    const price = tx.price ? formatPrice(Number.parseFloat(tx.price)) : "N/A";
    const value = tx.valueUsd ? formatPrice(Number.parseFloat(tx.valueUsd)) : "N/A";
    return `
  ${formatDate(tx.timestamp)} - ${tx.type}
  Amount: ${formatNumber(normalizedAmount)} ${token.symbol}
  Price: ${price}
  Value: ${value}
  TX: ${tx.transactionHash}
          `.trim();
  });
}
function formatPositionPerformance(position, token, transactions) {
  const perfData = calculatePositionPerformance(position, token, transactions);
  return `
  Position ID: ${position.id}
  Type: ${position.isSimulation ? "Simulation" : "Real"}
  Token: ${token.name} (${token.symbol})
  Wallet: ${position.walletAddress}

  Trading Summary:
  - Total Bought: ${formatNumber(perfData.trades.totalBought)} ${token.symbol}
  - Total Sold: ${formatNumber(perfData.trades.totalSold)} ${token.symbol}
  - Average Entry: ${formatPrice(perfData.trades.averageEntryPrice)}
  - Average Exit: ${formatPrice(perfData.trades.averageExitPrice)}
  - Trading Volume: ${formatPrice(perfData.trades.volumeUsd)}
  - First Trade: ${formatDate(perfData.trades.firstTradeTime)}
  - Last Trade: ${formatDate(perfData.trades.lastTradeTime)}

  Performance Metrics:
  - Current Price: ${formatPrice(token.price)}
  - Initial Price: ${formatPrice(Number.parseFloat(position.initialPrice))}
  - Price Change: ${formatPrice(perfData.priceChange)} (${formatPercent(perfData.priceChangePercentage)})

  Position Value:
  - Current Balance: ${formatNumber(perfData.normalizedBalance)} ${token.symbol}
  - Current Value: ${formatPrice(perfData.currentValue)}
  - Realized P&L: ${formatPrice(perfData.trades.realizedPnL)} (${formatPercent(perfData.trades.realizedPnLPercent)})
  - Unrealized P&L: ${formatPrice(perfData.unrealizedPnL)} (${formatPercent(perfData.unrealizedPnLPercent)})
  - Total P&L: ${formatPrice(perfData.totalPnL)} (${formatPercent(perfData.totalPnLPercent)})

  Market Info:
  - Current Liquidity: ${formatPrice(token.liquidity)}
  - 24h Volume: ${formatPrice(token.volume)}

  Transaction History:
  ${formatTransactionHistory(transactions, token)}
      `.trim();
}
function formatFullReport(tokens, positions, transactions) {
  const tokenMap = new Map(tokens.map((token) => [token.address, token]));
  const txMap = /* @__PURE__ */ new Map();
  transactions.forEach((tx) => {
    if (!txMap.has(tx.positionId)) {
      txMap.set(tx.positionId, []);
    }
    txMap.get(tx.positionId)?.push(tx);
  });
  const tokenReports = tokens.map((token) => formatTokenPerformance(token));
  const filteredPositions = positions.filter((position) => tokenMap.has(position.tokenAddress));
  const positionsWithData = filteredPositions.map((position) => ({
    position,
    token: tokenMap.get(position.tokenAddress),
    transactions: txMap.get(position.id) || []
  }));
  const positionReports = positionsWithData.map(
    ({ position, token, transactions: transactions2 }) => formatPositionPerformance(position, token, transactions2)
  );
  const { totalCurrentValue, totalRealizedPnL, totalUnrealizedPnL } = positions.reduce(
    (acc, position) => {
      const token = tokenMap.get(position.tokenAddress);
      if (token) {
        const perfData = calculatePositionPerformance(
          position,
          token,
          txMap.get(position.id) || []
        );
        return {
          totalCurrentValue: acc.totalCurrentValue + perfData.currentValue,
          totalRealizedPnL: acc.totalRealizedPnL + perfData.trades.realizedPnL,
          totalUnrealizedPnL: acc.totalUnrealizedPnL + perfData.unrealizedPnL
        };
      }
      return acc;
    },
    {
      totalCurrentValue: 0,
      totalRealizedPnL: 0,
      totalUnrealizedPnL: 0
    }
  );
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL;
  return {
    tokenReports,
    positionReports,
    totalCurrentValue: formatPrice(totalCurrentValue),
    totalRealizedPnL: formatPrice(totalRealizedPnL),
    totalUnrealizedPnL: formatPrice(totalUnrealizedPnL),
    totalPnL: formatPrice(totalPnL),
    positionsWithBalance: positionsWithData
  };
}
function formatScore(score) {
  return score.toFixed(2);
}
function formatPercentMetric(value) {
  return `${(value * 100).toFixed(1)}%`;
}
function calculateTrend(current, historicalValues) {
  if (historicalValues.length === 0) return 0;
  const previousValue = historicalValues[0];
  return (current - previousValue) / previousValue * 100;
}
function formatTrendArrow(trend) {
  if (trend > 5) return "\u2191";
  if (trend < -5) return "\u2193";
  return "\u2192";
}
function calculatePeriodTrends(history, period = null) {
  if (!period) {
    const monthlyData = history.reduce(
      (acc, record) => {
        const month = new Date(record.timestamp).toISOString().slice(0, 7);
        const currentData = acc.get(month) ?? {
          performances: [],
          successes: 0,
          total: 0
        };
        acc.set(month, {
          performances: [...currentData.performances, record.metrics.avgTokenPerformance],
          successes: currentData.successes + record.metrics.successfulRecs,
          total: currentData.total + record.metrics.totalRecommendations
        });
        return acc;
      },
      /* @__PURE__ */ new Map()
    );
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      period: month,
      avgPerformance: data.performances.reduce((a, b) => a + b, 0) / data.performances.length,
      successRate: data.successes / data.total,
      recommendations: data.total
    })).sort((a, b) => b.period.localeCompare(a.period));
  }
  const cutoffDate = /* @__PURE__ */ new Date();
  cutoffDate.setDate(cutoffDate.getDate() - period.days);
  const periodData = history.filter((record) => new Date(record.timestamp) >= cutoffDate);
  if (periodData.length === 0) {
    return [
      {
        period: period.label,
        avgPerformance: 0,
        successRate: 0,
        recommendations: 0
      }
    ];
  }
  const performances = periodData.map((record) => record.metrics.avgTokenPerformance);
  const totalRecommendations = periodData.reduce(
    (sum, record) => sum + record.metrics.totalRecommendations,
    0
  );
  const successfulRecs = periodData.reduce((sum, record) => sum + record.metrics.successfulRecs, 0);
  return [
    {
      period: period.label,
      avgPerformance: performances.reduce((a, b) => a + b, 0) / performances.length,
      successRate: totalRecommendations > 0 ? successfulRecs / totalRecommendations : 0,
      recommendations: totalRecommendations
    }
  ];
}
function formatTrends(trends) {
  return trends.map(
    (trend) => `
${trend.period}:
- Performance: ${formatPercent(trend.avgPerformance)}
- Success Rate: ${formatPercentMetric(trend.successRate)}
- Recommendations: ${trend.recommendations}`.trim()
  ).join("\n\n");
}
function formatRecommenderReport(entity, metrics, history) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const dailyTrends = calculatePeriodTrends(sortedHistory, {
    label: "24 Hours",
    days: 1
  });
  const weeklyTrends = calculatePeriodTrends(sortedHistory, {
    label: "7 Days",
    days: 7
  });
  const monthlyTrends = calculatePeriodTrends(sortedHistory);
  const successTrend = calculateTrend(
    metrics.successfulRecs / metrics.totalRecommendations,
    sortedHistory.map((h) => h.metrics.successfulRecs / h.metrics.totalRecommendations)
  );
  const performanceTrend = calculateTrend(
    metrics.avgTokenPerformance,
    sortedHistory.map((h) => h.metrics.avgTokenPerformance)
  );
  return `
Username: ${entity.metadata.username}
Platform: ${entity.metadata.platform}
ID: ${entity.id}

=== CURRENT METRICS ===
Trust Score: ${formatScore(metrics.trustScore)}
Success Rate: ${formatPercentMetric(metrics.successfulRecs / metrics.totalRecommendations)} (${formatTrendArrow(successTrend)})
Total Recommendations: ${metrics.totalRecommendations}
Average Token Performance: ${formatPercent(metrics.avgTokenPerformance)} (${formatTrendArrow(performanceTrend)})

Risk Analysis:
- Consistency: ${formatScore(metrics.consistencyScore)}

Activity Status:
- Last Active: ${formatDate(metrics.lastUpdated)}

=== PERFORMANCE TRENDS ===
${formatTrends(dailyTrends)}

${formatTrends(weeklyTrends)}

Monthly Average Performance:
${formatTrends(monthlyTrends)}`.trim();
}

// src/plugins/communityInvestor/types.ts
var ServiceType = {
  COMMUNITY_INVESTOR: "community_investor"
};

// src/plugins/communityInvestor/recommendations/agentPositions.ts
var getAgentPositions = {
  name: "GET_AGENT_POSITIONS",
  description: "Retrieves and formats position data for the agent's portfolio",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{agentName}} show me agent positions"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_AGENT_POSITIONS"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{agentName}} show me all positions"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_AGENT_POSITIONS"]
        }
      }
    ]
  ],
  similes: ["GET_AGENT_POSITIONS", "SHOW_AGENT_PORTFOLIO"],
  async handler(runtime, message, _state, _options, callback) {
    const tradingService = runtime.getService(ServiceType.COMMUNITY_INVESTOR);
    try {
      const positions = await tradingService.getOpenPositionsWithBalance();
      const filteredPositions = positions.filter((pos) => pos.isSimulation === false);
      if (filteredPositions.length === 0 && callback) {
        const responseMemory = {
          content: {
            text: "No open positions found.",
            inReplyTo: message.id ? message.id : void 0
          },
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          metadata: {
            ...message.metadata,
            actions: ["GET_AGENT_POSITIONS"]
          },
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory);
        return;
      }
      const positionIds = filteredPositions.map((p) => p.id);
      const transactions = await tradingService.getPositionsTransactions(positionIds);
      const tokens = [];
      const tokenSet = /* @__PURE__ */ new Set();
      for (const position of filteredPositions) {
        if (tokenSet.has(`${position.chain}:${position.tokenAddress}`)) continue;
        const tokenPerformance = await tradingService.getTokenPerformance(
          position.chain,
          position.tokenAddress
        );
        if (tokenPerformance) tokens.push(tokenPerformance);
        tokenSet.add(`${position.chain}:${position.tokenAddress}`);
      }
      const {
        totalCurrentValue,
        totalPnL,
        totalRealizedPnL,
        totalUnrealizedPnL,
        positionsWithBalance
      } = formatFullReport(tokens, filteredPositions, transactions);
      if (callback) {
        const formattedPositions = positionsWithBalance.map(({ position, token }) => {
          const currentValue = token.price ? (Number(position.balance) * token.price).toString() : "0";
          const pnlPercent = token.price && position.initialPrice ? ((Number(token.price) - Number(position.initialPrice)) / Number(position.initialPrice) * 100).toFixed(2) : "0";
          return `**${token.symbol} (${token.name})**
Address: ${token.address}
Price: $${token.price}
Value: $${currentValue}
P&L: ${pnlPercent}%
`;
        }).join("\n\n");
        const summary = `\u{1F4B0} **Agent Portfolio Summary**
Total Value: ${totalCurrentValue}
Total P&L: ${totalPnL}
Realized: ${totalRealizedPnL}
Unrealized: ${totalUnrealizedPnL}`;
        await callback({
          content: {
            text: positionsWithBalance.length > 0 ? `${summary}

${formattedPositions}` : "No open positions found.",
            inReplyTo: message.id ? message.id : void 0
          },
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          metadata: {
            ...message.metadata,
            actions: ["GET_AGENT_POSITIONS"]
          },
          createdAt: Date.now() * 1e3
        });
      }
    } catch (error) {
      console.error("Error in getPositions:", error);
      throw error;
    }
  },
  async validate(_runtime, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/recommendations/analysis.ts
import {
  ModelType,
  composePrompt,
  logger as logger3
} from "@elizaos/core";

// src/plugins/communityInvestor/utils.ts
var import_fast_xml_parser = __toESM(require_fxp(), 1);

// node_modules/zod-to-json-schema/dist/esm/Options.js
var ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
var defaultOptions = {
  name: void 0,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "format:date-time",
  mapStrategy: "entries",
  removeAdditionalStrategy: "passthrough",
  allowedAdditionalProperties: true,
  rejectedAdditionalProperties: false,
  definitionPath: "definitions",
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
  markdownDescription: false,
  patternStrategy: "escape",
  applyRegexFlags: false,
  emailStrategy: "format:email",
  base64Strategy: "contentEncoding:base64",
  nameStrategy: "ref"
};
var getDefaultOptions = (options) => typeof options === "string" ? {
  ...defaultOptions,
  name: options
} : {
  ...defaultOptions,
  ...options
};

// node_modules/zod-to-json-schema/dist/esm/Refs.js
var getRefs = (options) => {
  const _options = getDefaultOptions(options);
  const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
  return {
    ..._options,
    currentPath,
    propertyPath: void 0,
    seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [
      def._def,
      {
        def: def._def,
        path: [..._options.basePath, _options.definitionPath, name],
        // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
        jsonSchema: void 0
      }
    ]))
  };
};

// node_modules/zod-to-json-schema/dist/esm/errorMessages.js
function addErrorMessage(res, key, errorMessage, refs) {
  if (!refs?.errorMessages)
    return;
  if (errorMessage) {
    res.errorMessage = {
      ...res.errorMessage,
      [key]: errorMessage
    };
  }
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
  res[key] = value;
  addErrorMessage(res, key, errorMessage, refs);
}

// node_modules/zod-to-json-schema/dist/esm/selectParser.js
import { ZodFirstPartyTypeKind as ZodFirstPartyTypeKind3 } from "zod";

// node_modules/zod-to-json-schema/dist/esm/parsers/any.js
function parseAnyDef() {
  return {};
}

// node_modules/zod-to-json-schema/dist/esm/parsers/array.js
import { ZodFirstPartyTypeKind } from "zod";
function parseArrayDef(def, refs) {
  const res = {
    type: "array"
  };
  if (def.type?._def && def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
  }
  if (def.maxLength) {
    setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
  }
  if (def.exactLength) {
    setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
    setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
  }
  return res;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js
function parseBigintDef(def, refs) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js
function parseBooleanDef() {
  return {
    type: "boolean"
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/branded.js
function parseBrandedDef(_def, refs) {
  return parseDef(_def.type._def, refs);
}

// node_modules/zod-to-json-schema/dist/esm/parsers/catch.js
var parseCatchDef = (def, refs) => {
  return parseDef(def.innerType._def, refs);
};

// node_modules/zod-to-json-schema/dist/esm/parsers/date.js
function parseDateDef(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy ?? refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser(def, refs);
  }
}
var integerDateParser = (def, refs) => {
  const res = {
    type: "integer",
    format: "unix-time"
  };
  if (refs.target === "openApi3") {
    return res;
  }
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        setResponseValueAndErrors(
          res,
          "minimum",
          check.value,
          // This is in milliseconds
          check.message,
          refs
        );
        break;
      case "max":
        setResponseValueAndErrors(
          res,
          "maximum",
          check.value,
          // This is in milliseconds
          check.message,
          refs
        );
        break;
    }
  }
  return res;
};

// node_modules/zod-to-json-schema/dist/esm/parsers/default.js
function parseDefaultDef(_def, refs) {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/effects.js
function parseEffectsDef(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : {};
}

// node_modules/zod-to-json-schema/dist/esm/parsers/enum.js
function parseEnumDef(def) {
  return {
    type: "string",
    enum: Array.from(def.values)
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js
var isJsonSchema7AllOfType = (type) => {
  if ("type" in type && type.type === "string")
    return false;
  return "allOf" in type;
};
function parseIntersectionDef(def, refs) {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf);
      if (schema.unevaluatedProperties === void 0) {
        unevaluatedProperties = void 0;
      }
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      } else {
        unevaluatedProperties = void 0;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? {
    allOf: mergedAllOf,
    ...unevaluatedProperties
  } : void 0;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/literal.js
function parseLiteralDef(def, refs) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [def.value]
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/record.js
import { ZodFirstPartyTypeKind as ZodFirstPartyTypeKind2 } from "zod";

// node_modules/zod-to-json-schema/dist/esm/parsers/string.js
var emojiRegex = void 0;
var zodPatterns = {
  /**
   * `c` was changed to `[cC]` to replicate /i flag
   */
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  /**
   * `a-z` was added to replicate /i flag
   */
  email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  /**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */
  emoji: () => {
    if (emojiRegex === void 0) {
      emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
    }
    return emojiRegex;
  },
  /**
   * Unused
   */
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  /**
   * Unused
   */
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  /**
   * Unused
   */
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
  ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef(def, refs) {
  const res = {
    type: "string"
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          break;
        case "max":
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern(res, zodPatterns.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex, check.message, refs);
          break;
        case "cuid":
          addPattern(res, zodPatterns.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern(res, zodPatterns.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
          break;
        case "endsWith":
          addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
          break;
        case "datetime":
          addFormat(res, "date-time", check.message, refs);
          break;
        case "date":
          addFormat(res, "date", check.message, refs);
          break;
        case "time":
          addFormat(res, "time", check.message, refs);
          break;
        case "duration":
          addFormat(res, "duration", check.message, refs);
          break;
        case "length":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "includes": {
          addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "base64url":
          addPattern(res, zodPatterns.base64url, check.message, refs);
          break;
        case "jwt":
          addPattern(res, zodPatterns.jwt, check.message, refs);
          break;
        case "cidr": {
          if (check.version !== "v6") {
            addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
          }
          if (check.version !== "v4") {
            addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern(res, zodPatterns.emoji(), check.message, refs);
          break;
        case "ulid": {
          addPattern(res, zodPatterns.ulid, check.message, refs);
          break;
        }
        case "base64": {
          switch (refs.base64Strategy) {
            case "format:binary": {
              addFormat(res, "binary", check.message, refs);
              break;
            }
            case "contentEncoding:base64": {
              setResponseValueAndErrors(res, "contentEncoding", "base64", check.message, refs);
              break;
            }
            case "pattern:zod": {
              addPattern(res, zodPatterns.base64, check.message, refs);
              break;
            }
          }
          break;
        }
        case "nanoid": {
          addPattern(res, zodPatterns.nanoid, check.message, refs);
        }
        case "toLowerCase":
        case "toUpperCase":
        case "trim":
          break;
        default:
          /* @__PURE__ */ ((_) => {
          })(check);
      }
    }
  }
  return res;
}
function escapeLiteralCheckValue(literal, refs) {
  return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
var ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function escapeNonAlphaNumeric(source) {
  let result = "";
  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC.has(source[i])) {
      result += "\\";
    }
    result += source[i];
  }
  return result;
}
function addFormat(schema, value, message, refs) {
  if (schema.format || schema.anyOf?.some((x) => x.format)) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }
    if (schema.format) {
      schema.anyOf.push({
        format: schema.format,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { format: schema.errorMessage.format }
        }
      });
      delete schema.format;
      if (schema.errorMessage) {
        delete schema.errorMessage.format;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.anyOf.push({
      format: value,
      ...message && refs.errorMessages && { errorMessage: { format: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "format", value, message, refs);
  }
}
function addPattern(schema, regex, message, refs) {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }
    if (schema.pattern) {
      schema.allOf.push({
        pattern: schema.pattern,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { pattern: schema.errorMessage.pattern }
        }
      });
      delete schema.pattern;
      if (schema.errorMessage) {
        delete schema.errorMessage.pattern;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.allOf.push({
      pattern: stringifyRegExpWithFlags(regex, refs),
      ...message && refs.errorMessages && { errorMessage: { pattern: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "pattern", stringifyRegExpWithFlags(regex, refs), message, refs);
  }
}
function stringifyRegExpWithFlags(regex, refs) {
  if (!refs.applyRegexFlags || !regex.flags) {
    return regex.source;
  }
  const flags = {
    i: regex.flags.includes("i"),
    m: regex.flags.includes("m"),
    s: regex.flags.includes("s")
    // `.` matches newlines
  };
  const source = flags.i ? regex.source.toLowerCase() : regex.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;
  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }
    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }
    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r
]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
      continue;
    }
    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }
  try {
    new RegExp(pattern);
  } catch {
    console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
    return regex.source;
  }
  return pattern;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/record.js
function parseRecordDef(def, refs) {
  if (refs.target === "openAi") {
    console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
  }
  if (refs.target === "openApi3" && def.keyType?._def.typeName === ZodFirstPartyTypeKind2.ZodEnum) {
    return {
      type: "object",
      required: def.keyType._def.values,
      properties: def.keyType._def.values.reduce((acc, key) => ({
        ...acc,
        [key]: parseDef(def.valueType._def, {
          ...refs,
          currentPath: [...refs.currentPath, "properties", key]
        }) ?? {}
      }), {}),
      additionalProperties: refs.rejectedAdditionalProperties
    };
  }
  const schema = {
    type: "object",
    additionalProperties: parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? refs.allowedAdditionalProperties
  };
  if (refs.target === "openApi3") {
    return schema;
  }
  if (def.keyType?._def.typeName === ZodFirstPartyTypeKind2.ZodString && def.keyType._def.checks?.length) {
    const { type, ...keyType } = parseStringDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind2.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  } else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind2.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind2.ZodString && def.keyType._def.type._def.checks?.length) {
    const { type, ...keyType } = parseBrandedDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  }
  return schema;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/map.js
function parseMapDef(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }
  const keys = parseDef(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || {};
  const values = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || {};
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js
function parseNativeEnumDef(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/never.js
function parseNeverDef() {
  return {
    not: {}
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/null.js
function parseNullDef(refs) {
  return refs.target === "openApi3" ? {
    enum: ["null"],
    nullable: true
  } : {
    type: "null"
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/union.js
var primitiveMappings = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null"
};
function parseUnionDef(def, refs) {
  if (refs.target === "openApi3")
    return asAnyOf(def, refs);
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
    const types = options.reduce((types2, x) => {
      const type = primitiveMappings[x._def.typeName];
      return type && !types2.includes(type) ? [...types2, type] : types2;
    }, []);
    return {
      type: types.length > 1 ? types : types[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types = options.reduce((acc, x) => {
      const type = typeof x._def.value;
      switch (type) {
        case "string":
        case "number":
        case "boolean":
          return [...acc, type];
        case "bigint":
          return [...acc, "integer"];
        case "object":
          if (x._def.value === null)
            return [...acc, "null"];
        case "symbol":
        case "undefined":
        case "function":
        default:
          return acc;
      }
    }, []);
    if (types.length === options.length) {
      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce((acc, x) => {
          return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
        }, [])
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce((acc, x) => [
        ...acc,
        ...x._def.values.filter((x2) => !acc.includes(x2))
      ], [])
    };
  }
  return asAnyOf(def, refs);
}
var asAnyOf = (def, refs) => {
  const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", `${i}`]
  })).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
  return anyOf.length ? { anyOf } : void 0;
};

// node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js
function parseNullableDef(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[def.innerType._def.typeName],
        nullable: true
      };
    }
    return {
      type: [
        primitiveMappings[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  if (refs.target === "openApi3") {
    const base2 = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath]
    });
    if (base2 && "$ref" in base2)
      return { allOf: [base2], nullable: true };
    return base2 && { ...base2, nullable: true };
  }
  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/number.js
function parseNumberDef(def, refs) {
  const res = {
    type: "number"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        addErrorMessage(res, "type", check.message, refs);
        break;
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/object.js
import { ZodOptional } from "zod";
function parseObjectDef(def, refs) {
  const forceOptionalIntoNullable = refs.target === "openAi";
  const result = {
    type: "object",
    properties: {}
  };
  const required = [];
  const shape = def.shape();
  for (const propName in shape) {
    let propDef = shape[propName];
    if (propDef === void 0 || propDef._def === void 0) {
      continue;
    }
    let propOptional = safeIsOptional(propDef);
    if (propOptional && forceOptionalIntoNullable) {
      if (propDef instanceof ZodOptional) {
        propDef = propDef._def.innerType;
      }
      if (!propDef.isNullable()) {
        propDef = propDef.nullable();
      }
      propOptional = false;
    }
    const parsedDef = parseDef(propDef._def, {
      ...refs,
      currentPath: [...refs.currentPath, "properties", propName],
      propertyPath: [...refs.currentPath, "properties", propName]
    });
    if (parsedDef === void 0) {
      continue;
    }
    result.properties[propName] = parsedDef;
    if (!propOptional) {
      required.push(propName);
    }
  }
  if (required.length) {
    result.required = required;
  }
  const additionalProperties = decideAdditionalProperties(def, refs);
  if (additionalProperties !== void 0) {
    result.additionalProperties = additionalProperties;
  }
  return result;
}
function decideAdditionalProperties(def, refs) {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    });
  }
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
  }
}
function safeIsOptional(schema) {
  try {
    return schema.isOptional();
  } catch {
    return true;
  }
}

// node_modules/zod-to-json-schema/dist/esm/parsers/optional.js
var parseOptionalDef = (def, refs) => {
  if (refs.currentPath.toString() === refs.propertyPath?.toString()) {
    return parseDef(def.innerType._def, refs);
  }
  const innerSchema = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "1"]
  });
  return innerSchema ? {
    anyOf: [
      {
        not: {}
      },
      innerSchema
    ]
  } : {};
};

// node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js
var parsePipelineDef = (def, refs) => {
  if (refs.pipeStrategy === "input") {
    return parseDef(def.in._def, refs);
  } else if (refs.pipeStrategy === "output") {
    return parseDef(def.out._def, refs);
  }
  const a = parseDef(def.in._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"]
  });
  const b = parseDef(def.out._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
  });
  return {
    allOf: [a, b].filter((x) => x !== void 0)
  };
};

// node_modules/zod-to-json-schema/dist/esm/parsers/promise.js
function parsePromiseDef(def, refs) {
  return parseDef(def.type._def, refs);
}

// node_modules/zod-to-json-schema/dist/esm/parsers/set.js
function parseSetDef(def, refs) {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
  }
  if (def.maxSize) {
    setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
  }
  return schema;
}

// node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js
function parseTupleDef(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
    };
  }
}

// node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js
function parseUndefinedDef() {
  return {
    not: {}
  };
}

// node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js
function parseUnknownDef() {
  return {};
}

// node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js
var parseReadonlyDef = (def, refs) => {
  return parseDef(def.innerType._def, refs);
};

// node_modules/zod-to-json-schema/dist/esm/selectParser.js
var selectParser = (def, typeName, refs) => {
  switch (typeName) {
    case ZodFirstPartyTypeKind3.ZodString:
      return parseStringDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodNumber:
      return parseNumberDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodObject:
      return parseObjectDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodBigInt:
      return parseBigintDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind3.ZodDate:
      return parseDateDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind3.ZodNull:
      return parseNullDef(refs);
    case ZodFirstPartyTypeKind3.ZodArray:
      return parseArrayDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodUnion:
    case ZodFirstPartyTypeKind3.ZodDiscriminatedUnion:
      return parseUnionDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodIntersection:
      return parseIntersectionDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodTuple:
      return parseTupleDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodRecord:
      return parseRecordDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodLiteral:
      return parseLiteralDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodEnum:
      return parseEnumDef(def);
    case ZodFirstPartyTypeKind3.ZodNativeEnum:
      return parseNativeEnumDef(def);
    case ZodFirstPartyTypeKind3.ZodNullable:
      return parseNullableDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodOptional:
      return parseOptionalDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodMap:
      return parseMapDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodSet:
      return parseSetDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodLazy:
      return () => def.getter()._def;
    case ZodFirstPartyTypeKind3.ZodPromise:
      return parsePromiseDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodNaN:
    case ZodFirstPartyTypeKind3.ZodNever:
      return parseNeverDef();
    case ZodFirstPartyTypeKind3.ZodEffects:
      return parseEffectsDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodAny:
      return parseAnyDef();
    case ZodFirstPartyTypeKind3.ZodUnknown:
      return parseUnknownDef();
    case ZodFirstPartyTypeKind3.ZodDefault:
      return parseDefaultDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodBranded:
      return parseBrandedDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodReadonly:
      return parseReadonlyDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodCatch:
      return parseCatchDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodPipeline:
      return parsePipelineDef(def, refs);
    case ZodFirstPartyTypeKind3.ZodFunction:
    case ZodFirstPartyTypeKind3.ZodVoid:
    case ZodFirstPartyTypeKind3.ZodSymbol:
      return void 0;
    default:
      return /* @__PURE__ */ ((_) => void 0)(typeName);
  }
};

// node_modules/zod-to-json-schema/dist/esm/parseDef.js
function parseDef(def, refs, forceResolution = false) {
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
  const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }
  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema, def, refs);
    newItem.jsonSchema = jsonSchema;
    return postProcessResult;
  }
  newItem.jsonSchema = jsonSchema;
  return jsonSchema;
}
var get$ref = (item, refs) => {
  switch (refs.$refStrategy) {
    case "root":
      return { $ref: item.path.join("/") };
    case "relative":
      return { $ref: getRelativePath(refs.currentPath, item.path) };
    case "none":
    case "seen": {
      if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
        console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
        return {};
      }
      return refs.$refStrategy === "seen" ? {} : void 0;
    }
  }
};
var getRelativePath = (pathA, pathB) => {
  let i = 0;
  for (; i < pathA.length && i < pathB.length; i++) {
    if (pathA[i] !== pathB[i])
      break;
  }
  return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};
var addMeta = (def, refs, jsonSchema) => {
  if (def.description) {
    jsonSchema.description = def.description;
    if (refs.markdownDescription) {
      jsonSchema.markdownDescription = def.description;
    }
  }
  return jsonSchema;
};

// node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js
var zodToJsonSchema = (schema, options) => {
  const refs = getRefs(options);
  const definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name2, schema2]) => ({
    ...acc,
    [name2]: parseDef(schema2._def, {
      ...refs,
      currentPath: [...refs.basePath, refs.definitionPath, name2]
    }, true) ?? {}
  }), {}) : void 0;
  const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
  const main = parseDef(schema._def, name === void 0 ? refs : {
    ...refs,
    currentPath: [...refs.basePath, refs.definitionPath, name]
  }, false) ?? {};
  const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
  if (title !== void 0) {
    main.title = title;
  }
  const combined = name === void 0 ? definitions ? {
    ...main,
    [refs.definitionPath]: definitions
  } : main : {
    $ref: [
      ...refs.$refStrategy === "relative" ? [] : refs.basePath,
      refs.definitionPath,
      name
    ].join("/"),
    [refs.definitionPath]: {
      ...definitions,
      [name]: main
    }
  };
  if (refs.target === "jsonSchema7") {
    combined.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
    combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
  }
  if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) {
    console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
  }
  return combined;
};

// node_modules/zod-to-json-schema/dist/esm/index.js
var esm_default = zodToJsonSchema;

// src/plugins/communityInvestor/utils.ts
function getZodJsonSchema(schema) {
  return esm_default(schema, "schema").definitions?.schema;
}
function extractXMLFromResponse(output, tag) {
  const start = output.indexOf(`<${tag}>`);
  const end = output.indexOf(`</${tag}>`) + `</${tag}>`.length;
  if (start === -1 || end === -1) {
    return "";
  }
  return output.slice(start, end);
}
function parseRecommendationsResponse(xmlResponse) {
  const parser = new import_fast_xml_parser.XMLParser({
    ignoreAttributes: false,
    isArray: (name) => name === "recommendation"
    // Treat individual recommendations as array elements
  });
  const result = parser.parse(xmlResponse);
  return result.new_recommendations?.recommendation || [];
}
function parseConfirmationResponse(xmlResponse) {
  const parser = new import_fast_xml_parser.XMLParser({
    ignoreAttributes: false
  });
  const result = parser.parse(xmlResponse);
  return result.message || "";
}
function parseSignalResponse(xmlResponse) {
  const parser = new import_fast_xml_parser.XMLParser({
    ignoreAttributes: false
  });
  const result = parser.parse(xmlResponse);
  return result.signal;
}
function parseTokenResponse(xmlResponse) {
  const parser = new import_fast_xml_parser.XMLParser({
    ignoreAttributes: false
  });
  const result = parser.parse(xmlResponse);
  return result.token;
}
var BuyAmountConfig = {
  MAX_ACCOUNT_PERCENTAGE: 0.05,
  MIN_BUY_LAMPORTS: BigInt(1e8),
  // 0.1 SOL
  MAX_BUY_LAMPORTS: BigInt(1e10),
  // 10 SOL,
  MAX_LIQUIDITY_MULTIPLIER: 1.5,
  MAX_VOLUME_MULTIPLIER: 1.5,
  MARKET_CAP_LOWER_BOUND: 75e4,
  MARKET_CAP_UPPER_BOUND: 1e7,
  HIGH_MARKET_CAP_MULTIPLIER: 1.5,
  LIQUIDITY_DIVISOR: 1e3
};

// src/plugins/communityInvestor/recommendations/analysis.ts
var tokenDetailsTemplate = `You are a crypto expert.

You will be given a ticker and token overview.

Your goal is to write a message to the user presenting the token details in a engaing, easy to read format.

Each Message should include the following information:

- Should enclude engaging tagline at the beginning.
- Should include a report of the token.
- Should always include links to the token addresses and accounts:
    - Token: https://solscan.io/token/[tokenAddress]
    - Account: https://solscan.io/account/[accountAddress]
    - Tx: https://solscan.io/tx/[txHash]
    - Pair: https://www.defined.fi/sol/[pairAddress]
- Should always use valid markdown links when possible.
- Should Always end in a question asking the user if they want to confirm the token recommendation, can get creative with the this.
- Should use a few emojis to make the message more engaging.

The message should **NOT**:

- Contain more than 5 emojis.
- Be too long.

<ticker>
{{ticker}}
</ticker>

<token_overview>
{{tokenOverview}}
</token_overview>

# Response Instructions

When writing your response, follow these strict guidelines:

## Response Information

Respond with the following structure:

-MESSAGE: This is the message you will need to send to the user.

## Response Format

Respond with the following format:
<message>
**MESSAGE_TEXT_HERE**
</message>

## Response Example

<message>
Hello! Here are the details for Kolwaii (KWAII):

Token Overview:

- Name: Kolwaii
- Symbol: KWAII
- Chain: Solana
- Address: [6uVJY332tiYwo58g3B8p9FJRGmGZ2fUuXR8cpiaDpump](https://solscan.io/token/6uVJY332tiYwo58g3B8p9FJRGmGZ2fUuXR8cpiaDpump)
- Price: $0.01578
- Market Cap: $4,230,686
- 24h Trading Volume: $53,137,098.26
- Holders: 3,884
- Liquidity: $677,160.66
- 24h Price Change: +4.75%
- Total Supply: 999,998,189.02 KWAII

Top Trading Pairs:

1. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/ChiPAU1gj79o1tB4PXpB14v4DPuumtbzAkr3BnPbo1ru) - Price: $0.01578
2. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/HsnFjX8utMyLm7fVYphsr47nhhsqHsejP3JoUr3BUcYm) - Price: $0.01577
3. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/3czJZMWfobm5r3nUcxpZGE6hz5rKywegKCWKppaisM7n) - Price: $0.01523

Creator Information:

- Creator Address: [FTERkgMYziSVfcGEkZS55zYiLerZHWcMrjwt49aL9jBe](https://solscan.io/account/FTERkgMYziSVfcGEkZS55zYiLerZHWcMrjwt49aL9jBe)
- Creation Transaction: [View Transaction](https://solscan.io/tx/4PMbpyyQB9kPDKyeQaJGrMfmS2CnnHYp9nB5h4wiB2sDv7yHGoew4EgYgsaeGYTcuZPRpgKPKgrq4DLX4y8sX21y)

</message>

Now based on the user_message, recommendation, and token_overview, write your message.`;
var extractLatestTicketTemplate = `You are an expert crypto analyst and trader, that specializes in extracting tickers or token addresses from a group of messages.

You will be given a list of messages from a user each containing <createdAt> and <content> fields.

Your goal is to identify the most recent ticker or token address mentioned from the user.

Review the following messages:

<messages>
  {{messages}}
</messages>

# Instructions and Guidelines:

1. Carefully read through the messages, looking for messages from users that:

    - Mention specific token tickers or token addresses

# Response Instructions

When writing your response, follow these strict instructions and examples:

## Response Information

Respond with the following information:

- TOKEN: The most recent ticker or token address mentioned from the user
    - TICKER: The ticker of the token
    - TOKEN_ADDRESS: The token address of the token

## Response Format

Respond in the following format:

<token>
    <ticker>__TICKER___</ticker>
    <tokenAddress>__TOKEN_ADDRESS___</tokenAddress>
</token>

## Response Example

<token>
    <ticker>MOON</ticker>
    <tokenAddress></tokenAddress>
</token>

Now, based on the messages provided, please respond with the most recent ticker or token address mentioned from the user.`;
var getTokenDetails = {
  name: "GET_TOKEN_DETAILS",
  description: "Gets the detailed analysis of a token",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Are you just looking for details, or are you recommending this token?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I am just looking for details"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Ok, here are the details...",
          actions: ["GET_TOKEN_DETAILS"]
        }
      }
    ]
  ],
  similes: ["TOKEN_DETAILS"],
  async handler(runtime, message, _state, _options, callback) {
    if (!runtime.getService(ServiceType.COMMUNITY_INVESTOR)) {
      return;
    }
    const tradingService = runtime.getService(
      ServiceType.COMMUNITY_INVESTOR
    );
    if (!tradingService) {
      throw new Error("No trading service found");
    }
    const rawMessages = await runtime.getMemories({
      tableName: "messages",
      roomId: message.roomId,
      count: 10,
      unique: true
    });
    if (!rawMessages.length) {
      logger3.error(`No messages found for user ${message.entityId}`);
      return;
    }
    const messages = rawMessages.map((m) => {
      const content = typeof m.content === "string" ? JSON.parse(m.content) : m.content;
      return `
            <message>
                <createdAt>${new Date(m.createdAt).toISOString()}</createdAt>
                <content>${JSON.stringify(content.text)}</content>
            </message>`;
    }).join("\n");
    const prompt = composePrompt({
      state: {
        messages
      },
      template: extractLatestTicketTemplate
    });
    const text = await runtime.useModel(ModelType.TEXT_SMALL, {
      prompt
    });
    const extractXML = extractXMLFromResponse(text, "token");
    const results = parseTokenResponse(extractXML);
    if (!results.tokenAddress) {
      results.tokenAddress = await tradingService.resolveTicker(
        "solana",
        // todo: extract from recommendation?
        results.ticker
      );
    }
    if (!results.tokenAddress) {
      logger3.error(`No token address found for ${results.ticker}`);
      return;
    }
    const tokenOverview = await tradingService.getTokenOverview("solana", results.tokenAddress);
    const tokenOverviewString = JSON.stringify(tokenOverview, (_, v) => {
      if (typeof v === "bigint") return v.toString();
      return v;
    });
    const tokenDetailsPrompt = composePrompt({
      state: {
        ticker: results.ticker,
        tokenOverview: tokenOverviewString
      },
      template: tokenDetailsTemplate
    });
    const tokenDetails = await runtime.useModel(ModelType.TEXT_LARGE, {
      prompt: tokenDetailsPrompt
    });
    const agentResponseMsg = extractXMLFromResponse(tokenDetails, "message");
    const finalResponse = parseConfirmationResponse(agentResponseMsg);
    if (callback) {
      const responseMemory = {
        content: {
          text: finalResponse,
          inReplyTo: message.id ? message.id : void 0,
          actions: ["GET_TOKEN_DETAILS"]
        },
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        metadata: message.metadata,
        createdAt: Date.now() * 1e3
      };
      await callback(responseMemory);
    }
    return true;
  },
  async validate(_, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/recommendations/confirm.ts
import {
  logger as logger4
} from "@elizaos/core";

// node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm-node/rng.js
import crypto2 from "node:crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto2.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm-node/native.js
import crypto3 from "node:crypto";
var native_default = {
  randomUUID: crypto3.randomUUID
};

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/plugins/communityInvestor/recommendations/confirm.ts
var confirmRecommendation = {
  name: "CONFIRM_RECOMMENDATION",
  description: "Confirms <draft_recommendations> to buy or sell memecoins/tokens in <user_recommendations_provider> from the <trust_plugin>",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "do you wish to confirm this recommendation?\n {...recomendation}"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "yes, I would"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "<NONE>",
          actions: ["CONFIRM_RECOMMENDATION"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Are you just looking for details, or are you recommending this token?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I am recommending this token"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "<NONE>",
          actions: ["CONFIRM_RECOMMENDATION"]
        }
      }
    ]
  ],
  similes: ["CONFIRM_RECOMMENDATION"],
  async handler(runtime, message, _state, _options, callback) {
    if (!runtime.getService(ServiceType.COMMUNITY_INVESTOR)) {
      await runtime.createMemory(
        {
          entityId: runtime.agentId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: {
            thought: "No trading service found",
            actions: ["CONFIRM_RECOMMENDATION_FAILED"]
          }
        },
        "messages"
      );
      return;
    }
    if (callback) {
      const responseMemory = {
        content: {
          text: "Placing recommendation...",
          inReplyTo: message.id ? message.id : void 0,
          actions: ["CONFIRM_RECOMMENDATION"]
        },
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        metadata: {
          type: "reaction",
          reaction: {
            type: [{ type: "emoji", emoji: "\u{1F44D}" }],
            onlyReaction: true
          }
        },
        createdAt: Date.now() * 1e3
      };
      await callback(responseMemory);
    }
    const tradingService = runtime.getService(
      ServiceType.COMMUNITY_INVESTOR
    );
    if (!tradingService.hasWallet("solana")) {
      await runtime.createMemory(
        {
          entityId: runtime.agentId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: {
            thought: "No registered solana wallet in trading service",
            actions: ["CONFIRM_RECOMMENDATION_FAILED"]
          }
        },
        "messages"
      );
      return;
    }
    const recentRecommendations = await runtime.getMemories({
      tableName: "recommendations",
      roomId: message.roomId,
      count: 20
    });
    const newUserRecommendations = recentRecommendations.filter((m) => m.entityId === message.entityId).sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
    if (newUserRecommendations.length === 0) return;
    const tokens = [
      (newUserRecommendations[0]?.metadata).recommendation?.tokenAddress ?? ""
    ];
    if (!Array.isArray(tokens) || tokens[0] === "") return;
    logger4.info(tokens);
    try {
      const participants = await runtime.getParticipantsForRoom(message.roomId);
      const entities = await Promise.all(participants.map((id) => runtime.getEntityById(id))).then(
        (entities2) => entities2.filter((participant) => !!participant)
      );
      for (const tokenAddress of [tokens[tokens.length - 1]]) {
        const memory = newUserRecommendations.find(
          (r) => r.metadata.recommendation.tokenAddress === tokenAddress
        );
        if (!memory) continue;
        const recommendation = memory.metadata.recommendation;
        const participant = entities.find((participant2) => {
          return participant2.names.map((name) => name.toLowerCase().trim()).includes(recommendation.username.toLowerCase().trim()) || participant2.id === message.entityId;
        });
        if (!participant) {
          console.warn("Could not find participant: ", recommendation.username);
          continue;
        }
        const entity = await runtime.getEntityById(participant.id);
        const result = await tradingService.handleRecommendation(entity, {
          chain: "solana",
          // TODO: handle multichain
          conviction: recommendation.conviction === "HIGH" ? "HIGH" /* HIGH */ : recommendation.conviction === "MEDIUM" ? "MEDIUM" /* MEDIUM */ : "LOW" /* LOW */,
          tokenAddress: recommendation.tokenAddress,
          type: recommendation.type === "BUY" ? "BUY" /* BUY */ : "SELL" /* SELL */,
          timestamp: message.createdAt ? new Date(message.createdAt) : /* @__PURE__ */ new Date(),
          metadata: {
            msg: message.content.text ?? "CONFIRMATION",
            msgId: message.id,
            chatId: message.metadata?.clientChatId
          }
        });
        const newUUID = v4_default();
        if (callback && result) {
          switch (recommendation.type) {
            case "BUY": {
              const responseMemory = {
                id: newUUID,
                content: {
                  text: `Simulation buy started for token: ${recommendation.ticker} (${recommendation.tokenAddress})`,
                  inReplyTo: message.id ? message.id : void 0,
                  actions: ["CONFIRM_RECOMMENDATION_BUY_STARTED"]
                },
                entityId: participant.id,
                agentId: message.agentId,
                roomId: message.roomId,
                metadata: {
                  type: "CONFIRM_RECOMMENDATION",
                  recommendation,
                  confirmed: true
                },
                createdAt: Date.now() * 1e3
              };
              await callback(responseMemory);
              break;
            }
            case "DONT_BUY":
            case "SELL":
            case "DONT_SELL":
              break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  async validate(_runtime, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/recommendations/evaluator.ts
import {
  ModelType as ModelType2,
  composePrompt as composePrompt2
} from "@elizaos/core";
import { z as z2 } from "zod";

// src/plugins/communityInvestor/recommendations/examples.ts
var examples = [
  {
    prompt: `People in the scene:
{{name1}}: Experienced DeFi degen. Constantly chasing high yield farms.
{{name2}}: New to DeFi, learning the ropes.

Recommendations about the entities:
None`,
    messages: [
      {
        name: "{{name1}}",
        content: {
          text: "Yo, have you checked out $SOLARUG? Dope new yield aggregator on Solana."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Nah, I'm still trying to wrap my head around how yield farming even works haha. Is it risky?"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I mean, there's always risk in DeFi, but the $SOLARUG devs seem legit. Threw a few sol into the FCweoTfJ128jGgNEXgdfTXdEZVk58Bz9trCemr6sXNx9 vault, farming's been smooth so far."
        }
      }
    ],
    outcome: `\`\`\`json
[
{
"entity": "{{name1}}",
"ticker": "SOLARUG",
"tokenAddress": "FCweoTfJ128jGgNEXgdfTXdEZVk58Bz9trCemr6sXNx9",
"type": "BUY",
"conviction": "medium",
}
]
\`\`\``
  },
  {
    prompt: `People in the scene:
{{name1}}: Solana maximalist. Believes Solana will flip Ethereum.
{{name2}}: Multichain proponent. Holds both SOL and ETH.

Recommendations about the entities:
{{name1}} has previously promoted $COPETOKEN and $SOYLENT.`,
    messages: [
      {
        name: "{{name1}}",
        content: {
          text: "If you're not long $SOLVAULT at 7tRzKud6FBVFEhYqZS3CuQ2orLRM21bdisGykL5Sr4Dx, you're missing out. This will be the blackhole of Solana liquidity."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Idk man, feels like there's a new 'vault' or 'reserve' token every week on Sol. What happened to $COPETOKEN and $SOYLENT that you were shilling before?"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "$COPETOKEN and $SOYLENT had their time, I took profits near the top. But $SOLVAULT is different, it has actual utility. Do what you want, but don't say I didn't warn you when this 50x's and you're left holding your $ETH bags."
        }
      }
    ],
    outcome: `\`\`\`json
[
{
"entity": "{{name1}}",
"ticker": "COPETOKEN",
"tokenAddress": null,
"type": "SELL",
"conviction": "low",
},
{
"entity": "{{name1}}",
"ticker": "SOYLENT",
"tokenAddress": null,
"type": "SELL",
"conviction": "low",
},
{
"entity": "{{name1}}",
"ticker": "SOLVAULT",
"tokenAddress": "7tRzKud6FBVFEhYqZS3CuQ2orLRM21bdisGykL5Sr4Dx",
"type": "BUY",
"conviction": "high",
}
]
\`\`\``
  },
  {
    prompt: `People in the scene:
{{name1}}: Self-proclaimed Solana alpha caller. Allegedly has insider info.
{{name2}}: Degen gambler. Will ape into any hyped token.

Recommendations about the entities:
None`,
    messages: [
      {
        name: "{{name1}}",
        content: {
          text: "I normally don't do this, but I like you anon, so I'll let you in on some alpha. $ROULETTE at 48vV5y4DRH1Adr1bpvSgFWYCjLLPtHYBqUSwNc2cmCK2 is going to absolutely send it soon. You didn't hear it from me \u{1F910}"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Oh shit, insider info from the alpha god himself? Say no more, I'm aping in hard."
        }
      }
    ],
    outcome: `\`\`\`json
[
{
"entity": "{{name1}}",
"ticker": "ROULETTE",
"tokenAddress": "48vV5y4DRH1Adr1bpvSgFWYCjLLPtHYBqUSwNc2cmCK2",
"type": "BUY",
"conviction": "high",
}
]
\`\`\``
  },
  {
    prompt: `People in the scene:
{{name1}}: NFT collector and trader. Bullish on Solana NFTs.
{{name2}}: Only invests based on fundamentals. Sees all NFTs as worthless JPEGs.

Recommendations about the entities:
None
`,
    messages: [
      {
        name: "{{name1}}",
        content: {
          text: "GM. I'm heavily accumulating $PIXELAPE, the token for the Pixel Ape Yacht Club NFT collection. 10x is inevitable."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "NFTs are a scam bro. There's no underlying value. You're essentially trading worthless JPEGs."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Fun staying poor \u{1F921} $PIXELAPE is about to moon and you'll be left behind."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Whatever man, I'm not touching that shit with a ten foot pole. Have fun holding your bags."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Don't need luck where I'm going \u{1F60E} Once $PIXELAPE at 3hAKKmR6XyBooQBPezCbUMhrmcyTkt38sRJm2thKytWc takes off, you'll change your tune."
        }
      }
    ],
    outcome: `\`\`\`json
[
{
"entity": "{{name1}}",
"ticker": "PIXELAPE",
"tokenAddress": "3hAKKmR6XyBooQBPezCbUMhrmcyTkt38sRJm2thKytWc",
"type": "BUY",
"conviction": "high",
}
]
\`\`\``
  },
  {
    prompt: `People in the scene:
{{name1}}: Contrarian investor. Bets against hyped projects.
{{name2}}: Trend follower. Buys tokens that are currently popular.

Recommendations about the entities:
None`,
    messages: [
      {
        name: "{{name2}}",
        content: {
          text: "$SAMOYED is the talk of CT right now. Making serious moves. Might have to get a bag."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Whenever a token is the 'talk of CT', that's my cue to short it. $SAMOYED is going to dump hard, mark my words."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Idk man, the hype seems real this time. 5TQwHyZbedaH4Pcthj1Hxf5GqcigL6qWuB7YEsBtqvhr chart looks bullish af."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Hype is always real until it isn't. I'm taking out a fat short position here. Don't say I didn't warn you when this crashes 90% and you're left holding the flaming bags."
        }
      }
    ],
    outcome: `\`\`\`json
[
{
"entity": "{{name2}}",
"ticker": "SAMOYED",
"tokenAddress": "5TQwHyZbedaH4Pcthj1Hxf5GqcigL6qWuB7YEsBtqvhr",
"type": "BUY",
"conviction": "medium",
},
{
"entity": "{{name1}}",
"ticker": "SAMOYED",
"tokenAddress": "5TQwHyZbedaH4Pcthj1Hxf5GqcigL6qWuB7YEsBtqvhr",
"type": "dont_buy",
"conviction": "high",
}
]
\`\`\``
  }
];

// src/plugins/communityInvestor/recommendations/schema.ts
import { z } from "zod";
var recommendationSchema = z.object({
  username: z.string().describe("The username of the person making the recommendation in the conversation"),
  ticker: z.string().optional().nullable().describe(
    "The ticker symbol of the recommended asset (e.g., 'BTC', 'AAPL'). Optional as recommendations may discuss assets without explicit tickers"
  ),
  tokenAddress: z.string().optional().nullable().describe(
    "The blockchain contract address of the token if mentioned. This helps disambiguate tokens that might share similar names or symbols"
  ),
  type: z.enum(["BUY", "SELL", "DONT_BUY", "DONT_SELL", "NONE"]).describe(
    "The type of trading recommendation being made. This captures both positive recommendations (buy/sell) and explicit warnings against actions"
  ),
  conviction: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).describe(
    "The level of confidence or urgency expressed in the recommendation, helping prioritize stronger signals"
  )
}).describe(
  "Schema for extracting trading recommendations from conversational text, capturing the key components of who made the recommendation, what asset was discussed, what action was recommended, and how strongly it was recommended"
);

// src/plugins/communityInvestor/recommendations/evaluator.ts
var recommendationFormatTemplate = `You are a crypto expert.

You will be given a recommendation.

Your goal is to write a message to the {{recipientAgentName}} asking if they like the recommendation.

The message will then be sent to the {{recipientAgentName}} for an illicited response.

Each Message should include the following information:

- Should enclude engaging tagline at the beginning.
- Should include a report of the recommendation.
- Should Always end in a question asking the {{recipientAgentName}} if they like the recommendation, can get creative with the this.
- Should use a few emojis to make the message more engaging.
- Should always precide the message with a tag containing the @{{recipientAgentName}}

The message should **NOT**:

- Contain more than 5 emojis.
- Be too long.

<recommendation>
{{recommendation}}
</recommendation>

# Response Instructions

When writing your response, follow these strict guidelines:

## Response Information

Respond with the following structure:

-MESSAGE: This is the message you will need to send to the {{recipientAgentName}}.

## Response Format

Respond with the following format:
<message>
**MESSAGE_TEXT_HERE**
</message>

## Response Example

<message>
@{{recipientAgentName}} Hey there! \u{1F50D} I've got a fresh recommendation to run by you.

Based on my analysis, I'm seeing a HIGH conviction BUY signal for $PEPE. The signals are looking particularly strong right now.

What do you think about this play? Would love to get your take on it! \u{1F680}
</message>

Now based on the recommendation, write your message.`;
var sentimentTemplate = `You are an expert crypto analyst and trader. You mainly specialize in analyzing cryptocurrency conversations and extracting signals from those conversations and messages.

You will be given a message.

Your goal is to identify whether or not the message purports to a signal. A signal is a message that contains a positive or negative sentiment towards a token. A token can only be a token address.

## RULES

Strictly follow the below rules:

- If the message suggests a positive sentiment or negative sentiment towards a token address, then the signal is 1.
- If the message suggests a neutral sentiment towards a token address i.e (GnQUsLcyZ3NXUAPXymWoefMYfCwmJazBVkko4vb7pump), then the signal is 0.
- If the message only contains a token address, then the signal is 0. example: GnQUsLcyZ3NXUAPXymWoefMYfCwmJazBVkko4vb7pump
- If message contains a token ticker ($PNUT), then the signal is 2.
- If the message does not contain a token address at all, then the signal is 3.

Here is the general format of a token address to base your analysis on:

<tokenAddress>gnvgqjgozwo2aqd9zlmymadozn83gryvdpunx53ufq2p</tokenAddress>
<tokenAddress>32vfamd12dthmwo9g5quce9sgvdv72yufk9pmp2dtbj7</tokenAddress>
<tokenAddress>GnQUsLcyZ3NXUAPXymWoefMYfCwmJazBVkko4vb7pump</tokenAddress>

The signal should include the following information:

- The signal of the message (0, 1, or 2, or 3)

The signal should **NOT**:

- Include words other than 0, 1, or 2, or 3

<message>
{{message}}
</message>

# Response Instructions

When writing your response, follow these strict instructions:

## Response Information

Respond with the following information:

- SIGNAL: The signal of the message (0, 1, or 2, or 3)

## Response Format

Respond in the following format:

<signal>**SIGNAL_HERE**</signal>

## Response Example

<signal>0</signal>

Now, based on the message provided, please respond with your signal.`;
var recommendationConfirmTemplate = `You are {{agentName}}, a crypto expert.

You will be given a user message, recommendation, and token overview.

Your goal is to write a message to the user asking if they want to confirm the token recommendation.

The message will then be sent to the user for an illicited response.

Each Message should include the following information:

- Should include engaging tagline at the beginning.
- Should include a report of the token.
- Should always include links to the token addresses and accounts:
    - Token: https://solscan.io/token/[tokenAddress]
    - Account: https://solscan.io/account/[accountAddress]
    - Tx: https://solscan.io/tx/[txHash]
    - Pair: https://www.defined.fi/sol/[pairAddress]
- Should always use valid markdown links when possible.
- Should Always end in a question asking the user if they want to confirm the token recommendation, can get creative with the this.
- Should use a few emojis to make the message more engaging.

The message should **NOT**:

- Contain more than 5 emojis.
- Be too long.

<user_message>
{{msg}}
</user_message>

<recommendation>
{{recommendation}}
</recommendation>

<token_overview>
{{token}}
</token_overview>

# Response Instructions

When writing your response, follow these strict guidelines:

## Response Information

Respond with the following structure:

-MESSAGE: This is the message you will need to send to the user.

## Response Format

Respond with the following format:
<message>
**MESSAGE_TEXT_HERE**
</message>

## Response Example

<message>
Hello! Would you like to confirm the token recommendation for Kolwaii (KWAII)? Here are the details:

Token Overview:

- Name: Kolwaii
- Symbol: KWAII
- Chain: Solana
- Address: [6uVJY332tiYwo58g3B8p9FJRGmGZ2fUuXR8cpiaDpump](https://solscan.io/token/6uVJY332tiYwo58g3B8p9FJRGmGZ2fUuXR8cpiaDpump)
- Price: $0.01578
- Market Cap: $4,230,686
- 24h Trading Volume: $53,137,098.26
- Holders: 3,884
- Liquidity: $677,160.66
- 24h Price Change: +4.75%
- Total Supply: 999,998,189.02 KWAII

Top Trading Pairs:

1. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/ChiPAU1gj79o1tB4PXpB14v4DPuumtbzAkr3BnPbo1ru) - Price: $0.01578
2. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/HsnFjX8utMyLm7fVYphsr47nhhsqHsejP3JoUr3BUcYm) - Price: $0.01577
3. KWAII/SOL - [View on Defined.fi](https://www.defined.fi/sol/3czJZMWfobm5r3nUcxpZGE6hz5rKywegKCWKppaisM7n) - Price: $0.01523

Creator Information:

- Creator Address: [FTERkgMYziSVfcGEkZS55zYiLerZHWcMrjwt49aL9jBe](https://solscan.io/account/FTERkgMYziSVfcGEkZS55zYiLerZHWcMrjwt49aL9jBe)
- Creation Transaction: [View Transaction](https://solscan.io/tx/4PMbpyyQB9kPDKyeQaJGrMfmS2CnnHYp9nB5h4wiB2sDv7yHGoew4EgYgsaeGYTcuZPRpgKPKgrq4DLX4y8sX21y)

Would you like to proceed with the recommendation?
</message>

Now based on the user_message, recommendation, and token_overview, write your message.
`;
var recommendationTemplate = `You are an expert crypto analyst and trader. You mainly specialize in analyzing cryptocurrency conversations and extracting trading recommendations from them.

You will be given a token_metadata schema, a list of existing token recommendations to use as examples, and a conversation.

Your goal is to identify new buy or sell recommendations for memecoins from a given conversation, avoiding duplicates of existing recommendations.

Each new recommendation should include the following information:

- A analysis of the recommendation
- A recommendation object that adheres to the recommendation schema

The new recommendations should **NOT**:

- Include any existing or duplicate recommendations
- Change the contract address, even if it contains words like "pump" or "meme"

Review the following recommendation schema:

<recommendation_schema>
{{schema}}
</recommendation_schema>

Next, analyze the conversation:

<conversation>
{{message}}
</conversation>

# Instructions and Guidelines:

1. Carefully read through the conversation, looking for messages from users that:

    - Mention specific token addresses
    - Contain words related to buying, selling, or trading tokens
    - Express opinions or convictions about tokens

2. Your analysis should consider:
    - Quote the relevant part of the conversation
    - Is this truly a new recommendation?
    - What is the recommender's username?
    - What is the conviction level (NONE, LOW, MEDIUM, HIGH)?
    - What type of recommendation is it (BUY, DONT_BUY, SELL, DONT_SELL, NONE), if neutral sentiment, then the type is BUY?
    - Is there a contract address mentioned?
    - How does this recommendation compare to the existing ones? List any similar existing recommendations.
    - Conclusion: Is this a new, valid recommendation?

# Response Instructions

When writing your response, follow these strict instructions:

Do not modify the contract address, even if it contains words like "pump" or "meme".

## Response Information

Respond with the following information:

- NEW_RECOMMENDATIONS: The list of new recommendations
    - RECOMMENDATION: A single recommendation. Contains a analysis and recommendation object
        - ANALYSIS: A detailed analysis of the recommendation
        - RECOMMENDATION_DATA: A recommendation that adheres to the recommendation schema
            - username: The username of the recommender
            - conviction: The conviction level (NONE, LOW, MEDIUM, HIGH)
            - type: The type of recommendation (BUY, DONT_BUY, SELL, DONT_SELL, NONE)
            - tokenAddress: The contract address of the token (null if not provided)

## Response Format

Respond in the following format:

<new_recommendations>
<recommendation>
<analysis>
**Analysis_of recommendation_here**
</analysis>
<recommendation_data>
<username>**username**</username>
<conviction>**conviction**</conviction>
<type>**type**</type>
<tokenAddress>**tokenAddress**</tokenAddress>
</recommendation_data>
</recommendation>
...remaining recommendations...
</new_recommendations>

## Response Example

<new_recommendations>
<recommendation>
<analysis>
Analyzing message from user CryptoFan123:
Quote: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC is going to explode soon, buy now!" - Mentions token "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC" - Suggests buying - Conviction seems HIGH - No existing recommendation for HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC in the list - No contract address provided - No similar existing recommendations found
Conclusion: This appears to be a new, valid recommendation.
</analysis>
<recommendation_data>
<username>CryptoFan123</username>
<conviction>HIGH</conviction>
<type>BUY</type>
<tokenAddress>HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC</tokenAddress>
</recommendation_data>
</recommendation>
...remaining recommendations...
</new_recommendations>

Now, based on the recommendation schema, the existing recommendations, and the conversation provided, please respond with your new token recommendations.`;
var TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
var recommendationEvaluator = {
  name: "EXTRACT_RECOMMENDATIONS",
  similes: [],
  alwaysRun: true,
  validate: async (_runtime, message) => {
    if (message.content.text.length < 5) {
      return false;
    }
    return message.entityId !== message.agentId;
  },
  description: "Extract recommendations to buy or sell memecoins/tokens from the conversation, including details like ticker, contract address, conviction level, and recommender username.",
  async handler(runtime, message, state, options, callback) {
    try {
      await handler(runtime, message, state, options, callback);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  examples
};
async function handler(runtime, message, state, _options, callback) {
  if (!state) return;
  const { agentId, roomId } = message;
  if (!runtime.getService(ServiceType.COMMUNITY_INVESTOR)) {
    return;
  }
  const tradingService = runtime.getService(
    ServiceType.COMMUNITY_INVESTOR
  );
  if (!tradingService.hasWallet("solana")) {
    return;
  }
  if (message.entityId === message.agentId) return;
  const sentimentPrompt = composePrompt2({
    template: sentimentTemplate,
    state: {
      message: message.content.text
    }
  });
  const sentimentText = await runtime.useModel(ModelType2.TEXT_LARGE, {
    prompt: sentimentPrompt
  });
  const signal = extractXMLFromResponse(sentimentText, "signal");
  const signalInt = parseSignalResponse(signal);
  if (signalInt === 2 && callback) {
    const responseMemory = {
      content: {
        text: "Please provide a token address!",
        inReplyTo: message.id ? message.id : void 0,
        buttons: []
      },
      entityId: message.entityId,
      agentId: message.agentId,
      metadata: {
        ...message.metadata
      },
      roomId: message.roomId,
      createdAt: Date.now() * 1e3
    };
    await callback(responseMemory);
    return;
  }
  if (signalInt === 3) {
    return;
  }
  const recentRecommendations = await runtime.getMemories({
    tableName: "recommendations",
    roomId,
    count: 10
  });
  Promise.all(
    await recentRecommendations.filter((r) => r.createdAt && Date.now() - r.createdAt > 10 * 60 * 1e3).map((r) => runtime.deleteMemory(r.id))
  );
  const messageData = {
    text: message.content.text,
    entityId: message.entityId,
    agentId: message.agentId,
    roomId: message.roomId,
    username: message.content.username ?? message.content.userName
  };
  const messageString = `username: ${messageData.username}: text: ${messageData.text}
	entityId: ${messageData.entityId} | agentId: ${messageData.agentId} | roomId: ${messageData.roomId}`;
  const prompt = composePrompt2({
    state: {
      schema: JSON.stringify(getZodJsonSchema(recommendationSchema)),
      message: messageString
    },
    template: recommendationTemplate
  });
  const [text, participants] = await Promise.all([
    runtime.useModel(ModelType2.TEXT_LARGE, {
      prompt,
      stopSequences: []
    }),
    runtime.getParticipantsForRoom(message.roomId)
  ]);
  const newRecommendationsBlock = extractXMLFromResponse(text, "new_recommendations");
  const parsedRecommendations = parseRecommendationsResponse(newRecommendationsBlock);
  if (parsedRecommendations.length === 0) {
    return;
  }
  const recommendationDataMap = parsedRecommendations.map((r) => r.recommendation_data).filter((c) => c.conviction !== "null" && c.type !== "null");
  const recommendations = z2.array(recommendationSchema).parse(recommendationDataMap);
  const tokenRecommendationsSet = new Set(
    recentRecommendations.filter((r) => r.metadata.recommendation.confirmed).map((r) => r.metadata.recommendation.tokenAddress)
  );
  const filteredRecommendations = recommendations.filter((rec) => rec.username !== runtime.character.name).filter((rec) => !tokenRecommendationsSet.has(rec.tokenAddress));
  if (filteredRecommendations.length === 0) {
    return;
  }
  const users = await Promise.all(participants.map((id) => runtime.getEntityById(id))).then(
    (users2) => users2.filter((user) => !!user)
  );
  let hasAgentRepliedTo = false;
  for (const recommendation of filteredRecommendations) {
    if (recommendation.tokenAddress !== "null" && recommendation.ticker !== "null" && recommendation.ticker) {
      const tokenAddress = await tradingService.resolveTicker(
        "solana",
        // todo: extract from recommendation?
        recommendation.ticker
      );
      recommendation.tokenAddress = tokenAddress ?? void 0;
    }
    if (!recommendation.tokenAddress) continue;
    const token = await tradingService.getTokenOverview("solana", recommendation.tokenAddress);
    recommendation.ticker = token.symbol;
    const user = users.find((user2) => {
      return user2.names.map((name) => name.toLowerCase().trim()).includes(recommendation.username.toLowerCase().trim()) || user2.id === message.entityId;
    });
    if (!user) {
      console.warn("Could not find name: ", recommendation.username);
      continue;
    }
    const recommendationString = `username: ${recommendation.username} | ticker: ${recommendation.ticker} | tokenAddress: ${recommendation.tokenAddress} | conviction: ${recommendation.conviction} | type: ${recommendation.type}`;
    if (TELEGRAM_CHANNEL_ID) {
      (async () => {
        const prompt2 = composePrompt2({
          state: {
            recommendation: recommendationString,
            recipientAgentName: runtime.character.name
          },
          template: recommendationFormatTemplate
        });
        const text2 = await runtime.useModel(ModelType2.TEXT_SMALL, {
          prompt: prompt2
        });
        const extractedXML = extractXMLFromResponse(text2, "message");
        const formattedResponse = parseConfirmationResponse(extractedXML);
        if (callback) {
          const responseMemory = {
            content: {
              text: formattedResponse,
              buttons: [],
              channelId: TELEGRAM_CHANNEL_ID,
              source: "telegram",
              actions: ["CONFIRM_RECOMMENDATION"]
            },
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            metadata: message.metadata,
            createdAt: Date.now() * 1e3
          };
          callback(responseMemory);
        }
      })();
    }
    const recMemory = {
      id: v4_default(),
      entityId: message.entityId,
      agentId,
      content: { text: "", recommendation },
      roomId,
      createdAt: Date.now()
    };
    await Promise.all([runtime.createMemory(recMemory, "recommendations", true)]);
    const tokenString = JSON.stringify(token, (_, v) => {
      if (typeof v === "bigint") return v.toString();
      return v;
    });
    if (callback && !hasAgentRepliedTo) {
      if (signalInt === 0) {
        const responseMemory2 = {
          content: {
            text: "Are you just looking for details, or are you recommending this token?",
            inReplyTo: message.id ? message.id : void 0,
            buttons: [],
            actions: ["CONFIRM_RECOMMENDATION"],
            source: "telegram"
          },
          entityId: message.entityId,
          agentId: message.agentId,
          metadata: message.metadata,
          roomId: message.roomId,
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory2);
        return;
      }
      if (recommendation.conviction === "MEDIUM" || recommendation.conviction === "HIGH") {
        const actionMemory = {
          id: message.id,
          entityId: message.entityId,
          agentId,
          content: {
            text: message.content.text,
            actions: ["CONFIRM_RECOMMENDATION"]
          },
          roomId,
          createdAt: Date.now()
        };
        await runtime.processActions(
          {
            ...message,
            ...actionMemory,
            actions: [""]
          },
          [actionMemory],
          state,
          callback
        );
        return;
      }
      const prompt2 = composePrompt2({
        state: {
          agentName: runtime.character.name,
          msg: message.content.text,
          recommendation: recommendationString,
          token: tokenString
        },
        template: recommendationConfirmTemplate
      });
      const res = await runtime.useModel(ModelType2.TEXT_LARGE, {
        prompt: prompt2
      });
      const agentResponseMsg = extractXMLFromResponse(res, "message");
      const question = parseConfirmationResponse(agentResponseMsg);
      const responseMemory = {
        content: {
          text: question,
          inReplyTo: message.id ? message.id : void 0,
          buttons: [],
          actions: ["CONFIRM_RECOMMENDATION"],
          source: "telegram"
        },
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        metadata: message.metadata,
        createdAt: Date.now() * 1e3
      };
      await callback(responseMemory);
      hasAgentRepliedTo = true;
    }
  }
  hasAgentRepliedTo = false;
  return recommendations;
}

// src/plugins/communityInvestor/recommendations/positions.ts
import { logger as logger5 } from "@elizaos/core";
var getPositions = {
  name: "GET_POSITIONS",
  description: "Retrieves and formats position data for the agent's portfolio",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{agentName}} show me my positions"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_POSITIONS"]
        }
      }
    ]
  ],
  similes: ["GET_POSITIONS", "SHOW_PORTFOLIO"],
  async handler(runtime, message, _state, _options, callback) {
    const tradingService = runtime.getService(
      ServiceType.COMMUNITY_INVESTOR
    );
    if (!tradingService) {
      throw new Error("No trading service found");
    }
    try {
      const [positions, user] = await Promise.all([
        tradingService.getOpenPositionsWithBalance(),
        runtime.getEntityById(message.entityId)
      ]);
      if (!user) {
        logger5.error("No User Found, no entity score can be generated");
        await runtime.createMemory(
          {
            entityId: runtime.agentId,
            agentId: runtime.agentId,
            roomId: message.roomId,
            content: {
              thought: "No user found",
              actions: ["GET_POSITIONS_FAILED"]
            }
          },
          "messages"
        );
        return;
      }
      const entity = await runtime.getEntityById(user.id);
      const filteredPositions = positions.filter(
        (pos) => pos.entityId === entity?.id && pos.isSimulation === false
      );
      if (filteredPositions.length === 0 && callback) {
        const responseMemory = {
          content: {
            text: "No open positions found.",
            inReplyTo: message.id ? message.id : void 0,
            actions: ["GET_POSITIONS"]
          },
          entityId: message.entityId,
          agentId: message.agentId,
          metadata: message.metadata,
          roomId: message.roomId,
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory);
        return;
      }
      const transactions = filteredPositions.length > 0 ? await tradingService.getPositionsTransactions(filteredPositions.map((p) => p.id)) : [];
      const tokens = [];
      const tokenSet = /* @__PURE__ */ new Set();
      for (const position of filteredPositions) {
        if (tokenSet.has(`${position.chain}:${position.tokenAddress}`)) continue;
        const tokenPerformance = await tradingService.getTokenPerformance(
          position.chain,
          position.tokenAddress
        );
        if (tokenPerformance) {
          tokens.push({
            chain: position.chain,
            address: position.tokenAddress,
            ...tokenPerformance
          });
        }
        tokenSet.add(`${position.chain}:${position.tokenAddress}`);
      }
      const mappedTransactions = transactions.map((tx) => {
        const position = filteredPositions.find((p) => p.tokenAddress === tx.tokenAddress);
        return {
          id: v4_default(),
          positionId: position?.id || v4_default(),
          chain: position?.chain || "",
          type: tx.type.toUpperCase(),
          tokenAddress: tx.tokenAddress,
          transactionHash: tx.transactionHash,
          amount: BigInt(tx.amount),
          price: tx.price?.toString(),
          isSimulation: tx.isSimulation,
          timestamp: new Date(tx.timestamp)
        };
      });
      const {
        positionReports,
        tokenReports,
        totalCurrentValue,
        totalPnL,
        totalRealizedPnL,
        totalUnrealizedPnL,
        positionsWithBalance
      } = formatFullReport(tokens, filteredPositions, mappedTransactions);
      if (callback) {
        const formattedPositions = positionsWithBalance.map(({ position, token, transactions: transactions2 }) => {
          const _latestTx = transactions2[transactions2.length - 1];
          const currentValue = token.price ? (Number(position.balance) * token.price).toString() : "0";
          const pnlPercent = token.price && position.initialPrice ? ((Number(token.price) - Number(position.initialPrice)) / Number(position.initialPrice) * 100).toFixed(2) : "0";
          return `**${token.symbol} (${token.name})**
Address: ${token.address}
Price: $${token.price}
Value: $${currentValue}
P&L: ${pnlPercent}%
`;
        }).join("\n\n");
        const summary = `\u{1F4B0} **Your Portfolio Summary**
Total Value: ${totalCurrentValue}
Total P&L: ${totalPnL}
Realized: ${totalRealizedPnL}
Unrealized: ${totalUnrealizedPnL}`;
        const responseMemory = {
          content: {
            text: positionsWithBalance.length > 0 ? `${summary}

${formattedPositions}` : "No open positions found.",
            inReplyTo: message.id ? message.id : void 0,
            actions: ["GET_POSITIONS"]
          },
          entityId: message.entityId,
          metadata: message.metadata,
          agentId: message.agentId,
          roomId: message.roomId,
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory);
      }
    } catch (error) {
      console.error("Error in getPositions:", error);
      throw error;
    }
  },
  async validate(_runtime, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/recommendations/report.ts
import { logger as logger6 } from "@elizaos/core";
var getRecommenderReport = {
  name: "GET_RECOMMENDER_REPORT",
  description: "Gets a entity's report scoring their recommendations",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "what is my entity score?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_RECOMMENDER_REPORT"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "please provide my entity report"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_RECOMMENDER_REPORT"]
        }
      }
    ]
  ],
  similes: ["RECOMMENDER_REPORT", "RECOMMENDER_SCORE"],
  async handler(runtime, message, _state, _options, callback) {
    if (!callback) {
      logger6.error("No callback provided, no entity score can be generated");
      return;
    }
    const entity = await runtime.getEntityById(message.entityId);
    if (!entity) {
      logger6.error("No entity found, no entity score can be generated");
      return;
    }
    const tradingService = runtime.getService(
      ServiceType.COMMUNITY_INVESTOR
    );
    const metrics = entity ? await tradingService.getRecommenderMetrics(entity.id) : void 0;
    if (!metrics?.trustScore || metrics.trustScore === 0 || metrics.trustScore === -100) {
      const responseMemory2 = {
        content: {
          text: "You don't have a entity score yet. Please start recommending tokens to earn a score.",
          inReplyTo: message.id ? message.id : void 0,
          actions: ["GET_RECOMMENDER_REPORT"]
        },
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        metadata: message.metadata,
        createdAt: Date.now() * 1e3
      };
      await callback(responseMemory2);
      return true;
    }
    logger6.info(`Recommender report for ${entity?.id}: ${metrics?.trustScore}`);
    const recommenderReport = entity && metrics ? formatRecommenderReport(
      {
        ...entity,
        id: entity.id
        // Ensure id is not undefined
      },
      metrics,
      (await tradingService.getRecommenderMetricsHistory(entity.id)).map((history) => ({
        ...history,
        historyId: history.entityId || v4_default(),
        // Ensure historyId is a valid UUID
        entityId: history.entityId || "",
        trustScore: history.metrics.trustScore || 0,
        totalRecommendations: history.metrics.totalRecommendations || 0,
        successfulRecs: history.metrics.successfulRecs || 0,
        avgTokenPerformance: history.metrics.avgTokenPerformance || 0,
        consistencyScore: history.metrics.consistencyScore || 0,
        lastUpdated: history.timestamp || /* @__PURE__ */ new Date()
      }))
    ) : "";
    logger6.info(`Recommender report: ${recommenderReport}`);
    const responseMemory = {
      content: {
        text: recommenderReport,
        actions: ["GET_RECOMMENDER_REPORT"]
      },
      entityId: message.entityId,
      agentId: message.agentId,
      roomId: message.roomId,
      metadata: message.metadata,
      createdAt: Date.now() * 1e3
    };
    await callback(responseMemory);
    return true;
  },
  async validate(_, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/recommendations/simulatedPositions.ts
import { logger as logger7 } from "@elizaos/core";
var getSimulatedPositions = {
  name: "GET_SIMULATED_POSITIONS",
  description: "Retrieves and formats position data for the agent's portfolio",
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{agentName}} show me my simulated positions"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_SIMULATED_POSITIONS"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{agentName}} show me simulated positions"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "<NONE>",
          actions: ["GET_SIMULATED_POSITIONS"]
        }
      }
    ]
  ],
  similes: ["GET_SIMULATED_POSITIONS", "SHOW_SIMULATED_PORTFOLIO"],
  async handler(runtime, message, _state, _options, callback) {
    const tradingService = runtime.getService(
      ServiceType.COMMUNITY_INVESTOR
    );
    try {
      const [positions, user] = await Promise.all([
        tradingService.getOpenPositionsWithBalance(),
        runtime.getEntityById(message.entityId)
      ]);
      if (!user) {
        logger7.error("No User Found, no entity score can be generated");
        return;
      }
      const entity = await runtime.getEntityById(user.id);
      const filteredPositions = positions.filter(
        (pos) => pos.entityId === entity?.id && pos.isSimulation === true
      );
      if (filteredPositions.length === 0 && callback) {
        const responseMemory = {
          content: {
            text: "No simulated positions found.",
            inReplyTo: message.id ? message.id : void 0,
            actions: ["GET_SIMULATED_POSITIONS"]
          },
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          metadata: message.metadata,
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory);
        return;
      }
      const transactions = filteredPositions.length > 0 ? await tradingService.getPositionsTransactions(filteredPositions.map((p) => p.id)) : [];
      const tokens = [];
      const tokenSet = /* @__PURE__ */ new Set();
      for (const position of filteredPositions) {
        if (tokenSet.has(`${position.chain}:${position.tokenAddress}`)) continue;
        const tokenPerformance = await tradingService.getTokenPerformance(
          position.chain,
          position.tokenAddress
        );
        if (tokenPerformance) {
          tokens.push({
            chain: position.chain,
            address: position.tokenAddress,
            ...tokenPerformance
          });
        }
        tokenSet.add(`${position.chain}:${position.tokenAddress}`);
      }
      const mappedTransactions = transactions.map((tx) => {
        const position = filteredPositions.find((p) => p.tokenAddress === tx.tokenAddress);
        return {
          id: v4_default(),
          positionId: position?.id || v4_default(),
          chain: position?.chain || "",
          type: tx.type.toUpperCase(),
          tokenAddress: tx.tokenAddress,
          transactionHash: tx.transactionHash,
          amount: BigInt(tx.amount),
          price: tx.price?.toString(),
          isSimulation: tx.isSimulation,
          timestamp: new Date(tx.timestamp)
        };
      });
      const {
        positionReports,
        tokenReports,
        totalCurrentValue,
        totalPnL,
        totalRealizedPnL,
        totalUnrealizedPnL,
        positionsWithBalance
      } = formatFullReport(tokens, filteredPositions, mappedTransactions);
      if (callback) {
        const formattedPositions = positionsWithBalance.map(({ position, token, transactions: transactions2 }) => {
          const _latestTx = transactions2[transactions2.length - 1];
          const currentValue = token.price ? (Number(position.balance) * token.price).toString() : "0";
          const pnlPercent = token.price && position.initialPrice ? ((Number(token.price) - Number(position.initialPrice)) / Number(position.initialPrice) * 100).toFixed(2) : "0";
          return `**${token.symbol} (${token.name})**
Address: ${token.address}
Price: $${token.price}
Value: $${currentValue}
P&L: ${pnlPercent}%
`;
        }).join("\n\n");
        const summary = `\u{1F4B0} **Simulated Portfolio Summary**
Total Value: ${totalCurrentValue}
Total P&L: ${totalPnL}
Realized: ${totalRealizedPnL}
Unrealized: ${totalUnrealizedPnL}`;
        const responseMemory = {
          content: {
            text: positionsWithBalance.length > 0 ? `${summary}

${formattedPositions}` : "No simulated positions found.",
            inReplyTo: message.id ? message.id : void 0,
            actions: ["GET_SIMULATED_POSITIONS"]
          },
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          metadata: message.metadata,
          createdAt: Date.now() * 1e3
        };
        await callback(responseMemory);
      }
    } catch (error) {
      console.error("Error in getPositions:", error);
      throw error;
    }
  },
  async validate(_runtime, message) {
    if (message.agentId === message.entityId) return false;
    return true;
  }
};

// src/plugins/communityInvestor/tradingService.ts
import {
  ModelType as ModelType3,
  Service,
  logger as logger8
} from "@elizaos/core";

// node_modules/bignumber.js/bignumber.mjs
var isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
var mathceil = Math.ceil;
var mathfloor = Math.floor;
var bignumberError = "[BigNumber Error] ";
var tooManyDigits = bignumberError + "Number primitive has more than 15 significant digits: ";
var BASE = 1e14;
var LOG_BASE = 14;
var MAX_SAFE_INTEGER = 9007199254740991;
var POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
var SQRT_BASE = 1e7;
var MAX = 1e9;
function clone(configObject) {
  var div, convertBase, parseNumeric, P = BigNumber2.prototype = { constructor: BigNumber2, toString: null, valueOf: null }, ONE = new BigNumber2(1), DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, MODULO_MODE = 1, POW_PRECISION = 0, FORMAT = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: "\xA0",
    // non-breaking space
    suffix: ""
  }, ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz", alphabetHasNormalDecimalDigits = true;
  function BigNumber2(v, b) {
    var alphabet, c, caseChanged, e, i, isNum, len, str, x = this;
    if (!(x instanceof BigNumber2)) return new BigNumber2(v, b);
    if (b == null) {
      if (v && v._isBigNumber === true) {
        x.s = v.s;
        if (!v.c || v.e > MAX_EXP) {
          x.c = x.e = null;
        } else if (v.e < MIN_EXP) {
          x.c = [x.e = 0];
        } else {
          x.e = v.e;
          x.c = v.c.slice();
        }
        return;
      }
      if ((isNum = typeof v == "number") && v * 0 == 0) {
        x.s = 1 / v < 0 ? (v = -v, -1) : 1;
        if (v === ~~v) {
          for (e = 0, i = v; i >= 10; i /= 10, e++) ;
          if (e > MAX_EXP) {
            x.c = x.e = null;
          } else {
            x.e = e;
            x.c = [v];
          }
          return;
        }
        str = String(v);
      } else {
        if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);
        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
      }
      if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
      if ((i = str.search(/e/i)) > 0) {
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {
        e = str.length;
      }
    } else {
      intCheck(b, 2, ALPHABET.length, "Base");
      if (b == 10 && alphabetHasNormalDecimalDigits) {
        x = new BigNumber2(v);
        return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
      }
      str = String(v);
      if (isNum = typeof v == "number") {
        if (v * 0 != 0) return parseNumeric(x, str, isNum, b);
        x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;
        if (BigNumber2.DEBUG && str.replace(/^0\.0*|\./, "").length > 15) {
          throw Error(tooManyDigits + v);
        }
      } else {
        x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
      }
      alphabet = ALPHABET.slice(0, b);
      e = i = 0;
      for (len = str.length; i < len; i++) {
        if (alphabet.indexOf(c = str.charAt(i)) < 0) {
          if (c == ".") {
            if (i > e) {
              e = len;
              continue;
            }
          } else if (!caseChanged) {
            if (str == str.toUpperCase() && (str = str.toLowerCase()) || str == str.toLowerCase() && (str = str.toUpperCase())) {
              caseChanged = true;
              i = -1;
              e = 0;
              continue;
            }
          }
          return parseNumeric(x, String(v), isNum, b);
        }
      }
      isNum = false;
      str = convertBase(str, b, 10, x.s);
      if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
      else e = str.length;
    }
    for (i = 0; str.charCodeAt(i) === 48; i++) ;
    for (len = str.length; str.charCodeAt(--len) === 48; ) ;
    if (str = str.slice(i, ++len)) {
      len -= i;
      if (isNum && BigNumber2.DEBUG && len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
        throw Error(tooManyDigits + x.s * v);
      }
      if ((e = e - i - 1) > MAX_EXP) {
        x.c = x.e = null;
      } else if (e < MIN_EXP) {
        x.c = [x.e = 0];
      } else {
        x.e = e;
        x.c = [];
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;
        if (i < len) {
          if (i) x.c.push(+str.slice(0, i));
          for (len -= LOG_BASE; i < len; ) {
            x.c.push(+str.slice(i, i += LOG_BASE));
          }
          i = LOG_BASE - (str = str.slice(i)).length;
        } else {
          i -= len;
        }
        for (; i--; str += "0") ;
        x.c.push(+str);
      }
    } else {
      x.c = [x.e = 0];
    }
  }
  BigNumber2.clone = clone;
  BigNumber2.ROUND_UP = 0;
  BigNumber2.ROUND_DOWN = 1;
  BigNumber2.ROUND_CEIL = 2;
  BigNumber2.ROUND_FLOOR = 3;
  BigNumber2.ROUND_HALF_UP = 4;
  BigNumber2.ROUND_HALF_DOWN = 5;
  BigNumber2.ROUND_HALF_EVEN = 6;
  BigNumber2.ROUND_HALF_CEIL = 7;
  BigNumber2.ROUND_HALF_FLOOR = 8;
  BigNumber2.EUCLID = 9;
  BigNumber2.config = BigNumber2.set = function(obj) {
    var p, v;
    if (obj != null) {
      if (typeof obj == "object") {
        if (obj.hasOwnProperty(p = "DECIMAL_PLACES")) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          DECIMAL_PLACES = v;
        }
        if (obj.hasOwnProperty(p = "ROUNDING_MODE")) {
          v = obj[p];
          intCheck(v, 0, 8, p);
          ROUNDING_MODE = v;
        }
        if (obj.hasOwnProperty(p = "EXPONENTIAL_AT")) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, 0, p);
            intCheck(v[1], 0, MAX, p);
            TO_EXP_NEG = v[0];
            TO_EXP_POS = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
          }
        }
        if (obj.hasOwnProperty(p = "RANGE")) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, -1, p);
            intCheck(v[1], 1, MAX, p);
            MIN_EXP = v[0];
            MAX_EXP = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            if (v) {
              MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
            } else {
              throw Error(bignumberError + p + " cannot be zero: " + v);
            }
          }
        }
        if (obj.hasOwnProperty(p = "CRYPTO")) {
          v = obj[p];
          if (v === !!v) {
            if (v) {
              if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                CRYPTO = v;
              } else {
                CRYPTO = !v;
                throw Error(bignumberError + "crypto unavailable");
              }
            } else {
              CRYPTO = v;
            }
          } else {
            throw Error(bignumberError + p + " not true or false: " + v);
          }
        }
        if (obj.hasOwnProperty(p = "MODULO_MODE")) {
          v = obj[p];
          intCheck(v, 0, 9, p);
          MODULO_MODE = v;
        }
        if (obj.hasOwnProperty(p = "POW_PRECISION")) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          POW_PRECISION = v;
        }
        if (obj.hasOwnProperty(p = "FORMAT")) {
          v = obj[p];
          if (typeof v == "object") FORMAT = v;
          else throw Error(bignumberError + p + " not an object: " + v);
        }
        if (obj.hasOwnProperty(p = "ALPHABET")) {
          v = obj[p];
          if (typeof v == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
            alphabetHasNormalDecimalDigits = v.slice(0, 10) == "0123456789";
            ALPHABET = v;
          } else {
            throw Error(bignumberError + p + " invalid: " + v);
          }
        }
      } else {
        throw Error(bignumberError + "Object expected: " + obj);
      }
    }
    return {
      DECIMAL_PLACES,
      ROUNDING_MODE,
      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
      RANGE: [MIN_EXP, MAX_EXP],
      CRYPTO,
      MODULO_MODE,
      POW_PRECISION,
      FORMAT,
      ALPHABET
    };
  };
  BigNumber2.isBigNumber = function(v) {
    if (!v || v._isBigNumber !== true) return false;
    if (!BigNumber2.DEBUG) return true;
    var i, n, c = v.c, e = v.e, s = v.s;
    out: if ({}.toString.call(c) == "[object Array]") {
      if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {
        if (c[0] === 0) {
          if (e === 0 && c.length === 1) return true;
          break out;
        }
        i = (e + 1) % LOG_BASE;
        if (i < 1) i += LOG_BASE;
        if (String(c[0]).length == i) {
          for (i = 0; i < c.length; i++) {
            n = c[i];
            if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
          }
          if (n !== 0) return true;
        }
      }
    } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
      return true;
    }
    throw Error(bignumberError + "Invalid BigNumber: " + v);
  };
  BigNumber2.maximum = BigNumber2.max = function() {
    return maxOrMin(arguments, -1);
  };
  BigNumber2.minimum = BigNumber2.min = function() {
    return maxOrMin(arguments, 1);
  };
  BigNumber2.random = function() {
    var pow2_53 = 9007199254740992;
    var random53bitInt = Math.random() * pow2_53 & 2097151 ? function() {
      return mathfloor(Math.random() * pow2_53);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(dp) {
      var a, b, e, k, v, i = 0, c = [], rand = new BigNumber2(ONE);
      if (dp == null) dp = DECIMAL_PLACES;
      else intCheck(dp, 0, MAX);
      k = mathceil(dp / LOG_BASE);
      if (CRYPTO) {
        if (crypto.getRandomValues) {
          a = crypto.getRandomValues(new Uint32Array(k *= 2));
          for (; i < k; ) {
            v = a[i] * 131072 + (a[i + 1] >>> 11);
            if (v >= 9e15) {
              b = crypto.getRandomValues(new Uint32Array(2));
              a[i] = b[0];
              a[i + 1] = b[1];
            } else {
              c.push(v % 1e14);
              i += 2;
            }
          }
          i = k / 2;
        } else if (crypto.randomBytes) {
          a = crypto.randomBytes(k *= 7);
          for (; i < k; ) {
            v = (a[i] & 31) * 281474976710656 + a[i + 1] * 1099511627776 + a[i + 2] * 4294967296 + a[i + 3] * 16777216 + (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];
            if (v >= 9e15) {
              crypto.randomBytes(7).copy(a, i);
            } else {
              c.push(v % 1e14);
              i += 7;
            }
          }
          i = k / 7;
        } else {
          CRYPTO = false;
          throw Error(bignumberError + "crypto unavailable");
        }
      }
      if (!CRYPTO) {
        for (; i < k; ) {
          v = random53bitInt();
          if (v < 9e15) c[i++] = v % 1e14;
        }
      }
      k = c[--i];
      dp %= LOG_BASE;
      if (k && dp) {
        v = POWS_TEN[LOG_BASE - dp];
        c[i] = mathfloor(k / v) * v;
      }
      for (; c[i] === 0; c.pop(), i--) ;
      if (i < 0) {
        c = [e = 0];
      } else {
        for (e = -1; c[0] === 0; c.splice(0, 1), e -= LOG_BASE) ;
        for (i = 1, v = c[0]; v >= 10; v /= 10, i++) ;
        if (i < LOG_BASE) e -= LOG_BASE - i;
      }
      rand.e = e;
      rand.c = c;
      return rand;
    };
  }();
  BigNumber2.sum = function() {
    var i = 1, args = arguments, sum = new BigNumber2(args[0]);
    for (; i < args.length; ) sum = sum.plus(args[i++]);
    return sum;
  };
  convertBase = /* @__PURE__ */ function() {
    var decimal = "0123456789";
    function toBaseOut(str, baseIn, baseOut, alphabet) {
      var j, arr = [0], arrL, i = 0, len = str.length;
      for (; i < len; ) {
        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn) ;
        arr[0] += alphabet.indexOf(str.charAt(i++));
        for (j = 0; j < arr.length; j++) {
          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] == null) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }
      return arr.reverse();
    }
    return function(str, baseIn, baseOut, sign, callerIsToString) {
      var alphabet, d, e, k, r, x, xc, y, i = str.indexOf("."), dp = DECIMAL_PLACES, rm = ROUNDING_MODE;
      if (i >= 0) {
        k = POW_PRECISION;
        POW_PRECISION = 0;
        str = str.replace(".", "");
        y = new BigNumber2(baseIn);
        x = y.pow(str.length - i);
        POW_PRECISION = k;
        y.c = toBaseOut(
          toFixedPoint(coeffToString(x.c), x.e, "0"),
          10,
          baseOut,
          decimal
        );
        y.e = y.c.length;
      }
      xc = toBaseOut(str, baseIn, baseOut, callerIsToString ? (alphabet = ALPHABET, decimal) : (alphabet = decimal, ALPHABET));
      e = k = xc.length;
      for (; xc[--k] == 0; xc.pop()) ;
      if (!xc[0]) return alphabet.charAt(0);
      if (i < 0) {
        --e;
      } else {
        x.c = xc;
        x.e = e;
        x.s = sign;
        x = div(x, y, dp, rm, baseOut);
        xc = x.c;
        r = x.r;
        e = x.e;
      }
      d = e + dp + 1;
      i = xc[d];
      k = baseOut / 2;
      r = r || d < 0 || xc[d + 1] != null;
      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : i > k || i == k && (rm == 4 || r || rm == 6 && xc[d - 1] & 1 || rm == (x.s < 0 ? 8 : 7));
      if (d < 1 || !xc[0]) {
        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
      } else {
        xc.length = d;
        if (r) {
          for (--baseOut; ++xc[--d] > baseOut; ) {
            xc[d] = 0;
            if (!d) {
              ++e;
              xc = [1].concat(xc);
            }
          }
        }
        for (k = xc.length; !xc[--k]; ) ;
        for (i = 0, str = ""; i <= k; str += alphabet.charAt(xc[i++])) ;
        str = toFixedPoint(str, e, alphabet.charAt(0));
      }
      return str;
    };
  }();
  div = /* @__PURE__ */ function() {
    function multiply(x, k, base) {
      var m, temp, xlo, xhi, carry = 0, i = x.length, klo = k % SQRT_BASE, khi = k / SQRT_BASE | 0;
      for (x = x.slice(); i--; ) {
        xlo = x[i] % SQRT_BASE;
        xhi = x[i] / SQRT_BASE | 0;
        m = khi * xlo + xhi * klo;
        temp = klo * xlo + m % SQRT_BASE * SQRT_BASE + carry;
        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
        x[i] = temp % base;
      }
      if (carry) x = [carry].concat(x);
      return x;
    }
    function compare2(a, b, aL, bL) {
      var i, cmp;
      if (aL != bL) {
        cmp = aL > bL ? 1 : -1;
      } else {
        for (i = cmp = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            cmp = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }
      return cmp;
    }
    function subtract(a, b, aL, base) {
      var i = 0;
      for (; aL--; ) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }
      for (; !a[0] && a.length > 1; a.splice(0, 1)) ;
    }
    return function(x, y, dp, rm, base) {
      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0, yL, yz, s = x.s == y.s ? 1 : -1, xc = x.c, yc = y.c;
      if (!xc || !xc[0] || !yc || !yc[0]) {
        return new BigNumber2(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
          )
        );
      }
      q = new BigNumber2(s);
      qc = q.c = [];
      e = x.e - y.e;
      s = dp + e + 1;
      if (!base) {
        base = BASE;
        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
        s = s / LOG_BASE | 0;
      }
      for (i = 0; yc[i] == (xc[i] || 0); i++) ;
      if (yc[i] > (xc[i] || 0)) e--;
      if (s < 0) {
        qc.push(1);
        more = true;
      } else {
        xL = xc.length;
        yL = yc.length;
        i = 0;
        s += 2;
        n = mathfloor(base / (yc[0] + 1));
        if (n > 1) {
          yc = multiply(yc, n, base);
          xc = multiply(xc, n, base);
          yL = yc.length;
          xL = xc.length;
        }
        xi = yL;
        rem = xc.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; rem[remL++] = 0) ;
        yz = yc.slice();
        yz = [0].concat(yz);
        yc0 = yc[0];
        if (yc[1] >= base / 2) yc0++;
        do {
          n = 0;
          cmp = compare2(yc, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
            n = mathfloor(rem0 / yc0);
            if (n > 1) {
              if (n >= base) n = base - 1;
              prod = multiply(yc, n, base);
              prodL = prod.length;
              remL = rem.length;
              while (compare2(prod, rem, prodL, remL) == 1) {
                n--;
                subtract(prod, yL < prodL ? yz : yc, prodL, base);
                prodL = prod.length;
                cmp = 1;
              }
            } else {
              if (n == 0) {
                cmp = n = 1;
              }
              prod = yc.slice();
              prodL = prod.length;
            }
            if (prodL < remL) prod = [0].concat(prod);
            subtract(rem, prod, remL, base);
            remL = rem.length;
            if (cmp == -1) {
              while (compare2(yc, rem, yL, remL) < 1) {
                n++;
                subtract(rem, yL < remL ? yz : yc, remL, base);
                remL = rem.length;
              }
            }
          } else if (cmp === 0) {
            n++;
            rem = [0];
          }
          qc[i++] = n;
          if (rem[0]) {
            rem[remL++] = xc[xi] || 0;
          } else {
            rem = [xc[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] != null) && s--);
        more = rem[0] != null;
        if (!qc[0]) qc.splice(0, 1);
      }
      if (base == BASE) {
        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++) ;
        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);
      } else {
        q.e = e;
        q.r = +more;
      }
      return q;
    };
  }();
  function format(n, i, rm, id) {
    var c0, e, ne, len, str;
    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);
    if (!n.c) return n.toString();
    c0 = n.c[0];
    ne = n.e;
    if (i == null) {
      str = coeffToString(n.c);
      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS) ? toExponential(str, ne) : toFixedPoint(str, ne, "0");
    } else {
      n = round(new BigNumber2(n), i, rm);
      e = n.e;
      str = coeffToString(n.c);
      len = str.length;
      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {
        for (; len < i; str += "0", len++) ;
        str = toExponential(str, e);
      } else {
        i -= ne;
        str = toFixedPoint(str, e, "0");
        if (e + 1 > len) {
          if (--i > 0) for (str += "."; i--; str += "0") ;
        } else {
          i += e - len;
          if (i > 0) {
            if (e + 1 == len) str += ".";
            for (; i--; str += "0") ;
          }
        }
      }
    }
    return n.s < 0 && c0 ? "-" + str : str;
  }
  function maxOrMin(args, n) {
    var k, y, i = 1, x = new BigNumber2(args[0]);
    for (; i < args.length; i++) {
      y = new BigNumber2(args[i]);
      if (!y.s || (k = compare(x, y)) === n || k === 0 && x.s === n) {
        x = y;
      }
    }
    return x;
  }
  function normalise(n, c, e) {
    var i = 1, j = c.length;
    for (; !c[--j]; c.pop()) ;
    for (j = c[0]; j >= 10; j /= 10, i++) ;
    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {
      n.c = n.e = null;
    } else if (e < MIN_EXP) {
      n.c = [n.e = 0];
    } else {
      n.e = e;
      n.c = c;
    }
    return n;
  }
  parseNumeric = /* @__PURE__ */ function() {
    var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i, dotAfter = /^([^.]+)\.$/, dotBefore = /^\.([^.]+)$/, isInfinityOrNaN = /^-?(Infinity|NaN)$/, whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
    return function(x, str, isNum, b) {
      var base, s = isNum ? str : str.replace(whitespaceOrPlus, "");
      if (isInfinityOrNaN.test(s)) {
        x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
      } else {
        if (!isNum) {
          s = s.replace(basePrefix, function(m, p1, p2) {
            base = (p2 = p2.toLowerCase()) == "x" ? 16 : p2 == "b" ? 2 : 8;
            return !b || b == base ? p1 : m;
          });
          if (b) {
            base = b;
            s = s.replace(dotAfter, "$1").replace(dotBefore, "0.$1");
          }
          if (str != s) return new BigNumber2(s, base);
        }
        if (BigNumber2.DEBUG) {
          throw Error(bignumberError + "Not a" + (b ? " base " + b : "") + " number: " + str);
        }
        x.s = null;
      }
      x.c = x.e = null;
    };
  }();
  function round(x, sd, rm, r) {
    var d, i, j, k, n, ni, rd, xc = x.c, pows10 = POWS_TEN;
    if (xc) {
      out: {
        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++) ;
        i = sd - d;
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          n = xc[ni = 0];
          rd = mathfloor(n / pows10[d - j - 1] % 10);
        } else {
          ni = mathceil((i + 1) / LOG_BASE);
          if (ni >= xc.length) {
            if (r) {
              for (; xc.length <= ni; xc.push(0)) ;
              n = rd = 0;
              d = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            n = k = xc[ni];
            for (d = 1; k >= 10; k /= 10, d++) ;
            i %= LOG_BASE;
            j = i - LOG_BASE + d;
            rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
          }
        }
        r = r || sd < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);
        r = rm < 4 ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
        if (sd < 1 || !xc[0]) {
          xc.length = 0;
          if (r) {
            sd -= x.e + 1;
            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
            x.e = -sd || 0;
          } else {
            xc[0] = x.e = 0;
          }
          return x;
        }
        if (i == 0) {
          xc.length = ni;
          k = 1;
          ni--;
        } else {
          xc.length = ni + 1;
          k = pows10[LOG_BASE - i];
          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
        }
        if (r) {
          for (; ; ) {
            if (ni == 0) {
              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++) ;
              j = xc[0] += k;
              for (k = 1; j >= 10; j /= 10, k++) ;
              if (i != k) {
                x.e++;
                if (xc[0] == BASE) xc[0] = 1;
              }
              break;
            } else {
              xc[ni] += k;
              if (xc[ni] != BASE) break;
              xc[ni--] = 0;
              k = 1;
            }
          }
        }
        for (i = xc.length; xc[--i] === 0; xc.pop()) ;
      }
      if (x.e > MAX_EXP) {
        x.c = x.e = null;
      } else if (x.e < MIN_EXP) {
        x.c = [x.e = 0];
      }
    }
    return x;
  }
  function valueOf(n) {
    var str, e = n.e;
    if (e === null) return n.toString();
    str = coeffToString(n.c);
    str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(str, e) : toFixedPoint(str, e, "0");
    return n.s < 0 ? "-" + str : str;
  }
  P.absoluteValue = P.abs = function() {
    var x = new BigNumber2(this);
    if (x.s < 0) x.s = 1;
    return x;
  };
  P.comparedTo = function(y, b) {
    return compare(this, new BigNumber2(y, b));
  };
  P.decimalPlaces = P.dp = function(dp, rm) {
    var c, n, v, x = this;
    if (dp != null) {
      intCheck(dp, 0, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(new BigNumber2(x), dp + x.e + 1, rm);
    }
    if (!(c = x.c)) return null;
    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;
    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--) ;
    if (n < 0) n = 0;
    return n;
  };
  P.dividedBy = P.div = function(y, b) {
    return div(this, new BigNumber2(y, b), DECIMAL_PLACES, ROUNDING_MODE);
  };
  P.dividedToIntegerBy = P.idiv = function(y, b) {
    return div(this, new BigNumber2(y, b), 0, 1);
  };
  P.exponentiatedBy = P.pow = function(n, m) {
    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y, x = this;
    n = new BigNumber2(n);
    if (n.c && !n.isInteger()) {
      throw Error(bignumberError + "Exponent not an integer: " + valueOf(n));
    }
    if (m != null) m = new BigNumber2(m);
    nIsBig = n.e > 14;
    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {
      y = new BigNumber2(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
      return m ? y.mod(m) : y;
    }
    nIsNeg = n.s < 0;
    if (m) {
      if (m.c ? !m.c[0] : !m.s) return new BigNumber2(NaN);
      isModExp = !nIsNeg && x.isInteger() && m.isInteger();
      if (isModExp) x = x.mod(m);
    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0 ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7 : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {
      k = x.s < 0 && isOdd(n) ? -0 : 0;
      if (x.e > -1) k = 1 / k;
      return new BigNumber2(nIsNeg ? 1 / k : k);
    } else if (POW_PRECISION) {
      k = mathceil(POW_PRECISION / LOG_BASE + 2);
    }
    if (nIsBig) {
      half = new BigNumber2(0.5);
      if (nIsNeg) n.s = 1;
      nIsOdd = isOdd(n);
    } else {
      i = Math.abs(+valueOf(n));
      nIsOdd = i % 2;
    }
    y = new BigNumber2(ONE);
    for (; ; ) {
      if (nIsOdd) {
        y = y.times(x);
        if (!y.c) break;
        if (k) {
          if (y.c.length > k) y.c.length = k;
        } else if (isModExp) {
          y = y.mod(m);
        }
      }
      if (i) {
        i = mathfloor(i / 2);
        if (i === 0) break;
        nIsOdd = i % 2;
      } else {
        n = n.times(half);
        round(n, n.e + 1, 1);
        if (n.e > 14) {
          nIsOdd = isOdd(n);
        } else {
          i = +valueOf(n);
          if (i === 0) break;
          nIsOdd = i % 2;
        }
      }
      x = x.times(x);
      if (k) {
        if (x.c && x.c.length > k) x.c.length = k;
      } else if (isModExp) {
        x = x.mod(m);
      }
    }
    if (isModExp) return y;
    if (nIsNeg) y = ONE.div(y);
    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
  };
  P.integerValue = function(rm) {
    var n = new BigNumber2(this);
    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);
    return round(n, n.e + 1, rm);
  };
  P.isEqualTo = P.eq = function(y, b) {
    return compare(this, new BigNumber2(y, b)) === 0;
  };
  P.isFinite = function() {
    return !!this.c;
  };
  P.isGreaterThan = P.gt = function(y, b) {
    return compare(this, new BigNumber2(y, b)) > 0;
  };
  P.isGreaterThanOrEqualTo = P.gte = function(y, b) {
    return (b = compare(this, new BigNumber2(y, b))) === 1 || b === 0;
  };
  P.isInteger = function() {
    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
  };
  P.isLessThan = P.lt = function(y, b) {
    return compare(this, new BigNumber2(y, b)) < 0;
  };
  P.isLessThanOrEqualTo = P.lte = function(y, b) {
    return (b = compare(this, new BigNumber2(y, b))) === -1 || b === 0;
  };
  P.isNaN = function() {
    return !this.s;
  };
  P.isNegative = function() {
    return this.s < 0;
  };
  P.isPositive = function() {
    return this.s > 0;
  };
  P.isZero = function() {
    return !!this.c && this.c[0] == 0;
  };
  P.minus = function(y, b) {
    var i, j, t, xLTy, x = this, a = x.s;
    y = new BigNumber2(y, b);
    b = y.s;
    if (!a || !b) return new BigNumber2(NaN);
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }
    var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
    if (!xe || !ye) {
      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber2(yc ? x : NaN);
      if (!xc[0] || !yc[0]) {
        return yc[0] ? (y.s = -b, y) : new BigNumber2(xc[0] ? x : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          ROUNDING_MODE == 3 ? -0 : 0
        ));
      }
    }
    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();
    if (a = xe - ye) {
      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }
      t.reverse();
      for (b = a; b--; t.push(0)) ;
      t.reverse();
    } else {
      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;
      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }
    if (xLTy) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }
    b = (j = yc.length) - (i = xc.length);
    if (b > 0) for (; b--; xc[i++] = 0) ;
    b = BASE - 1;
    for (; j > a; ) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i]; xc[i] = b) ;
        --xc[i];
        xc[j] += BASE;
      }
      xc[j] -= yc[j];
    }
    for (; xc[0] == 0; xc.splice(0, 1), --ye) ;
    if (!xc[0]) {
      y.s = ROUNDING_MODE == 3 ? -1 : 1;
      y.c = [y.e = 0];
      return y;
    }
    return normalise(y, xc, ye);
  };
  P.modulo = P.mod = function(y, b) {
    var q, s, x = this;
    y = new BigNumber2(y, b);
    if (!x.c || !y.s || y.c && !y.c[0]) {
      return new BigNumber2(NaN);
    } else if (!y.c || x.c && !x.c[0]) {
      return new BigNumber2(x);
    }
    if (MODULO_MODE == 9) {
      s = y.s;
      y.s = 1;
      q = div(x, y, 0, 3);
      y.s = s;
      q.s *= s;
    } else {
      q = div(x, y, 0, MODULO_MODE);
    }
    y = x.minus(q.times(y));
    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;
    return y;
  };
  P.multipliedBy = P.times = function(y, b) {
    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc, base, sqrtBase, x = this, xc = x.c, yc = (y = new BigNumber2(y, b)).c;
    if (!xc || !yc || !xc[0] || !yc[0]) {
      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
        y.c = y.e = y.s = null;
      } else {
        y.s *= x.s;
        if (!xc || !yc) {
          y.c = y.e = null;
        } else {
          y.c = [0];
          y.e = 0;
        }
      }
      return y;
    }
    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    y.s *= x.s;
    xcL = xc.length;
    ycL = yc.length;
    if (xcL < ycL) {
      zc = xc;
      xc = yc;
      yc = zc;
      i = xcL;
      xcL = ycL;
      ycL = i;
    }
    for (i = xcL + ycL, zc = []; i--; zc.push(0)) ;
    base = BASE;
    sqrtBase = SQRT_BASE;
    for (i = ycL; --i >= 0; ) {
      c = 0;
      ylo = yc[i] % sqrtBase;
      yhi = yc[i] / sqrtBase | 0;
      for (k = xcL, j = i + k; j > i; ) {
        xlo = xc[--k] % sqrtBase;
        xhi = xc[k] / sqrtBase | 0;
        m = yhi * xlo + xhi * ylo;
        xlo = ylo * xlo + m % sqrtBase * sqrtBase + zc[j] + c;
        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
        zc[j--] = xlo % base;
      }
      zc[j] = c;
    }
    if (c) {
      ++e;
    } else {
      zc.splice(0, 1);
    }
    return normalise(y, zc, e);
  };
  P.negated = function() {
    var x = new BigNumber2(this);
    x.s = -x.s || null;
    return x;
  };
  P.plus = function(y, b) {
    var t, x = this, a = x.s;
    y = new BigNumber2(y, b);
    b = y.s;
    if (!a || !b) return new BigNumber2(NaN);
    if (a != b) {
      y.s = -b;
      return x.minus(y);
    }
    var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
    if (!xe || !ye) {
      if (!xc || !yc) return new BigNumber2(a / 0);
      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber2(xc[0] ? x : a * 0);
    }
    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }
      t.reverse();
      for (; a--; t.push(0)) ;
      t.reverse();
    }
    a = xc.length;
    b = yc.length;
    if (a - b < 0) {
      t = yc;
      yc = xc;
      xc = t;
      b = a;
    }
    for (a = 0; b; ) {
      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    }
    if (a) {
      xc = [a].concat(xc);
      ++ye;
    }
    return normalise(y, xc, ye);
  };
  P.precision = P.sd = function(sd, rm) {
    var c, n, v, x = this;
    if (sd != null && sd !== !!sd) {
      intCheck(sd, 1, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(new BigNumber2(x), sd, rm);
    }
    if (!(c = x.c)) return null;
    v = c.length - 1;
    n = v * LOG_BASE + 1;
    if (v = c[v]) {
      for (; v % 10 == 0; v /= 10, n--) ;
      for (v = c[0]; v >= 10; v /= 10, n++) ;
    }
    if (sd && x.e + 1 > n) n = x.e + 1;
    return n;
  };
  P.shiftedBy = function(k) {
    intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    return this.times("1e" + k);
  };
  P.squareRoot = P.sqrt = function() {
    var m, n, r, rep, t, x = this, c = x.c, s = x.s, e = x.e, dp = DECIMAL_PLACES + 4, half = new BigNumber2("0.5");
    if (s !== 1 || !c || !c[0]) {
      return new BigNumber2(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    }
    s = Math.sqrt(+valueOf(x));
    if (s == 0 || s == 1 / 0) {
      n = coeffToString(c);
      if ((n.length + e) % 2 == 0) n += "0";
      s = Math.sqrt(+n);
      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);
      if (s == 1 / 0) {
        n = "5e" + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf("e") + 1) + e;
      }
      r = new BigNumber2(n);
    } else {
      r = new BigNumber2(s + "");
    }
    if (r.c[0]) {
      e = r.e;
      s = e + dp;
      if (s < 3) s = 0;
      for (; ; ) {
        t = r;
        r = half.times(t.plus(div(x, t, dp, 1)));
        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {
          if (r.e < e) --s;
          n = n.slice(s - 3, s + 1);
          if (n == "9999" || !rep && n == "4999") {
            if (!rep) {
              round(t, t.e + DECIMAL_PLACES + 2, 0);
              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }
            dp += 4;
            s += 4;
            rep = 1;
          } else {
            if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
              round(r, r.e + DECIMAL_PLACES + 2, 1);
              m = !r.times(r).eq(x);
            }
            break;
          }
        }
      }
    }
    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
  };
  P.toExponential = function(dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp++;
    }
    return format(this, dp, rm, 1);
  };
  P.toFixed = function(dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp = dp + this.e + 1;
    }
    return format(this, dp, rm);
  };
  P.toFormat = function(dp, rm, format2) {
    var str, x = this;
    if (format2 == null) {
      if (dp != null && rm && typeof rm == "object") {
        format2 = rm;
        rm = null;
      } else if (dp && typeof dp == "object") {
        format2 = dp;
        dp = rm = null;
      } else {
        format2 = FORMAT;
      }
    } else if (typeof format2 != "object") {
      throw Error(bignumberError + "Argument not an object: " + format2);
    }
    str = x.toFixed(dp, rm);
    if (x.c) {
      var i, arr = str.split("."), g1 = +format2.groupSize, g2 = +format2.secondaryGroupSize, groupSeparator = format2.groupSeparator || "", intPart = arr[0], fractionPart = arr[1], isNeg = x.s < 0, intDigits = isNeg ? intPart.slice(1) : intPart, len = intDigits.length;
      if (g2) {
        i = g1;
        g1 = g2;
        g2 = i;
        len -= i;
      }
      if (g1 > 0 && len > 0) {
        i = len % g1 || g1;
        intPart = intDigits.substr(0, i);
        for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
        if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
        if (isNeg) intPart = "-" + intPart;
      }
      str = fractionPart ? intPart + (format2.decimalSeparator || "") + ((g2 = +format2.fractionGroupSize) ? fractionPart.replace(
        new RegExp("\\d{" + g2 + "}\\B", "g"),
        "$&" + (format2.fractionGroupSeparator || "")
      ) : fractionPart) : intPart;
    }
    return (format2.prefix || "") + str + (format2.suffix || "");
  };
  P.toFraction = function(md) {
    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s, x = this, xc = x.c;
    if (md != null) {
      n = new BigNumber2(md);
      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
        throw Error(bignumberError + "Argument " + (n.isInteger() ? "out of range: " : "not an integer: ") + valueOf(n));
      }
    }
    if (!xc) return new BigNumber2(x);
    d = new BigNumber2(ONE);
    n1 = d0 = new BigNumber2(ONE);
    d1 = n0 = new BigNumber2(ONE);
    s = coeffToString(xc);
    e = d.e = s.length - x.e - 1;
    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    md = !md || n.comparedTo(d) > 0 ? e > 0 ? d : n1 : n;
    exp = MAX_EXP;
    MAX_EXP = 1 / 0;
    n = new BigNumber2(s);
    n0.c[0] = 0;
    for (; ; ) {
      q = div(n, d, 0, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.comparedTo(md) == 1) break;
      d0 = d1;
      d1 = d2;
      n1 = n0.plus(q.times(d2 = n1));
      n0 = d2;
      d = n.minus(q.times(d2 = d));
      n = d2;
    }
    d2 = div(md.minus(d0), d1, 0, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    e = e * 2;
    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
      div(n0, d0, e, ROUNDING_MODE).minus(x).abs()
    ) < 1 ? [n1, d1] : [n0, d0];
    MAX_EXP = exp;
    return r;
  };
  P.toNumber = function() {
    return +valueOf(this);
  };
  P.toPrecision = function(sd, rm) {
    if (sd != null) intCheck(sd, 1, MAX);
    return format(this, sd, rm, 2);
  };
  P.toString = function(b) {
    var str, n = this, s = n.s, e = n.e;
    if (e === null) {
      if (s) {
        str = "Infinity";
        if (s < 0) str = "-" + str;
      } else {
        str = "NaN";
      }
    } else {
      if (b == null) {
        str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(coeffToString(n.c), e) : toFixedPoint(coeffToString(n.c), e, "0");
      } else if (b === 10 && alphabetHasNormalDecimalDigits) {
        n = round(new BigNumber2(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
        str = toFixedPoint(coeffToString(n.c), n.e, "0");
      } else {
        intCheck(b, 2, ALPHABET.length, "Base");
        str = convertBase(toFixedPoint(coeffToString(n.c), e, "0"), 10, b, s, true);
      }
      if (s < 0 && n.c[0]) str = "-" + str;
    }
    return str;
  };
  P.valueOf = P.toJSON = function() {
    return valueOf(this);
  };
  P._isBigNumber = true;
  P[Symbol.toStringTag] = "BigNumber";
  P[Symbol.for("nodejs.util.inspect.custom")] = P.valueOf;
  if (configObject != null) BigNumber2.set(configObject);
  return BigNumber2;
}
function bitFloor(n) {
  var i = n | 0;
  return n > 0 || n === i ? i : i - 1;
}
function coeffToString(a) {
  var s, z5, i = 1, j = a.length, r = a[0] + "";
  for (; i < j; ) {
    s = a[i++] + "";
    z5 = LOG_BASE - s.length;
    for (; z5--; s = "0" + s) ;
    r += s;
  }
  for (j = r.length; r.charCodeAt(--j) === 48; ) ;
  return r.slice(0, j + 1 || 1);
}
function compare(x, y) {
  var a, b, xc = x.c, yc = y.c, i = x.s, j = y.s, k = x.e, l = y.e;
  if (!i || !j) return null;
  a = xc && !xc[0];
  b = yc && !yc[0];
  if (a || b) return a ? b ? 0 : -j : i;
  if (i != j) return i;
  a = i < 0;
  b = k == l;
  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;
  if (!b) return k > l ^ a ? 1 : -1;
  j = (k = xc.length) < (l = yc.length) ? k : l;
  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;
  return k == l ? 0 : k > l ^ a ? 1 : -1;
}
function intCheck(n, min, max, name) {
  if (n < min || n > max || n !== mathfloor(n)) {
    throw Error(bignumberError + (name || "Argument") + (typeof n == "number" ? n < min || n > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
  }
}
function isOdd(n) {
  var k = n.c.length - 1;
  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
}
function toExponential(str, e) {
  return (str.length > 1 ? str.charAt(0) + "." + str.slice(1) : str) + (e < 0 ? "e" : "e+") + e;
}
function toFixedPoint(str, e, z5) {
  var len, zs;
  if (e < 0) {
    for (zs = z5 + "."; ++e; zs += z5) ;
    str = zs + str;
  } else {
    len = str.length;
    if (++e > len) {
      for (zs = z5, e -= len; --e; zs += z5) ;
      str += zs;
    } else if (e < len) {
      str = str.slice(0, e) + "." + str.slice(e);
    }
  }
  return str;
}
var BigNumber = clone();
var bignumber_default = BigNumber;

// src/plugins/communityInvestor/clients.ts
import * as dotenv from "dotenv";

// src/plugins/communityInvestor/constants.ts
var SOL_ADDRESS = "So11111111111111111111111111111111111111112";
var BTC_ADDRESS = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh";
var ETH_ADDRESS = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs";

// src/plugins/communityInvestor/clients.ts
dotenv.config();
var nextRpcRequestId = 1;
var DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 1e3,
  maxDelay: 3e4,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};
var RequestError = class extends Error {
  /**
   *  Constructor for creating a RequestError instance.
   *
   * @param {string} message - The error message for the RequestError instance.
   * @param {Response} [response] - Optional response object associated with the error.
   */
  constructor(message, response) {
    super(message);
    this.response = response;
    this.name = "RequestError";
  }
};
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var calculateDelay = (attempt, options) => {
  const delay = options.initialDelay * options.backoffFactor ** (attempt - 1);
  return Math.min(delay, options.maxDelay);
};
var isRetryableError = (error) => error.name === "TypeError" || error.name === "AbortError" || error instanceof RequestError;
var buildUrl = (url, params) => {
  if (!params) return url;
  const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value != null).map(([key, value]) => [key, String(value)])
  );
  const separator = url.includes("?") ? "&" : "?";
  const queryString = searchParams.toString();
  return queryString ? `${url}${separator}${queryString}` : url;
};
var http = {
  async request(url, options) {
    const { params, ...fetchOptions } = options || {};
    const fullUrl = buildUrl(url, params);
    const retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options?.retryOptions
    };
    let attempt = 1;
    while (true) {
      try {
        const res = await fetch(fullUrl, fetchOptions);
        if (!res.ok) {
          const errorText = await res.text();
          throw new RequestError(`Request failed with status ${res.status}: ${errorText}`, res);
        }
        return res;
      } catch (error) {
        if (isRetryableError(error) && attempt < retryOptions.maxRetries) {
          const delay = calculateDelay(attempt, retryOptions);
          console.warn(
            `Request failed with error: ${error.message}. Retrying in ${delay}ms (attempt ${attempt}/${retryOptions.maxRetries})`
          );
          await sleep(delay);
          attempt++;
          continue;
        }
        console.error(`Request failed after ${attempt} attempts:`, error);
        throw error;
      }
    }
  },
  async json(url, options) {
    const res = await this.request(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
    return await res.json();
  },
  get: {
    async request(url, params, options) {
      return http.request(url, {
        ...options,
        method: "GET",
        params
      });
    },
    async json(url, params, options) {
      return http.json(url, {
        ...options,
        method: "GET",
        params
      });
    }
  },
  post: {
    async request(url, body, options) {
      return http.request(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      });
    },
    async json(url, body, options) {
      return http.json(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      });
    }
  },
  async jsonrpc(url, method, params, headers) {
    return this.post.json(
      url,
      {
        jsonrpc: "2.0",
        id: nextRpcRequestId++,
        method,
        params
      },
      { headers }
    );
  },
  async graphql(url, query, variables, headers) {
    return this.post.json(
      url,
      {
        query,
        variables
      },
      { headers }
    );
  }
};
var JupiterClient = class _JupiterClient {
  static baseUrl = "https://api.jup.ag/swap/v1";
  static xApiKey = process.env.JUPITER_API_KEY || "";
  /**
   * Fetches a quote for a given input and output mint, amount, and slippage.
   * @param {string} inputMint The mint of the input token.
   * @param {string} outputMint The mint of the output token.
   * @param {string} amount The amount to be swapped.
   * @param {number} [slippageBps=50] The slippage tolerance in basis points (default: 50).
   * @returns {Promise<{inputMint: string, outputMint: string, inAmount: string, outAmount: string, routePlan: unknown[]} | {error: unknown}>} The quote object or an error object.
   */
  static async getQuote(inputMint, outputMint, amount, slippageBps = 50) {
    const headers = {};
    if (_JupiterClient.xApiKey) {
      headers["x-api-key"] = _JupiterClient.xApiKey;
    }
    const quote = await http.get.json(
      `${_JupiterClient.baseUrl}/quote`,
      {
        inputMint,
        outputMint,
        amount,
        slippageBps: slippageBps.toString()
      },
      { headers }
    );
    if ("error" in quote) {
      console.error("Quote error:", quote);
      throw new Error(`Failed to get quote: ${quote?.error || "Unknown error"}`);
    }
    return quote;
  }
  /**
   * Perform a swap operation using the provided quote data and user's wallet public key.
   * @param {any} quoteData - The data required for the swap operation.
   * @param {string} walletPublicKey - The public key of the user's wallet.
   * @returns {Promise<any>} The result of the swap operation.
   */
  static async swap(quoteData, walletPublicKey) {
    const headers = {};
    if (_JupiterClient.xApiKey) {
      headers["x-api-key"] = _JupiterClient.xApiKey;
    }
    const swapRequestBody = {
      quoteResponse: quoteData,
      userPublicKey: walletPublicKey,
      wrapAndUnwrapSol: true,
      computeUnitPriceMicroLamports: 2e6,
      dynamicComputeUnitLimit: true
    };
    const swapData = await http.post.json(`${_JupiterClient.baseUrl}/swap`, swapRequestBody, {
      headers
    });
    if (!swapData || !swapData.swapTransaction) {
      console.error("Swap error:", swapData);
      throw new Error(
        `Failed to get swap transaction: ${swapData?.error || "No swap transaction returned"}`
      );
    }
    return swapData;
  }
};
var DexscreenerClient = class _DexscreenerClient {
  /**
   * Constructor for the class.
   * @param {IAgentRuntime} runtime - The runtime passed as a parameter to the constructor.
   */
  constructor(runtime) {
    this.runtime = runtime;
  }
  /**
   * Create a new DexscreenerClient instance using the provided agent runtime.
   *
   * @param {IAgentRuntime} runtime - The agent runtime to use for creating the DexscreenerClient instance.
   * @returns {DexscreenerClient} A new instance of DexscreenerClient.
   */
  static createFromRuntime(runtime) {
    return new _DexscreenerClient(runtime);
  }
  /**
   * Makes an asynchronous HTTP request to the DexScreener API.
   *
   * @template T - The type of data expected to be returned
   * @param {string} path - The endpoint path for the API request
   * @param {QueryParams} [params] - Optional query parameters for the request
   * @param {DexscreenerOptions} [options] - Optional options for the request
   * @returns {Promise<T>} - A promise that resolves with the data returned from the API
   */
  async request(path4, params, options) {
    const cacheKey = [
      "dexscreener",
      buildUrl(path4, params)
      // remove first "/"
    ].filter(Boolean).join("/");
    if (options?.expires) {
      const cached = await this.runtime.getCache(cacheKey);
      if (cached) return cached;
    }
    const res = await http.get.json(`https://api.dexscreener.com/${path4}`, params);
    if (options?.expires) {
      await this.runtime.setCache(cacheKey, res);
    }
    return res;
  }
  /**
   * Asynchronously searches for DexScreener data based on the provided address.
   *
   * @param {string} address - The address to search for in DexScreener data.
   * @param {DexscreenerOptions} [options] - Optional parameters for the request.
   * @returns {Promise<DexScreenerData>} A promise that resolves with the DexScreener data.
   */
  async search(address, options) {
    try {
      const data = await this.request(
        "latest/dex/search",
        {
          q: address
        },
        options
      );
      if (!data || !data.pairs) {
        throw new Error("No DexScreener data available");
      }
      return data;
    } catch (error) {
      console.error("Error fetching DexScreener data:", error);
      return {
        schemaVersion: "1.0.0",
        pairs: []
      };
    }
  }
  /**
   * Asynchronously searches for the pair with the highest liquidity based on the given address.
   *
   * @param {string} address The address to search for liquidity pairs from.
   * @param {string} [chain] The chain ID to filter the liquidity pairs by.
   * @param {DexscreenerOptions} [options] Additional options for searching.
   * @returns {Promise<DexScreenerPair | null>} The pair with the highest liquidity, or null if no pairs were found.
   */
  async searchForHighestLiquidityPair(address, chain, options) {
    let { pairs } = await this.search(address, options);
    if (pairs.length === 0) {
      return null;
    }
    if (chain) {
      pairs = pairs.filter((pair) => pair.chainId === chain);
    }
    return pairs.sort((a, b) => {
      const liquidityA = a.liquidity?.usd ?? 0;
      const liquidityB = b.liquidity?.usd ?? 0;
      return liquidityB < liquidityA ? -1 : 1;
    })[0];
  }
};
var HeliusClient = class _HeliusClient {
  /**
   * Constructor for initializing an instance of class.
   *
   * @param apiKey - The API key to be used for authentication.
   * @param _runtime - The runtime environment for the agent.
   */
  constructor(apiKey, _runtime) {
    this.apiKey = apiKey;
  }
  runtime;
  /**
   * Creates a new HeliusClient instance using the provided IAgentRuntime.
   *
   * @param {IAgentRuntime} runtime - The IAgentRuntime to use for creating the HeliusClient.
   * @returns {HeliusClient} A new instance of HeliusClient.
   * @throws {Error} Thrown if HELIUS_API_KEY is missing from the runtime settings.
   */
  static createFromRuntime(runtime) {
    const apiKey = runtime.getSetting("HELIUS_API_KEY");
    if (!apiKey) {
      throw new Error("missing HELIUS_API_KEY");
    }
    return new _HeliusClient(apiKey, runtime);
  }
  /**
   * Fetches the list of token holders for a given address asynchronously.
   * If the option `expires` is provided and there is a cached version available, it returns the cached data.
   * Otherwise, it fetches the data from the Helius API using the provided address.
   *
   * @param {string} address - The address for which to fetch the list of token holders.
   * @param {Object} [options] - Optional parameters.
   * @param {string | CacheOptions["expires"]} [options.expires] - The expiration date for caching the data.
   *
   * @returns {Promise<HolderData[]>} A promise that resolves to an array of HolderData objects representing the token holders.
   */
  async fetchHolderList(address, options) {
    if (options?.expires) {
      const cached = await this.runtime.getCache(`helius/token-holders/${address}`);
      if (cached) return cached;
    }
    const allHoldersMap = /* @__PURE__ */ new Map();
    let page = 1;
    const limit = 1e3;
    let cursor;
    const url = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    try {
      while (true) {
        const params = {
          limit,
          displayOptions: {},
          mint: address,
          cursor
        };
        if (cursor !== void 0) {
          params.cursor = cursor;
        }
        if (page > 2) {
          break;
        }
        const data = await http.jsonrpc(url, "getTokenAccounts", params);
        if (!data || !data.result || !data.result.token_accounts || data.result.token_accounts.length === 0) {
          break;
        }
        data.result.token_accounts.forEach((account) => {
          const owner = account.owner;
          const balance = Number.parseFloat(account.amount);
          if (allHoldersMap.has(owner)) {
            allHoldersMap.set(owner, allHoldersMap.get(owner) + balance);
          } else {
            allHoldersMap.set(owner, balance);
          }
        });
        cursor = data.result.cursor;
        page++;
      }
      const holders = Array.from(allHoldersMap.entries()).map(
        ([address2, balance]) => ({
          address: address2,
          balance: balance.toString()
        })
      );
      if (options?.expires)
        await this.runtime.setCache(`helius/token-holders/${address}`, holders);
      return holders;
    } catch (error) {
      console.error("Error fetching holder list from Helius:", error);
      throw new Error("Failed to fetch holder list from Helius.");
    }
  }
};
var CoingeckoClient = class _CoingeckoClient {
  /**
   * Constructor for initializing a new instance of the class.
   * @param apiKey The API key used for authentication.
   * @param runtime The agent runtime implementation.
   */
  constructor(apiKey, runtime) {
    this.apiKey = apiKey;
    this.runtime = runtime;
  }
  /**
   * Creates a new instance of CoingeckoClient using the apiKey retrieved from the provided runtime.
   * @param {IAgentRuntime} runtime - The runtime object that contains the COINGECKO_API_KEY setting.
   * @throws {Error} If COINGECKO_API_KEY setting is missing in the runtime object.
   * @returns {CoingeckoClient} A new instance of CoingeckoClient initialized with the apiKey and runtime.
   */
  static createFromRuntime(runtime) {
    const apiKey = runtime.getSetting("COINGECKO_API_KEY");
    if (!apiKey) {
      throw new Error("missing COINGECKO_API_KEY");
    }
    return new _CoingeckoClient(apiKey, runtime);
  }
  /**
   * Makes an asynchronous HTTP request to the Coingecko API.
   * @template T
   * @param {string} path - The API endpoint to call.
   * @param {QueryParams} [params] - Optional query parameters to include in the request.
   * @param {CoingeckoOptions} [options] - Additional options for the request.
   * @returns {Promise<T>} The response data from the API.
   */
  async request(path4, params, options) {
    const cacheKey = ["coingecko", buildUrl(path4, params)].filter(Boolean).join("/");
    if (options?.expires) {
      const cached = await this.runtime.getCache(cacheKey);
      if (cached) return cached;
    }
    const res = await http.get.json(`https://api.coingecko.com/api/v3/${path4}`, params, {
      headers: {
        "x-cg-demo-api-key": this.apiKey
      }
    });
    if (options?.expires) {
      await this.runtime.setCache(cacheKey, res);
    }
    return res;
  }
  /**
   * Fetches prices for specified cryptocurrencies from the Coingecko API.
   *
   * @param {CoingeckoOptions} [options] The options for the Coingecko API request.
   * @returns {Promise<Prices>} A Promise that resolves to the prices of the specified cryptocurrencies.
   */
  async fetchPrices(options) {
    const prices = await this.request(
      "simple/price",
      {
        ids: "solana,bitcoin,ethereum",
        vs_currencies: "usd"
      },
      options
    );
    return prices;
  }
  /**
   * Asynchronously fetches global data.
   *
   * @returns {Promise} The promise containing the global data.
   */
  async fetchGlobal() {
    return this.request(
      "global",
      {},
      {
        expires: "30m"
      }
    );
  }
  /**
   * Asynchronously fetches a list of coin categories.
   * @returns {Promise} The Promise object representing the result of the fetch operation.
   */
  async fetchCategories() {
    return this.request(
      "coins/categories",
      {},
      {
        expires: "30m"
      }
    );
  }
};
var BirdeyeClient = class _BirdeyeClient {
  /**
   * Constructor for initializing a new instance.
   *
   * @param apiKey The API key to be used.
   * @param runtime The agent runtime for handling communication with the runtime environment.
   */
  constructor(apiKey, runtime) {
    this.apiKey = apiKey;
    this.runtime = runtime;
  }
  static url = "https://public-api.birdeye.so/";
  /**
   * Send a request to the Birdeye API using the provided API key, path, query parameters, and headers.
   *
   * @param {string} apiKey - The API key for authenticating the request.
   * @param {string} path - The endpoint path to send the request to.
   * @param {QueryParams} [params] - Optional query parameters to include in the request.
   * @param {BirdeyeClientHeaders} [headers] - Optional additional headers to include in the request.
   * @returns {Promise<T>} A Promise that resolves with the data received from the API request.
   */
  static async request(apiKey, path4, params, headers) {
    const res = await http.get.json(
      _BirdeyeClient.url + path4,
      params,
      {
        headers: {
          ...headers,
          "X-API-KEY": apiKey
        }
      }
    );
    if (!res.success || !res.data) {
      console.error({ res });
      throw new Error(`Birdeye request failed:${path4}`);
    }
    return res.data;
  }
  /**
   * Create a new BirdeyeClient instance using the provided IAgentRuntime object.
   *
   * @param {IAgentRuntime} runtime - The IAgentRuntime object that provides access to runtime settings.
   * @returns {BirdeyeClient} A new instance of BirdeyeClient initialized with the provided API key and runtime.
   * @throws {Error} Thrown if the BIRDEYE_API_KEY setting is missing in the runtime object.
   */
  static createFromRuntime(runtime) {
    const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
    if (!apiKey) {
      throw new Error("missing BIRDEYE_API_KEY");
    }
    return new _BirdeyeClient(apiKey, runtime);
  }
  /**
   * Performs a request to the specified path with given query parameters and options.
   * @template T
   * @param {string} path - The path to request.
   * @param {QueryParams} params - The query parameters to include in the request.
   * @param {BirdeyeRequestOptions} [options] - Optional request options.
   * @param {boolean} [forceRefresh] - Flag to force refresh the cache.
   * @returns {Promise<T>} The response data from the request.
   */
  async request(path4, params, options, forceRefresh) {
    const cacheKey = ["birdeye", options?.chain, buildUrl(path4, params)].filter(Boolean).join("/");
    if (options?.expires && !forceRefresh) {
      const cached = await this.runtime.getCache(cacheKey);
      if (cached) return cached;
    }
    const response = await _BirdeyeClient.request(
      this.apiKey,
      path4,
      params,
      options?.chain ? {
        "x-chain": options.chain
      } : void 0
    );
    if (options?.expires) {
      await this.runtime.setCache(cacheKey, response);
    }
    return response;
  }
  /**
   * Fetches the price for a given address.
   *
   * @param {string} address - The address for which to fetch the price.
   * @param {BirdeyeRequestOptions} [options] - The options for the Birdeye request.
   * @returns {Promise<number>} The price value fetched for the given address.
   */
  async fetchPrice(address, options) {
    const price = await this.request("defi/price", { address }, options);
    return price.value;
  }
  /**
   * Fetches the latest prices for Bitcoin, Ethereum, and Solana in USD from the DeFi API.
   * @returns {Promise<Prices>} The latest prices for Bitcoin, Ethereum, and Solana in USD.
   */
  async fetchPrices() {
    const prices = await this.request(
      "defi/multi_price",
      { list_address: [SOL_ADDRESS, ETH_ADDRESS, BTC_ADDRESS].join(",") },
      {
        chain: "solana",
        expires: "5m"
      }
    );
    return {
      bitcoin: { usd: prices[BTC_ADDRESS].value.toString() },
      ethereum: { usd: prices[ETH_ADDRESS].value.toString() },
      solana: { usd: prices[SOL_ADDRESS].value.toString() }
    };
  }
  /**
   * Fetches token overview for a specific address.
   *
   * @param {string} address The address of the token for which overview is to be fetched.
   * @param {BirdeyeRequestOptions} [options] Additional options for the Birdeye request.
   * @param {boolean} [forceRefresh=false] Flag to force refresh the data.
   * @returns {Promise<TokenOverview>} Promise that resolves to the token overview.
   */
  async fetchTokenOverview(address, options, forceRefresh = false) {
    const token = await this.request(
      "defi/token_overview",
      { address },
      options,
      forceRefresh
    );
    return token;
  }
  /**
   * Fetches token security data from the API for a given address.
   * @param {string} address - The address of the token for which to fetch security data.
   * @param {BirdeyeRequestOptions} [options] - Optional request options.
   * @returns {Promise<TokenSecurityData>} A promise that resolves with the token security data.
   */
  async fetchTokenSecurity(address, options) {
    const security = await this.request(
      "defi/token_security",
      { address },
      options
    );
    return security;
  }
  /**
   * Fetches token trade data for a specific address.
   * @param {string} address - The address of the token.
   * @param {BirdeyeRequestOptions} [options] - Optional request options.
   * @returns {Promise<TokenTradeData>} - A promise that resolves with the token trade data.
   */
  async fetchTokenTradeData(address, options) {
    const tradeData = await this.request(
      "defi/v3/token/trade-data/single",
      { address },
      options
    );
    return tradeData;
  }
  /**
   * Fetches the wallet token list for a given address.
   *
   * @param {string} address - The address of the wallet to fetch the token list for.
   * @param {BirdeyeRequestOptions} [options] - Additional options for the request.
   * @returns {Promise<WalletTokenList>} The wallet token list for the specified address.
   */
  async fetchWalletTokenList(address, options) {
    const tokenList = await this.request(
      "v1/wallet/token_list",
      { wallet: address },
      options
    );
    return tokenList;
  }
  /**
   * Asynchronously fetches the portfolio value for a given address.
   *
   * @param {string} address - The address for which to fetch the portfolio value.
   * @param {BirdeyeRequestOptions} [options] - The optional request options.
   * @returns {Promise<WalletPortfolio>} - A promise that resolves to the wallet portfolio object containing total USD, total SOL, and portfolio items.
   * @throws {Error} - If an error occurs while fetching the portfolio value.
   */
  async fetchPortfolioValue(address, options) {
    try {
      const portfolio = {
        totalUsd: "0",
        totalSol: "0",
        items: []
      };
      const tokenList = await this.fetchWalletTokenList(address, options);
      const totalUsd = new bignumber_default(tokenList.totalUsd.toString());
      const solPriceInUSD = new bignumber_default(await this.fetchPrice(SOL_ADDRESS));
      const items = tokenList.items.map((item) => ({
        address: item.address,
        name: item.name || "Unknown",
        symbol: item.symbol || "Unknown",
        decimals: item.decimals,
        valueSol: new bignumber_default(item.valueUsd || 0).div(solPriceInUSD).toFixed(6),
        priceUsd: item.priceUsd?.toString() || "0",
        valueUsd: item.valueUsd?.toString() || "0",
        uiAmount: item.uiAmount?.toString() || "0",
        balance: item.balance?.toString() || "0"
      }));
      const totalSol = totalUsd.div(solPriceInUSD);
      portfolio.totalUsd = totalUsd.toString();
      portfolio.totalSol = totalSol.toFixed(6);
      portfolio.items = items.sort(
        (a, b) => new bignumber_default(b.valueUsd).minus(new bignumber_default(a.valueUsd)).toNumber()
      );
      return portfolio;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  }
};
var units = {
  ms: 1,
  s: 1e3,
  m: 60 * 1e3,
  h: 60 * 60 * 1e3,
  d: 24 * 60 * 60 * 1e3
};

// src/plugins/communityInvestor/config.ts
var DEFAULT_TRADING_CONFIG = {
  slippageBps: 100,
  // 1%
  forceSimulation: false,
  defaultChain: "solana",
  maxPositionsPerToken: 3,
  maxPositionsPerRecommender: 5,
  minLiquidityUsd: 1e4,
  // $10k
  maxMarketCapUsd: 1e8,
  // $100M
  buyAmountConfig: {
    baseAmount: 0.1,
    // 0.1 SOL
    minAmount: 0.01,
    // 0.01 SOL
    maxAmount: 1,
    // 1 SOL
    trustScoreMultiplier: 0.5,
    convictionMultiplier: 0.3
  }
};
function getConvictionMultiplier(conviction) {
  switch (conviction) {
    case "NONE" /* NONE */:
      return 0;
    case "LOW" /* LOW */:
      return 0.5;
    case "MEDIUM" /* MEDIUM */:
      return 1;
    case "HIGH" /* HIGH */:
      return 1.5;
    case "VERY_HIGH" /* VERY_HIGH */:
      return 2;
    default:
      return 1;
  }
}
function getLiquidityMultiplier(liquidity) {
  if (liquidity < 1e4) return 0.5;
  if (liquidity < 5e4) return 0.75;
  if (liquidity < 1e5) return 1;
  if (liquidity < 5e5) return 1.25;
  return 1.5;
}
function getMarketCapMultiplier(marketCap) {
  if (marketCap < 1e5) return 1.5;
  if (marketCap < 1e6) return 1.25;
  if (marketCap < 1e7) return 1;
  if (marketCap < 5e7) return 0.75;
  return 0.5;
}
function getVolumeMultiplier(volume) {
  if (volume < 1e4) return 0.5;
  if (volume < 5e4) return 0.75;
  if (volume < 1e5) return 1;
  if (volume < 5e5) return 1.25;
  return 1.5;
}

// src/plugins/communityInvestor/tradingService.ts
var CommunityInvestorService = class _CommunityInvestorService extends Service {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
    this.birdeyeClient = BirdeyeClient.createFromRuntime(runtime);
    this.dexscreenerClient = DexscreenerClient.createFromRuntime(runtime);
    try {
      this.coingeckoClient = CoingeckoClient.createFromRuntime(runtime);
    } catch (error) {
      logger8.warn("Failed to initialize Coingecko client, prices may be limited:", error);
    }
    try {
      this.heliusClient = HeliusClient.createFromRuntime(runtime);
    } catch (error) {
      logger8.warn("Failed to initialize Helius client, holder data will be limited:", error);
    }
    this.tradingConfig = DEFAULT_TRADING_CONFIG;
  }
  static serviceType = ServiceType.COMMUNITY_INVESTOR;
  capabilityDescription = "The agent is able to trade on the Solana blockchain";
  // Client instances
  birdeyeClient;
  dexscreenerClient;
  coingeckoClient = null;
  heliusClient = null;
  // Configuration
  tradingConfig;
  // Event listeners
  eventListeners = /* @__PURE__ */ new Map();
  static async start(runtime) {
    const tradingService = new _CommunityInvestorService(runtime);
    return tradingService;
  }
  static async stop(runtime) {
    const tradingService = runtime.getService("trading");
    if (tradingService) {
      await tradingService.stop();
    }
  }
  async stop() {
    return Promise.resolve();
  }
  /**
   * Add an event listener for trading events
   */
  addEventListener(eventId, listener) {
    if (!this.eventListeners.has(eventId)) {
      this.eventListeners.set(eventId, []);
    }
    this.eventListeners.get(eventId).push(listener);
  }
  /**
   * Remove an event listener
   */
  removeEventListener(eventId) {
    logger8.debug("removing event listener", eventId);
    this.eventListeners.delete(eventId);
  }
  /**
   * Emit a trading event to all listeners
   */
  emitEvent(event) {
    logger8.debug("emitting event", event);
    for (const listeners of this.eventListeners.values()) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          logger8.error("Error in event listener:", error);
        }
      }
    }
  }
  /**
   * Process a buy signal from an entity
   */
  async processBuySignal(buySignal, entity) {
    logger8.debug("processing buy signal", buySignal, entity);
    try {
      const tokenPerformance = await this.getOrFetchTokenPerformance(
        buySignal.tokenAddress,
        buySignal.chain || this.tradingConfig.defaultChain
      );
      if (!tokenPerformance) {
        logger8.error(`Token not found: ${buySignal.tokenAddress}`);
        return null;
      }
      if (!this.validateToken(tokenPerformance)) {
        logger8.error(`Token failed validation: ${buySignal.tokenAddress}`);
        return null;
      }
      const recommendation = await this.createTokenRecommendation(
        entity.id,
        tokenPerformance,
        buySignal.conviction || "MEDIUM" /* MEDIUM */,
        "BUY" /* BUY */
      );
      if (!recommendation) {
        logger8.error(`Failed to create recommendation for token: ${buySignal.tokenAddress}`);
        return null;
      }
      const buyAmount = this.calculateBuyAmount(
        entity,
        buySignal.conviction || "MEDIUM" /* MEDIUM */,
        tokenPerformance
      );
      const position = await this.createPosition(
        recommendation.id,
        entity.id,
        buySignal.tokenAddress,
        buySignal.walletAddress || "simulation",
        buyAmount,
        tokenPerformance.price?.toString() || "0",
        buySignal.isSimulation || this.tradingConfig.forceSimulation
      );
      if (!position) {
        logger8.error(`Failed to create position for token: ${buySignal.tokenAddress}`);
        return null;
      }
      await this.recordTransaction(
        position.id,
        buySignal.tokenAddress,
        "BUY" /* BUY */,
        buyAmount,
        tokenPerformance.price || 0,
        position.isSimulation
      );
      this.emitEvent({ type: "position_opened", position });
      return position;
    } catch (error) {
      logger8.error("Error processing buy signal:", error);
      return null;
    }
  }
  /**
   * Process a sell signal for an existing position
   */
  async processSellSignal(positionId, _sellRecommenderId) {
    try {
      logger8.debug("processing sell signal", positionId, _sellRecommenderId);
      const position = await this.getPosition(positionId);
      if (!position) {
        logger8.error(`Position not found: ${positionId}`);
        return false;
      }
      if (position.closedAt) {
        logger8.error(`Position already closed: ${positionId}`);
        return false;
      }
      const tokenPerformance = await this.getOrFetchTokenPerformance(
        position.tokenAddress,
        position.chain
      );
      if (!tokenPerformance) {
        logger8.error(`Token not found: ${position.tokenAddress}`);
        return false;
      }
      const initialPrice = Number.parseFloat(position.initialPrice);
      const currentPrice = tokenPerformance.price || 0;
      const priceChange = initialPrice > 0 ? (currentPrice - initialPrice) / initialPrice : 0;
      const updatedPosition = {
        ...position,
        currentPrice: currentPrice.toString(),
        closedAt: /* @__PURE__ */ new Date()
      };
      await this.storePosition(updatedPosition);
      await this.recordTransaction(
        position.id,
        position.tokenAddress,
        "SELL" /* SELL */,
        BigInt(position.amount),
        currentPrice,
        position.isSimulation
      );
      await this.updateRecommenderMetrics(position.entityId, priceChange * 100);
      this.emitEvent({ type: "position_closed", position: updatedPosition });
      return true;
    } catch (error) {
      logger8.error("Error processing sell signal:", error);
      return false;
    }
  }
  /**
   * Handle a recommendation from a entity
   */
  async handleRecommendation(entity, recommendation) {
    try {
      logger8.debug("handling recommendation", entity, recommendation);
      const tokenPerformance = await this.getOrFetchTokenPerformance(
        recommendation.tokenAddress,
        recommendation.chain
      );
      if (!tokenPerformance) {
        logger8.error(`Token not found: ${recommendation.tokenAddress}`);
        return null;
      }
      const tokenRecommendation = await this.createTokenRecommendation(
        entity.id,
        tokenPerformance,
        recommendation.conviction,
        recommendation.type
      );
      if (!tokenRecommendation) {
        logger8.error(`Failed to create recommendation for token: ${recommendation.tokenAddress}`);
        return null;
      }
      if (recommendation.type === "BUY" /* BUY */) {
        const buyAmount = this.calculateBuyAmount(
          entity,
          recommendation.conviction,
          tokenPerformance
        );
        const position = await this.createPosition(
          tokenRecommendation.id,
          entity.id,
          recommendation.tokenAddress,
          "simulation",
          // Use simulation wallet by default
          buyAmount,
          tokenPerformance.price?.toString() || "0",
          true
          // Simulation by default
        );
        if (!position) {
          logger8.error(`Failed to create position for token: ${recommendation.tokenAddress}`);
          return null;
        }
        await this.recordTransaction(
          position.id,
          recommendation.tokenAddress,
          "BUY" /* BUY */,
          buyAmount,
          tokenPerformance.price || 0,
          true
          // Simulation by default
        );
        return position;
      }
      return null;
    } catch (error) {
      logger8.error("Error handling recommendation:", error);
      return null;
    }
  }
  /**
   * Check if a wallet is registered for a chain
   */
  hasWallet(chain) {
    logger8.debug("hasWallet", chain);
    return chain.toLowerCase() === "solana";
  }
  // ===================== TOKEN PROVIDER METHODS =====================
  /**
   * Get token overview data
   */
  async getTokenOverview(chain, tokenAddress, forceRefresh = false) {
    try {
      logger8.debug("getting token overview", chain, tokenAddress, forceRefresh);
      if (!forceRefresh) {
        const cacheKey = `token:${chain}:${tokenAddress}:overview`;
        const cachedData = await this.runtime.getCache(cacheKey);
        if (cachedData) {
          return cachedData;
        }
        const tokenPerformance = await this.getTokenPerformance(tokenAddress, chain);
        if (tokenPerformance) {
          const tokenData = {
            chain: tokenPerformance.chain || chain,
            address: tokenPerformance.address || tokenAddress,
            name: tokenPerformance.name || "",
            symbol: tokenPerformance.symbol || "",
            decimals: tokenPerformance.decimals || 0,
            metadata: tokenPerformance.metadata || {},
            price: tokenPerformance.price || 0,
            priceUsd: tokenPerformance.price?.toString() || "0",
            price24hChange: tokenPerformance.price24hChange || 0,
            marketCap: tokenPerformance.currentMarketCap || 0,
            liquidityUsd: tokenPerformance.liquidity || 0,
            volume24h: tokenPerformance.volume || 0,
            volume24hChange: tokenPerformance.volume24hChange || 0,
            trades: tokenPerformance.trades || 0,
            trades24hChange: tokenPerformance.trades24hChange || 0,
            uniqueWallet24h: 0,
            // Would need to be fetched
            uniqueWallet24hChange: 0,
            // Would need to be fetched
            holders: tokenPerformance.holders || 0
          };
          await this.runtime.setCache(cacheKey, tokenData);
          return tokenData;
        }
      }
      if (chain.toLowerCase() === "solana") {
        const [dexScreenerData, birdeyeData] = await Promise.all([
          this.dexscreenerClient.searchForHighestLiquidityPair(tokenAddress, chain, {
            expires: "5m"
          }),
          this.birdeyeClient.fetchTokenOverview(tokenAddress, { expires: "5m" }, forceRefresh)
        ]);
        const tokenData = {
          chain,
          address: tokenAddress,
          name: birdeyeData?.name || dexScreenerData?.baseToken?.name || "",
          symbol: birdeyeData?.symbol || dexScreenerData?.baseToken?.symbol || "",
          decimals: birdeyeData?.decimals || 9,
          // Default for Solana tokens
          metadata: {
            logoURI: birdeyeData?.logoURI || "",
            pairAddress: dexScreenerData?.pairAddress || "",
            dexId: dexScreenerData?.dexId || ""
          },
          price: Number.parseFloat(dexScreenerData?.priceUsd || "0"),
          priceUsd: dexScreenerData?.priceUsd || "0",
          price24hChange: dexScreenerData?.priceChange?.h24 || 0,
          marketCap: dexScreenerData?.marketCap || 0,
          liquidityUsd: dexScreenerData?.liquidity?.usd || 0,
          volume24h: dexScreenerData?.volume?.h24 || 0,
          volume24hChange: 0,
          // Need to calculate from historical data
          trades: 0,
          // Would need additional data
          trades24hChange: 0,
          // Would need additional data
          uniqueWallet24h: 0,
          // Would need additional data
          uniqueWallet24hChange: 0,
          // Would need additional data
          holders: 0
        };
        const cacheKey = `token:${chain}:${tokenAddress}:overview`;
        await this.runtime.setCache(cacheKey, tokenData);
        return tokenData;
      }
      throw new Error(`Chain ${chain} not supported`);
    } catch (error) {
      logger8.error(`Error fetching token overview for ${tokenAddress}:`, error);
      throw error;
    }
  }
  /**
   * Resolve a ticker to a token address
   */
  async resolveTicker(chain, ticker) {
    logger8.debug("resolving ticker", chain, ticker);
    const cacheKey = `ticker:${chain}:${ticker}`;
    const cachedAddress = await this.runtime.getCache(cacheKey);
    if (cachedAddress) {
      return cachedAddress;
    }
    if (chain.toLowerCase() === "solana") {
      const result = await this.dexscreenerClient.searchForHighestLiquidityPair(ticker, chain, {
        expires: "5m"
      });
      const address = result?.baseToken?.address || null;
      if (address) {
        await this.runtime.setCache(cacheKey, address);
      }
      return address;
    }
    throw new Error(`Chain ${chain} not supported for ticker resolution`);
  }
  /**
   * Get current price for a token
   */
  async getCurrentPrice(chain, tokenAddress) {
    logger8.debug("getting current price", chain, tokenAddress);
    try {
      const cacheKey = `token:${chain}:${tokenAddress}:price`;
      const cachedPrice = await this.runtime.getCache(cacheKey);
      if (cachedPrice) {
        return Number.parseFloat(cachedPrice);
      }
      const token = await this.getTokenPerformance(tokenAddress, chain);
      if (token?.price) {
        await this.runtime.setCache(cacheKey, token.price.toString());
        return token.price;
      }
      if (chain.toLowerCase() === "solana") {
        const price = await this.birdeyeClient.fetchPrice(tokenAddress, {
          chain: "solana"
        });
        await this.runtime.setCache(cacheKey, price.toString());
        return price;
      }
      throw new Error(`Chain ${chain} not supported for price fetching`);
    } catch (error) {
      logger8.error(`Error fetching current price for ${tokenAddress}:`, error);
      return 0;
    }
  }
  /**
   * Determine if a token should be traded
   */
  async shouldTradeToken(chain, tokenAddress) {
    logger8.debug("shouldTradeToken", chain, tokenAddress);
    try {
      const tokenData = await this.getProcessedTokenData(chain, tokenAddress);
      if (!tokenData) return false;
      const { tradeData, security, dexScreenerData } = tokenData;
      if (!dexScreenerData || !dexScreenerData.pairs || dexScreenerData.pairs.length === 0) {
        return false;
      }
      const pair = dexScreenerData.pairs[0];
      if (!pair.liquidity || pair.liquidity.usd < this.tradingConfig.minLiquidityUsd) {
        return false;
      }
      if (!pair.marketCap || pair.marketCap > this.tradingConfig.maxMarketCapUsd) {
        return false;
      }
      if (security && security.top10HolderPercent > 80) {
        return false;
      }
      if (tradeData && tradeData.volume_24h_usd < 1e3) {
        return false;
      }
      return true;
    } catch (error) {
      logger8.error(`Error checking if token ${tokenAddress} should be traded:`, error);
      return false;
    }
  }
  /**
   * Get processed token data with security and trade information
   */
  async getProcessedTokenData(chain, tokenAddress) {
    logger8.debug("getting processed token data", chain, tokenAddress);
    try {
      const cacheKey = `token:${chain}:${tokenAddress}:processed`;
      const cachedData = await this.runtime.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      if (chain.toLowerCase() === "solana") {
        const dexScreenerData = await this.dexscreenerClient.search(tokenAddress, {
          expires: "5m"
        });
        let tokenTradeData;
        let tokenSecurityData;
        try {
          tokenTradeData = await this.birdeyeClient.fetchTokenTradeData(tokenAddress, {
            chain: "solana",
            expires: "5m"
          });
          tokenSecurityData = await this.birdeyeClient.fetchTokenSecurity(tokenAddress, {
            chain: "solana",
            expires: "5m"
          });
        } catch (error) {
          logger8.error(`Error fetching token data for ${tokenAddress}:`, error);
          return null;
        }
        let tokenInfo;
        const holderDistributionTrend = await this.analyzeHolderDistribution(tokenTradeData);
        let highValueHolders = [];
        let highSupplyHoldersCount = 0;
        if (this.heliusClient) {
          try {
            const holders = await this.heliusClient.fetchHolderList(tokenAddress, {
              expires: "30m"
            });
            const tokenPrice = Number.parseFloat(tokenTradeData.price.toString());
            highValueHolders = holders.filter((holder) => {
              const balance = Number.parseFloat(holder.balance);
              const balanceUsd = balance * tokenPrice;
              return balanceUsd > 5;
            }).map((holder) => ({
              holderAddress: holder.address,
              balanceUsd: (Number.parseFloat(holder.balance) * tokenPrice).toFixed(2)
            }));
            const totalSupply = tokenInfo?.totalSupply || "0";
            highSupplyHoldersCount = holders.filter((holder) => {
              const holderRatio = Number.parseFloat(holder.balance) / Number.parseFloat(totalSupply);
              return holderRatio > 0.02;
            }).length;
          } catch (error) {
            logger8.warn(`Error fetching holder data for ${tokenAddress}:`, error);
          }
        }
        const recentTrades = tokenTradeData.volume_24h > 0;
        const isDexScreenerListed = dexScreenerData.pairs.length > 0;
        const isDexScreenerPaid = dexScreenerData.pairs.some(
          (pair) => pair.boosts && pair.boosts.active > 0
        );
        const processedData = {
          token: {
            address: tokenAddress,
            name: tokenInfo?.name || dexScreenerData.pairs[0]?.baseToken?.name || "",
            symbol: tokenInfo?.symbol || dexScreenerData.pairs[0]?.baseToken?.symbol || "",
            decimals: tokenInfo?.decimals || 9,
            // Default for Solana
            logoURI: tokenInfo?.info?.imageThumbUrl || ""
          },
          security: tokenSecurityData,
          tradeData: tokenTradeData,
          holderDistributionTrend,
          highValueHolders,
          recentTrades,
          highSupplyHoldersCount,
          dexScreenerData,
          isDexScreenerListed,
          isDexScreenerPaid
        };
        await this.runtime.setCache(cacheKey, processedData);
        return processedData;
      }
      throw new Error(`Chain ${chain} not supported for processed token data`);
    } catch (error) {
      logger8.error(`Error fetching processed token data for ${tokenAddress}:`, error);
      return null;
    }
  }
  /**
   * Analyze holder distribution trend
   */
  async analyzeHolderDistribution(tradeData) {
    logger8.debug("analyzing holder distribution", tradeData);
    const intervals = [
      {
        period: "30m",
        change: tradeData.unique_wallet_30m_change_percent
      },
      { period: "1h", change: tradeData.unique_wallet_1h_change_percent },
      { period: "2h", change: tradeData.unique_wallet_2h_change_percent },
      { period: "4h", change: tradeData.unique_wallet_4h_change_percent },
      { period: "8h", change: tradeData.unique_wallet_8h_change_percent },
      {
        period: "24h",
        change: tradeData.unique_wallet_24h_change_percent
      }
    ];
    const validChanges = intervals.map((interval) => interval.change).filter((change) => change !== null && change !== void 0);
    if (validChanges.length === 0) {
      return "stable";
    }
    const averageChange = validChanges.reduce((acc, curr) => acc + curr, 0) / validChanges.length;
    const increaseThreshold = 10;
    const decreaseThreshold = -10;
    if (averageChange > increaseThreshold) {
      return "increasing";
    }
    if (averageChange < decreaseThreshold) {
      return "decreasing";
    }
    return "stable";
  }
  // ===================== SCORE MANAGER METHODS =====================
  /**
   * Update token performance data
   */
  async updateTokenPerformance(chain, tokenAddress) {
    logger8.debug("updating token performance", chain, tokenAddress);
    try {
      const tokenData = await this.getTokenOverview(chain, tokenAddress, true);
      const performance = {
        chain,
        address: tokenAddress,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        price: Number.parseFloat(tokenData.priceUsd),
        volume: tokenData.volume24h,
        liquidity: tokenData.liquidityUsd,
        currentMarketCap: tokenData.marketCap,
        holders: tokenData.holders,
        price24hChange: tokenData.price24hChange,
        volume24hChange: tokenData.volume24hChange,
        metadata: tokenData.metadata,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      await this.storeTokenPerformance(performance);
      this.emitEvent({
        type: "token_performance_updated",
        performance
      });
      return performance;
    } catch (error) {
      logger8.error(`Error updating token performance for ${tokenAddress}:`, error);
      throw error;
    }
  }
  /**
   * Calculate risk score for a token
   */
  calculateRiskScore(token) {
    logger8.debug("calculating risk score", token);
    let score = 50;
    const liquidity = token.liquidity || 0;
    score -= getLiquidityMultiplier(liquidity);
    const marketCap = token.currentMarketCap || 0;
    score += getMarketCapMultiplier(marketCap);
    const volume = token.volume || 0;
    score -= getVolumeMultiplier(volume);
    if (token.rugPull) score += 30;
    if (token.isScam) score += 30;
    if (token.rapidDump) score += 15;
    if (token.suspiciousVolume) score += 15;
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Update entity metrics based on their recommendation performance
   */
  async updateRecommenderMetrics(entityId, performance = 0) {
    logger8.debug("updating recommender metrics", entityId, performance);
    const metrics = await this.getRecommenderMetrics(entityId);
    if (!metrics) {
      await this.initializeRecommenderMetrics(entityId, "default");
      return;
    }
    const updatedMetrics = {
      ...metrics,
      totalRecommendations: metrics.totalRecommendations + 1,
      successfulRecs: performance > 0 ? metrics.successfulRecs + 1 : metrics.successfulRecs,
      avgTokenPerformance: (metrics.avgTokenPerformance * metrics.totalRecommendations + performance) / (metrics.totalRecommendations + 1),
      trustScore: this.calculateTrustScore(metrics, performance)
    };
    await this.storeRecommenderMetrics(updatedMetrics);
    const historyEntry = {
      entityId,
      metrics: updatedMetrics,
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.storeRecommenderMetricsHistory(historyEntry);
  }
  /**
   * Calculate trust score based on metrics and new performance
   */
  calculateTrustScore(metrics, newPerformance) {
    logger8.debug("calculating trust score", metrics, newPerformance);
    const HISTORY_WEIGHT = 0.7;
    const NEW_PERFORMANCE_WEIGHT = 0.3;
    const newSuccessRate = (metrics.successfulRecs + (newPerformance > 0 ? 1 : 0)) / (metrics.totalRecommendations + 1);
    const consistencyScore = metrics.consistencyScore || 50;
    const newTrustScore = metrics.trustScore * HISTORY_WEIGHT + (newPerformance > 0 ? 100 : 0) * NEW_PERFORMANCE_WEIGHT;
    const successFactor = newSuccessRate * 100;
    const combinedScore = newTrustScore * 0.6 + successFactor * 0.3 + consistencyScore * 0.1;
    return Math.max(0, Math.min(100, combinedScore));
  }
  // ===================== POSITION METHODS =====================
  /**
   * Get or fetch token performance data
   */
  async getOrFetchTokenPerformance(tokenAddress, chain) {
    logger8.debug("getting or fetching token performance", tokenAddress, chain);
    try {
      let tokenPerformance = await this.getTokenPerformance(tokenAddress, chain);
      if (!tokenPerformance) {
        const tokenOverview = await this.getTokenOverview(chain, tokenAddress);
        tokenPerformance = {
          chain,
          address: tokenAddress,
          name: tokenOverview.name,
          symbol: tokenOverview.symbol,
          decimals: tokenOverview.decimals,
          price: Number.parseFloat(tokenOverview.priceUsd),
          volume: tokenOverview.volume24h,
          price24hChange: tokenOverview.price24hChange,
          liquidity: tokenOverview.liquidityUsd,
          holders: tokenOverview.holders,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (tokenPerformance) {
          await this.storeTokenPerformance(tokenPerformance);
        }
      }
      return tokenPerformance;
    } catch (error) {
      logger8.error(`Error fetching token performance for ${tokenAddress}:`, error);
      return null;
    }
  }
  /**
   * Validate if a token meets trading criteria
   */
  validateToken(token) {
    if (token.address?.startsWith("sim_")) {
      return true;
    }
    if (token.isScam || token.rugPull) {
      return false;
    }
    const liquidity = token.liquidity || 0;
    if (liquidity < this.tradingConfig.minLiquidityUsd) {
      return false;
    }
    const marketCap = token.currentMarketCap || 0;
    if (marketCap > this.tradingConfig.maxMarketCapUsd) {
      return false;
    }
    return true;
  }
  /**
   * Create a token recommendation
   */
  async createTokenRecommendation(entityId, token, conviction = "MEDIUM" /* MEDIUM */, type = "BUY" /* BUY */) {
    logger8.debug("creating token recommendation", entityId, token, conviction, type);
    try {
      const recommendation = {
        id: v4_default(),
        entityId,
        chain: token.chain || this.tradingConfig.defaultChain,
        tokenAddress: token.address || "",
        type,
        conviction,
        initialMarketCap: (token.initialMarketCap || 0).toString(),
        initialLiquidity: (token.liquidity || 0).toString(),
        initialPrice: (token.price || 0).toString(),
        marketCap: (token.currentMarketCap || 0).toString(),
        liquidity: (token.liquidity || 0).toString(),
        price: (token.price || 0).toString(),
        rugPull: token.rugPull || false,
        isScam: token.isScam || false,
        riskScore: this.calculateRiskScore(token),
        performanceScore: 0,
        metadata: {},
        status: "ACTIVE",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      await this.storeTokenRecommendation(recommendation);
      this.emitEvent({
        type: "recommendation_added",
        recommendation
      });
      return recommendation;
    } catch (error) {
      logger8.error("Error creating token recommendation:", error);
      return null;
    }
  }
  /**
   * Calculate buy amount based on entity trust score and conviction
   */
  calculateBuyAmount(entity, conviction, token) {
    logger8.debug("calculating buy amount", entity, conviction, token);
    let trustScore = 50;
    const metricsPromise = this.getRecommenderMetrics(entity.id);
    metricsPromise.then((metrics) => {
      if (metrics) {
        trustScore = metrics.trustScore;
      }
    }).catch((error) => {
      logger8.error(`Error getting entity metrics for ${entity.id}:`, error);
    });
    const { baseAmount, minAmount, maxAmount, trustScoreMultiplier, convictionMultiplier } = this.tradingConfig.buyAmountConfig;
    const trustMultiplier = 1 + trustScore / 100 * trustScoreMultiplier;
    const convMultiplier = getConvictionMultiplier(conviction);
    let amount = baseAmount * trustMultiplier * convMultiplier;
    if (token.liquidity) {
      amount *= getLiquidityMultiplier(token.liquidity);
    }
    amount = Math.max(minAmount, Math.min(maxAmount, amount));
    return BigInt(Math.floor(amount * 1e9));
  }
  /**
   * Create a new position
   */
  async createPosition(recommendationId, entityId, tokenAddress, walletAddress, amount, price, isSimulation) {
    logger8.debug(
      "creating position",
      recommendationId,
      entityId,
      tokenAddress,
      walletAddress,
      amount,
      price,
      isSimulation
    );
    try {
      const position = {
        id: v4_default(),
        chain: this.tradingConfig.defaultChain,
        tokenAddress,
        walletAddress,
        isSimulation,
        entityId,
        recommendationId,
        initialPrice: price,
        balance: "0",
        status: "OPEN",
        amount: amount.toString(),
        createdAt: /* @__PURE__ */ new Date()
      };
      await this.storePosition(position);
      return position;
    } catch (error) {
      logger8.error("Error creating position:", error);
      return null;
    }
  }
  /**
   * Record a transaction
   */
  async recordTransaction(positionId, tokenAddress, type, amount, price, isSimulation) {
    logger8.debug(
      "recording transaction",
      positionId,
      tokenAddress,
      type,
      amount,
      price,
      isSimulation
    );
    try {
      const transaction = {
        id: v4_default(),
        positionId,
        chain: this.tradingConfig.defaultChain,
        tokenAddress,
        type,
        amount: amount.toString(),
        price: price.toString(),
        isSimulation,
        timestamp: /* @__PURE__ */ new Date()
      };
      await this.storeTransaction(transaction);
      this.emitEvent({ type: "transaction_added", transaction });
      return true;
    } catch (error) {
      logger8.error("Error recording transaction:", error);
      return false;
    }
  }
  /**
   * Get all positions for an entity
   */
  async getPositionsByRecommender(entityId) {
    logger8.debug("getting positions by recommender", entityId);
    try {
      const recommendations = await this.getRecommendationsByRecommender(entityId);
      const positions = [];
      for (const recommendation of recommendations) {
        const positionMatches = await this.getPositionsByToken(recommendation.tokenAddress);
        const entityPositions = positionMatches.filter(
          (position) => position.entityId === entityId
        );
        positions.push(...entityPositions);
      }
      return positions;
    } catch (error) {
      logger8.error("Error getting positions by entity:", error);
      return [];
    }
  }
  /**
   * Get all positions for a token
   */
  async getPositionsByToken(tokenAddress) {
    logger8.debug("getting positions by token", tokenAddress);
    try {
      const positions = await this.getOpenPositionsWithBalance();
      return positions.filter((position) => position.tokenAddress === tokenAddress);
    } catch (error) {
      logger8.error("Error getting positions by token:", error);
      return [];
    }
  }
  /**
   * Get all transactions for a position
   */
  async getTransactionsByPosition(positionId) {
    logger8.debug("getting transactions by position", positionId);
    try {
      const query = `transactions for position ${positionId}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "transactions",
        embedding,
        match_threshold: 0.7,
        count: 20
      });
      const transactions = [];
      for (const memory of memories) {
        if (memory.content.transaction && memory.content.transaction.positionId === positionId) {
          transactions.push(memory.content.transaction);
        }
      }
      return transactions;
    } catch (error) {
      logger8.error("Error getting transactions by position:", error);
      return [];
    }
  }
  /**
   * Get all transactions for a token
   */
  async getTransactionsByToken(tokenAddress) {
    logger8.debug("getting transactions by token", tokenAddress);
    try {
      const query = `transactions for token ${tokenAddress}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "transactions",
        embedding,
        match_threshold: 0.7,
        count: 50
      });
      const transactions = [];
      for (const memory of memories) {
        if (memory.content.transaction && memory.content.transaction.tokenAddress === tokenAddress) {
          transactions.push(memory.content.transaction);
        }
      }
      return transactions;
    } catch (error) {
      logger8.error("Error getting transactions by token:", error);
      return [];
    }
  }
  /**
   * Get a position by ID
   */
  async getPosition(positionId) {
    logger8.debug("getting position", positionId);
    try {
      const cacheKey = `position:${positionId}`;
      const cachedPosition = await this.runtime.getCache(cacheKey);
      if (cachedPosition) {
        return cachedPosition;
      }
      const query = `position with ID ${positionId}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "positions",
        embedding,
        match_threshold: 0.7,
        count: 1
      });
      if (memories.length > 0 && memories[0].content.position) {
        const position = memories[0].content.position;
        await this.runtime.setCache(cacheKey, position);
        return position;
      }
      return null;
    } catch (error) {
      logger8.error("Error getting position:", error);
      return null;
    }
  }
  /**
   * Get all recommendations by a entity
   */
  async getRecommendationsByRecommender(entityId) {
    logger8.debug("getting recommendations by recommender", entityId);
    try {
      const query = `recommendations by entity ${entityId}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "recommendations",
        embedding,
        match_threshold: 0.7,
        count: 50
      });
      const recommendations = [];
      for (const memory of memories) {
        if (memory.metadata.recommendation && memory.metadata.recommendation.entityId === entityId) {
          recommendations.push(memory.metadata.recommendation);
        }
      }
      return recommendations;
    } catch (error) {
      logger8.error("Error getting recommendations by entity:", error);
      return [];
    }
  }
  /**
   * Close a position and update metrics
   */
  async closePosition(positionId) {
    logger8.debug("closing position", positionId);
    try {
      const position = await this.getPosition(positionId);
      if (!position) {
        logger8.error(`Position ${positionId} not found`);
        return false;
      }
      position.status = "CLOSED";
      position.closedAt = /* @__PURE__ */ new Date();
      const transactions = await this.getTransactionsByPosition(positionId);
      const performance = await this.calculatePositionPerformance(position, transactions);
      await this.updateRecommenderMetrics(position.entityId, performance);
      await this.storePosition(position);
      this.emitEvent({ type: "position_closed", position });
      return true;
    } catch (error) {
      logger8.error(`Failed to close position ${positionId}:`, error);
      return false;
    }
  }
  /**
   * Calculate position performance
   */
  async calculatePositionPerformance(position, transactions) {
    logger8.debug("calculating position performance", position, transactions);
    if (!transactions.length) return 0;
    const buyTxs = transactions.filter((t) => t.type === "BUY" /* BUY */);
    const sellTxs = transactions.filter((t) => t.type === "SELL" /* SELL */);
    const totalBuyAmount = buyTxs.reduce((sum, tx) => sum + BigInt(tx.amount), 0n);
    const _totalSellAmount = sellTxs.reduce((sum, tx) => sum + BigInt(tx.amount), 0n);
    position.amount = totalBuyAmount.toString();
    const avgBuyPrice = buyTxs.reduce((sum, tx) => sum + Number(tx.price), 0) / buyTxs.length;
    const avgSellPrice = sellTxs.length ? sellTxs.reduce((sum, tx) => sum + Number(tx.price), 0) / sellTxs.length : await this.getCurrentPrice(position.chain, position.tokenAddress);
    position.currentPrice = avgSellPrice.toString();
    return (avgSellPrice - avgBuyPrice) / avgBuyPrice * 100;
  }
  /**
   * Store token performance data
   */
  async storeTokenPerformance(token) {
    logger8.debug("storing token performance", token);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Token performance data for ${token.symbol || token.address} on ${token.chain}`,
          token
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "tokens", true);
      const cacheKey = `token:${token.chain}:${token.address}:performance`;
      await this.runtime.setCache(cacheKey, token);
    } catch (error) {
      logger8.error(`Error storing token performance for ${token.address}:`, error);
    }
  }
  /**
   * Store position data
   */
  async storePosition(position) {
    logger8.debug("storing position", position);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Position data for token ${position.tokenAddress} by entity ${position.entityId}`,
          position
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "positions", true);
      const cacheKey = `position:${position.id}`;
      await this.runtime.setCache(cacheKey, position);
    } catch (error) {
      logger8.error(`Error storing position for ${position.tokenAddress}:`, error);
    }
  }
  /**
   * Store transaction data
   */
  async storeTransaction(transaction) {
    logger8.debug("storing transaction", transaction);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Transaction data for position ${transaction.positionId} token ${transaction.tokenAddress} ${transaction.type}`,
          transaction
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "transactions", true);
      const cacheKey = `position:${transaction.positionId}:transactions`;
      const cachedTxs = await this.runtime.getCache(cacheKey);
      if (cachedTxs) {
        const txs = cachedTxs;
        txs.push(transaction);
        await this.runtime.setCache(cacheKey, txs);
      } else {
        await this.runtime.setCache(cacheKey, [transaction]);
      }
    } catch (error) {
      logger8.error(`Error storing transaction for position ${transaction.positionId}:`, error);
    }
  }
  /**
   * Store token recommendation data
   */
  async storeTokenRecommendation(recommendation) {
    logger8.debug("storing token recommendation", recommendation);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Token recommendation for ${recommendation.tokenAddress} by entity ${recommendation.entityId}`,
          recommendation
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "recommendations", true);
      const cacheKey = `recommendation:${recommendation.id}`;
      await this.runtime.setCache(cacheKey, recommendation);
    } catch (error) {
      logger8.error(`Error storing recommendation for ${recommendation.tokenAddress}:`, error);
    }
  }
  /**
   * Store entity metrics
   */
  async storeRecommenderMetrics(metrics) {
    logger8.debug("storing recommender metrics", metrics);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Recommender metrics for ${metrics.entityId}`,
          metrics
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "recommender_metrics", true);
      const cacheKey = `entity:${metrics.entityId}:metrics`;
      await this.runtime.setCache(cacheKey, metrics);
    } catch (error) {
      logger8.error(`Error storing entity metrics for ${metrics.entityId}:`, error);
    }
  }
  /**
   * Store entity metrics history
   */
  async storeRecommenderMetricsHistory(history) {
    logger8.debug("storing recommender metrics history", history);
    try {
      const memory = {
        id: v4_default(),
        entityId: this.runtime.agentId,
        roomId: "global",
        content: {
          text: `Recommender metrics history for ${history.entityId}`,
          history
        },
        createdAt: Date.now()
      };
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, memory.content.text);
      const memoryWithEmbedding = { ...memory, embedding };
      await this.runtime.createMemory(memoryWithEmbedding, "recommender_metrics_history", true);
      const cacheKey = `entity:${history.entityId}:history`;
      const cachedHistory = await this.runtime.getCache(cacheKey);
      if (cachedHistory) {
        const histories = cachedHistory;
        histories.push(history);
        const recentHistories = histories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
        await this.runtime.setCache(cacheKey, recentHistories);
      } else {
        await this.runtime.setCache(cacheKey, [history]);
      }
    } catch (error) {
      logger8.error(`Error storing entity metrics history for ${history.entityId}:`, error);
    }
  }
  /**
   * Get entity metrics
   */
  async getRecommenderMetrics(entityId) {
    logger8.debug("getting recommender metrics", entityId);
    try {
      const cacheKey = `entity:${entityId}:metrics`;
      const cachedMetrics = await this.runtime.getCache(cacheKey);
      if (cachedMetrics) {
        return cachedMetrics;
      }
      const query = `entity metrics for entity ${entityId}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "recommender_metrics",
        embedding,
        match_threshold: 0.7,
        count: 1
      });
      if (memories.length > 0 && memories[0].content.metrics) {
        const metrics = memories[0].content.metrics;
        await this.runtime.setCache(cacheKey, metrics);
        return metrics;
      }
      return null;
    } catch (error) {
      logger8.error(`Error getting entity metrics for ${entityId}:`, error);
      return null;
    }
  }
  /**
   * Get entity metrics history
   */
  async getRecommenderMetricsHistory(entityId) {
    logger8.debug("getting recommender metrics history", entityId);
    try {
      const cacheKey = `entity:${entityId}:history`;
      const cachedHistory = await this.runtime.getCache(cacheKey);
      if (cachedHistory) {
        return cachedHistory;
      }
      const query = `entity metrics history for entity ${entityId}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "recommender_metrics_history",
        embedding,
        match_threshold: 0.7,
        count: 10
      });
      const historyEntries = [];
      for (const memory of memories) {
        if (memory.content.history && memory.content.history.entityId === entityId) {
          historyEntries.push(memory.content.history);
        }
      }
      const sortedEntries = historyEntries.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      await this.runtime.setCache(cacheKey, sortedEntries);
      return sortedEntries;
    } catch (error) {
      logger8.error(`Error getting entity metrics history for ${entityId}:`, error);
      return [];
    }
  }
  /**
   * Initialize entity metrics
   */
  async initializeRecommenderMetrics(entityId, platform) {
    logger8.debug("initializing recommender metrics", entityId, platform);
    try {
      const initialMetrics = {
        entityId,
        platform,
        totalRecommendations: 0,
        successfulRecs: 0,
        consistencyScore: 50,
        trustScore: 50,
        failedTrades: 0,
        totalProfit: 0,
        avgTokenPerformance: 0,
        lastUpdated: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      };
      await this.storeRecommenderMetrics(initialMetrics);
      const historyEntry = {
        entityId,
        metrics: initialMetrics,
        timestamp: /* @__PURE__ */ new Date()
      };
      await this.storeRecommenderMetricsHistory(historyEntry);
    } catch (error) {
      logger8.error(`Error initializing entity metrics for ${entityId}:`, error);
    }
  }
  /**
   * Get token performance
   */
  async getTokenPerformance(tokenAddress, chain) {
    logger8.debug("getting token performance", tokenAddress, chain);
    try {
      const cacheKey = `token:${chain}:${tokenAddress}:performance`;
      const cachedToken = await this.runtime.getCache(cacheKey);
      if (cachedToken) {
        return cachedToken;
      }
      const query = `token performance for ${tokenAddress}`;
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "tokens",
        embedding,
        match_threshold: 0.7,
        count: 1
      });
      if (memories.length > 0 && memories[0].content.token) {
        const token = memories[0].content.token;
        await this.runtime.setCache(cacheKey, token);
        return token;
      }
      return null;
    } catch (error) {
      logger8.error(`Error getting token performance for ${tokenAddress}:`, error);
      return null;
    }
  }
  /**
   * Get open positions with balance
   */
  async getOpenPositionsWithBalance() {
    logger8.debug("getting open positions with balance");
    try {
      const cacheKey = "positions:open:with-balance";
      const cachedPositions = await this.runtime.getCache(cacheKey);
      if (cachedPositions) {
        return cachedPositions;
      }
      const query = "open positions with balance";
      const embedding = await this.runtime.useModel(ModelType3.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        tableName: "positions",
        embedding,
        match_threshold: 0.7,
        count: 50
      });
      const positions = [];
      for (const memory of memories) {
        if (memory.content.position) {
          const position = memory.content.position;
          if (position.status === "OPEN") {
            positions.push({
              ...position,
              balance: BigInt(position.balance || "0")
            });
          }
        }
      }
      await this.runtime.setCache(cacheKey, positions);
      return positions;
    } catch (error) {
      logger8.error("Error getting open positions with balance:", error);
      return [];
    }
  }
  /**
   * Get positions transactions
   */
  async getPositionsTransactions(positionIds) {
    logger8.debug("getting positions transactions", positionIds);
    try {
      const allTransactions = [];
      for (const positionId of positionIds) {
        const transactions = await this.getTransactionsByPosition(positionId);
        allTransactions.push(...transactions);
      }
      return allTransactions;
    } catch (error) {
      logger8.error("Error getting transactions for positions:", error);
      return [];
    }
  }
  /**
   * Get formatted portfolio report
   */
  async getFormattedPortfolioReport(entityId) {
    logger8.debug("getting formatted portfolio report", entityId);
    try {
      const positions = await this.getOpenPositionsWithBalance();
      const filteredPositions = entityId ? positions.filter((p) => p.entityId === entityId) : positions;
      if (filteredPositions.length === 0) {
        return "No open positions found.";
      }
      const tokens = [];
      const tokenSet = /* @__PURE__ */ new Set();
      for (const position of filteredPositions) {
        if (tokenSet.has(`${position.chain}:${position.tokenAddress}`)) continue;
        const token = await this.getTokenPerformance(position.tokenAddress, position.chain);
        if (token) tokens.push(token);
        tokenSet.add(`${position.chain}:${position.tokenAddress}`);
      }
      const transactions = await this.getPositionsTransactions(filteredPositions.map((p) => p.id));
      const report = formatFullReport(tokens, filteredPositions, transactions);
      return `
Portfolio Summary:
Total Current Value: ${report.totalCurrentValue}
Total Realized P&L: ${report.totalRealizedPnL}
Total Unrealized P&L: ${report.totalUnrealizedPnL}
Total P&L: ${report.totalPnL}

Positions:
${report.positionReports.join("\n\n")}

Tokens:
${report.tokenReports.join("\n\n")}
            `.trim();
    } catch (error) {
      logger8.error("Error generating portfolio report:", error);
      return "Error generating portfolio report.";
    }
  }
};

// src/plugins/communityInvestor/index.ts
var communityInvestorPlugin = {
  name: "community-investor",
  description: "Community Investor Plugin for Eliza",
  evaluators: [recommendationEvaluator],
  providers: [],
  actions: [
    confirmRecommendation,
    getTokenDetails,
    getRecommenderReport,
    getPositions,
    getAgentPositions,
    getSimulatedPositions
  ],
  services: [CommunityInvestorService]
};

// src/plugins/degenIntel/apis.ts
import { createUniqueUuid as createUniqueUuid2 } from "@elizaos/core";

// src/plugins/degenIntel/schemas.ts
import { z as z3 } from "zod";
var TokenSchema = z3.object({
  provider: z3.string(),
  rank: z3.number(),
  __v: z3.number(),
  address: z3.string(),
  chain: z3.string(),
  createdAt: z3.string().datetime(),
  decimals: z3.number(),
  last_updated: z3.string().datetime(),
  liquidity: z3.number(),
  logoURI: z3.string().url(),
  name: z3.string(),
  price: z3.number(),
  price24hChangePercent: z3.number(),
  symbol: z3.string(),
  updatedAt: z3.string().datetime(),
  volume24hUSD: z3.number(),
  marketcap: z3.number()
});
var TokenArraySchema = z3.array(TokenSchema);
var TokenRequestSchema = z3.object({
  address: z3.string().min(1, "Address is required")
});
var TweetSchema = z3.object({
  _id: z3.string(),
  id: z3.string(),
  __v: z3.number(),
  createdAt: z3.string().datetime(),
  likes: z3.number(),
  retweets: z3.number(),
  text: z3.string(),
  timestamp: z3.string().datetime(),
  updatedAt: z3.string().datetime(),
  username: z3.string()
});
var TweetArraySchema = z3.array(TweetSchema);
var SentimentSchema = z3.object({
  timeslot: z3.string().datetime(),
  createdAt: z3.string().datetime(),
  occuringTokens: z3.array(
    z3.object({
      token: z3.string(),
      sentiment: z3.number(),
      reason: z3.string()
    })
  ),
  processed: z3.boolean(),
  updatedAt: z3.string().datetime(),
  text: z3.string()
});
var SentimentArraySchema = z3.array(SentimentSchema);
var WalletSchema = z3.object({
  wallet: z3.string(),
  totalUsd: z3.number(),
  items: z3.array(
    z3.object({
      address: z3.string(),
      decimals: z3.number(),
      balance: z3.number(),
      uiAmount: z3.number(),
      chainId: z3.string(),
      name: z3.string(),
      symbol: z3.string(),
      icon: z3.string().url(),
      logoURI: z3.string().url(),
      priceUsd: z3.number(),
      valueUsd: z3.number()
    })
  )
});
var BuySignalSchema = z3.object({
  recommended_buy: z3.string(),
  recommended_buy_address: z3.string(),
  reason: z3.string(),
  marketcap: z3.number(),
  buy_amount: z3.string()
});
var StatisticsSchema = z3.object({
  tweets: z3.number(),
  sentiment: z3.number(),
  tokens: z3.number()
});

// src/plugins/degenIntel/apis.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path.dirname(__filename);
var routes = [
  {
    type: "GET",
    path: "/degenintel-test",
    public: true,
    name: "Degen Intel Test",
    handler: async (_req, res) => {
      res.json({ message: "Degen Intel routes are working!", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
  },
  {
    type: "GET",
    path: "/degen-intel/dashboard",
    public: true,
    name: "Degen Intel Dashboard",
    handler: async (_req, res) => {
      console.log("=== DEGEN INTEL DASHBOARD ROUTE HIT ===");
      console.log("Request path:", _req.path);
      console.log("Request URL:", _req.url);
      const indexPath = path.resolve(process.cwd(), "dist/index.html");
      console.log("Serving index.html from:", indexPath);
      console.log("File exists:", fs.existsSync(indexPath));
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Frontend not built. Please run: yarn build");
      }
    }
  },
  {
    type: "GET",
    path: "/degen-intel/dashboard/*",
    public: true,
    handler: async (_req, res) => {
      const indexPath = path.resolve(process.cwd(), "dist/index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Frontend not built. Please run: yarn build");
      }
    }
  },
  {
    type: "GET",
    path: "/degen-intel/assets/:filename",
    public: true,
    handler: async (req, res) => {
      const filename = req.params.filename;
      const filePath = path.resolve(process.cwd(), "dist", "assets", filename);
      console.log("Asset request:", {
        filename,
        filePath,
        exists: fs.existsSync(filePath)
      });
      if (fs.existsSync(filePath)) {
        if (filename.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filename.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        }
        res.sendFile(filePath);
      } else {
        res.status(404).send("Asset not found");
      }
    }
  },
  {
    type: "POST",
    path: "/trending",
    handler: async (_req, res, runtime) => {
      try {
        const cachedTokens = await runtime.getCache("tokens_solana");
        const tokens = cachedTokens ? cachedTokens : [];
        const sortedTokens = tokens.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        res.json(sortedTokens);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "POST",
    path: "/wallet",
    handler: async (_req, res, runtime) => {
      try {
        const cachedTxs = await runtime.getCache("transaction_history");
        const transactions = cachedTxs ? cachedTxs : [];
        const history = transactions.filter((tx) => tx.data.mainAction === "received").sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime()).slice(0, 100);
        const cachedPortfolio = await runtime.getCache("portfolio");
        const portfolio = cachedPortfolio ? cachedPortfolio : { key: "PORTFOLIO", data: null };
        res.json({ history, portfolio: portfolio.data });
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "GET",
    path: "/tweets",
    handler: async (_req, res, runtime) => {
      try {
        const memories = await runtime.getMemories({
          tableName: "messages",
          roomId: createUniqueUuid2(runtime, "twitter-feed"),
          end: Date.now(),
          count: 50
        });
        const tweets = memories.filter((m) => m.content.source === "twitter").sort((a, b) => b.createdAt - a.createdAt).map((m) => ({
          text: m.content.text,
          timestamp: m.createdAt,
          metadata: m.content.tweet || {}
        }));
        const validatedData = TweetArraySchema.parse(tweets);
        res.json(validatedData);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "GET",
    path: "/sentiment",
    handler: async (_req, res, runtime) => {
      try {
        const memories = await runtime.getMemories({
          tableName: "messages",
          roomId: createUniqueUuid2(runtime, "sentiment-analysis"),
          end: Date.now(),
          count: 30
        });
        const sentiments = memories.filter(
          (m) => m.content.source === "sentiment-analysis" && !!m.content.metadata && typeof m.content.metadata === "object" && m.content.metadata !== null && "processed" in m.content.metadata && "occuringTokens" in m.content.metadata && Array.isArray(m.content.metadata.occuringTokens) && m.content.metadata.occuringTokens.length > 1
        ).sort((a, b) => {
          const aMetadata = a.content.metadata;
          const bMetadata = b.content.metadata;
          const aTime = new Date(aMetadata.timeslot).getTime();
          const bTime = new Date(bMetadata.timeslot).getTime();
          return bTime - aTime;
        }).map((m) => {
          const metadata = m.content.metadata;
          return {
            timeslot: metadata.timeslot,
            text: m.content.text,
            processed: metadata.processed,
            occuringTokens: metadata.occuringTokens || []
          };
        });
        const validatedData = SentimentArraySchema.parse(sentiments);
        res.json(validatedData);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "POST",
    path: "/signal",
    handler: async (_req, res, runtime) => {
      try {
        const cachedSignal = await runtime.getCache("BUY_SIGNAL");
        const signal = cachedSignal ? cachedSignal : {};
        res.json(signal?.data || {});
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
];
var apis_default = routes;

// src/plugins/degenIntel/tasks.ts
import { logger as logger16 } from "@elizaos/core";

// src/plugins/degenIntel/tasks/birdeye.ts
import {
  ModelType as ModelType4,
  createUniqueUuid as createUniqueUuid3,
  logger as logger9
} from "@elizaos/core";
var rolePrompt = "You are a sentiment analyzer for cryptocurrency and market data.";
var template = `Write a summary of what is happening in the tweets. The main topic is the cryptocurrency market.
You will also be analyzing the tokens that occur in the tweet and tell us whether their sentiment is positive or negative.

## Analyze the followings tweets:
{{tweets}}

Strictly return the following json:

{
   "text":"the summary of what has happened in those tweets, with a max length of 200 characters",
   "occuringTokens":[
      {
         "token":"the token symbol, like: ETH, SOL, BTC etc.",
         "sentiment":"positive is between 1 and 100 and negative is from -1 to -100",
         "reason":"a short sentence explaining the reason for this sentiment score"
      }
   ]
}`;
function makeBulletpointList(array) {
  return array.map((a) => ` - ${a}`).join("\n");
}
var Birdeye = class {
  apiKey;
  sentimentRoomId;
  twitterFeedRoomId;
  runtime;
  constructor(runtime) {
    const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
    if (!apiKey) {
      throw new Error("Failed to initialize Birdeye provider due to missing API key.");
    }
    this.apiKey = apiKey;
    this.sentimentRoomId = createUniqueUuid3(runtime, "sentiment-analysis");
    this.twitterFeedRoomId = createUniqueUuid3(runtime, "twitter-feed");
    this.runtime = runtime;
  }
  async syncWalletHistory() {
    try {
      const publicKey = this.runtime.getSetting("SOLANA_PUBLIC_KEY") || "BzsJQeZ7cvk3pTHmKeuvdhNDkDxcZ6uCXxW2rjwC7RTq";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-chain": "solana",
          "X-API-KEY": this.apiKey
        }
      };
      const res = await fetch(
        `https://public-api.birdeye.so/v1/wallet/tx_list?wallet=${publicKey}&limit=100`,
        options
      );
      const resp = await res.json();
      const birdeyeData = resp?.data?.solana || [];
      let transactions = birdeyeData.map((tx) => ({
        txHash: tx.txHash,
        blockTime: new Date(tx.blockTime),
        data: tx
      }));
      try {
        const cachedTxs = await this.runtime.getCache("transaction_history");
        if (cachedTxs && Array.isArray(cachedTxs)) {
          for (const cachedTx of cachedTxs) {
            if (!transactions.some((tx) => tx.txHash === cachedTx.txHash)) {
              transactions.push(cachedTx);
            }
          }
        }
      } catch (error) {
        logger9.debug("Failed to get cached transactions, continuing with Birdeye data only");
      }
      for (const tx of transactions) {
        if (typeof tx.blockTime === "string") {
          tx.blockTime = new Date(tx.blockTime);
        }
      }
      transactions.sort((a, b) => b.blockTime.getTime() - a.blockTime.getTime());
      try {
        await this.runtime.setCache("transaction_history", transactions);
        logger9.debug(`Updated transaction history with ${transactions.length} transactions`);
      } catch (error) {
        logger9.debug("Failed to set transaction cache, continuing without caching", error);
      }
      return transactions;
    } catch (error) {
      logger9.error("Failed to sync wallet history from Birdeye", error);
      return [];
    }
  }
  async syncWalletPortfolio() {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-chain": "solana",
        "X-API-KEY": this.apiKey
      }
    };
    const publicKey = this.runtime.getSetting("SOLANA_PUBLIC_KEY") || "BzsJQeZ7cvk3pTHmKeuvdhNDkDxcZ6uCXxW2rjwC7RTq";
    const res = await fetch(
      `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${publicKey}`,
      options
    );
    const resp = await res.json();
    const data = resp?.data;
    await this.runtime.setCache("portfolio", { key: "PORTFOLIO", data });
  }
  async syncWallet() {
    await this.syncWalletHistory();
    await this.syncWalletPortfolio();
    return true;
  }
  async syncTrendingTokens(chain) {
    try {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-chain": chain,
          "X-API-KEY": this.apiKey
        }
      };
      const cachedTokens = await this.runtime.getCache(`tokens_${chain}`);
      const tokens = cachedTokens ? cachedTokens : [];
      for (let batch = 0; batch < 5; batch++) {
        const currentOffset = batch * 20;
        const res = await fetch(
          `https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=${currentOffset}&limit=20`,
          options
        );
        const resp = await res.json();
        const data = resp?.data;
        const last_updated = new Date(data?.updateUnixTime * 1e3);
        const newTokens = data?.tokens;
        if (!newTokens) {
          continue;
        }
        for (const token of newTokens) {
          const existingIndex = tokens.findIndex(
            (t) => t.provider === "birdeye" && t.rank === token.rank && t.chain === chain
          );
          const tokenData = {
            address: token.address,
            chain,
            provider: "birdeye",
            decimals: token.decimals || 0,
            liquidity: token.liquidity || 0,
            logoURI: token.logoURI || "",
            name: token.name || token.symbol,
            symbol: token.symbol,
            marketcap: 0,
            volume24hUSD: token.volume24hUSD || 0,
            rank: token.rank || 0,
            price: token.price || 0,
            price24hChangePercent: token.price24hChangePercent || 0,
            last_updated
          };
          if (existingIndex >= 0) {
            tokens[existingIndex] = tokenData;
          } else {
            tokens.push(tokenData);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      await this.runtime.setCache(`tokens_${chain}`, tokens);
      logger9.debug(`Updated ${chain} tokens cache with ${tokens.length} tokens`);
      return true;
    } catch (error) {
      logger9.error("Failed to sync trending tokens", error);
      throw error;
    }
  }
  async fillTimeframe() {
    const memories = await this.runtime.getMemories({
      tableName: "messages",
      roomId: this.sentimentRoomId,
      end: Date.now(),
      count: 1
    });
    const lastMemory = memories[0];
    const lookUpDate = lastMemory?.content?.metadata?.timeslot;
    const start = new Date(lookUpDate || "2025-01-01T00:00:00.000Z");
    start.setUTCHours(0, 0, 0, 0);
    const today = /* @__PURE__ */ new Date();
    today.setUTCHours(23, 59, 59, 999);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24));
    for (let day = 0; day <= diff; day++) {
      const now = new Date(start);
      now.setUTCDate(start.getUTCDate() + day);
      for (let hour = 0; hour <= 23; hour++) {
        const timeslot = new Date(now);
        timeslot.setUTCHours(hour, 0, 0, 0);
        const rightNow = /* @__PURE__ */ new Date();
        if (timeslot > rightNow) {
          break;
        }
        await this.runtime.createMemory(
          {
            id: createUniqueUuid3(this.runtime, `sentiment-${timeslot.toISOString()}`),
            entityId: this.runtime.agentId,
            agentId: this.runtime.agentId,
            content: {
              text: "",
              source: "sentiment-analysis",
              metadata: {
                timeslot: timeslot.toISOString(),
                processed: false
              }
            },
            roomId: this.sentimentRoomId,
            createdAt: timeslot.getTime()
          },
          "messages"
        );
      }
    }
    logger9.info("Filled timeframe slots for sentiment analysis");
  }
  async parseTweets() {
    await this.fillTimeframe();
    const now = /* @__PURE__ */ new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1e3);
    const memories = await this.runtime.getMemories({
      tableName: "messages",
      roomId: this.sentimentRoomId,
      start: twoDaysAgo.getTime(),
      end: oneHourAgo.getTime()
    });
    const sentiment = memories.find(
      (m) => !m.content.metadata.processed
    );
    if (!sentiment) {
      logger9.debug("No unprocessed timeslots available.");
      return true;
    }
    logger9.info(`Trying to process ${sentiment.content.metadata.timeslot}`);
    const timeslot = new Date(sentiment.content.metadata.timeslot);
    const fromDate = new Date(timeslot.getTime() - 60 * 60 * 1e3 + 1e3);
    const toDate = timeslot;
    const tweets = await this.runtime.getMemories({
      tableName: "messages",
      roomId: this.twitterFeedRoomId,
      start: fromDate.getTime(),
      end: toDate.getTime()
    });
    if (!tweets || tweets.length === 0) {
      logger9.info(`No tweets to process for timeslot ${timeslot.toISOString()}`);
      await this.runtime.createMemory(
        {
          id: sentiment.id,
          entityId: sentiment.entityId,
          agentId: sentiment.agentId,
          content: {
            ...sentiment.content,
            metadata: {
              ...sentiment.content.metadata,
              processed: true
            }
          },
          roomId: sentiment.roomId,
          createdAt: sentiment.createdAt
        },
        "messages"
      );
      return true;
    }
    const tweetArray = tweets.map((tweet) => {
      const content = tweet.content;
      return `username: ${content.tweet?.username || "unknown"} tweeted: ${content.text}${content.tweet?.likes ? ` with ${content.tweet.likes} likes` : ""}${content.tweet?.retweets ? ` and ${content.tweet.retweets} retweets` : ""}.`;
    });
    const bulletpointTweets = makeBulletpointList(tweetArray);
    const prompt = template.replace("{{tweets}}", bulletpointTweets);
    const response = await this.runtime.useModel(ModelType4.TEXT_LARGE, {
      prompt,
      system: rolePrompt,
      temperature: 0.2,
      maxTokens: 4096,
      object: true
    });
    const json = JSON.parse(response || "{}");
    await this.runtime.createMemory(
      {
        id: sentiment.id,
        entityId: sentiment.entityId,
        agentId: sentiment.agentId,
        content: {
          text: json.text,
          source: "sentiment-analysis",
          metadata: {
            ...sentiment.content.metadata,
            occuringTokens: json.occuringTokens,
            processed: true
          }
        },
        roomId: sentiment.roomId,
        createdAt: sentiment.createdAt
      },
      "messages"
    );
    logger9.info(`Successfully processed timeslot ${sentiment.content.metadata.timeslot}`);
    return true;
  }
};

// src/plugins/degenIntel/tasks/buySignal.ts
import { ModelType as ModelType5, logger as logger10, parseJSONObjectFromText } from "@elizaos/core";
var DEGEN_WALLET = "BzsJQeZ7cvk3pTHmKeuvdhNDkDxcZ6uCXxW2rjwC7RTq";
var _rolePrompt = "You are a buy signal analyzer.";
var _template = `
I want you to give a crypto buy signal based on both the sentiment analysis as well as the trending tokens.
Only choose a token that occurs in both the Trending Tokens list as well as the Sentiment analysis. This ensures we have the proper token address.
The sentiment score has a range of -100 to 100, with -100 indicating extreme negativity and 100 indicating extreme positiveness.
My current balance is {{solana_balance}} SOL, If I have less than 0.3 SOL then I should not buy unless it's really good opportunity.
Also let me know what a good amount would be to buy. Buy amount should at least be 0.05 SOL and maximum 0.25 SOL.

Sentiment analysis:

{{sentiment}}

Trending tokens:

{{trending_tokens}}

Only return the following JSON:

{
recommended_buy: "the symbol of the token for example DEGENAI",
recommend_buy_address: "the address of the token to purchase, for example: 2sCUCJdVkmyXp4dT8sFaA9LKgSMK4yDPi9zLHiwXpump",
reason: "the reason why you think this is a good buy, and why you chose the specific amount",
buy_amount: "number, for example: 0.1"
}`;
var BuySignal = class {
  apiKey;
  runtime;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async generateSignal() {
    logger10.info("buy-signal::generateSignal - Updating latest buy signal");
    const sentimentsData = await this.runtime.getCache("sentiments") || [];
    let sentiments = "";
    let idx = 1;
    for (const sentiment of sentimentsData) {
      if (!sentiment?.occuringTokens?.length) continue;
      sentiments += `ENTRY ${idx}
TIME: ${sentiment.timeslot}
TOKEN ANALYSIS:
`;
      for (const token of sentiment.occuringTokens) {
        sentiments += `${token.token} - Sentiment: ${token.sentiment}
${token.reason}
`;
      }
      sentiments += "\n-------------------\n";
      idx++;
    }
    const prompt = _template.replace("{{sentiment}}", sentiments);
    let tokens = "";
    const trendingData = await this.runtime.getCache("tokens_solana") || [];
    if (!trendingData.length) {
      logger10.warn("No trending tokens found in cache");
    } else {
      let index = 1;
      for (const token of trendingData) {
        tokens += `ENTRY ${index}

TOKEN SYMBOL: ${token.name}
TOKEN ADDRESS: ${token.address}
PRICE: ${token.price}
24H CHANGE: ${token.price24hChangePercent}
LIQUIDITY: ${token.liquidity}`;
        tokens += "\n-------------------\n";
        index++;
      }
    }
    const solanaBalance = await this.getBalance();
    const finalPrompt = prompt.replace("{{trending_tokens}}", tokens).replace("{{solana_balance}}", String(solanaBalance));
    let responseContent = null;
    let retries = 0;
    const maxRetries = 3;
    while (retries < maxRetries && (!responseContent?.recommended_buy || !responseContent?.reason || !responseContent?.recommend_buy_address)) {
      const response = await this.runtime.useModel(ModelType5.TEXT_LARGE, {
        prompt: finalPrompt,
        system: _rolePrompt,
        temperature: 0.2,
        maxTokens: 4096,
        object: true
      });
      console.log("intel:buy-signal - response", response);
      responseContent = parseJSONObjectFromText(response);
      retries++;
      if (!responseContent?.recommended_buy && !responseContent?.reason && !responseContent?.recommend_buy_address) {
        logger10.warn("*** Missing required fields, retrying... generateSignal ***");
      }
    }
    if (!responseContent?.recommend_buy_address) {
      console.warn("buy-signal::generateSignal - no buy recommendation");
      return false;
    }
    if (!responseContent?.recommend_buy_address?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      logger10.error("Invalid Solana token address", {
        address: responseContent?.recommend_buy_address
      });
      return false;
    }
    const apiKey = this.runtime.getSetting("BIRDEYE_API_KEY");
    if (!apiKey) {
      logger10.error("BIRDEYE_API_KEY not found in runtime settings");
      return false;
    }
    const BIRDEYE_API = "https://public-api.birdeye.so";
    const endpoint = `${BIRDEYE_API}/defi/token_overview`;
    const url = `${endpoint}?address=${responseContent.recommend_buy_address}`;
    logger10.debug("Making Birdeye API request", {
      url,
      address: responseContent.recommend_buy_address
    });
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-chain": "solana",
        "X-API-KEY": apiKey
      }
    };
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const errorText = await res.text();
        logger10.error("Birdeye API request failed", {
          status: res.status,
          statusText: res.statusText,
          error: errorText,
          address: responseContent.recommend_buy_address
        });
        throw new Error(`Birdeye marketcap request failed: ${res.status} ${res.statusText}`);
      }
      const resJson = await res.json();
      const marketcap = resJson?.data?.marketCap;
      if (!marketcap) {
        logger10.warn("buy-signal: No marketcap data returned from Birdeye", {
          response: resJson,
          address: responseContent.recommend_buy_address
        });
      }
      responseContent.marketcap = Number(marketcap || 0);
    } catch (error) {
      logger10.error("Error fetching marketcap data:", error);
      responseContent.marketcap = 0;
    }
    this.runtime.emitEvent("SPARTAN_TRADE_BUY_SIGNAL", responseContent);
    await this.runtime.setCache("buy_signals", {
      key: "BUY_SIGNAL",
      data: responseContent
    });
    return true;
  }
  async getBalance() {
    const url = "https://zondra-wil7oz-fast-mainnet.helius-rpc.com";
    const headers = {
      "Content-Type": "application/json"
    };
    const data = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [DEGEN_WALLET]
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    const result = await response.json();
    const lamportsBalance = result?.result?.value;
    return lamportsBalance / 1e9;
  }
};

// src/plugins/degenIntel/tasks/sellSignal.ts
import { parseJSONObjectFromText as parseJSONObjectFromText3, logger as logger13, ModelType as ModelType6 } from "@elizaos/core";

// src/plugins/degenTrader/types.ts
var ServiceTypes = {
  DEGEN_TRADING: "degen_trader"
};

// src/plugins/degenTrader/utils/wallet.ts
import { logger as logger12, parseJSONObjectFromText as parseJSONObjectFromText2 } from "@elizaos/core";
import { Connection, Keypair, VersionedTransaction, PublicKey as PublicKey2 } from "@solana/web3.js";
import { Buffer as Buffer2 } from "buffer";

// src/plugins/degenTrader/utils/utils.ts
import { logger as logger11 } from "@elizaos/core";
import { PublicKey } from "@solana/web3.js";
function decodeBase58(str) {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const ALPHABET_MAP = new Map(ALPHABET.split("").map((c, i) => [c, BigInt(i)]));
  let result = BigInt(0);
  for (const char of str) {
    const value = ALPHABET_MAP.get(char);
    if (value === void 0) {
      throw new Error("Invalid base58 character");
    }
    result = result * BigInt(58) + value;
  }
  const bytes = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xffn));
    result = result >> 8n;
  }
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    bytes.unshift(0);
  }
  return new Uint8Array(bytes);
}

// src/plugins/degenTrader/utils/wallet.ts
function getWalletKeypair(runtime) {
  const privateKeyString = runtime?.getSetting("SOLANA_PRIVATE_KEY");
  if (!privateKeyString) {
    throw new Error("No wallet private key configured");
  }
  try {
    const privateKeyBytes = decodeBase58(privateKeyString);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    logger12.error("Failed to create wallet keypair:", error);
    throw error;
  }
}
var CONFIRMATION_CONFIG = {
  MAX_ATTEMPTS: 12,
  // Increased from 8
  INITIAL_TIMEOUT: 2e3,
  // 2 seconds
  MAX_TIMEOUT: 2e4,
  // 20 seconds
  // Exponential backoff between retries
  getDelayForAttempt: (attempt) => Math.min(2e3 * 1.5 ** attempt, 2e4)
};
function calculateDynamicSlippage(amount, quoteData) {
  const baseSlippage = 0.45;
  const priceImpact = Number.parseFloat(quoteData?.priceImpactPct || "0");
  const amountNum = Number(amount);
  let dynamicSlippage = baseSlippage;
  if (priceImpact > 1) {
    dynamicSlippage += priceImpact * 0.5;
  }
  if (amountNum > 1e4) {
    dynamicSlippage *= 1.5;
  }
  return Math.min(dynamicSlippage, 2.5);
}
async function executeTrade(runtime, params) {
  const actionStr = params.action === "SELL" ? "sell" : "buy";
  logger12.info(`Executing ${actionStr} trade using ${params.dex}:`, {
    tokenAddress: params.tokenAddress,
    amount: params.amount,
    slippage: params.slippage
  });
  try {
    const walletKeypair = getWalletKeypair(runtime);
    const connection = new Connection(runtime.getSetting("RPC_URL"));
    const SOL_ADDRESS2 = "So11111111111111111111111111111111111111112";
    const inputTokenCA = params.action === "SELL" ? params.tokenAddress : SOL_ADDRESS2;
    const outputTokenCA = params.action === "SELL" ? SOL_ADDRESS2 : params.tokenAddress;
    const swapAmount = params.action === "SELL" ? Number(params.amount) : Math.floor(Number(params.amount) * 1e9);
    const quoteResponse = await fetch(
      `https://public.jupiterapi.com/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${swapAmount}&slippageBps=${params.slippage}&platformFeeBps=200`
    );
    if (!quoteResponse.ok) {
      const error = await quoteResponse.text();
      const parsedResponse = parseJSONObjectFromText2(error);
      if (parsedResponse?.errorCode === "TOKEN_NOT_TRADABLE") {
        let extractTokenAddress = function(message) {
          const regex = /The token (\w{44}) is not tradable/;
          const match = message.match(regex);
          return match ? match[1] : null;
        };
        logger12.log("Need to flag", extractTokenAddress(parsedResponse.error), "as not tradable");
      }
      logger12.warn("Quote request failed:", {
        status: quoteResponse.status,
        error
      });
      return {
        success: false,
        error: `Failed to get quote: ${error}`
      };
    }
    const quoteData = await quoteResponse.json();
    logger12.log("Quote received:", quoteData);
    const dynamicSlippage = calculateDynamicSlippage(params.amount.toString(), quoteData);
    logger12.info("Using dynamic slippage:", {
      baseSlippage: params.slippage,
      dynamicSlippage,
      priceImpact: quoteData?.priceImpactPct
    });
    const swapResponse = await fetch("https://public.jupiterapi.com/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: {
          ...quoteData,
          slippageBps: Math.floor(dynamicSlippage * 1e4)
        },
        userPublicKey: walletKeypair.publicKey.toString(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 5e6,
        dynamicComputeUnitLimit: true
      })
    });
    if (!swapResponse.ok) {
      const error = await swapResponse.text();
      logger12.error("Swap request failed:", {
        status: swapResponse.status,
        error
      });
      throw new Error(`Failed to get swap transaction: ${error}`);
    }
    const swapData = await swapResponse.json();
    logger12.log("Swap response received:", swapData);
    if (!swapData?.swapTransaction) {
      logger12.error("Invalid swap response:", swapData);
      throw new Error("No swap transaction returned in response");
    }
    const transactionBuf = Buffer2.from(swapData.swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(transactionBuf);
    const latestBlockhash = await connection.getLatestBlockhash("processed");
    tx.message.recentBlockhash = latestBlockhash.blockhash;
    tx.sign([walletKeypair]);
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
      preflightCommitment: "processed"
    });
    logger12.log("Transaction sent with high priority:", {
      signature,
      explorer: `https://solscan.io/tx/${signature}`
    });
    let confirmed = false;
    for (let i = 0; i < CONFIRMATION_CONFIG.MAX_ATTEMPTS; i++) {
      try {
        const status = await connection.getSignatureStatus(signature);
        if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
          confirmed = true;
          logger12.log("Transaction confirmed:", {
            signature,
            confirmationStatus: status.value.confirmationStatus,
            slot: status.context.slot,
            attempt: i + 1
          });
          break;
        }
        const delay = CONFIRMATION_CONFIG.getDelayForAttempt(i);
        logger12.info(
          `Waiting ${delay}ms before next confirmation check (attempt ${i + 1}/${CONFIRMATION_CONFIG.MAX_ATTEMPTS})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        logger12.warn(`Confirmation check ${i + 1} failed:`, error);
        if (i === CONFIRMATION_CONFIG.MAX_ATTEMPTS - 1) {
          throw new Error("Could not confirm transaction status");
        }
        const delay = CONFIRMATION_CONFIG.getDelayForAttempt(i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    if (!confirmed) {
      throw new Error("Could not confirm transaction status");
    }
    logger12.log("Trade executed successfully:", {
      type: params.action === "SELL" ? "sell" : "buy",
      tokenAddress: params.tokenAddress,
      amount: params.amount,
      signature,
      explorer: `https://solscan.io/tx/${signature}`
    });
    return {
      success: true,
      signature,
      receivedAmount: params.amount,
      receivedValue: params.amount
    };
  } catch (error) {
    logger12.error("Trade execution failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      params: {
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        slippage: params.slippage,
        dex: params.dex,
        action: params.action
      },
      errorStack: error instanceof Error ? error.stack : void 0
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getWalletBalances(runtime) {
  try {
    const walletKeypair = getWalletKeypair(runtime);
    const connection = new Connection(runtime.getSetting("RPC_URL"));
    const solBalance = await connection.getBalance(walletKeypair.publicKey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletKeypair.publicKey, {
      programId: new PublicKey2("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });
    const balances = {
      solBalance: solBalance / 1e9,
      tokens: tokenAccounts.value.map((account) => ({
        mint: account.account.data.parsed.info.mint,
        balance: account.account.data.parsed.info.tokenAmount.amount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount
      }))
    };
    return balances;
  } catch (error) {
    logger12.error("Failed to get wallet balances:", error);
    return {
      solBalance: 0,
      tokens: []
    };
  }
}
async function getTokenBalance(runtime, tokenMint) {
  try {
    const balances = await getWalletBalances(runtime);
    const token = balances.tokens.find((t) => t.mint.toLowerCase() === tokenMint.toLowerCase());
    if (!token) {
      logger12.warn(`No balance found for token ${tokenMint}`, {
        availableTokens: balances.tokens.map((t) => t.mint)
      });
    }
    return token;
  } catch (error) {
    logger12.error("Failed to get token balance:", error);
    return null;
  }
}

// src/plugins/degenIntel/tasks/sellSignal.ts
var rolePrompt2 = "You are a sell signal analyzer.";
var template2 = `

I want you to give a crypto sell signal based on both the sentiment analysis as well as the wallet token data.
The sentiment score has a range of -100 to 100, with -100 indicating extreme negativity and 100 indicating extreme positiveness.
My current balance is {{solana_balance}} SOL, If I have less than 0.3 SOL, I should up the priority on selling something but we don't need to realize a heavy loss over it.

Sentiment analysis:

{{sentiment}}

Wallet tokens:

{{walletData}}

Additional wallet token data (in JSON format):
{{walletData2}}

Only return the following JSON:

{
  recommended_sell: "the symbol of the token for example DEGENAI",
  recommend_sell_address: "the address of the token to purchase, for example: 2sCUCJdVkmyXp4dT8sFaA9LKgSMK4yDPi9zLHiwXpump",
  reason: "the reason why you think this is a good sell, and why you chose the specific amount",
  sell_amount: "number, for example: 600.54411 (number amount of tokens to sell)"
}`;
var SellSignal = class {
  apiKey;
  runtime;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async generateSignal() {
    try {
      logger13.info("sell-signal::generateSignal - Generating sell signal");
      await this.runtime.emitEvent("INTEL_SYNC_WALLET", {});
      const walletBalances = await getWalletBalances(this.runtime);
      const walletData = walletBalances.tokens.map((token) => ({
        mint: token.mint,
        balance: token.uiAmount
      }));
      if (!walletData.length) {
        logger13.warn("No wallet tokens found");
        return false;
      }
      const portfolioData = await this.runtime.getCache("PORTFOLIO") || [];
      const txHistoryData = await this.runtime.getCache("transaction_history") || [];
      let walletProviderStr = "Your wallet contents: ";
      const tokensHeld = [];
      for (const t of walletData) {
        walletProviderStr += "You hold " + t.balance + "(" + t.balance + ") of " + t.mint + " (" + t.mint + " CA: " + t.mint + ") worth $" + t.balance + "usd (" + t.balance + " sol)\n";
        tokensHeld.push(t.mint);
      }
      let prompt = template2.replace("{{walletData}}", walletProviderStr);
      const tradeService = this.runtime.getService(
        ServiceTypes.DEGEN_TRADING
      );
      if (tradeService) {
        const tokenData = await tradeService.dataService.getTokensMarketData(tokensHeld);
        prompt = prompt.replace("{{walletData2}}", JSON.stringify(tokenData));
      } else {
        prompt = prompt.replace("{{walletData2}}", "");
      }
      const sentimentData = await this.runtime.getCache("sentiments") || [];
      if (!sentimentData.length) {
        logger13.warn("No sentiment data found");
        return false;
      }
      let sentiments = "";
      let idx = 1;
      for (const sentiment of sentimentData) {
        if (!sentiment?.occuringTokens?.length) continue;
        sentiments += `ENTRY ${idx}
TIME: ${sentiment.timeslot}
TOKEN ANALYSIS:
`;
        for (const token of sentiment.occuringTokens) {
          sentiments += `${token.token} - Sentiment: ${token.sentiment}
${token.reason}
`;
        }
        sentiments += "\n-------------------\n";
        idx++;
      }
      prompt = prompt.replace("{{sentiment}}", sentiments);
      const solanaBalance = await this.getBalance();
      const finalPrompt = prompt.replace("{{solana_balance}}", String(solanaBalance));
      let responseContent = null;
      let retries = 0;
      const maxRetries = 3;
      while (retries < maxRetries && (!responseContent?.recommended_sell || !responseContent?.reason || !responseContent?.recommend_sell_address)) {
        const response = await this.runtime.useModel(ModelType6.TEXT_LARGE, {
          prompt: finalPrompt,
          system: rolePrompt2,
          temperature: 0.2,
          maxTokens: 4096,
          object: true
        });
        responseContent = parseJSONObjectFromText3(response);
        retries++;
        if (!responseContent?.recommended_sell && !responseContent?.reason && !responseContent?.recommend_sell_address) {
          logger13.warn("*** Missing required fields, retrying... generateSignal ***");
        }
      }
      if (!responseContent?.recommend_sell_address) {
        logger13.warn("sell-signal::generateSignal - no sell recommendation");
        return false;
      }
      if (!responseContent?.recommend_sell_address?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        logger13.error("Invalid Solana token address", {
          address: responseContent?.recommend_sell_address
        });
        return false;
      }
      const apiKey = this.runtime.getSetting("BIRDEYE_API_KEY");
      if (!apiKey) {
        logger13.error("BIRDEYE_API_KEY not found in runtime settings");
        return false;
      }
      const BIRDEYE_API = "https://public-api.birdeye.so";
      const endpoint = `${BIRDEYE_API}/defi/token_overview`;
      const url = `${endpoint}?address=${responseContent.recommend_sell_address}`;
      logger13.debug("Making Birdeye API request", {
        url,
        address: responseContent.recommend_sell_address
      });
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-chain": "solana",
          "X-API-KEY": apiKey
        }
      };
      try {
        const res = await fetch(url, options);
        if (!res.ok) {
          const errorText = await res.text();
          logger13.error("Birdeye API request failed", {
            status: res.status,
            statusText: res.statusText,
            error: errorText,
            address: responseContent.recommend_sell_address
          });
          throw new Error(`Birdeye marketcap request failed: ${res.status} ${res.statusText}`);
        }
        const resJson = await res.json();
        const marketcap = resJson?.data?.marketCap;
        if (!marketcap) {
          logger13.warn("sell: No marketcap data returned from Birdeye", {
            response: resJson,
            address: responseContent.recommend_sell_address
          });
        }
        responseContent.marketcap = Number(marketcap || 0);
      } catch (error) {
        logger13.error("Error fetching marketcap data:", error);
        responseContent.marketcap = 0;
      }
      logger13.info("Emitting sell signal", {
        token: responseContent.recommended_sell,
        address: responseContent.recommend_sell_address,
        amount: responseContent.sell_amount
      });
      await this.runtime.emitEvent("SPARTAN_TRADE_SELL_SIGNAL", {
        recommend_sell_address: responseContent.recommend_sell_address,
        sell_amount: responseContent.sell_amount,
        reason: responseContent.reason
      });
      logger13.info("Sell signal emitted successfully");
      await this.runtime.setCache("sell_signals", {
        key: "SELL_SIGNAL",
        data: responseContent
      });
      return true;
    } catch (error) {
      logger13.error("Error generating sell signal:", error);
      return false;
    }
  }
  async getBalance() {
    const url = "https://zondra-wil7oz-fast-mainnet.helius-rpc.com";
    const headers = {
      "Content-Type": "application/json"
    };
    const data = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [this.runtime.getSetting("SOLANA_PUBLIC_KEY")]
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    const result = await response.json();
    const lamportsBalance = result?.result?.value;
    return lamportsBalance / 1e9;
  }
};

// src/plugins/degenIntel/tasks/twitter.ts
import {
  ChannelType as ChannelType2,
  ServiceType as ServiceType2,
  createUniqueUuid as createUniqueUuid4,
  logger as logger14
} from "@elizaos/core";
var Twitter = class {
  runtime;
  feedRoomId;
  constructor(runtime) {
    this.runtime = runtime;
    this.feedRoomId = createUniqueUuid4(runtime, "twitter-feed");
  }
  async syncRawTweets() {
    const users = [
      "shawmakesmagic",
      "aixbt_agent",
      "0x_nomAI",
      "mobyagent",
      "arok_vc",
      "finding_yeti",
      "ShardiB2",
      "dankvr",
      "elizaos",
      "autodotfun",
      "Overdose_AI",
      "Heyitsyolotv",
      "CryptoGodJohn",
      "traderpow",
      "0xRamonos",
      "CryptoKaleo",
      "TeTheGamer",
      "CryptoHayes",
      "JakeGagain",
      "Yourpop8",
      "LFGNOW1",
      "garbinsky182",
      "Bored_Hades18",
      "gianinaskarlett",
      "ZssBecker",
      "CryptoWizardd",
      "KookCapitalLLC",
      "CrashiusClay69",
      "rasmr_eth",
      "MustStopMurad",
      "0xSweep",
      "CryptoTalkMan",
      "Jeremyybtc",
      "W0LF0FCRYPT0",
      "blknoiz06",
      "SrPetersETH",
      "SolJakey",
      "fuelkek",
      "whalewatchalert",
      "shax_btc",
      "alphawifhat",
      "CampbellJAustin",
      "beast_ico",
      "0xSisyphus",
      "AltcoinGordon",
      "imperooterxbt",
      "basedkarbon",
      "RektProof",
      "trader1sz",
      "notsofast ",
      "cobie"
    ];
    await this.runtime.ensureRoomExists({
      id: this.feedRoomId,
      name: "Twitter Feed",
      source: "twitter",
      type: ChannelType2.FEED
    });
    let manager = this.runtime.getService(ServiceType2.TWITTER);
    while (!manager) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      manager = this.runtime.getService(ServiceType2.TWITTER);
    }
    console.log("degen-intel: Twitter manager acquired, starting sync");
    const client = manager.getClient(this.runtime.agentId, this.runtime.agentId);
    let twitterClient = client.client.twitterClient;
    if (!twitterClient) {
      logger14.error("Twitter client not found");
      return false;
    }
    for (const u of users) {
      try {
        const list = twitterClient.getTweets(u, 200);
        let syncCount = 0;
        for await (const item of list) {
          if (item?.text && !item?.isRetweet) {
            const tweetId = createUniqueUuid4(this.runtime, item.id);
            const existingTweet = await this.runtime.getMemoryById(tweetId);
            if (existingTweet) {
              continue;
            }
            await this.runtime.createMemory(
              {
                id: tweetId,
                agentId: this.runtime.agentId,
                roomId: this.feedRoomId,
                entityId: this.runtime.agentId,
                content: {
                  text: item.text,
                  source: "twitter",
                  metadata: {
                    likes: item.likes ?? 0,
                    retweets: item.retweets ?? 0,
                    username: item.username,
                    timestamp: new Date(item.timestamp * 1e3).toISOString()
                  }
                },
                createdAt: item.timestamp * 1e3
              },
              "messages"
            );
            syncCount++;
          }
        }
        logger14.info(`Raw tweet sync [username: ${u}] synced ${syncCount} new tweets`);
        await new Promise((resolve) => setTimeout(resolve, 1e4));
      } catch (error) {
        logger14.error("Error syncing tweets:", error);
        await new Promise((resolve) => setTimeout(resolve, 1e4));
      }
    }
    return true;
  }
};

// src/plugins/degenIntel/tasks/twitterParser.ts
import {
  ModelType as ModelType7,
  createUniqueUuid as createUniqueUuid5,
  logger as logger15
} from "@elizaos/core";
var makeBulletpointList2 = (array) => {
  return array.map((a) => ` - ${a}`).join("\n");
};
var examples2 = [
  "$KUDAI 87% retention rate after 30 days. smart engagement up 1333% week over week. arbitrum expansion next with full gmx integration",
  "ecosystem play emerging\n\nboth tokens showing unusual strength - $HWTR running 12m mcap in first 24h, $MON bringing established gaming liquidity to HL",
  "alliance dao backing + $54m daily volume on $GRIFT. defai sector at $2.5b. agent infrastructure capturing value faster than agents themselves",
  "morpho lending markets at 100% utilization. lenders trapped, borrowers facing liquidation. protocol revenue switch activated while crisis unfolds",
  "$AERO voters collected $7.8M in fees last week alone. alm v2 launching. base's flagship dex running 1,109% apr on select pairs",
  "$ZEUS sitting at 21.8 zbtc minted with mechanismcap and animoca verifying cross-chain. current mcap 249m",
  "13 states expected to pass sbr legislation by summer\n\nonly 21m $btc exist\n\nstates about to learn about supply shock",
  "trump cards doing 2.38M $POL volume in last 24h. floor at 1.3k from 99 mint. classic season signal when pfp floors detach from reality",
  "$ethos launching on base mainnet next week after 15 months of dev. smart contracts audited\n\nprivate testnet wrapping up",
  "original $ROSS donated $250k to ross ulbricht's wallet, $300k to family. 8 month track record vs fresh fork trying to steal narrative",
  "hardware accelerated L2s are no longer theoretical\n\n$LAYER processing 1M TPS through InfiniSVM, pushing 100Gbps+ bandwidth at mainnet. already managing 350M tvl",
  "gaming and AI infrastructure are converging\n\n$PRIME at $14.29 with $749M mcap building a multi-vertical platform combining TCG, AI agents, and competitive gaming",
  "$LLM represents perfect fusion of memes and AI narratives on solana. from ascii art generator to binance alpha featured project with institutional backing",
  "$AERO doing more volume than uniswap's top pools across mainnet + base + arb\n\nreality check: major assets now trade more on aerodrome than anywhere else on-chain",
  "makersplace shutting down after pioneering $69M beeple sale\n\nplatform economics dead but the builders are evolving",
  "721 total supply. open edition with 6.9 week delayed reveal. multiple whitelists being distributed through bera ecosystem fcfs",
  "$qude implementing basic completions while others push assistants and tools\n\nsdk launch upcoming with enhanced token holder rewards\n\nonly non-scam ai in dex top 30",
  "pudgy penguins expanding beyond nfts\n\nmobile game on abstract chain, trading cards through ocap games, integration with agents of poker",
  "defai narrative hitting peak momentum. $SAI touched new ath of $0.106 today with 8.4% 24h gain. trading at $0.104 with 45% weekly growth",
  "same backers as $TAO but 300x smaller market cap\n\n$SAI generating $4.8M daily volume across gate, mexc, binance\n\ntier 1 listing imminent",
  "$BONK holding strength while market bleeds from $TRUMP launch\n\n10.7% up in 24h while others red. resistance becomes support",
  "now that $AERO is eating uniswap's volume on base + arb + mainnet, will velodrome and sushi exit?",
  "circle minted $250m $usdc on solana 5 hours ago. total solana mints now $2.2b in past 18 days",
  "everything leads to jan 20 release date. volume hitting $13.8m with price swinging between $0.013 and $0.023 in 24h",
  "$J launching on okx jan 22. dual token structure with $JAMBO creates real incentives for network growth\n\n20 token airdrop live",
  "40+ AVS services building on eigenlayer infrastructure, primarily focused on AI verification and security sharing protocols",
  "$build enabling direct web2 AI agent integration while trading at 41m mcap vs comparable infra at 3.6b. market needs to explain this gap",
  "survival belongs to brand builders not fee collectors\n\npudgy trading 26 eth floor while launching physical cards, plushies and blockchain games",
  "camelot dex already live on educhain. first L3 specialized for education apps and on-chain education finance. $EDU ecosystem expanding",
  "dual token system incoming w/ $anon + $anon33\n\ndefai category added to gecko tracking. 150% gain last 14 days on rising volumes",
  "the retardio network went deeper than expected\n\n$KUDAI automated GMX/uni v3 positions generated 350k in first week revenue with only 6000 holders",
  "$TRUMP just flipped $PEPE. what happens next to the overall memecoin market cap",
  "launch timing looks right. $42.4M mcap, burning tokens from listings + uni v3 fees\n\nformer aethir cco mack lorden just joined as chief commercial",
  "$GRPH studio launches with token burn mechanism\n\nfree development stays open while managed infrastructure requires token stake. 3000 personalities generated",
  "merit systems raises $10m from a16z + blockchain capital to build open source attribution protocol. ex-jolt zk builder and bcap engineers behind it",
  "$TRUMP flips $PEPE in market cap. 8.6B vs 8.5B\n\nFirst time since PEPE launch a new memecoin has achieved this",
  "best part about $SWORLD: vanguard pfp rebirth incoming\n\nclean token distribution through staking\n\nopen alpha running with 2 months left until close",
  "pudgy penguins showing the way. $PENGU at $2B mcap with 615k holders. pushing into abstract chain gaming while traditional marketplaces collapse",
  "current state: $ONDO mc 1.99B, 24h vol 748M, perp OI 440M. recent whale dumped 10.9M tokens for 13.5M usdc",
  "solana lst market hitting critical mass. 9% of total stake now in liquid staking tokens unlocking $7.5B productive sol\n\nbnSOL printed largest weekly inflow in chain history at $248M",
  "ETH/USD trading up to 1000x leverage\n\nsUSDe interest rate plays up to 10000x\n\npartnerships with ethena and lido for yield generation",
  "lending volumes growing fast. protocol revenue data incoming\n\nbase tvl already crossing early targets",
  "700k users across 128 countries already using web3 phones\n\njambo building real infrastructure while others just talk about adoption"
];
var rolePrompt3 = "You are a tweet analyzer.";
var template3 = `Write a summary of what is happening in the tweets. The main topic is the cryptocurrency market, but you don't have to state that explicitly.
You will also be analyzing the tokens that occur in the tweet and tell us whether their sentiment is positive or negative.

## Analyze the followings tweets:
{{tweets}}

## Rules:

## Example texts:
${makeBulletpointList2(examples2)}

Strictly return the following json:

{
   "text":"the summary of what has happened in those tweets, with a max length of 200 characters. Refer to ## Example texts",
   "occuringTokens":[
      {
         "token":"the token symbol, like: ETH, SOL, BTC etc.",
         "sentiment":"positive is between 1 and 100 and negative is from -1 to -100",
         "reason":"a short sentence explaining the reason for this sentiment score"
      }
   ]
}
`;
var TwitterParser = class {
  runtime;
  roomId;
  constructor(runtime) {
    this.runtime = runtime;
    this.roomId = createUniqueUuid5(runtime, "twitter-sentiment-analysis");
  }
  async fillTimeframe() {
    const cachedSentiments = await this.runtime.getCache("sentiments");
    const sentiments = cachedSentiments ? cachedSentiments : [];
    const lookUpDate = sentiments.length > 0 ? sentiments.sort(
      (a, b) => new Date(b.timeslot).getTime() - new Date(a.timeslot).getTime()
    )[0].timeslot : null;
    const start = new Date(lookUpDate || "2025-01-01T00:00:00.000Z");
    start.setUTCHours(0, 0, 0, 0);
    const today = /* @__PURE__ */ new Date();
    today.setUTCHours(23, 59, 59, 999);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24));
    const timeSlots = [];
    for (let day = 0; day <= diff; day++) {
      const now = new Date(start);
      now.setUTCDate(start.getUTCDate() + day);
      for (let hour = 0; hour <= 23; hour++) {
        const timeslotDate = new Date(now);
        timeslotDate.setUTCHours(hour, 0, 0, 0);
        const timeslot = timeslotDate.toISOString();
        const rightNow = /* @__PURE__ */ new Date();
        if (timeslotDate > rightNow) {
          break;
        }
        const exists = sentiments.some(
          (s) => new Date(s.timeslot).getTime() === timeslotDate.getTime()
        );
        if (!exists) {
          timeSlots.push({
            timeslot,
            processed: false
          });
        }
      }
    }
    if (timeSlots.length > 0) {
      const updatedSentiments = [...sentiments, ...timeSlots];
      await this.runtime.setCache("sentiments", updatedSentiments);
    }
    logger15.debug(`Updated timeframes, added ${timeSlots.length} new slots`);
  }
  async parseTweets() {
    await this.fillTimeframe();
    const cachedSentiments = await this.runtime.getCache("sentiments");
    const sentiments = cachedSentiments ? cachedSentiments : [];
    const now = /* @__PURE__ */ new Date();
    const oneHourAgo = new Date(now);
    oneHourAgo.setUTCHours(now.getUTCHours() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setUTCDate(now.getUTCDate() - 2);
    const unprocessedSentiment = sentiments.find(
      (s) => !s.processed && new Date(s.timeslot) <= oneHourAgo && new Date(s.timeslot) >= twoDaysAgo
    );
    if (!unprocessedSentiment) {
      logger15.debug("No unprocessed timeslots available.");
      return true;
    }
    logger15.debug(`Trying to process ${new Date(unprocessedSentiment.timeslot).toISOString()}`);
    const timeslot = new Date(unprocessedSentiment.timeslot);
    const fromDate = new Date(timeslot);
    fromDate.setUTCHours(timeslot.getUTCHours() - 1);
    fromDate.setUTCSeconds(fromDate.getUTCSeconds() + 1);
    const memories = await this.runtime.getMemories({
      tableName: "messages",
      roomId: this.roomId,
      start: fromDate.getTime(),
      end: timeslot.getTime()
    });
    const tweets = memories.filter(
      (memory) => memory.content.source === "twitter"
    ).sort((a, b) => b.createdAt - a.createdAt);
    if (!tweets || tweets.length === 0) {
      logger15.info(`No tweets to process for timeslot ${timeslot.toISOString()}`);
      const updatedSentiments2 = sentiments.map(
        (s) => s.timeslot === unprocessedSentiment.timeslot ? { ...s, processed: true } : s
      );
      await this.runtime.setCache("sentiments", updatedSentiments2);
      return true;
    }
    const tweetArray = tweets.map((memory) => {
      const tweet = memory.content;
      return `username: ${tweet.tweet?.username || "unknown"} tweeted: ${tweet.text}${tweet.tweet?.likes ? ` with ${tweet.tweet.likes} likes` : ""}${tweet.tweet?.retweets ? ` and ${tweet.tweet.retweets} retweets` : ""}.`;
    });
    const bulletpointTweets = makeBulletpointList2(tweetArray);
    const prompt = template3.replace("{{tweets}}", bulletpointTweets);
    const response = await this.runtime.useModel(ModelType7.TEXT_LARGE, {
      prompt,
      system: rolePrompt3,
      temperature: 0.2,
      maxTokens: 4096,
      object: true
    });
    const json = JSON.parse(response || "{}");
    const updatedSentiments = sentiments.map(
      (s) => s.timeslot === unprocessedSentiment.timeslot ? {
        ...s,
        text: json.text,
        occuringTokens: json.occuringTokens,
        processed: true
      } : s
    );
    await this.runtime.setCache("sentiments", updatedSentiments);
    logger15.info(
      `Successfully processed timeslot ${new Date(unprocessedSentiment.timeslot).toISOString()}`
    );
    return true;
  }
};

// src/plugins/degenIntel/tasks.ts
var registerTasks = async (runtime, worldId) => {
  worldId = runtime.agentId;
  const tasks = await runtime.getTasks({
    tags: ["queue", "repeat", "degen_intel"]
  });
  for (const task of tasks) {
    await runtime.deleteTask(task.id);
  }
  runtime.registerTaskWorker({
    name: "INTEL_SYNC_WALLET",
    validate: async (_runtime, _message, _state) => {
      return true;
    },
    execute: async (runtime2, _options, task) => {
      const birdeye = new Birdeye(runtime2);
      try {
        await birdeye.syncWallet();
      } catch (error) {
        logger16.error("Failed to sync wallet", error);
      }
    }
  });
  runtime.createTask({
    name: "INTEL_SYNC_WALLET",
    description: "Sync wallet from Birdeye",
    worldId,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      updateInterval: 1e3 * 60 * 5
      // 5 minutes
    },
    tags: ["queue", "repeat", "degen_intel", "immediate"]
  });
  const plugins = runtime.plugins.map((p) => p.name);
  if (plugins.indexOf("twitter") !== -1) {
    runtime.registerTaskWorker({
      name: "INTEL_SYNC_RAW_TWEETS",
      validate: async (runtime2, _message, _state) => {
        const twitterService = runtime2.getService("twitter");
        if (!twitterService) {
          logger16.debug("Twitter service not available, removing INTEL_SYNC_RAW_TWEETS task");
          const tasks2 = await runtime2.getTasksByName("INTEL_SYNC_RAW_TWEETS");
          for (const task of tasks2) {
            await runtime2.deleteTask(task.id);
          }
          return false;
        }
        return true;
      },
      execute: async (runtime2, _options, task) => {
        try {
          const twitter = new Twitter(runtime2);
          await twitter.syncRawTweets();
        } catch (error) {
          logger16.error("Failed to sync raw tweets", error);
        }
      }
    });
    runtime.createTask({
      name: "INTEL_SYNC_RAW_TWEETS",
      description: "Sync raw tweets from Twitter",
      worldId,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updateInterval: 1e3 * 60 * 15
        // 15 minutes
      },
      tags: ["queue", "repeat", "degen_intel", "immediate"]
    });
    runtime.registerTaskWorker({
      name: "INTEL_PARSE_TWEETS",
      validate: async (runtime2, _message, _state) => {
        const twitterService = runtime2.getService("twitter");
        if (!twitterService) {
          return false;
        }
        return true;
      },
      execute: async (runtime2, _options, task) => {
        const twitterParser = new TwitterParser(runtime2);
        try {
          await twitterParser.parseTweets();
        } catch (error) {
          logger16.error("Failed to parse tweets", error);
        }
      }
    });
    runtime.createTask({
      name: "INTEL_PARSE_TWEETS",
      description: "Parse tweets",
      worldId,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updateInterval: 1e3 * 60 * 60 * 24
        // 24 hours
      },
      tags: ["queue", "repeat", "degen_intel", "immediate"]
    });
  } else {
    console.log(
      "intel:tasks - plugins",
      runtime.plugins.map((p) => p.name)
    );
    logger16.debug(
      "WARNING: Twitter plugin not found, skipping creation of INTEL_SYNC_RAW_TWEETS task"
    );
  }
  const tradeService = runtime.getService("degen_trader");
  if (tradeService) {
    runtime.registerTaskWorker({
      name: "INTEL_GENERATE_BUY_SIGNAL",
      validate: async (runtime2, _message, _state) => {
        const sentimentsData = await runtime2.getCache("sentiments") || [];
        if (sentimentsData.length === 0) {
          return false;
        }
        return true;
      },
      execute: async (runtime2, _options, task) => {
        const signal = new BuySignal(runtime2);
        try {
          await signal.generateSignal();
        } catch (error) {
          logger16.error("Failed to generate buy signal", error);
        }
      }
    });
    runtime.createTask({
      name: "INTEL_GENERATE_BUY_SIGNAL",
      description: "Generate a buy signal",
      worldId,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updateInterval: 1e3 * 60 * 5
        // 5 minutes
      },
      tags: ["queue", "repeat", "degen_intel", "immediate"]
    });
    runtime.registerTaskWorker({
      name: "INTEL_GENERATE_SELL_SIGNAL",
      validate: async (runtime2, _message, _state) => {
        const sentimentsData = await runtime2.getCache("sentiments") || [];
        if (sentimentsData.length === 0) {
          return false;
        }
        return true;
      },
      execute: async (runtime2, _options, task) => {
        const signal = new SellSignal(runtime2);
        try {
          await signal.generateSignal();
        } catch (error) {
          logger16.error("Failed to generate buy signal", error);
        }
      }
    });
    runtime.createTask({
      name: "INTEL_GENERATE_SELL_SIGNAL",
      description: "Generate a sell signal",
      worldId,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updateInterval: 1e3 * 60 * 5
        // 5 minutes
      },
      tags: ["queue", "repeat", "degen_intel", "immediate"]
    });
  } else {
    logger16.debug(
      "WARNING: Trader service not found, skipping creation of INTEL_GENERATE_*_SIGNAL task"
    );
  }
};

// src/plugins/degenIntel/index.ts
import { logger as logger19 } from "@elizaos/core";

// src/plugins/degenIntel/providers/sentiment.ts
var sentimentProvider = {
  name: "CRYPTOTWITTER_MARKET_SENTIMENT",
  description: "Information about the current cryptocurrency twitter sentiment",
  dynamic: true,
  get: async (runtime, message, state) => {
    const sentimentData = await runtime.getCache("sentiments") || [];
    if (!sentimentData.length) {
      logger.warn("No sentiment data found");
      return false;
    }
    let sentiments = "\nCurrent cryptocurrency market data:";
    let idx = 1;
    for (const sentiment of sentimentData) {
      if (!sentiment?.occuringTokens?.length) continue;
      sentiments += `ENTRY ${idx}
TIME: ${sentiment.timeslot}
TOKEN ANALYSIS:
`;
      for (const token of sentiment.occuringTokens) {
        sentiments += `${token.token} - Sentiment: ${token.sentiment}
${token.reason}
`;
      }
      sentiments += "\n-------------------\n";
      idx++;
    }
    const data = {
      sentimentData
    };
    const values = {};
    const text = sentiments + "\n";
    return {
      data,
      values,
      text
    };
  }
};

// src/plugins/degenIntel/providers/cmcMarket.ts
import { logger as logger17 } from "@elizaos/core";
var cmcMarketProvider = {
  name: "INTEL_CMC_LATEST",
  description: "A list of trending solana tokens from the CoinMarketCap API",
  dynamic: true,
  get: async (runtime, message, state) => {
    const tokens = await runtime.getCache("tokens_solana") || [];
    if (!tokens.length) {
      logger17.warn("No tokens found in cache for CMC latest");
      return {
        data: { tokens: [] },
        values: {},
        text: "No trending tokens available from CoinMarketCap."
      };
    }
    const combinedTokens = tokens.slice(0, 10);
    let latestTxt = "Latest Tokens (CoinMarketCap):\n\n";
    let idx = 1;
    for (const t of combinedTokens) {
      const rank = t.rank || idx;
      const name = t.name || "Unknown";
      const symbol = t.symbol || "?";
      const priceUsd = t.price?.toFixed(10) || "0";
      const volume24hUSD = t.volume24hUSD?.toFixed(2) || "0";
      const price24hChangePercent = t.price24hChangePercent?.toFixed(2) || "0";
      const liquidity = t.liquidity?.toFixed(2) || "N/A";
      const marketcap = t.marketcap?.toFixed(2) || "0";
      latestTxt += `RANK ${rank}: ${name} (${symbol}) - Price: $${priceUsd}, Volume 24h: $${volume24hUSD}, Change 24h: ${price24hChangePercent}%, Liquidity: ${liquidity}, Market Cap: $${marketcap}
`;
      idx++;
    }
    return {
      data: { tokens: combinedTokens },
      values: {},
      text: latestTxt
    };
  }
};

// src/plugins/degenIntel/providers/birdeyeTrending.ts
import { logger as logger18 } from "@elizaos/core";
var birdeyeTrendingProvider = {
  name: "INTEL_BIRDEYE",
  description: "A list of trending solana tokens from the Birdeye REST API",
  dynamic: true,
  get: async (runtime, message, state) => {
    const tokens = await runtime.getCache("tokens_solana") || [];
    if (!tokens || tokens.length === 0) {
      logger18.warn("No tokens found in cache for Birdeye trending");
      return {
        data: { tokens: [] },
        values: {},
        text: "No trending tokens available at the moment."
      };
    }
    const combinedTokens = tokens.slice(0, 10);
    let latestTxt = "Trending Tokens (Birdeye):\n\n";
    let idx = 1;
    for (const t of combinedTokens) {
      const rank = t.rank || idx;
      const name = t.name || "Unknown";
      const symbol = t.symbol || "?";
      const priceUsd = t.price?.toFixed(10) || "0";
      const volume24hUSD = t.volume24hUSD?.toFixed(2) || "0";
      const price24hChangePercent = t.price24hChangePercent?.toFixed(2) || "0";
      const liquidity = t.liquidity?.toFixed(2) || "0";
      const marketcap = t.marketcap?.toFixed(2) || "0";
      latestTxt += `RANK ${rank}: ${name} (${symbol}) - Price: $${priceUsd}, Volume 24h: $${volume24hUSD}, Change 24h: ${price24hChangePercent}%, Liquidity: $${liquidity}, Market Cap: $${marketcap}
`;
      idx++;
    }
    return {
      data: { tokens: combinedTokens },
      values: {},
      text: latestTxt
    };
  }
};

// src/plugins/degenIntel/providers/birdeyeWallet.ts
var birdeyeWalletProvider = {
  name: "INTEL_BIRDEYE_WALLET",
  description: "A wallet provider that gives the current wallet portfolio and recent transactions",
  dynamic: true,
  get: async (runtime, message, state) => {
    const portfolioData = await runtime.getCache("portfolio") || { key: "PORTFOLIO", data: null };
    if (!portfolioData?.data) {
      return {
        data: { portfolio: {}, trades: [] },
        values: {},
        text: "No wallet portfolio data available."
      };
    }
    const trades = await runtime.getCache("transaction_history") || [];
    const portfolioText = `Current Portfolio:
${JSON.stringify(portfolioData.data, null, 2)}

`;
    const tradesText = `Recent Transactions:
${JSON.stringify(trades.slice(0, 5), null, 2)}`;
    return {
      data: { portfolio: portfolioData.data, trades },
      values: {},
      text: portfolioText + tradesText
    };
  }
};

// src/plugins/degenIntel/index.ts
var degenIntelPlugin = {
  name: "degen-intel",
  description: "Degen Intel plugin",
  routes: apis_default,
  providers: [],
  tests: [
    {
      name: "test suite for degen-intel",
      tests: [
        {
          name: "test for degen-intel",
          fn: async (runtime) => {
            logger19.info("test in degen-intel working");
          }
        }
      ]
    }
  ],
  init: async (_, runtime) => {
    await registerTasks(runtime);
    const plugins = runtime.plugins.map((p) => p.name);
    let notUsed = true;
    if (runtime.getSetting("COINMARKETCAP_API_KEY")) {
      runtime.registerProvider(cmcMarketProvider);
      notUsed = false;
    }
    if (runtime.getSetting("BIRDEYE_API_KEY")) {
      runtime.registerProvider(birdeyeTrendingProvider);
      runtime.registerProvider(birdeyeWalletProvider);
      notUsed = false;
    }
    if (plugins.indexOf("twitter") !== -1) {
      runtime.registerProvider(sentimentProvider);
      notUsed = false;
    }
    if (notUsed) {
      logger19.warn(
        "degen-intel plugin is included but not providing any value (COINMARKETCAP_API_KEY/BIRDEYE_API_KEY or twitter are suggested)"
      );
    }
  }
};

// src/plugins/degenTrader/tradingService.ts
import { logger as logger34, Service as Service3 } from "@elizaos/core";

// src/plugins/degenTrader/services/execution/buyService.ts
import { logger as logger23 } from "@elizaos/core";

// src/plugins/degenTrader/config/trading.ts
var DEFAULT_CONFIG = {
  intervals: {
    priceCheck: 6e4,
    walletSync: 6e5,
    performanceMonitor: 36e5
  },
  thresholds: {
    minLiquidity: 5e4,
    minVolume: 1e5,
    minScore: 60
  },
  riskLimits: {
    maxPositionSize: 0.2,
    maxDrawdown: 0.1,
    stopLossPercentage: 0.05,
    takeProfitPercentage: 0.2
  },
  slippageSettings: {
    baseSlippage: 0.5,
    maxSlippage: 1,
    liquidityMultiplier: 1,
    volumeMultiplier: 1
  }
};

// src/plugins/degenTrader/services/base/BaseTradeService.ts
var BaseTradeService = class {
  constructor(runtime, walletService, dataService, analyticsService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.dataService = dataService;
    this.analyticsService = analyticsService;
    this.tradingConfig = DEFAULT_CONFIG;
  }
  tradingConfig;
  getWalletService() {
    return this.walletService;
  }
  getDataService() {
    return this.dataService;
  }
  getAnalyticsService() {
    return this.analyticsService;
  }
};

// src/plugins/degenTrader/services/validation/TokenValidationService.ts
import { logger as logger20 } from "@elizaos/core";
var TokenValidationService = class extends BaseTradeService {
  async validateTokenForTrading(tokenAddress) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (marketData.liquidity < this.tradingConfig.thresholds.minLiquidity) {
        return {
          isValid: false,
          reason: `Insufficient liquidity: ${marketData.liquidity} < ${this.tradingConfig.thresholds.minLiquidity}`
        };
      }
      if (marketData.volume24h < this.tradingConfig.thresholds.minVolume) {
        return {
          isValid: false,
          reason: `Insufficient 24h volume: ${marketData.volume24h} < ${this.tradingConfig.thresholds.minVolume}`
        };
      }
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      if (!tokenMetadata.verified) {
        return { isValid: false, reason: "Token is not verified" };
      }
      if (tokenMetadata.suspiciousAttributes.length > 0) {
        return {
          isValid: false,
          reason: `Suspicious attributes: ${tokenMetadata.suspiciousAttributes.join(", ")}`
        };
      }
      return { isValid: true };
    } catch (error) {
      logger20.error("Error validating token:", error);
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  async fetchTokenMetadata(tokenAddress) {
    return {
      verified: true,
      suspiciousAttributes: [],
      ownershipConcentration: 0
    };
  }
};

// src/plugins/degenTrader/utils/analyzeTrade.ts
import { logger as logger21 } from "@elizaos/core";
async function assessMarketCondition(runtime) {
  try {
    const tradeService = runtime.getService(ServiceTypes.DEGEN_TRADING);
    const solData = await tradeService.dataService.getTokenMarketData(
      "So11111111111111111111111111111111111111112"
      // SOL address
    );
    if (!solData.priceHistory || solData.priceHistory.length < 24) {
      return "neutral";
    }
    const currentPrice = solData.price;
    const previousPrice = solData.priceHistory[0];
    const priceChange = (currentPrice - previousPrice) / previousPrice * 100;
    if (priceChange > 5) return "bullish";
    if (priceChange < -5) return "bearish";
    return "neutral";
  } catch (error) {
    console.log("Error assessing market condition:", error);
    return "neutral";
  }
}
function calculateVolatility(priceHistory) {
  if (priceHistory.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < priceHistory.length; i++) {
    returns.push(Math.log(priceHistory[i] / priceHistory[i - 1]));
  }
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}
function calculateDynamicSlippage2(amount, quoteData) {
  try {
    const baseSlippage = 5e-3;
    const priceImpact = Math.abs(parseFloat(quoteData?.priceImpactPct || "0")) / 100;
    const amountNum = parseFloat(amount);
    const decimals = quoteData?.inputDecimals || 9;
    const amountInBase = amountNum / Math.pow(10, decimals);
    let dynamicSlippage = baseSlippage;
    if (priceImpact > 0.01) {
      dynamicSlippage += priceImpact * 0.5;
    }
    if (amountInBase > 1e3) {
      dynamicSlippage *= 1.2;
    } else if (amountInBase > 100) {
      dynamicSlippage *= 1.1;
    }
    if (quoteData?.marketVolatility) {
      dynamicSlippage *= 1 + quoteData.marketVolatility;
    }
    const minSlippage = 1e-3;
    const maxSlippage = 0.05;
    return Math.min(Math.max(dynamicSlippage, minSlippage), maxSlippage);
  } catch (error) {
    logger21.warn("Error calculating dynamic slippage, using default:", error);
    return 0.01;
  }
}

// src/plugins/degenTrader/services/calculation/tradeCalculation.ts
import { logger as logger22 } from "@elizaos/core";
var TradeCalculationService = class extends BaseTradeService {
  async calculateOptimalBuyAmount({
    tokenAddress,
    walletBalance,
    signal
  }) {
    try {
      const tokenData = await this.dataService.getTokenMarketData(tokenAddress);
      const maxPosition = walletBalance * this.tradingConfig.riskLimits.maxPositionSize;
      let adjustedAmount = maxPosition;
      if (tokenData.priceHistory) {
        const volatility = calculateVolatility(tokenData.priceHistory);
        const volatilityFactor = Math.max(0.5, 1 - volatility);
        adjustedAmount *= volatilityFactor;
      }
      const marketCondition = await assessMarketCondition(this.runtime);
      if (marketCondition === "bearish") {
        adjustedAmount *= 0.5;
      }
      const maxLiquidityImpact = tokenData.liquidity * 0.02;
      const finalAmount = Math.min(adjustedAmount, maxLiquidityImpact);
      const minTradeSize = 0.05;
      return Math.max(minTradeSize, finalAmount);
    } catch (error) {
      logger22.error("Error calculating optimal buy amount:", error);
      return 0;
    }
  }
  async calculateDynamicSlippage(tokenAddress, tradeAmount, isSell) {
    try {
      const tokenData = await this.dataService.getTokenMarketData(tokenAddress);
      let slippageBps = 50;
      const liquidityPercentage = tradeAmount / tokenData.liquidity * 100;
      if (liquidityPercentage > 0.1) {
        const liquidityFactor = Math.min(
          Math.floor(liquidityPercentage * 10),
          // 10 bps per 1% of liquidity
          200
          // Cap at 2% (200 bps)
        );
        slippageBps += liquidityFactor;
      }
      const volumeToMcapRatio = tokenData.volume24h / tokenData.marketCap;
      if (volumeToMcapRatio > 0.05) {
        const volumeDiscount = Math.min(
          Math.floor(volumeToMcapRatio * 100),
          25
          // Maximum 25 bps reduction
        );
        slippageBps = Math.max(slippageBps - volumeDiscount, 25);
      }
      if (isSell) {
        slippageBps += 25;
      }
      const maxSlippageBps = 300;
      return Math.max(Math.min(Math.floor(slippageBps), maxSlippageBps), 25);
    } catch (error) {
      logger22.error("Error calculating dynamic slippage:", error);
      return 100;
    }
  }
};

// src/plugins/degenTrader/services/execution/buyService.ts
var BuyService = class extends BaseTradeService {
  validationService;
  calculationService;
  tradeMemoryService;
  constructor(runtime, walletService, dataService, analyticsService, tradeMemoryService) {
    super(runtime, walletService, dataService, analyticsService);
    this.validationService = new TokenValidationService(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.calculationService = new TradeCalculationService(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.tradeMemoryService = tradeMemoryService;
  }
  async initialize() {
    logger23.info("Initializing buy service");
    this.runtime.registerEvent("SPARTAN_TRADE_BUY_SIGNAL", this.handleBuySignal.bind(this));
  }
  async stop() {
  }
  async handleBuySignal(params) {
    const TRADER_BUY_KUMA = this.runtime.getSetting("TRADER_BUY_KUMA");
    if (TRADER_BUY_KUMA) {
      fetch(TRADER_BUY_KUMA).catch((e) => {
        logger23.error("TRADER_BUY_KUMA err", e);
      });
    }
    const signal = {
      positionId: v4_default(),
      tokenAddress: params.recommend_buy_address,
      entityId: "default",
      tradeAmount: params.buy_amount,
      expectedOutAmount: "0"
    };
    await this.updateExpectedOutAmount(signal);
    this.executeBuy(signal).then((result) => {
      logger23.info("executeBuy - result", result);
    });
  }
  async updateExpectedOutAmount(signal) {
    if (!signal.tradeAmount) return;
    try {
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${signal.tokenAddress}&amount=${Math.round(Number(signal.tradeAmount) * 1e9)}&slippageBps=0`
      );
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        signal.expectedOutAmount = quoteData.outAmount;
      }
    } catch (error) {
      logger23.warn("Failed to get expected out amount for buy", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  async executeBuy(signal) {
    try {
      if (!signal) {
        throw new Error("No signal data in buy task");
      }
      const validation = await this.validationService.validateTokenForTrading(signal.tokenAddress);
      if (!validation.isValid) {
        return { success: false, error: validation.reason };
      }
      const marketData = await this.dataService.getTokenMarketData(signal.tokenAddress);
      const walletBalance = await this.walletService.getBalance();
      const buyAmount = await this.calculationService.calculateOptimalBuyAmount({
        tokenAddress: signal.tokenAddress,
        walletBalance,
        signal
      });
      if (buyAmount <= 0) {
        return { success: false, error: "Buy amount too small" };
      }
      const slippageBps = await this.calculationService.calculateDynamicSlippage(
        signal.tokenAddress,
        buyAmount,
        false
      );
      const wallet = await this.walletService.getWallet();
      const result = await wallet.buy({
        tokenAddress: signal.tokenAddress,
        amountInSol: buyAmount,
        slippageBps
      });
      if (result.success) {
        await this.tradeMemoryService.createTrade({
          tokenAddress: signal.tokenAddress,
          chain: "solana",
          type: "BUY",
          amount: buyAmount.toString(),
          price: marketData.priceUsd.toString(),
          txHash: result.signature,
          metadata: {
            slippage: slippageBps,
            expectedAmount: signal.expectedOutAmount,
            receivedAmount: result.outAmount,
            valueUsd: result.swapUsdValue
          }
        });
        if (result.outAmount) {
          await this.analyticsService.trackSlippageImpact(
            signal.tokenAddress,
            signal.expectedOutAmount || "0",
            result.outAmount,
            slippageBps,
            false
          );
        }
      }
      return result;
    } catch (error) {
      logger23.error("Error executing buy task:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};

// src/plugins/degenTrader/services/execution/sellService.ts
import { logger as logger24 } from "@elizaos/core";

// src/plugins/degenTrader/utils/bignumber.ts
bignumber_default.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: bignumber_default.ROUND_DOWN,
  EXPONENTIAL_AT: [-20, 20]
});
function toBN(value) {
  try {
    return new bignumber_default(value);
  } catch (error) {
    throw new Error(`Failed to convert value to BigNumber: ${value}`);
  }
}

// src/plugins/degenTrader/services/execution/sellService.ts
var SellService = class extends BaseTradeService {
  pendingSells = {};
  validationService;
  calculationService;
  tradeMemoryService;
  constructor(runtime, walletService, dataService, analyticsService, tradeMemoryService) {
    super(runtime, walletService, dataService, analyticsService);
    this.validationService = new TokenValidationService(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.calculationService = new TradeCalculationService(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.tradeMemoryService = tradeMemoryService;
  }
  async initialize() {
    logger24.info("Initializing sell service");
    this.runtime.registerEvent("SPARTAN_TRADE_SELL_SIGNAL", this.handleSellSignal.bind(this));
  }
  async stop() {
    this.pendingSells = {};
  }
  async handleSellSignal(params) {
    const TRADER_SELL_KUMA = this.runtime.getSetting("TRADER_SELL_KUMA");
    if (TRADER_SELL_KUMA) {
      fetch(TRADER_SELL_KUMA).catch((e) => {
        logger24.error("TRADER_SELL_KUMA err", e);
      });
    }
    const signal = {
      positionId: v4_default(),
      tokenAddress: params.recommend_sell_address,
      amount: params.sell_amount,
      entityId: "default",
      slippage: params.slippage || 100
    };
    await this.updateExpectedOutAmount(signal);
    this.executeSell(signal).then((result) => {
      logger24.info("executeSell - result", result);
    });
  }
  async updateExpectedOutAmount(signal) {
    if (!signal.amount) return;
    try {
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${signal.tokenAddress}&outputMint=So11111111111111111111111111111111111111112&amount=${Math.round(
          Number(signal.amount) * 1e9
        )}&slippageBps=${signal.slippage || 100}`
      );
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        signal.expectedOutAmount = quoteData.outAmount;
      }
    } catch (error) {
      logger24.warn("Failed to get expected out amount for sell", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  async executeSell(signal) {
    try {
      if (!signal) {
        throw new Error("No signal data in sell task");
      }
      const tokenBalance = await getTokenBalance(this.runtime, signal.tokenAddress);
      if (!tokenBalance) {
        return { success: false, error: "No token balance found" };
      }
      const sellAmount = toBN(signal.amount).times(10 ** tokenBalance.decimals);
      if (sellAmount.gt(toBN(tokenBalance.balance))) {
        return {
          success: false,
          error: `Insufficient token balance. Requested: ${sellAmount.toString()}, Available: ${tokenBalance.balance}`
        };
      }
      try {
        this.pendingSells[signal.tokenAddress] = (this.pendingSells[signal.tokenAddress] || toBN(0)).plus(sellAmount);
        const slippageBps = await this.calculationService.calculateDynamicSlippage(
          signal.tokenAddress,
          Number(sellAmount),
          true
        );
        const result = await executeTrade(this.runtime, {
          tokenAddress: signal.tokenAddress,
          amount: sellAmount.toString(),
          slippage: slippageBps,
          dex: "jup",
          action: "SELL"
        });
        const marketData = await this.dataService.getTokenMarketData(signal.tokenAddress);
        if (result.success) {
          await this.tradeMemoryService.createTrade({
            tokenAddress: signal.tokenAddress,
            chain: "solana",
            type: "SELL",
            amount: sellAmount.toString(),
            price: marketData.priceUsd.toString(),
            txHash: result.signature,
            metadata: {
              slippage: slippageBps,
              expectedAmount: signal.expectedOutAmount || "0",
              receivedAmount: result.receivedAmount || "0",
              valueUsd: result.receivedValue || "0"
            }
          });
          await this.analyticsService.trackSlippageImpact(
            signal.tokenAddress,
            signal.expectedOutAmount || "0",
            result.receivedAmount || "0",
            slippageBps,
            true
          );
        }
        return result;
      } finally {
        this.pendingSells[signal.tokenAddress] = (this.pendingSells[signal.tokenAddress] || toBN(0)).minus(sellAmount);
        if (this.pendingSells[signal.tokenAddress].lte(toBN(0))) {
          delete this.pendingSells[signal.tokenAddress];
        }
      }
    } catch (error) {
      logger24.error("Error executing sell task:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};

// src/plugins/degenTrader/services/dataService.ts
import { logger as logger28 } from "@elizaos/core";

// src/plugins/degenTrader/utils/cacheManager.ts
var CacheManager = class {
  cache = /* @__PURE__ */ new Map();
  defaultTTL = 6e4;
  // 60 seconds default TTL
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ttl = this.defaultTTL) {
    const entry = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }
  async delete(key) {
    this.cache.delete(key);
  }
  async clear() {
    this.cache.clear();
  }
};

// src/plugins/degenTrader/services/analyticsService.ts
import { logger as logger25 } from "@elizaos/core";
var AnalyticsService = class {
  constructor(runtime) {
    this.runtime = runtime;
  }
  async initialize() {
    logger25.info("Initializing analytics service");
  }
  async stop() {
  }
  async scoreTechnicalSignals(signals) {
    if (!signals) return 0;
    let score = 0;
    if (signals.rsi < 30)
      score += 10;
    else if (signals.rsi > 70)
      score -= 5;
    else score += 5;
    if (signals.macd.value > 0 && signals.macd.value > signals.macd.signal) {
      score += 10;
    } else if (signals.macd.value < 0 && Math.abs(signals.macd.value) > Math.abs(signals.macd.signal)) {
      score -= 5;
    }
    if (signals.volumeProfile?.trend === "increasing" && !signals.volumeProfile.unusualActivity) {
      score += 10;
    }
    if (signals.volatility < 0.2) score += 10;
    else if (signals.volatility > 0.5) score -= 5;
    return score;
  }
  async scoreSocialMetrics(metrics) {
    if (!metrics) return 0;
    let score = 0;
    const mentionScore = Math.min(metrics.mentionCount / 100, 10);
    score += mentionScore;
    score += metrics.sentiment * 10;
    const influencerScore = Math.min(metrics.influencerMentions * 2, 10);
    score += influencerScore;
    return Math.max(0, score);
  }
  async scoreMarketMetrics(metrics) {
    let score = 0;
    if (metrics.marketCap > 1e9)
      score += 2;
    else if (metrics.marketCap > 1e8)
      score += 5;
    else if (metrics.marketCap > 1e7)
      score += 10;
    else score += 3;
    const volumeToMcap = metrics.volume24h / metrics.marketCap;
    score += Math.min(volumeToMcap * 100, 10);
    const liquidityToMcap = metrics.liquidity / metrics.marketCap;
    score += Math.min(liquidityToMcap * 100, 10);
    return score;
  }
  async trackSlippageImpact(tokenAddress, expectedAmount, actualAmount, slippageBps, isSell) {
    try {
      const expected = Number(expectedAmount);
      const actual = Number(actualAmount);
      if (expected <= 0 || actual <= 0) {
        logger25.warn("Invalid amounts for slippage tracking", {
          tokenAddress,
          expectedAmount,
          actualAmount
        });
        return;
      }
      const actualSlippage = (expected - actual) / expected * 100;
      const actualSlippageBps = Math.floor(actualSlippage * 100);
      await this.runtime.setCache(`slippage_impact:${tokenAddress}:${Date.now()}`, {
        tokenAddress,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        expectedAmount,
        actualAmount,
        slippageBpsUsed: slippageBps,
        actualSlippageBps,
        isSell
      });
      logger25.info("Trade slippage impact tracked", {
        tokenAddress,
        slippageBpsUsed: slippageBps,
        actualSlippageBps,
        efficiency: actualSlippageBps / slippageBps
      });
    } catch (error) {
      console.log("Error tracking slippage impact", error);
    }
  }
  calculateRSI(prices, period) {
    if (prices.length < period + 1) {
      return 50;
    }
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = avgLoss * (period - 1) / period;
      } else {
        avgGain = avgGain * (period - 1) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
  calculateMACD(prices) {
    const shortPeriod = 12;
    const longPeriod = 26;
    const signalPeriod = 9;
    if (prices.length < longPeriod) {
      return { macd: 0, signal: 0, histogram: 0 };
    }
    const shortEMA = this.calculateEMA(prices, shortPeriod);
    const longEMA = this.calculateEMA(prices, longPeriod);
    const macdLine = shortEMA - longEMA;
    const signalLine = this.calculateEMA([macdLine], signalPeriod);
    const histogram = macdLine - signalLine;
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }
  calculateEMA(prices, period) {
    if (prices.length < period) {
      return prices[prices.length - 1];
    }
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }
  async trackTradeExecution(data) {
    try {
      const tradeData = {
        id: v4_default(),
        ...data,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(`trade_execution:${tradeData.id}`, tradeData);
      logger25.info(`Trade execution tracked: ${data.type}`, {
        tokenAddress: data.tokenAddress,
        amount: data.amount
      });
    } catch (error) {
      console.log("Error tracking trade execution:", error);
    }
  }
  async addTradePerformance(data, isSimulation) {
    try {
      const id = v4_default();
      const tradeData = {
        id,
        ...data,
        isSimulation,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(
        `trade_performance:${data.token_address}:${data.buy_timeStamp}`,
        tradeData
      );
      const allTradesKey = isSimulation ? "all_simulation_trades" : "all_trades";
      const allTrades = await this.runtime.getCache(allTradesKey) || [];
      allTrades.push(`${data.token_address}:${data.buy_timeStamp}`);
      await this.runtime.setCache(allTradesKey, allTrades);
      await this.updateTokenStatistics(data.token_address, {
        profit_usd: data.profit_usd,
        profit_percent: data.profit_percent,
        rapidDump: data.rapidDump
      });
      return tradeData;
    } catch (error) {
      console.log("Error adding trade performance:", error);
      throw error;
    }
  }
  async updateTokenStatistics(tokenAddress, data) {
    try {
      const stats = await this.runtime.getCache(`token_stats:${tokenAddress}`) || {
        trades: 0,
        total_profit_usd: 0,
        average_profit_percent: 0,
        rapid_dumps: 0
      };
      stats.trades += 1;
      stats.total_profit_usd += data.profit_usd;
      stats.average_profit_percent = (stats.average_profit_percent * (stats.trades - 1) + data.profit_percent) / stats.trades;
      if (data.rapidDump) stats.rapid_dumps += 1;
      await this.runtime.setCache(`token_stats:${tokenAddress}`, stats);
    } catch (error) {
      console.log("Error updating token statistics:", error);
    }
  }
};

// src/plugins/degenTrader/services/calculation/birdeye.ts
import { logger as logger26 } from "@elizaos/core";

// src/plugins/degenTrader/config/providers.ts
var PROVIDER_CONFIG = {
  BIRDEYE_API: "https://public-api.birdeye.so",
  TOKEN_SECURITY_ENDPOINT: "/defi/token_security?address=",
  TOKEN_METADATA_ENDPOINT: "/defi/v3/token/meta-data/single?address=",
  MARKET_SEARCH_ENDPOINT: "/defi/v3/token/trade-data/single?address=",
  TOKEN_PRICE_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=price_change_24h_percent&sort_type=desc&verify_token=true&markets=Raydium&limit=20",
  TOKEN_VOLUME_24_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=volume_24h_change_percent&sort_type=desc&verify_token=true&markets=Raydium&limit=20",
  TOKEN_BUY_24_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=buy_24h_change_percent&sort_type=desc&verify_token=true&markets=Raydium&offset=0&limit=20",
  TOKEN_SECURITY_ENDPOINT_BASE: "/defi/token_security?address=",
  TOKEN_METADATA_ENDPOINT_BASE: "/defi/v3/token/meta-data/single?address=",
  MARKET_SEARCH_ENDPOINT_BASE: "/defi/v3/token/trade-data/single?address=",
  TOKEN_PRICE_CHANGE_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=price_change_24h_percent&sort_type=desc&offset=0&limit=20",
  TOKEN_VOLUME_24_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=volume_24h_usd&sort_type=desc&offset=2&limit=20",
  TOKEN_BUY_24_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=buy_24h&sort_type=desc&offset=2&limit=20",
  MAX_RETRIES: 3,
  RETRY_DELAY: 2e3
};
var ZEROEX_CONFIG = {
  API_URL: "https://api.0x.org",
  API_KEY: process.env.ZEROEX_API_KEY || "",
  QUOTE_ENDPOINT: "/swap/permit2/quote",
  PRICE_ENDPOINT: "/swap/permit2/price",
  SUPPORTED_CHAINS: {
    BASE: 8453
  },
  HEADERS: {
    "Content-Type": "application/json",
    "0x-api-key": process.env.ZEROEX_API_KEY || "",
    "0x-version": "v2"
  }
};

// src/plugins/degenTrader/config/chains.ts
var BASE_CONFIG = {
  RPC_URL: process.env.EVM_PROVIDER_URL || "https://mainnet.base.org",
  ROUTER_ADDRESS: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
  WETH_ADDRESS: "0x4200000000000000000000000000000000000006",
  CHAIN_ID: 8453,
  AERODROME: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  }
};

// src/plugins/degenTrader/services/calculation/birdeye.ts
var BirdeyeService = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  getBirdeyeFetchOptions() {
    return {
      headers: {
        accept: "application/json",
        "x-CHAIN": "solana",
        "X-API-KEY": this.apiKey
      }
    };
  }
  async getTokenMarketData(tokenAddress) {
    try {
      if (tokenAddress === "So11111111111111111111111111111111111111111") {
        tokenAddress = "So11111111111111111111111111111111111111112";
      }
      const [response, volResponse, priceHistoryResponse] = await Promise.all([
        fetch(
          `${PROVIDER_CONFIG.BIRDEYE_API}/defi/v3/token/market-data?address=${tokenAddress}`,
          this.getBirdeyeFetchOptions()
        ),
        fetch(
          `${PROVIDER_CONFIG.BIRDEYE_API}/defi/price_volume/single?address=${tokenAddress}&type=24h`,
          this.getBirdeyeFetchOptions()
        ),
        fetch(
          `${PROVIDER_CONFIG.BIRDEYE_API}/defi/history_price?address=${tokenAddress}&address_type=token&type=15m`,
          this.getBirdeyeFetchOptions()
        )
      ]);
      if (!response.ok || !volResponse.ok || !priceHistoryResponse.ok) {
        throw new Error(`Birdeye API error for token ${tokenAddress}`);
      }
      const [data, volData, priceHistoryData] = await Promise.all([
        response.json(),
        volResponse.json(),
        priceHistoryResponse.json()
      ]);
      if (!data.data) {
        logger26.warn("getTokenMarketData - cant save result", data, "for", tokenAddress);
        return this.getEmptyMarketData();
      }
      return {
        price: data.data.price,
        marketCap: data.data.market_cap || 0,
        liquidity: data.data.liquidity || 0,
        volume24h: volData.data.volumeUSD || 0,
        priceHistory: priceHistoryData.data.items.map((item) => item.value)
      };
    } catch (error) {
      logger26.error("Error fetching token market data:", error);
      return this.getEmptyMarketData();
    }
  }
  async getTokensMarketData(tokenAddresses) {
    const tokenDb = {};
    try {
      const chunkArray = (arr, size) => arr.map((_, i) => i % size === 0 ? arr.slice(i, i + size) : null).filter(Boolean);
      const hundos = chunkArray(tokenAddresses, 100);
      const multipricePs = hundos.map((addresses) => {
        const listStr = addresses.join(",");
        return fetch(
          `${PROVIDER_CONFIG.BIRDEYE_API}/defi/multi_price?list_address=${listStr}&include_liquidity=true`,
          this.getBirdeyeFetchOptions()
        );
      });
      const multipriceResps = await Promise.all(multipricePs);
      const multipriceData = await Promise.all(multipriceResps.map((resp) => resp.json()));
      for (const mpd of multipriceData) {
        for (const ca in mpd.data) {
          const t = mpd.data[ca];
          if (t) {
            tokenDb[ca] = {
              priceUsd: t.value,
              priceSol: t.priceInNative,
              liquidity: t.liquidity,
              priceChange24h: t.priceChange24h
            };
          } else {
            logger26.warn(ca, "mpd error", t);
          }
        }
      }
      return tokenDb;
    } catch (error) {
      logger26.error("Error fetching multiple tokens market data:", error);
      return tokenDb;
    }
  }
  getEmptyMarketData() {
    return {
      price: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceHistory: []
    };
  }
};

// src/plugins/degenTrader/services/calculation/technicalAnalysis.ts
var TechnicalAnalysisService = class extends BaseTradeService {
  async calculateTechnicalSignals(marketData) {
    const rsi = this.analyticsService.calculateRSI(marketData.priceHistory, 14);
    const macd = this.analyticsService.calculateMACD(marketData.priceHistory);
    const volatility = marketData.priceHistory.length > 1 ? Math.abs(
      marketData.priceHistory[marketData.priceHistory.length - 1] - marketData.priceHistory[marketData.priceHistory.length - 2]
    ) / marketData.priceHistory[marketData.priceHistory.length - 2] : 0;
    const volumeTrend = marketData.volume24h > marketData.marketCap * 0.1 ? "increasing" : "stable";
    const unusualActivity = marketData.volume24h > marketData.marketCap * 0.2;
    return {
      rsi,
      macd,
      volumeProfile: {
        trend: volumeTrend,
        unusualActivity
      },
      volatility
    };
  }
};

// src/plugins/degenTrader/services/calculation/scoring.ts
var ScoringService = class extends BaseTradeService {
  async scoreTokenSignals(signals) {
    const tokenMap = /* @__PURE__ */ new Map();
    for (const signal of signals) {
      if (tokenMap.has(signal.address)) {
        const existing = tokenMap.get(signal.address);
        existing.reasons.push(...signal.reasons);
        existing.score += signal.score;
      } else {
        tokenMap.set(signal.address, signal);
      }
    }
    const scoredTokens = await Promise.all(
      Array.from(tokenMap.values()).map(async (token) => {
        let score = 0;
        if (token.technicalSignals) {
          score += await this.analyticsService.scoreTechnicalSignals(token.technicalSignals);
        }
        if (token.socialMetrics) {
          score += await this.analyticsService.scoreSocialMetrics(token.socialMetrics);
        }
        score += await this.analyticsService.scoreMarketMetrics({
          marketCap: token.marketCap,
          volume24h: token.volume24h,
          liquidity: token.liquidity
        });
        token.score = score;
        return token;
      })
    );
    return scoredTokens.filter(
      (token) => token.score >= 60 && // Minimum score requirement
      token.liquidity >= 5e4 && // Minimum liquidity $50k
      token.volume24h >= 1e5
      // Minimum 24h volume $100k
    ).sort((a, b) => b.score - a.score);
  }
};

// src/plugins/degenTrader/services/validation/tokenSecurity.ts
import { logger as logger27 } from "@elizaos/core";
var TokenSecurityService = class extends BaseTradeService {
  async validateTokenForTrading(tokenAddress) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (marketData.liquidity < this.tradingConfig.thresholds.minLiquidity) {
        return {
          isValid: false,
          reason: `Insufficient liquidity: ${marketData.liquidity} < ${this.tradingConfig.thresholds.minLiquidity}`
        };
      }
      if (marketData.volume24h < this.tradingConfig.thresholds.minVolume) {
        return {
          isValid: false,
          reason: `Insufficient 24h volume: ${marketData.volume24h} < ${this.tradingConfig.thresholds.minVolume}`
        };
      }
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      if (!tokenMetadata.verified) {
        return { isValid: false, reason: "Token is not verified" };
      }
      if (tokenMetadata.suspiciousAttributes.length > 0) {
        return {
          isValid: false,
          reason: `Suspicious attributes: ${tokenMetadata.suspiciousAttributes.join(", ")}`
        };
      }
      return { isValid: true };
    } catch (error) {
      logger27.error("Error validating token:", error);
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  async fetchTokenMetadata(tokenAddress) {
    return {
      verified: true,
      suspiciousAttributes: [],
      ownershipConcentration: 0
    };
  }
};

// src/plugins/degenTrader/services/dataService.ts
var DataService = class {
  constructor(runtime, walletService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.cacheManager = new CacheManager();
    this.analyticsService = new AnalyticsService(runtime);
    this.technicalAnalysisService = new TechnicalAnalysisService(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
    this.scoringService = new ScoringService(runtime, walletService, this, this.analyticsService);
    this.tokenSecurityService = new TokenSecurityService(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
    this.tradeCalculationService = new TradeCalculationService(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
  }
  cacheManager;
  birdeyeService;
  analyticsService;
  technicalAnalysisService;
  scoringService;
  tokenSecurityService;
  tradeCalculationService;
  async initialize() {
    logger28.info("Initializing data service");
    const apiKey = process.env.BIRDEYE_API_KEY;
    if (!apiKey) {
      throw new Error("Birdeye API key not found");
    }
    this.birdeyeService = new BirdeyeService(apiKey);
  }
  async stop() {
    await this.cacheManager.clear();
  }
  async getBirdeyeSignals() {
    try {
      const trendingTokens = await this.cacheManager.get("birdeye_trending_tokens") || [];
      return Promise.all(
        trendingTokens.map(async (token) => {
          const marketData = await this.getTokenMarketData(token.address);
          const technicalSignals = await this.technicalAnalysisService.calculateTechnicalSignals(marketData);
          return {
            address: token.address,
            symbol: token.symbol,
            marketCap: marketData.marketCap,
            volume24h: marketData.volume24h,
            price: marketData.price,
            liquidity: marketData.liquidity,
            score: 0,
            reasons: [`Trending on Birdeye with ${marketData.volume24h}$ 24h volume`],
            technicalSignals: {
              ...technicalSignals,
              macd: {
                value: technicalSignals.macd.macd,
                signal: technicalSignals.macd.signal,
                histogram: technicalSignals.macd.histogram
              }
            }
          };
        })
      );
    } catch (error) {
      logger28.error("Error getting Birdeye signals:", error);
      return [];
    }
  }
  async getTwitterSignals() {
    try {
      const twitterSignals = await this.cacheManager.get("twitter_parsed_signals") || [];
      return twitterSignals.map((signal) => ({
        address: signal.tokenAddress,
        symbol: signal.symbol,
        marketCap: signal.marketCap,
        volume24h: signal.volume24h,
        price: signal.price,
        liquidity: signal.liquidity,
        score: 0,
        reasons: [`High social activity: ${signal.mentionCount} mentions`],
        socialMetrics: {
          mentionCount: signal.mentionCount,
          sentiment: signal.sentiment,
          influencerMentions: signal.influencerMentions
        }
      }));
    } catch (error) {
      logger28.error("Error getting Twitter signals:", error);
      return [];
    }
  }
  async getCMCSignals() {
    try {
      const cmcTokens = await this.cacheManager.get("cmc_trending_tokens") || [];
      return cmcTokens.map((token) => ({
        address: token.address,
        symbol: token.symbol,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        price: token.price,
        liquidity: token.liquidity,
        score: 0,
        reasons: [`Trending on CMC: ${token.cmcRank} rank`],
        cmcMetrics: {
          rank: token.cmcRank,
          priceChange24h: token.priceChange24h,
          volumeChange24h: token.volumeChange24h
        }
      }));
    } catch (error) {
      logger28.error("Error getting CMC signals:", error);
      return [];
    }
  }
  async getTokenMarketData(tokenAddress) {
    const cacheKey = `market_data_${tokenAddress}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.birdeyeService.getTokenMarketData(tokenAddress);
    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1e3);
    return { ...result, volumeHistory: [] };
  }
  async getTokensMarketData(tokenAddresses) {
    const missing = [];
    const tokenDb = {};
    for (const ca of tokenAddresses) {
      const cached = await this.cacheManager.get(`market_data_${ca}`);
      if (!cached) {
        missing.push(ca);
      } else {
        tokenDb[ca] = cached;
      }
    }
    if (missing.length) {
      const newData = await this.birdeyeService.getTokensMarketData(missing);
      for (const [address, data] of Object.entries(newData)) {
        const cacheKey = `market_data_${address}`;
        await this.cacheManager.set(cacheKey, data, 10 * 60 * 1e3);
        tokenDb[address] = data;
      }
    }
    return tokenDb;
  }
  async getMonitoredTokens() {
    try {
      const tasks = await this.runtime.getTasks({
        tags: ["degen_trader", "EXECUTE_SELL"]
      });
      const tokenAddresses = /* @__PURE__ */ new Set();
      tasks.forEach((task) => {
        const metadata = task.metadata;
        if (metadata?.signal?.tokenAddress) {
          tokenAddresses.add(metadata.signal.tokenAddress);
        }
      });
      return Array.from(tokenAddresses);
    } catch (error) {
      logger28.error("Error getting monitored tokens:", error);
      return [];
    }
  }
  async getPositions() {
    try {
      const monitoredTokens = await this.getMonitoredTokens();
      if (!monitoredTokens.length) {
        return [];
      }
      const positions = await Promise.all(
        monitoredTokens.map(async (tokenAddress) => {
          try {
            const balance = await getTokenBalance(this.runtime, tokenAddress);
            const marketData = await this.getTokenMarketData(tokenAddress);
            return {
              tokenAddress,
              balance,
              currentPrice: marketData.price,
              value: Number(balance?.balance) * marketData.price,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
            };
          } catch (error) {
            logger28.error(`Error getting position for token ${tokenAddress}:`, error);
            return null;
          }
        })
      );
      return positions.filter((position) => position !== null);
    } catch (error) {
      logger28.error("Error getting positions:", error);
      return [];
    }
  }
  getDefaultRecommendation() {
    return {
      recommended_buy: "SOL",
      recommend_buy_address: "So11111111111111111111111111111111111111112",
      reason: "Default recommendation",
      marketcap: 0,
      buy_amount: 0.1
    };
  }
};

// src/plugins/degenTrader/services/monitoringService.ts
import { logger as logger30 } from "@elizaos/core";

// src/plugins/degenTrader/services/execution/tradeExecutionService.ts
import { logger as logger29 } from "@elizaos/core";
var TradeExecutionService = class {
  constructor(runtime, walletService, dataService, analyticsService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.dataService = dataService;
    this.analyticsService = analyticsService;
  }
  async initialize() {
    logger29.info("Initializing trade execution service");
  }
  async stop() {
  }
  async executeBuyTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    try {
      const result = await executeTrade(this.runtime, {
        tokenAddress,
        amount: amount.toString(),
        slippage,
        dex: "raydium",
        action: "BUY"
      });
      if (result.success) {
        await this.analyticsService.trackTradeExecution({
          type: "buy",
          tokenAddress,
          amount: amount.toString(),
          signature: result.signature
        });
      }
      return result;
    } catch (error) {
      logger29.error("Buy trade execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async executeSellTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    try {
      const result = await executeTrade(this.runtime, {
        tokenAddress,
        amount: amount.toString(),
        slippage,
        dex: "raydium",
        action: "SELL"
      });
      if (result.success) {
        await this.analyticsService.trackTradeExecution({
          type: "sell",
          tokenAddress,
          amount: amount.toString(),
          signature: result.signature
        });
      }
      return result;
    } catch (error) {
      logger29.error("Sell trade execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async calculateExpectedAmount(tokenAddress, amount, isSell) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      const expectedAmount = isSell ? amount * marketData.price : amount / marketData.price;
      return expectedAmount.toString();
    } catch (error) {
      logger29.error("Error calculating expected amount:", error);
      return "0";
    }
  }
};

// src/plugins/degenTrader/config/config.ts
var BASE_CONFIG2 = {
  RPC_URL: process.env.EVM_PROVIDER_URL || "https://mainnet.base.org",
  ROUTER_ADDRESS: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
  // Base Uniswap V2 Router
  WETH_ADDRESS: "0x4200000000000000000000000000000000000006",
  // Base WETH
  CHAIN_ID: 8453,
  // Add Aerodrome-specific addresses
  AERODROME: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  }
};
var ZEROEX_CONFIG2 = {
  API_URL: "https://api.0x.org",
  API_KEY: process.env.ZEROEX_API_KEY || "",
  QUOTE_ENDPOINT: "/swap/permit2/quote",
  PRICE_ENDPOINT: "/swap/permit2/price",
  SUPPORTED_CHAINS: {
    BASE: 8453
  },
  HEADERS: {
    "Content-Type": "application/json",
    "0x-api-key": process.env.ZEROEX_API_KEY || "",
    "0x-version": "v2"
  }
};
var DEFAULT_CONFIG2 = {
  intervals: {
    priceCheck: 6e4,
    // 1 minute
    walletSync: 6e5,
    // 10 minutes
    performanceMonitor: 36e5
    // 1 hour
  },
  thresholds: {
    minLiquidity: 5e4,
    // $50k minimum liquidity
    minVolume: 1e5,
    // $100k minimum 24h volume
    minScore: 60
    // Minimum token score
  },
  riskLimits: {
    maxPositionSize: 0.2,
    // 20% of wallet
    maxDrawdown: 0.1,
    // 10% maximum drawdown
    stopLossPercentage: 0.05,
    // 5% stop loss
    takeProfitPercentage: 0.2
    // 20% take profit
  },
  slippageSettings: {
    baseSlippage: 0.5,
    // 0.5% base slippage
    maxSlippage: 1,
    // 1% maximum slippage
    liquidityMultiplier: 1,
    volumeMultiplier: 1
  }
};

// src/plugins/degenTrader/services/monitoringService.ts
var MonitoringService = class extends TradeExecutionService {
  isInitialized = false;
  monitoringIntervals = [];
  tradingConfig = DEFAULT_CONFIG2;
  constructor(runtime, dataService, walletService, analyticsService) {
    super(runtime, walletService, dataService, analyticsService);
  }
  // Implement TradeExecutionService interface methods
  async executeBuyTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    return {
      success: false,
      error: "Monitoring service does not execute trades directly"
    };
  }
  async executeSellTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    return {
      success: false,
      error: "Monitoring service does not execute trades directly"
    };
  }
  async calculateExpectedAmount(tokenAddress, amount, isSell) {
    const marketData = await this.dataService.getTokenMarketData(tokenAddress);
    const expectedAmount = isSell ? amount * marketData.price : amount / marketData.price;
    return expectedAmount.toString();
  }
  async initialize() {
    if (this.isInitialized) {
      logger30.warn("Monitoring service already initialized");
      return;
    }
    logger30.info("Initializing monitoring service...");
    this.startMonitoringIntervals();
    this.isInitialized = true;
    logger30.info("Monitoring service initialized successfully");
  }
  async stop() {
    logger30.info("Stopping monitoring service...");
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals = [];
    this.isInitialized = false;
    logger30.info("Monitoring service stopped successfully");
  }
  startMonitoringIntervals() {
    const priceMonitorInterval = setInterval(() => {
      this.monitorPrices().catch((error) => console.log("Price monitoring error:", error));
    }, 6e4);
    this.monitoringIntervals.push(priceMonitorInterval);
  }
  async monitorToken(options) {
    try {
      const { tokenAddress } = options;
      const currentBalance = await getTokenBalance(this.runtime, tokenAddress);
      if (!currentBalance || BigInt(currentBalance.toString()) <= BigInt(0)) {
        console.log("No position to monitor", { tokenAddress });
        return;
      }
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (!marketData.price) {
        logger30.warn("Unable to get current price for token", { tokenAddress });
        return;
      }
      const priceChangePercent = options.initialPrice ? (marketData.price - options.initialPrice) / options.initialPrice * 100 : 0;
      if (options.stopLossPrice && marketData.price <= options.stopLossPrice) {
        logger30.warn("Stop loss triggered", {
          tokenAddress,
          currentPrice: marketData.price,
          stopLossPrice: options.stopLossPrice
        });
        await this.createSellSignal(tokenAddress, currentBalance.toString(), "Stop loss triggered");
        return;
      }
      if (options.takeProfitPrice && marketData.price >= options.takeProfitPrice) {
        logger30.info("Take profit triggered", {
          tokenAddress,
          currentPrice: marketData.price,
          takeProfitPrice: options.takeProfitPrice
        });
        const halfPosition = BigInt(currentBalance.toString()) / BigInt(2);
        await this.createSellSignal(
          tokenAddress,
          halfPosition.toString(),
          "Take profit - selling half position"
        );
        await this.setTrailingStop(tokenAddress, marketData.price, halfPosition.toString());
      }
      return {
        tokenAddress,
        currentPrice: marketData.price,
        priceChangePercent
      };
    } catch (error) {
      console.log("Error monitoring token:", error);
      return { error: true, message: String(error) };
    }
  }
  async createSellSignal(tokenAddress, amount, reason) {
    try {
      const signal = {
        tokenAddress,
        amount,
        positionId: v4_default(),
        reason
      };
      await this.runtime.createTask({
        id: v4_default(),
        roomId: this.runtime.agentId,
        name: "SELL_SIGNAL",
        description: `Sell signal for ${tokenAddress}`,
        tags: ["queue", "sell"],
        metadata: signal
      });
      logger30.info("Sell signal created", { tokenAddress, amount, reason });
    } catch (error) {
      console.log("Error creating sell signal:", error);
    }
  }
  async setTrailingStop(tokenAddress, activationPrice, amount) {
    try {
      const trailingStopData = {
        tokenAddress,
        highestPrice: activationPrice,
        activationPrice,
        trailingStopPercentage: 5,
        // 5% trailing stop
        amount,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(`trailing_stop:${tokenAddress}`, trailingStopData);
      await this.runtime.createTask({
        id: v4_default(),
        roomId: this.runtime.agentId,
        name: "MONITOR_TRAILING_STOP",
        description: `Monitor trailing stop for ${tokenAddress}`,
        tags: ["queue", "repeat"],
        metadata: {
          tokenAddress,
          updatedAt: Date.now(),
          updateInterval: 6e4
        }
      });
      logger30.info("Trailing stop set", trailingStopData);
    } catch (error) {
      console.log("Error setting trailing stop:", error);
    }
  }
  async monitorPrices() {
    try {
      const positions = await this.dataService.getPositions();
      for (const [tokenAddress, position] of Object.entries(positions)) {
        const marketData = await this.dataService.getTokenMarketData(tokenAddress);
        if (marketData.price > 0) {
          await this.checkPriceThresholds(tokenAddress, marketData.price, position);
        }
      }
    } catch (error) {
      console.log("Error monitoring prices:", error);
    }
  }
  async checkPriceThresholds(tokenAddress, currentPrice, position) {
    try {
      const stopLossPrice = position.entryPrice * (1 - this.tradingConfig.riskLimits.stopLossPercentage);
      const takeProfitPrice = position.entryPrice * (1 + this.tradingConfig.riskLimits.takeProfitPercentage);
      if (currentPrice <= stopLossPrice) {
        await this.createSellSignal(
          tokenAddress,
          position.amount.toString(),
          "Stop loss triggered"
        );
      } else if (currentPrice >= takeProfitPrice) {
        const halfPosition = BigInt(position.amount.toString()) / BigInt(2);
        await this.createSellSignal(
          tokenAddress,
          halfPosition.toString(),
          "Take profit - selling half position"
        );
      }
    } catch (error) {
      logger30.warn("Error checking price thresholds:", error);
    }
  }
};

// src/plugins/degenTrader/services/taskService.ts
import { logger as logger31 } from "@elizaos/core";
var TaskService = class extends TradeExecutionService {
  constructor(runtime, buyService, sellService) {
    super(
      runtime,
      buyService.getWalletService(),
      buyService.getDataService(),
      buyService.getAnalyticsService()
    );
    this.runtime = runtime;
    this.buyService = buyService;
    this.sellService = sellService;
  }
  scheduledTasks = [];
  async registerTasks() {
    this.registerSellTasks();
  }
  async stop() {
    this.scheduledTasks.forEach((task) => clearTimeout(task));
    this.scheduledTasks = [];
  }
  registerSellTasks() {
    this.runtime.registerTaskWorker({
      name: "EXECUTE_SELL",
      execute: async (runtime, options, task) => {
        logger31.info("Executing sell task");
        await this.executeSellTask(options);
      },
      validate: async () => true
    });
  }
  async createSellTask(signal) {
    try {
      logger31.info("Creating sell task", {
        tokenAddress: signal.tokenAddress,
        amount: signal.amount,
        currentBalance: signal.currentBalance
      });
      let expectedReceiveAmount = "0";
      try {
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${signal.tokenAddress}&outputMint=So11111111111111111111111111111111111111112&amount=${Math.round(Number(signal.amount) * 1e9)}&slippageBps=0`;
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();
        if (quoteData?.outAmount) {
          expectedReceiveAmount = quoteData.outAmount;
          logger31.info("Expected receive amount for sell", {
            expectedReceiveAmount,
            tokenAddress: signal.tokenAddress
          });
        }
      } catch (error) {
        console.log("Failed to fetch expected receive amount for sell", error);
      }
      const slippage = await this.calculateExpectedAmount(
        signal.tokenAddress,
        Number(signal.amount),
        true
      );
      const taskId = v4_default();
      await this.runtime.createTask({
        id: taskId,
        name: "EXECUTE_SELL",
        description: `Execute sell for ${signal.tokenAddress}`,
        tags: ["queue", "repeat", ServiceTypes.DEGEN_TRADING],
        metadata: {
          signal,
          expectedReceiveAmount,
          slippageBps: Number(slippage)
        }
      });
      logger31.info("Sell task created", { taskId });
      return { success: true, taskId };
    } catch (error) {
      console.log("Error creating sell task", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  async executeSellTask(options) {
    try {
      const { signal } = options;
      if (!signal) {
        throw new Error("No signal data in sell task");
      }
      const result = await this.sellService.executeSell(signal);
      if (result.success) {
        logger31.info("Sell task executed successfully", {
          signature: result.signature,
          receivedAmount: result.receivedAmount
        });
      } else {
        logger31.error("Sell task failed", { error: result.error });
      }
    } catch (error) {
      console.log("Error executing sell task:", error);
    }
  }
};

// src/plugins/degenTrader/services/walletService.ts
import { logger as logger32 } from "@elizaos/core";
import { Connection as Connection2, Keypair as Keypair2, VersionedTransaction as VersionedTransaction2 } from "@solana/web3.js";
import { Buffer as Buffer3 } from "buffer";
var import_bs58 = __toESM(require_bs58(), 1);
var WalletService = class {
  constructor(runtime) {
    this.runtime = runtime;
    this.CONFIRMATION_CONFIG = {
      MAX_ATTEMPTS: 12,
      // Increased from 8
      INITIAL_TIMEOUT: 2e3,
      // 2 seconds
      MAX_TIMEOUT: 2e4,
      // 20 seconds
      // Exponential backoff between retries
      getDelayForAttempt: (attempt) => Math.min(2e3 * Math.pow(1.5, attempt), 2e4)
    };
  }
  connection = null;
  keypair = null;
  CONFIRMATION_CONFIG;
  async initialize() {
    try {
      const rpcUrl = this.runtime.getSetting("SOLANA_RPC_URL");
      if (!rpcUrl) {
        throw new Error("Solana RPC URL not configured");
      }
      this.connection = new Connection2(rpcUrl);
      const privateKey = this.runtime.getSetting("SOLANA_PRIVATE_KEY");
      if (!privateKey) {
        throw new Error("Solana private key not configured");
      }
      const decodedKey = import_bs58.default.decode(privateKey);
      this.keypair = Keypair2.fromSecretKey(decodedKey);
      logger32.info("Wallet service initialized successfully");
    } catch (error) {
      console.log("Failed to initialize wallet service:", error);
      throw error;
    }
  }
  async stop() {
    this.connection = null;
    this.keypair = null;
  }
  async getWallet() {
    if (!this.keypair || !this.connection) {
      throw new Error("Wallet not initialized");
    }
    const keypair = this.keypair;
    return {
      publicKey: this.keypair.publicKey,
      connection: this.connection,
      CONFIRMATION_CONFIG: this.CONFIRMATION_CONFIG,
      async executeTrade({
        tokenAddress,
        amount,
        slippage,
        action
      }, dex = "jup") {
        const actionStr = action === "SELL" ? "sell" : "buy";
        logger32.info(`Executing ${actionStr} trade using ${dex}:`, {
          tokenAddress,
          amount,
          slippage
        });
        try {
          const walletKeypair = keypair;
          console.log("walletKeypair", walletKeypair.publicKey.toString());
          const connection = this.connection;
          const SOL_ADDRESS2 = "So11111111111111111111111111111111111111112";
          const inputTokenCA = action === "SELL" ? tokenAddress : SOL_ADDRESS2;
          const outputTokenCA = action === "SELL" ? SOL_ADDRESS2 : tokenAddress;
          const swapAmount = action === "BUY" ? Math.floor(Number(amount) * 1e9) : Math.floor(Number(amount));
          logger32.debug("Swap parameters:", {
            inputTokenCA,
            outputTokenCA,
            swapAmount,
            originalAmount: amount
          });
          if (isNaN(swapAmount) || swapAmount <= 0) {
            throw new Error(`Invalid swap amount: ${swapAmount}`);
          }
          const quoteResponse = await fetch(
            `https://public.jupiterapi.com/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${swapAmount}&slippageBps=${Math.floor(slippage * 1e4)}&platformFeeBps=200`
          );
          if (!quoteResponse.ok) {
            const error = await quoteResponse.text();
            logger32.warn("Quote request failed:", {
              status: quoteResponse.status,
              error
            });
            return {
              success: false,
              error: `Failed to get quote: ${error}`
            };
          }
          const quoteData = await quoteResponse.json();
          logger32.log("Quote received:", quoteData);
          if (!quoteData || !quoteData.outAmount) {
            throw new Error("Invalid quote response: missing output amount");
          }
          const dynamicSlippage = calculateDynamicSlippage2(amount.toString(), quoteData);
          const clampedSlippage = Math.min(Math.max(dynamicSlippage, 1e-3), 0.5);
          const slippageBps = Math.min(Math.floor(clampedSlippage * 1e4), 5e3);
          logger32.info("Using dynamic slippage:", {
            baseSlippage: slippage,
            dynamicSlippage,
            clampedSlippage,
            slippageBps,
            priceImpact: quoteData?.priceImpactPct
          });
          const swapResponse = await fetch("https://public.jupiterapi.com/swap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quoteResponse: {
                ...quoteData,
                slippageBps
                // Use the clamped and converted value
              },
              feeAccount: "3nMBmufBUBVnk28sTp3NsrSJsdVGTyLZYmsqpMFaUT9J",
              userPublicKey: walletKeypair.publicKey.toString(),
              wrapAndUnwrapSol: true,
              computeUnitPriceMicroLamports: 5e6,
              dynamicComputeUnitLimit: true,
              useSharedAccounts: true,
              simulateTransaction: true
            })
          });
          if (!swapResponse.ok) {
            const error = await swapResponse.text();
            logger32.error("Swap request failed:", {
              status: swapResponse.status,
              error
            });
            throw new Error(`Failed to get swap transaction: ${error}`);
          }
          const swapData = await swapResponse.json();
          logger32.log("Swap response received:", swapData);
          if (!swapData?.swapTransaction) {
            logger32.error("Invalid swap response:", swapData);
            throw new Error("No swap transaction returned in response");
          }
          if (swapData.simulationError) {
            logger32.error("Transaction simulation failed:", swapData.simulationError);
            return {
              success: false,
              error: `Simulation failed: ${swapData.simulationError}`
            };
          }
          const transactionBuf = Buffer3.from(swapData.swapTransaction, "base64");
          const tx = VersionedTransaction2.deserialize(transactionBuf);
          const latestBlockhash = await connection.getLatestBlockhash("processed");
          tx.message.recentBlockhash = latestBlockhash.blockhash;
          tx.sign([walletKeypair]);
          const signature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            maxRetries: 5,
            preflightCommitment: "processed"
          });
          logger32.log("Transaction sent with high priority:", {
            signature,
            explorer: `https://solscan.io/tx/${signature}`
          });
          let confirmed = false;
          for (let i = 0; i < this.CONFIRMATION_CONFIG.MAX_ATTEMPTS; i++) {
            try {
              const status = await connection.getSignatureStatus(signature);
              if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
                confirmed = true;
                logger32.log("Transaction confirmed:", {
                  signature,
                  confirmationStatus: status.value.confirmationStatus,
                  slot: status.context.slot,
                  attempt: i + 1
                });
                break;
              }
              const delay = this.CONFIRMATION_CONFIG.getDelayForAttempt(i);
              logger32.info(
                `Waiting ${delay}ms before next confirmation check (attempt ${i + 1}/${this.CONFIRMATION_CONFIG.MAX_ATTEMPTS})`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            } catch (error) {
              logger32.warn(`Confirmation check ${i + 1} failed:`, error);
              if (i === this.CONFIRMATION_CONFIG.MAX_ATTEMPTS - 1) {
                throw new Error("Could not confirm transaction status");
              }
              const delay = this.CONFIRMATION_CONFIG.getDelayForAttempt(i);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
          if (!confirmed) {
            throw new Error("Could not confirm transaction status");
          }
          return {
            success: true,
            signature,
            outAmount: quoteData.outAmount,
            swapUsdValue: quoteData.swapUsdValue
          };
        } catch (error) {
          logger32.error("Trade execution failed:", {
            error: error instanceof Error ? error.message : "Unknown error",
            params: { tokenAddress, amount, slippage, dex, action },
            errorStack: error instanceof Error ? error.stack : void 0
          });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      },
      async buy({ tokenAddress, amountInSol, slippageBps }) {
        try {
          const result = await this.executeTrade({
            tokenAddress,
            amount: amountInSol,
            slippage: slippageBps / 1e4,
            action: "BUY"
          });
          return result;
        } catch (error) {
          logger32.error("Error executing buy in wallet", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },
      async sell({ tokenAddress, tokenAmount, slippageBps }) {
        try {
          const result = await this.executeTrade({
            tokenAddress,
            amount: tokenAmount,
            slippage: slippageBps / 1e4,
            action: "SELL"
          });
          return result;
        } catch (error) {
          console.log("Error executing sell in wallet", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    };
  }
  async getBalance() {
    if (!this.keypair || !this.connection) {
      throw new Error("Wallet not initialized");
    }
    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance / 1e9;
    } catch (error) {
      console.log("Error getting wallet balance:", error);
      throw error;
    }
  }
};

// src/plugins/degenTrader/services/tradeMemoryService.ts
import { logger as logger33, ModelType as ModelType8 } from "@elizaos/core";
var TradeMemoryService = class extends BaseTradeService {
  constructor(runtime, walletService, dataService, analyticsService) {
    super(runtime, walletService, dataService, analyticsService);
  }
  async initialize() {
    logger33.info("Initializing trade memory service");
  }
  async storeTrade(trade) {
    try {
      const memoryContent = `${trade.type} trade for ${trade.tokenAddress} on ${trade.chain} at ${trade.timestamp.toISOString()}. Amount: ${trade.amount}, Price: ${trade.price}`;
      const memory = {
        id: trade.id,
        agentId: this.runtime.agentId,
        entityId: this.runtime.agentId,
        roomId: this.runtime.agentId,
        content: {
          text: memoryContent,
          trade
        },
        createdAt: Date.now()
      };
      const memoryWithEmbedding = await this.runtime.addEmbeddingToMemory(memory);
      await this.runtime.createMemory(memoryWithEmbedding, "trades", true);
      const cacheKey = `trade:${trade.chain}:${trade.tokenAddress}:${trade.txHash}`;
      await this.runtime.setCache(cacheKey, trade);
      logger33.info(`Stored ${trade.type} trade for ${trade.tokenAddress}`);
    } catch (error) {
      logger33.error(`Error storing trade for ${trade.tokenAddress}:`, error);
      throw error;
    }
  }
  async getTradesForToken(tokenAddress, chain) {
    try {
      const memories = await this.runtime.getMemories({
        agentId: this.runtime.agentId,
        tableName: "trades"
      });
      return memories.filter((memory) => {
        const trade = memory.content.trade;
        return trade.tokenAddress === tokenAddress && trade.chain === chain;
      }).map((memory) => memory.content.trade).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logger33.error(`Error getting trades for token ${tokenAddress}:`, error);
      return [];
    }
  }
  async createTrade(params) {
    const trade = {
      id: v4_default(),
      timestamp: /* @__PURE__ */ new Date(),
      ...params
    };
    await this.storeTrade(trade);
    return trade;
  }
  async getRecentTrades(limit = 10) {
    try {
      const memories = await this.runtime.getMemories({
        agentId: this.runtime.agentId,
        tableName: "trades",
        count: limit
      });
      return memories.sort((a, b) => {
        const tradeA = a.content.trade;
        const tradeB = b.content.trade;
        return tradeB.timestamp.getTime() - tradeA.timestamp.getTime();
      }).map((memory) => memory.content.trade);
    } catch (error) {
      logger33.error("Error getting recent trades:", error);
      return [];
    }
  }
  async searchTrades(query) {
    try {
      const queryEmbedding = await this.runtime.useModel(ModelType8.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        embedding: queryEmbedding,
        tableName: "trades",
        count: 10,
        match_threshold: 0.7,
        roomId: this.runtime.agentId
      });
      return memories.map((memory) => memory.content.trade);
    } catch (error) {
      logger33.error("Error searching trades:", error);
      return [];
    }
  }
  async deleteTrade(tradeId) {
    try {
      await this.runtime.deleteMemory(tradeId);
      logger33.info(`Deleted trade ${tradeId}`);
    } catch (error) {
      logger33.error(`Error deleting trade ${tradeId}:`, error);
      throw error;
    }
  }
};

// src/plugins/degenTrader/tradingService.ts
var DegenTradingService = class _DegenTradingService extends Service3 {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
    this.processId = `sol-process-${Date.now()}`;
    this.walletService = new WalletService(runtime);
    this.dataService = new DataService(runtime, this.walletService);
    this.analyticsService = new AnalyticsService(runtime);
    this.tradeMemoryService = new TradeMemoryService(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService
    );
    this.tradeExecutionService = new TradeExecutionService(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService
    );
    this.buyService = new BuyService(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService,
      this.tradeMemoryService
    );
    this.sellService = new SellService(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService,
      this.tradeMemoryService
    );
    this.taskService = new TaskService(runtime, this.buyService, this.sellService);
    this.monitoringService = new MonitoringService(
      runtime,
      this.dataService,
      this.walletService,
      this.analyticsService
    );
  }
  isRunning = false;
  processId;
  // Service instances
  buyService;
  sellService;
  dataService;
  analyticsService;
  monitoringService;
  taskService;
  walletService;
  tradeExecutionService;
  tradeMemoryService;
  static serviceType = ServiceTypes.DEGEN_TRADING;
  capabilityDescription = "The agent is able to trade on the Solana blockchain";
  /**
   * Start the scenario service with the given runtime.
   * @param {IAgentRuntime} runtime - The agent runtime
   * @returns {Promise<ScenarioService>} - The started scenario service
   */
  static async start(runtime) {
    const service = new _DegenTradingService(runtime);
    service.start();
    return service;
  }
  /**
   * Stops the Scenario service associated with the given runtime.
   *
   * @param {IAgentRuntime} runtime The runtime to stop the service for.
   * @throws {Error} When the Scenario service is not found.
   */
  static async stop(runtime) {
    const service = runtime.getService(_DegenTradingService.serviceType);
    if (!service) {
      throw new Error("DegenTradingService service not found");
    }
    service.stop();
  }
  async start() {
    if (this.isRunning) {
      logger34.warn("Trading service is already running");
      return;
    }
    try {
      logger34.info("Starting trading service...");
      await Promise.all([
        this.dataService.initialize(),
        this.analyticsService.initialize(),
        this.walletService.initialize(),
        this.tradeMemoryService.initialize(),
        this.buyService.initialize(),
        this.sellService.initialize(),
        this.monitoringService.initialize()
      ]);
      await this.taskService.registerTasks();
      this.isRunning = true;
      logger34.info("Trading service started successfully");
    } catch (error) {
      logger34.error("Error starting trading service:", error);
      throw error;
    }
  }
  async stop() {
    if (!this.isRunning) {
      logger34.warn("Trading service is not running");
      return;
    }
    try {
      logger34.info("Stopping trading service...");
      await Promise.all([
        this.dataService.stop(),
        this.analyticsService.stop(),
        this.walletService.stop(),
        this.buyService.stop(),
        this.sellService.stop(),
        this.monitoringService.stop()
      ]);
      this.isRunning = false;
      logger34.info("Trading service stopped successfully");
    } catch (error) {
      logger34.error("Error stopping trading service:", error);
      throw error;
    }
  }
  isServiceRunning() {
    return this.isRunning;
  }
};

// src/plugins/degenTrader/index.ts
var degenTraderPlugin = {
  name: "Degen Trader Plugin",
  description: "Autonomous trading agent plugin",
  evaluators: [],
  providers: [],
  actions: [],
  services: [DegenTradingService]
};

// src/plugins/helius/providers/helius.ts
import WebSocket from "ws";
var heliusProvider = {
  name: "HELIUS_INFORMATION",
  description: "Helius latest information about the cryptocurrencies using Laserstream",
  dynamic: true,
  get: async (runtime, message, state) => {
    try {
      const url = `https://api.helius.xyz/v0/token-metadata?api-key=${runtime.getSetting("HELIUS_API_KEY")}`;
      const response = await fetch(url);
      const tokens = await response.json();
      const data = {
        tokens: tokens.map((token) => ({
          symbol: token.symbol || "Unknown",
          name: token.name || "Unknown",
          address: token.address,
          decimals: token.decimals,
          totalSupply: token.totalSupply,
          marketCap: token.marketCap,
          volume24h: token.volume24h,
          price: token.price
        }))
      };
      let text = "\nCurrent Helius token information:\n\n";
      for (const token of data.tokens) {
        text += `${token.name} (${token.symbol})
`;
        text += `Address: ${token.address}
`;
        text += `Price: $${token.price}
`;
        text += `24h Volume: $${token.volume24h}
`;
        text += `Market Cap: $${token.marketCap}

`;
      }
      return {
        data,
        values: {},
        text
      };
    } catch (error) {
      console.error("Error in Helius provider:", error);
      throw error;
    }
  }
};

// src/plugins/helius/index.ts
var heliusPlugin = {
  name: "helius",
  description: "Helius data plugin",
  actions: [],
  evaluators: [],
  providers: [heliusProvider]
};

// src/plugins/autofun/index.ts
import { logger as logger35 } from "@elizaos/core";

// src/plugins/autofun/apis.ts
import { createUniqueUuid as createUniqueUuid6 } from "@elizaos/core";

// src/plugins/autofun/schemas.ts
import { z as z4 } from "zod";
var TokenSchema2 = z4.object({
  provider: z4.string(),
  rank: z4.number(),
  __v: z4.number(),
  address: z4.string(),
  chain: z4.string(),
  createdAt: z4.string().datetime(),
  decimals: z4.number(),
  last_updated: z4.string().datetime(),
  liquidity: z4.number(),
  logoURI: z4.string().url(),
  name: z4.string(),
  price: z4.number(),
  price24hChangePercent: z4.number(),
  symbol: z4.string(),
  updatedAt: z4.string().datetime(),
  volume24hUSD: z4.number(),
  marketcap: z4.number()
});
var TokenArraySchema2 = z4.array(TokenSchema2);
var TokenRequestSchema2 = z4.object({
  address: z4.string().min(1, "Address is required")
});
var TweetSchema2 = z4.object({
  _id: z4.string(),
  id: z4.string(),
  __v: z4.number(),
  createdAt: z4.string().datetime(),
  likes: z4.number(),
  retweets: z4.number(),
  text: z4.string(),
  timestamp: z4.string().datetime(),
  updatedAt: z4.string().datetime(),
  username: z4.string()
});
var TweetArraySchema2 = z4.array(TweetSchema2);
var SentimentSchema2 = z4.object({
  timeslot: z4.string().datetime(),
  createdAt: z4.string().datetime(),
  occuringTokens: z4.array(
    z4.object({
      token: z4.string(),
      sentiment: z4.number(),
      reason: z4.string()
    })
  ),
  processed: z4.boolean(),
  updatedAt: z4.string().datetime(),
  text: z4.string()
});
var SentimentArraySchema2 = z4.array(SentimentSchema2);
var WalletSchema2 = z4.object({
  wallet: z4.string(),
  totalUsd: z4.number(),
  items: z4.array(
    z4.object({
      address: z4.string(),
      decimals: z4.number(),
      balance: z4.number(),
      uiAmount: z4.number(),
      chainId: z4.string(),
      name: z4.string(),
      symbol: z4.string(),
      icon: z4.string().url(),
      logoURI: z4.string().url(),
      priceUsd: z4.number(),
      valueUsd: z4.number()
    })
  )
});
var BuySignalSchema2 = z4.object({
  recommended_buy: z4.string(),
  recommended_buy_address: z4.string(),
  reason: z4.string(),
  marketcap: z4.number(),
  buy_amount: z4.string()
});
var StatisticsSchema2 = z4.object({
  tweets: z4.number(),
  sentiment: z4.number(),
  tokens: z4.number()
});

// src/plugins/autofun/apis.ts
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname3 = path2.dirname(__filename2);
var frontendDist = path2.resolve(__dirname3, "./");
var routes2 = [
  {
    type: "POST",
    path: "/trending",
    handler: async (_req, res, runtime) => {
      try {
        const cachedTokens = await runtime.getCache("tokens_solana");
        const tokens = cachedTokens ? cachedTokens : [];
        const sortedTokens = tokens.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        res.json(sortedTokens);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "POST",
    path: "/wallet",
    handler: async (_req, res, runtime) => {
      try {
        const cachedTxs = await runtime.getCache("transaction_history");
        const transactions = cachedTxs ? cachedTxs : [];
        const history = transactions.filter((tx) => tx.data.mainAction === "received").sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime()).slice(0, 100);
        const cachedPortfolio = await runtime.getCache("portfolio");
        const portfolio = cachedPortfolio ? cachedPortfolio : { key: "PORTFOLIO", data: null };
        res.json({ history, portfolio: portfolio.data });
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "GET",
    path: "/tweets",
    handler: async (_req, res, runtime) => {
      try {
        const memories = await runtime.getMemories({
          tableName: "messages",
          roomId: createUniqueUuid6(runtime, "twitter-feed"),
          end: Date.now(),
          count: 50
        });
        const tweets = memories.filter((m) => m.content.source === "twitter").sort((a, b) => b.createdAt - a.createdAt).map((m) => ({
          text: m.content.text,
          timestamp: m.createdAt,
          metadata: m.content.tweet || {}
        }));
        const validatedData = TweetArraySchema2.parse(tweets);
        res.json(validatedData);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "GET",
    path: "/sentiment",
    handler: async (_req, res, runtime) => {
      try {
        const memories = await runtime.getMemories({
          tableName: "messages",
          roomId: createUniqueUuid6(runtime, "sentiment-analysis"),
          end: Date.now(),
          count: 30
        });
        const sentiments = memories.filter(
          (m) => m.content.source === "sentiment-analysis" && !!m.content.metadata && typeof m.content.metadata === "object" && m.content.metadata !== null && "processed" in m.content.metadata && "occuringTokens" in m.content.metadata && Array.isArray(m.content.metadata.occuringTokens) && m.content.metadata.occuringTokens.length > 1
        ).sort((a, b) => {
          const aTime = new Date(a.content.metadata.timeslot).getTime();
          const bTime = new Date(b.content.metadata.timeslot).getTime();
          return bTime - aTime;
        }).map((m) => ({
          timeslot: m.content.metadata.timeslot,
          text: m.content.text,
          processed: m.content.metadata.processed,
          occuringTokens: m.content.metadata.occuringTokens || []
        }));
        const validatedData = SentimentArraySchema2.parse(sentiments);
        res.json(validatedData);
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  {
    type: "POST",
    path: "/signal",
    handler: async (_req, res, runtime) => {
      try {
        const cachedSignal = await runtime.getCache("BUY_SIGNAL");
        const signal = cachedSignal ? cachedSignal : {};
        res.json(signal?.data || {});
      } catch (_error) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
];
var apis_default2 = routes2;

// src/plugins/autofun/providers/autofun.ts
var autofunProvider = {
  name: "INTEL_AUTOFUN",
  description: "A list of autofun solana tokens from the onchain and off-chain data aggregators",
  dynamic: true,
  //position: -1,
  get: async (runtime, message, state) => {
    if (!runtime.getSetting("AUTOFUN_API_KEY")) {
      return {
        data: {},
        values: {},
        text: "No AutoFun API key configured."
      };
    }
    const chains = ["solana", "base"];
    const solanaTokens = await runtime.getCache("tokens_solana") || [];
    const combinedTokens = [...solanaTokens];
    if (!combinedTokens.length) {
      return {
        data: { tokens: [] },
        values: {},
        text: "No tokens found."
      };
    }
    const url = "https://api.auto.fun/api/tokens?limit=200&page=1&sortBy=createdAt&sortOrder=desc&hideImported=1";
    const res = await fetch(url);
    const tokens = await res.json();
    console.log("autofun data", tokens.length);
    let latestTxt = "\nCurrent Auto.fun list of all active cryptocurrencies with latest market data:\n";
    let idx = 1;
    const fields = [
      "id",
      "name",
      "ticker",
      "url",
      "twitter",
      "telegram",
      "discord",
      "farcaster",
      "description",
      "liquidity",
      "currentPrice",
      "tokenSupplyUiAmount",
      "holderCount",
      "volume24h",
      "price24hAgo",
      "priceChange24h",
      "curveProgress"
    ];
    const remaps = {
      ticker: "symbol"
    };
    latestTxt += "id, name, symbol, url, twitter, telegram, discord, farcaster, description, liquidity, currentPrice, tokenSupplyUiAmount, holderCount, volume24h, price24hAgo, priceChange24h, curveProgress";
    for (const t of tokens) {
      const out = [];
      for (const f of fields) {
        out.push(t[f]);
      }
      latestTxt += out.join(", ") + "\n";
    }
    const data = {
      tokens
    };
    const values = {};
    const text = latestTxt + "\n";
    return {
      data,
      values,
      text
    };
  }
};

// src/plugins/autofun/index.ts
var autofunPlugin = {
  name: "autofun",
  description: "Autofun plugin",
  routes: apis_default2,
  providers: [autofunProvider],
  tests: [
    {
      name: "test suite for degen-intel",
      tests: [
        {
          name: "test for degen-intel",
          fn: async (runtime) => {
            logger35.info("test in degen-intel working");
          }
        }
      ]
    }
  ],
  // FIXME: make a service
  services: [],
  init: async (_, runtime) => {
    let hasPluginTrader = true;
    if (hasPluginTrader) {
      new Promise(async (resolve) => {
        resolve();
        console.log("autofunStartIn");
        let service = runtime.getService("TRADER_DATAPROVIDER");
        while (!service) {
          console.log("autofun waiting for Trading info service...");
          service = runtime.getService("TRADER_DATAPROVIDER");
          if (!service) {
            await new Promise((waitResolve) => setTimeout(waitResolve, 1e3));
          } else {
            console.log("autofun Acquired trading chain service...");
          }
        }
        const me = {
          name: "Autofun",
          trendingService: "AUTOFUN"
        };
        await service.registerDataProvder(me);
        console.log("autofunStart done");
      });
    }
  }
};

// src/plugins/autofunTrader/index.ts
import { logger as logger53 } from "@elizaos/core";

// src/plugins/autofunTrader/tradingService.ts
import { logger as logger52, Service as Service4 } from "@elizaos/core";

// src/plugins/autofunTrader/services/execution/buyService.ts
import { ModelType as ModelType9, logger as logger39, parseKeyValueXml } from "@elizaos/core";

// src/plugins/autofunTrader/config/trading.ts
var DEFAULT_CONFIG3 = {
  intervals: {
    priceCheck: 6e4,
    walletSync: 6e5,
    performanceMonitor: 36e5
  },
  thresholds: {
    minLiquidity: 5e4,
    minVolume: 1e5,
    minScore: 60
  },
  riskLimits: {
    maxPositionSize: 0.2,
    maxDrawdown: 0.1,
    stopLossPercentage: 0.05,
    takeProfitPercentage: 0.2
  },
  slippageSettings: {
    baseSlippage: 0.5,
    maxSlippage: 1,
    liquidityMultiplier: 1,
    volumeMultiplier: 1
  }
};

// src/plugins/autofunTrader/services/base/BaseTradeService.ts
var BaseTradeService2 = class {
  constructor(runtime, walletService, dataService, analyticsService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.dataService = dataService;
    this.analyticsService = analyticsService;
    this.tradingConfig = DEFAULT_CONFIG3;
  }
  tradingConfig;
  getWalletService() {
    return this.walletService;
  }
  getDataService() {
    return this.dataService;
  }
  getAnalyticsService() {
    return this.analyticsService;
  }
};

// src/plugins/autofunTrader/utils/analyzeTrade.ts
import { logger as logger36 } from "@elizaos/core";
async function assessMarketCondition2(runtime) {
  try {
    const tradeService = runtime.getService("AUTOFUN_TRADING" /* AUTOFUN_TRADING */);
    const solData = await tradeService.dataService.getTokenMarketData(
      "So11111111111111111111111111111111111111112"
      // SOL address
    );
    if (!solData.priceHistory || solData.priceHistory.length < 24) {
      return "neutral";
    }
    const currentPrice = solData.price;
    const previousPrice = solData.priceHistory[0];
    const priceChange = (currentPrice - previousPrice) / previousPrice * 100;
    if (priceChange > 5) return "bullish";
    if (priceChange < -5) return "bearish";
    return "neutral";
  } catch (error) {
    console.log("Error assessing market condition:", error);
    return "neutral";
  }
}
function calculateVolatility2(priceHistory) {
  if (priceHistory.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < priceHistory.length; i++) {
    returns.push(Math.log(priceHistory[i] / priceHistory[i - 1]));
  }
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}
function calculateDynamicSlippage3(amount, quoteData) {
  try {
    const baseSlippage = 5e-3;
    const priceImpact = Math.abs(parseFloat(quoteData?.priceImpactPct || "0")) / 100;
    const amountNum = parseFloat(amount);
    const decimals = quoteData?.inputDecimals || 9;
    const amountInBase = amountNum / Math.pow(10, decimals);
    let dynamicSlippage = baseSlippage;
    if (priceImpact > 0.01) {
      dynamicSlippage += priceImpact * 0.5;
    }
    if (amountInBase > 1e3) {
      dynamicSlippage *= 1.2;
    } else if (amountInBase > 100) {
      dynamicSlippage *= 1.1;
    }
    if (quoteData?.marketVolatility) {
      dynamicSlippage *= 1 + quoteData.marketVolatility;
    }
    const minSlippage = 1e-3;
    const maxSlippage = 0.05;
    return Math.min(Math.max(dynamicSlippage, minSlippage), maxSlippage);
  } catch (error) {
    logger36.warn("Error calculating dynamic slippage, using default:", error);
    return 0.01;
  }
}

// src/plugins/autofunTrader/services/calculation/tradeCalculation.ts
import { logger as logger37 } from "@elizaos/core";
var TradeCalculationService2 = class extends BaseTradeService2 {
  async calculateOptimalBuyAmount({
    tokenAddress,
    walletBalance,
    signal
  }) {
    try {
      const tokenData = await this.dataService.getTokenMarketData(tokenAddress);
      const maxPosition = walletBalance * this.tradingConfig.riskLimits.maxPositionSize;
      let adjustedAmount = maxPosition;
      if (tokenData.priceHistory) {
        const volatility = calculateVolatility2(tokenData.priceHistory);
        const volatilityFactor = Math.max(0.5, 1 - volatility);
        adjustedAmount *= volatilityFactor;
      }
      const marketCondition = await assessMarketCondition2(this.runtime);
      if (marketCondition === "bearish") {
        adjustedAmount *= 0.5;
      }
      const maxLiquidityImpact = tokenData.liquidity * 0.02;
      const finalAmount = Math.min(adjustedAmount, maxLiquidityImpact);
      const minTradeSize = 0.05;
      return Math.max(minTradeSize, finalAmount);
    } catch (error) {
      logger37.error("Error calculating optimal buy amount:", error);
      return 0;
    }
  }
  async calculateDynamicSlippage(tokenAddress, tradeAmount, isSell) {
    try {
      const tokenData = await this.dataService.getTokenMarketData(tokenAddress);
      let slippageBps = 50;
      const liquidityPercentage = tradeAmount / tokenData.liquidity * 100;
      if (liquidityPercentage > 0.1) {
        const liquidityFactor = Math.min(
          Math.floor(liquidityPercentage * 10),
          // 10 bps per 1% of liquidity
          200
          // Cap at 2% (200 bps)
        );
        slippageBps += liquidityFactor;
      }
      const volumeToMcapRatio = tokenData.volume24h / tokenData.marketCap;
      if (volumeToMcapRatio > 0.05) {
        const volumeDiscount = Math.min(
          Math.floor(volumeToMcapRatio * 100),
          25
          // Maximum 25 bps reduction
        );
        slippageBps = Math.max(slippageBps - volumeDiscount, 25);
      }
      if (isSell) {
        slippageBps += 25;
      }
      const maxSlippageBps = 300;
      return Math.max(Math.min(Math.floor(slippageBps), maxSlippageBps), 25);
    } catch (error) {
      logger37.error("Error calculating dynamic slippage:", error);
      return 100;
    }
  }
};

// src/plugins/autofunTrader/services/validation/TokenValidationService.ts
import { logger as logger38 } from "@elizaos/core";
var TokenValidationService2 = class extends BaseTradeService2 {
  async validateTokenForTrading(tokenAddress) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (marketData.liquidity < this.tradingConfig.thresholds.minLiquidity) {
        return {
          isValid: false,
          reason: `Insufficient liquidity: ${marketData.liquidity} < ${this.tradingConfig.thresholds.minLiquidity}`
        };
      }
      if (marketData.volume24h < this.tradingConfig.thresholds.minVolume) {
        return {
          isValid: false,
          reason: `Insufficient 24h volume: ${marketData.volume24h} < ${this.tradingConfig.thresholds.minVolume}`
        };
      }
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      if (!tokenMetadata.verified) {
        return { isValid: false, reason: "Token is not verified" };
      }
      if (tokenMetadata.suspiciousAttributes.length > 0) {
        return {
          isValid: false,
          reason: `Suspicious attributes: ${tokenMetadata.suspiciousAttributes.join(", ")}`
        };
      }
      return { isValid: true };
    } catch (error) {
      logger38.error("Error validating token:", error);
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  async fetchTokenMetadata(tokenAddress) {
    return {
      verified: true,
      suspiciousAttributes: [],
      ownershipConcentration: 0
    };
  }
};

// src/plugins/autofunTrader/services/execution/buyService.ts
import anchorPkg from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection as Connection3,
  PublicKey as PublicKey4,
  Transaction,
  VersionedTransaction as VersionedTransaction3
} from "@solana/web3.js";
import { Buffer as Buffer4 } from "buffer";

// src/plugins/autofunTrader/idl/autofun.json
var autofun_default = {
  address: "autoUmixaMaYKFjexMpQuBpNYntgbkzCo2b1ZqUaAZ5",
  metadata: {
    name: "autofun",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor"
  },
  instructions: [
    {
      name: "accept_authority",
      discriminator: [107, 86, 198, 91, 33, 12, 107, 160],
      accounts: [
        {
          name: "new_admin",
          writable: true,
          signer: true
        },
        {
          name: "global_config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ],
      args: []
    },
    {
      name: "configure",
      discriminator: [245, 7, 108, 117, 95, 196, 54, 217],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: "global_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: "global_wsol_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "global_vault"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "native_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "native_mint",
          address: "So11111111111111111111111111111111111111112"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      args: [
        {
          name: "new_config",
          type: {
            defined: {
              name: "Config"
            }
          }
        }
      ]
    },
    {
      name: "launch",
      discriminator: [153, 241, 93, 225, 22, 69, 74, 61],
      accounts: [
        {
          name: "global_config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: "global_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: "creator",
          writable: true,
          signer: true
        },
        {
          name: "token",
          writable: true,
          signer: true
        },
        {
          name: "bonding_curve",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 111, 110, 100, 105, 110, 103, 95, 99, 117, 114, 118, 101]
              },
              {
                kind: "account",
                path: "token"
              }
            ]
          }
        },
        {
          name: "token_metadata_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [109, 101, 116, 97, 100, 97, 116, 97]
              },
              {
                kind: "const",
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          name: "global_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "global_vault"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "mpl_token_metadata_program",
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          name: "team_wallet",
          writable: true
        },
        {
          name: "team_wallet_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "team_wallet"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        }
      ],
      args: [
        {
          name: "decimals",
          type: "u8"
        },
        {
          name: "token_supply",
          type: "u64"
        },
        {
          name: "virtual_lamport_reserves",
          type: "u64"
        },
        {
          name: "name",
          type: "string"
        },
        {
          name: "symbol",
          type: "string"
        },
        {
          name: "uri",
          type: "string"
        }
      ]
    },
    {
      name: "launch_and_swap",
      discriminator: [67, 201, 190, 15, 185, 41, 47, 122],
      accounts: [
        {
          name: "global_config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: "global_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: "creator",
          writable: true,
          signer: true
        },
        {
          name: "token",
          writable: true,
          signer: true
        },
        {
          name: "bonding_curve",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 111, 110, 100, 105, 110, 103, 95, 99, 117, 114, 118, 101]
              },
              {
                kind: "account",
                path: "token"
              }
            ]
          }
        },
        {
          name: "token_metadata_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [109, 101, 116, 97, 100, 97, 116, 97]
              },
              {
                kind: "const",
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          name: "global_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "global_vault"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "team_wallet",
          writable: true
        },
        {
          name: "team_wallet_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "team_wallet"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "user_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "creator"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "mpl_token_metadata_program",
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      args: [
        {
          name: "decimals",
          type: "u8"
        },
        {
          name: "token_supply",
          type: "u64"
        },
        {
          name: "virtual_lamport_reserves",
          type: "u64"
        },
        {
          name: "name",
          type: "string"
        },
        {
          name: "symbol",
          type: "string"
        },
        {
          name: "uri",
          type: "string"
        },
        {
          name: "swap_amount",
          type: "u64"
        },
        {
          name: "minimum_receive_amount",
          type: "u64"
        },
        {
          name: "deadline",
          type: "i64"
        }
      ],
      returns: "u64"
    },
    {
      name: "nominate_authority",
      discriminator: [148, 182, 144, 91, 186, 12, 118, 18],
      accounts: [
        {
          name: "admin",
          writable: true,
          signer: true
        },
        {
          name: "global_config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        }
      ],
      args: [
        {
          name: "new_admin",
          type: "pubkey"
        }
      ]
    },
    {
      name: "swap",
      discriminator: [248, 198, 158, 145, 225, 117, 135, 200],
      accounts: [
        {
          name: "global_config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: "team_wallet",
          writable: true
        },
        {
          name: "team_wallet_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "team_wallet"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "bonding_curve",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 111, 110, 100, 105, 110, 103, 95, 99, 117, 114, 118, 101]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ]
          }
        },
        {
          name: "global_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: "token_mint"
        },
        {
          name: "global_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "global_vault"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "user_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "user"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        },
        {
          name: "direction",
          type: "u8"
        },
        {
          name: "minimum_receive_amount",
          type: "u64"
        },
        {
          name: "deadline",
          type: "i64"
        }
      ],
      returns: "u64"
    },
    {
      name: "withdraw",
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34],
      accounts: [
        {
          name: "global_config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103]
              }
            ]
          }
        },
        {
          name: "global_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: "admin",
          writable: true,
          signer: true
        },
        {
          name: "token_mint"
        },
        {
          name: "bonding_curve",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 111, 110, 100, 105, 110, 103, 95, 99, 117, 114, 118, 101]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ]
          }
        },
        {
          name: "global_vault_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "global_vault"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "admin_ata",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "admin"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "BondingCurve",
      discriminator: [23, 183, 248, 55, 96, 216, 172, 96]
    },
    {
      name: "Config",
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130]
    }
  ],
  events: [
    {
      name: "CompleteEvent",
      discriminator: [95, 114, 97, 156, 212, 46, 152, 8]
    }
  ],
  errors: [
    {
      code: 6e3,
      name: "ValueTooSmall",
      msg: "ValueTooSmall"
    },
    {
      code: 6001,
      name: "ValueTooLarge",
      msg: "ValueTooLarge"
    },
    {
      code: 6002,
      name: "ValueInvalid",
      msg: "ValueInvalid"
    },
    {
      code: 6003,
      name: "IncorrectConfigAccount",
      msg: "IncorrectConfigAccount"
    },
    {
      code: 6004,
      name: "IncorrectAuthority",
      msg: "IncorrectAuthority"
    },
    {
      code: 6005,
      name: "OverflowOrUnderflowOccurred",
      msg: "Overflow or underflow occured"
    },
    {
      code: 6006,
      name: "InvalidAmount",
      msg: "Amount is invalid"
    },
    {
      code: 6007,
      name: "IncorrectTeamWallet",
      msg: "Incorrect team wallet address"
    },
    {
      code: 6008,
      name: "CurveNotCompleted",
      msg: "Curve is not completed"
    },
    {
      code: 6009,
      name: "CurveAlreadyCompleted",
      msg: "Can not swap after the curve is completed"
    },
    {
      code: 6010,
      name: "MintAuthorityEnabled",
      msg: "Mint authority should be revoked"
    },
    {
      code: 6011,
      name: "FreezeAuthorityEnabled",
      msg: "Freeze authority should be revoked"
    },
    {
      code: 6012,
      name: "ReturnAmountTooSmall",
      msg: "Return amount is too small compared to the minimum received amount"
    },
    {
      code: 6013,
      name: "TransactionExpired",
      msg: "Transaction expired"
    },
    {
      code: 6014,
      name: "DecimalOverflow",
      msg: "Decimal overflow"
    }
  ],
  types: [
    {
      name: "AmountConfig",
      generics: [
        {
          kind: "type",
          name: "T"
        }
      ],
      type: {
        kind: "enum",
        variants: [
          {
            name: "Range",
            fields: [
              {
                name: "min",
                type: {
                  option: {
                    generic: "T"
                  }
                }
              },
              {
                name: "max",
                type: {
                  option: {
                    generic: "T"
                  }
                }
              }
            ]
          },
          {
            name: "Enum",
            fields: [
              {
                vec: {
                  generic: "T"
                }
              }
            ]
          }
        ]
      }
    },
    {
      name: "BondingCurve",
      type: {
        kind: "struct",
        fields: [
          {
            name: "token_mint",
            type: "pubkey"
          },
          {
            name: "creator",
            type: "pubkey"
          },
          {
            name: "init_lamport",
            type: "u64"
          },
          {
            name: "reserve_lamport",
            type: "u64"
          },
          {
            name: "reserve_token",
            type: "u64"
          },
          {
            name: "curve_limit",
            type: "u64"
          },
          {
            name: "is_completed",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "CompleteEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "mint",
            type: "pubkey"
          },
          {
            name: "bonding_curve",
            type: "pubkey"
          }
        ]
      }
    },
    {
      name: "Config",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "pubkey"
          },
          {
            name: "pending_authority",
            type: "pubkey"
          },
          {
            name: "team_wallet",
            type: "pubkey"
          },
          {
            name: "init_bonding_curve",
            type: "f64"
          },
          {
            name: "platform_buy_fee",
            type: "u128"
          },
          {
            name: "platform_sell_fee",
            type: "u128"
          },
          {
            name: "curve_limit",
            type: "u64"
          },
          {
            name: "lamport_amount_config",
            type: {
              defined: {
                name: "AmountConfig",
                generics: [
                  {
                    kind: "type",
                    type: "u64"
                  }
                ]
              }
            }
          },
          {
            name: "token_supply_config",
            type: {
              defined: {
                name: "AmountConfig",
                generics: [
                  {
                    kind: "type",
                    type: "u64"
                  }
                ]
              }
            }
          },
          {
            name: "token_decimals_config",
            type: {
              defined: {
                name: "AmountConfig",
                generics: [
                  {
                    kind: "type",
                    type: "u8"
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ]
};

// src/plugins/autofunTrader/services/execution/buyService.ts
var { AnchorProvider, BN: AnchorBN, Program } = anchorPkg;
function convertToBasisPoints(feePercent) {
  if (feePercent >= 1) {
    return feePercent;
  }
  return Math.floor(feePercent * 1e4);
}
function calculateAmountOutBuy(reserveToken, amount, _solDecimals, reserveLamport, platformBuyFee) {
  console.log("calculateAmountOutBuy inputs:", {
    reserveToken,
    amount,
    _solDecimals,
    reserveLamport,
    platformBuyFee
  });
  const feeBasisPoints = new AnchorBN(convertToBasisPoints(platformBuyFee));
  console.log("feeBasisPoints:", feeBasisPoints.toString());
  const amountBN = new AnchorBN(amount);
  console.log("amountBN:", amountBN.toString());
  const adjustedAmount = amountBN.mul(new AnchorBN(1e4)).sub(feeBasisPoints).div(new AnchorBN(1e4));
  console.log("adjustedAmount:", adjustedAmount.toString());
  const reserveTokenBN = new AnchorBN(reserveToken.toString());
  console.log("reserveTokenBN:", reserveTokenBN.toString());
  const numerator = reserveTokenBN.mul(adjustedAmount);
  console.log("numerator:", numerator.toString());
  const denominator = new AnchorBN(reserveLamport.toString()).add(adjustedAmount);
  console.log("denominator:", denominator.toString());
  const out = numerator.div(denominator).toNumber();
  console.log("final output:", out);
  return out;
}
function calculateAmountOutSell(reserveLamport, amount, _tokenDecimals, platformSellFee, reserveToken) {
  if (reserveLamport < 0) throw new Error("reserveLamport must be non-negative");
  if (amount < 0) throw new Error("amount must be non-negative");
  if (platformSellFee < 0) throw new Error("platformSellFee must be non-negative");
  if (reserveToken < 0) throw new Error("reserveToken must be non-negative");
  const feeBasisPoints = convertToBasisPoints(platformSellFee);
  const amountBN = new AnchorBN(amount);
  const adjustedAmount = amountBN.mul(new AnchorBN(1e4 - feeBasisPoints)).div(new AnchorBN(1e4));
  const numerator = new AnchorBN(reserveLamport.toString()).mul(adjustedAmount);
  const denominator = new AnchorBN(reserveToken.toString()).add(adjustedAmount);
  if (denominator.isZero()) throw new Error("Division by zero");
  return numerator.div(denominator).toNumber();
}
var FEE_BASIS_POINTS = 1e4;
var getSwapAmount = async (configAccount, program, amount, style, reserveToken, reserveLamport) => {
  console.log("getSwapAmount inputs:", {
    amount,
    style,
    reserveToken,
    reserveLamport,
    platformSellFee: configAccount.platformSellFee,
    platformBuyFee: configAccount.platformBuyFee
  });
  if (amount === void 0 || isNaN(amount)) {
    throw new Error("Invalid amount provided to getSwapAmount");
  }
  const feePercent = style === 1 ? Number(configAccount.platformSellFee) : Number(configAccount.platformBuyFee);
  console.log("feePercent:", feePercent);
  const adjustedAmount = Math.floor(amount * (FEE_BASIS_POINTS - feePercent) / FEE_BASIS_POINTS);
  console.log("adjustedAmount:", adjustedAmount);
  let estimatedOutput;
  if (style === 0) {
    console.log("Calculating buy output...");
    estimatedOutput = calculateAmountOutBuy(
      reserveToken,
      adjustedAmount,
      9,
      // SOL decimals
      reserveLamport,
      feePercent
    );
  } else {
    console.log("Calculating sell output...");
    estimatedOutput = calculateAmountOutSell(
      reserveLamport,
      adjustedAmount,
      6,
      // SOL decimals (why is this different)
      feePercent,
      reserveToken
    );
  }
  console.log("estimatedOutput:", estimatedOutput);
  return {
    estimatedOutput,
    priceImpact: "0"
  };
};
var swapIx = async (user, token, amount, style, slippageBps = 100, program, reserveToken, reserveLamport, configAccount) => {
  console.log("swapIx", {
    amount,
    style,
    slippageBps,
    reserveToken,
    reserveLamport
  });
  const estimatedOutputResult = await getSwapAmount(
    configAccount,
    program,
    amount,
    style,
    reserveToken,
    reserveLamport
  );
  const estimatedOutput = estimatedOutputResult.estimatedOutput;
  const minOutput = new AnchorBN(Math.floor(estimatedOutput * (1e4 - slippageBps) / 1e4));
  const deadline = Math.floor(Date.now() / 1e3) + 120;
  const tx = await program.methods.swap(new AnchorBN(amount), style, minOutput, new AnchorBN(deadline)).accounts({
    teamWallet: configAccount.teamWallet,
    user,
    tokenMint: token
  }).instruction();
  return tx;
};
var buyTemplate = `
I want you to give a crypto buy signal based on both the sentiment analysis as well as the trending tokens.
You trade on auto.fun, a token launchpad, a lot of these coins are brand new, won't have a lot of history.
Be hesitant about imported coins, you're more interested in the prebonded tokens.
My current balance is {{solana_balance}} SOL, If I have less than 0.3 SOL then I should not buy unless it's really good opportunity.
Also let me know what a good amount would be to buy. Buy amount should at least be 0.05 SOL and maximum 0.25 SOL.

Sentiment analysis:

{{sentiment}}

Tokens:

{{tokens}}

Only return XML in the following format:
<buy_signal>
  <recommended_buy>DEGENAI</recommended_buy>
  <recommend_buy_address>2sCUCJdVkmyXp4dT8sFaA9LKgSMK4yDPi9zLHiwXpump</recommend_buy_address>
  <reason>The reason why you think this is a good buy, and why you chose the specific amount.</reason>
  <buy_amount>0.1</buy_amount>
</buy_signal>
`;
var BuyService2 = class extends BaseTradeService2 {
  validationService;
  calculationService;
  tradeMemoryService;
  constructor(runtime, walletService, dataService, analyticsService, tradeMemoryService) {
    super(runtime, walletService, dataService, analyticsService);
    this.validationService = new TokenValidationService2(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.calculationService = new TradeCalculationService2(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.tradeMemoryService = tradeMemoryService;
  }
  async initialize() {
    logger39.info("Initializing buy service");
    this.runtime.registerEvent("SPARTAN_TRADE_BUY_SIGNAL", this.handleBuySignal.bind(this));
  }
  async stop() {
  }
  async generateSignal() {
    console.log("buy-signal - start");
    const url = "https://api.auto.fun/api/tokens?limit=1000&page=1&sortBy=createdAt&sortOrder=desc&hideImported=1";
    const res = await fetch(url);
    const data = await res.json();
    console.log("buy-signal - got token data", data.tokens.length);
    if (!data.tokens?.length) {
      logger39.warn("buy-signal - no autofun response");
      return false;
    }
    let prompt = buyTemplate;
    prompt = prompt.replace("{{sentiment}}", "The highly technical analysis is: buy whatever dude");
    let latestTxt = "\nCurrent Auto.fun list of all active cryptocurrencies with latest market data:\n";
    let idx = 1;
    const fields = [
      "id",
      "name",
      "ticker",
      "url",
      // seems to be metadata url
      "twitter",
      "telegram",
      "discord",
      "farcaster",
      "description",
      "liquidity",
      "currentPrice",
      "tokenSupplyUiAmount",
      "holderCount",
      "volume24h",
      "price24hAgo",
      "priceChange24h",
      "curveProgress",
      "status"
    ];
    const remaps = {
      ticker: "symbol"
    };
    latestTxt += "id, name, symbol, url, twitter, telegram, discord, farcaster, description, liquidity, currentPrice, tokenSupplyUiAmount, holderCount, volume24h, price24hAgo, priceChange24h, curveProgress, status";
    latestTxt += "\n";
    for (const t of data.tokens) {
      const out = [];
      for (const f of fields) {
        let val2 = t[f];
        if (val2?.replaceAll) {
          val2 = val2.replaceAll("\n", " ");
        }
        out.push(val2);
      }
      latestTxt += out.join(", ") + "\n";
    }
    prompt = prompt.replace("{{tokens}}", latestTxt);
    const walletBalance = await this.walletService.getBalance();
    prompt = prompt.replace("{{solana_balance}}", walletBalance.toString());
    let responseContent = null;
    let retries = 0;
    const maxRetries = 3;
    while (retries < maxRetries && (!responseContent?.recommended_buy || !responseContent?.reason || !responseContent?.recommend_buy_address)) {
      const response = await this.runtime.useModel(ModelType9.TEXT_LARGE, {
        prompt,
        system: "You are a buy signal analyzer.",
        temperature: 0.2,
        maxTokens: 4096,
        object: true
      });
      console.log("afTrader:buy-signal - response", response);
      const parsedXml = parseKeyValueXml(response);
      if (parsedXml) {
        responseContent = {
          recommended_buy: parsedXml.recommended_buy || "",
          recommend_buy_address: parsedXml.recommend_buy_address || "",
          reason: parsedXml.reason || "",
          buy_amount: parsedXml.buy_amount || ""
        };
      } else {
        responseContent = null;
      }
      retries++;
      if (!responseContent?.recommended_buy && !responseContent?.reason && !responseContent?.recommend_buy_address) {
        logger39.warn("*** Missing required fields, retrying... generateSignal ***");
      }
    }
    if (!responseContent?.recommend_buy_address) {
      console.warn("afTrader:buy-signal::generateSignal - no buy recommendation");
      return false;
    }
    if (!responseContent?.recommend_buy_address?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      logger39.error("Invalid Solana token address", {
        address: responseContent?.recommend_buy_address
      });
      return false;
    }
    const params = responseContent;
    const signal = {
      positionId: v4_default(),
      tokenAddress: params.recommend_buy_address,
      entityId: "default",
      tradeAmount: params.buy_amount.toString(),
      expectedOutAmount: "0"
    };
    console.log("buy signal", signal);
    const token = data.tokens.find((t) => t.id === params.recommend_buy_address);
    if (!token) {
      console.log(params.recommend_buy_address, "not a auto.fun token");
      return false;
    }
    await this.updateExpectedOutAmount(signal);
    const buyAmount = await this.calculationService.calculateOptimalBuyAmount({
      tokenAddress: signal.tokenAddress,
      walletBalance,
      signal
    });
    if (buyAmount <= 0) {
      return { success: false, error: "Buy amount too small" };
    }
    const slippageBps = await this.calculationService.calculateDynamicSlippage(
      signal.tokenAddress,
      buyAmount,
      false
    );
    signal.tradeAmount = buyAmount.toString();
    const wallet = await this.walletService.getWallet();
    let result = {};
    if (token.status === "migrated" || token.status === "locked") {
      logger39.debug("buying from LP (bonded)");
      result = await wallet.buy({
        tokenAddress: signal.tokenAddress,
        amountInSol: buyAmount,
        slippageBps
      });
    } else {
      logger39.debug("buying from AutoFun (unbonded)");
      await this.autofunBuy(wallet, signal, slippageBps);
    }
    if (result.success) {
      await this.tradeMemoryService.createTrade({
        tokenAddress: signal.tokenAddress,
        chain: "solana",
        type: "BUY",
        amount: buyAmount.toString(),
        price: token.currentPrice.toString(),
        txHash: result.signature,
        metadata: {
          slippage: slippageBps,
          expectedAmount: signal.expectedOutAmount,
          receivedAmount: result.outAmount,
          valueUsd: result.swapUsdValue
        }
      });
      if (result.outAmount) {
        await this.analyticsService.trackSlippageImpact(
          signal.tokenAddress,
          signal.expectedOutAmount || "0",
          result.outAmount,
          slippageBps,
          false
        );
      }
    }
  }
  async autofunBuy(wallet, signal, slippageBps) {
    const walletAdapter = {
      publicKey: wallet.publicKey,
      signTransaction: async (tx2) => {
        await wallet.executeTrade({
          tokenAddress: signal.tokenAddress,
          amount: signal.tradeAmount,
          slippage: slippageBps,
          action: "BUY"
        });
        return tx2;
      },
      signAllTransactions: async (txs) => {
        return Promise.all(txs.map((tx2) => walletAdapter.signTransaction(tx2)));
      }
    };
    const connection = new Connection3(this.runtime.getSetting("SOLANA_RPC_URL"));
    const provider = new AnchorProvider(connection, walletAdapter, AnchorProvider.defaultOptions());
    const program = new Program(autofun_default, provider);
    const tokenAddress = signal.tokenAddress;
    const [bondingCurvePda] = PublicKey4.findProgramAddressSync(
      [Buffer4.from("bonding_curve"), new PublicKey4(tokenAddress).toBytes()],
      program.programId
    );
    const curve = await program.account.bondingCurve.fetch(bondingCurvePda);
    const [configPda, _] = PublicKey4.findProgramAddressSync(
      [Buffer4.from("config")],
      program.programId
    );
    const config3 = await program.account.config.fetch(configPda);
    const amount = parseFloat(signal.tradeAmount) * 1e3;
    const internalIx = await swapIx(
      wallet.publicKey,
      new PublicKey4(tokenAddress),
      amount,
      0,
      slippageBps,
      program,
      curve.reserveToken.toNumber(),
      curve.reserveLamport.toNumber(),
      config3
    );
    let ixs = [internalIx];
    const solFee = 5e-4;
    const feeLamports = Math.floor(solFee * 1e9);
    ixs.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: feeLamports
      })
    );
    const tx = new Transaction().add(...ixs);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = blockhash;
    console.log("Executing buy simulation transaction...");
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      logger39.error("Buy transaction simulation failed:", simulation.value.err);
      logger39.error("Buy simulation Logs:", simulation.value.logs);
      return {
        success: false,
        signature: "",
        outAmount: 0,
        swapUsdValue: 0
      };
    }
    logger39.log("Buy transaction simulation successful.");
    const versionedTx = new VersionedTransaction3(tx.compileMessage());
    const walletKeypair = this.walletService.keypair;
    const latestBlockhash = await connection.getLatestBlockhash("processed");
    versionedTx.message.recentBlockhash = latestBlockhash.blockhash;
    versionedTx.sign([walletKeypair]);
    const signature = await connection.sendRawTransaction(versionedTx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
      preflightCommitment: "processed"
    });
    console.log(`Standard transaction sent, signature: ${signature}`);
    let success = false;
    success = true;
    return {
      success,
      signature,
      outAmount: 0,
      swapUsdValue: 0
    };
  }
  async handleBuySignal(params) {
    const TRADER_BUY_KUMA = this.runtime.getSetting("TRADER_BUY_KUMA");
    if (TRADER_BUY_KUMA) {
      fetch(TRADER_BUY_KUMA).catch((e) => {
        logger39.error("TRADER_BUY_KUMA err", e);
      });
    }
    const signal = {
      positionId: v4_default(),
      tokenAddress: params.recommend_buy_address,
      entityId: "default",
      tradeAmount: params.buy_amount,
      expectedOutAmount: "0"
    };
    await this.updateExpectedOutAmount(signal);
    this.executeBuy(signal).then((result) => {
      logger39.info("executeBuy - result", result);
    });
  }
  async updateExpectedOutAmount(signal) {
    if (!signal.tradeAmount) return;
    try {
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${signal.tokenAddress}&amount=${Math.round(Number(signal.tradeAmount) * 1e9)}&slippageBps=0`
      );
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        signal.expectedOutAmount = quoteData.outAmount;
      }
    } catch (error) {
      logger39.warn("Failed to get expected out amount for buy", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  async executeBuy(signal) {
    const walletBalance = await this.walletService.getBalance();
    const buyAmount = await this.calculationService.calculateOptimalBuyAmount({
      tokenAddress: signal.tokenAddress,
      walletBalance,
      signal
    });
    if (buyAmount <= 0) {
      return { success: false, error: "Buy amount too small" };
    }
    const slippageBps = await this.calculationService.calculateDynamicSlippage(
      signal.tokenAddress,
      buyAmount,
      false
    );
    return await executeTrade(this.runtime, {
      tokenAddress: signal.tokenAddress,
      amount: buyAmount.toString(),
      slippage: slippageBps,
      action: "BUY",
      dex: "jup"
    });
  }
};

// src/plugins/autofunTrader/services/execution/sellService.ts
import {
  ModelType as ModelType10,
  logger as logger42,
  parseJSONObjectFromText as parseJSONObjectFromText5
} from "@elizaos/core";

// src/plugins/autofunTrader/utils/bignumber.ts
bignumber_default.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: bignumber_default.ROUND_DOWN,
  EXPONENTIAL_AT: [-20, 20]
});
function toBN2(value) {
  try {
    return new bignumber_default(value);
  } catch (error) {
    throw new Error(`Failed to convert value to BigNumber: ${value}`);
  }
}

// src/plugins/autofunTrader/utils/wallet.ts
import { logger as logger41, parseJSONObjectFromText as parseJSONObjectFromText4 } from "@elizaos/core";
import { Connection as Connection4, Keypair as Keypair3, VersionedTransaction as VersionedTransaction4, PublicKey as PublicKey6 } from "@solana/web3.js";
import { Buffer as Buffer5 } from "buffer";

// src/plugins/autofunTrader/utils/utils.ts
import { logger as logger40 } from "@elizaos/core";
import { PublicKey as PublicKey5 } from "@solana/web3.js";
function decodeBase582(str) {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const ALPHABET_MAP = new Map(ALPHABET.split("").map((c, i) => [c, BigInt(i)]));
  let result = BigInt(0);
  for (const char of str) {
    const value = ALPHABET_MAP.get(char);
    if (value === void 0) {
      throw new Error("Invalid base58 character");
    }
    result = result * BigInt(58) + value;
  }
  const bytes = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xffn));
    result = result >> 8n;
  }
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    bytes.unshift(0);
  }
  return new Uint8Array(bytes);
}

// src/plugins/autofunTrader/utils/wallet.ts
function getWalletKeypair2(runtime) {
  const privateKeyString = runtime?.getSetting("SOLANA_PRIVATE_KEY");
  if (!privateKeyString) {
    throw new Error("No wallet private key configured");
  }
  try {
    const privateKeyBytes = decodeBase582(privateKeyString);
    return Keypair3.fromSecretKey(privateKeyBytes);
  } catch (error) {
    logger41.error("Failed to create wallet keypair:", error);
    throw error;
  }
}
var CONFIRMATION_CONFIG2 = {
  MAX_ATTEMPTS: 12,
  // Increased from 8
  INITIAL_TIMEOUT: 2e3,
  // 2 seconds
  MAX_TIMEOUT: 2e4,
  // 20 seconds
  // Exponential backoff between retries
  getDelayForAttempt: (attempt) => Math.min(2e3 * 1.5 ** attempt, 2e4)
};
function calculateDynamicSlippage4(amount, quoteData) {
  const baseSlippage = 0.45;
  const priceImpact = Number.parseFloat(quoteData?.priceImpactPct || "0");
  const amountNum = Number(amount);
  let dynamicSlippage = baseSlippage;
  if (priceImpact > 1) {
    dynamicSlippage += priceImpact * 0.5;
  }
  if (amountNum > 1e4) {
    dynamicSlippage *= 1.5;
  }
  return Math.min(dynamicSlippage, 2.5);
}
async function executeTrade2(runtime, params) {
  const actionStr = params.action === "SELL" ? "sell" : "buy";
  logger41.info(`Executing ${actionStr} trade using ${params.dex}:`, {
    tokenAddress: params.tokenAddress,
    amount: params.amount,
    slippage: params.slippage
  });
  try {
    const walletKeypair = getWalletKeypair2(runtime);
    const connection = new Connection4(runtime.getSetting("RPC_URL"));
    const SOL_ADDRESS2 = "So11111111111111111111111111111111111111112";
    const inputTokenCA = params.action === "SELL" ? params.tokenAddress : SOL_ADDRESS2;
    const outputTokenCA = params.action === "SELL" ? SOL_ADDRESS2 : params.tokenAddress;
    const swapAmount = params.action === "SELL" ? Number(params.amount) : Math.floor(Number(params.amount) * 1e9);
    const quoteResponse = await fetch(
      `https://public.jupiterapi.com/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${swapAmount}&slippageBps=${params.slippage}&platformFeeBps=200`
    );
    if (!quoteResponse.ok) {
      const error = await quoteResponse.text();
      const parsedResponse = parseJSONObjectFromText4(error);
      if (parsedResponse?.errorCode === "TOKEN_NOT_TRADABLE") {
        let extractTokenAddress = function(message) {
          const regex = /The token (\w{44}) is not tradable/;
          const match = message.match(regex);
          return match ? match[1] : null;
        };
        logger41.log("Need to flag", extractTokenAddress(parsedResponse.error), "as not tradable");
      }
      logger41.warn("Quote request failed:", {
        status: quoteResponse.status,
        error
      });
      return {
        success: false,
        error: `Failed to get quote: ${error}`
      };
    }
    const quoteData = await quoteResponse.json();
    logger41.log("Quote received:", quoteData);
    const dynamicSlippage = calculateDynamicSlippage4(params.amount.toString(), quoteData);
    logger41.info("Using dynamic slippage:", {
      baseSlippage: params.slippage,
      dynamicSlippage,
      priceImpact: quoteData?.priceImpactPct
    });
    const swapResponse = await fetch("https://public.jupiterapi.com/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: {
          ...quoteData,
          slippageBps: Math.floor(dynamicSlippage * 1e4)
        },
        userPublicKey: walletKeypair.publicKey.toString(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 5e6,
        dynamicComputeUnitLimit: true
      })
    });
    if (!swapResponse.ok) {
      const error = await swapResponse.text();
      logger41.error("Swap request failed:", {
        status: swapResponse.status,
        error
      });
      throw new Error(`Failed to get swap transaction: ${error}`);
    }
    const swapData = await swapResponse.json();
    logger41.log("Swap response received:", swapData);
    if (!swapData?.swapTransaction) {
      logger41.error("Invalid swap response:", swapData);
      throw new Error("No swap transaction returned in response");
    }
    const transactionBuf = Buffer5.from(swapData.swapTransaction, "base64");
    const tx = VersionedTransaction4.deserialize(transactionBuf);
    const latestBlockhash = await connection.getLatestBlockhash("processed");
    tx.message.recentBlockhash = latestBlockhash.blockhash;
    tx.sign([walletKeypair]);
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
      preflightCommitment: "processed"
    });
    logger41.log("Transaction sent with high priority:", {
      signature,
      explorer: `https://solscan.io/tx/${signature}`
    });
    let confirmed = false;
    for (let i = 0; i < CONFIRMATION_CONFIG2.MAX_ATTEMPTS; i++) {
      try {
        const status = await connection.getSignatureStatus(signature);
        if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
          confirmed = true;
          logger41.log("Transaction confirmed:", {
            signature,
            confirmationStatus: status.value.confirmationStatus,
            slot: status.context.slot,
            attempt: i + 1
          });
          break;
        }
        const delay = CONFIRMATION_CONFIG2.getDelayForAttempt(i);
        logger41.info(
          `Waiting ${delay}ms before next confirmation check (attempt ${i + 1}/${CONFIRMATION_CONFIG2.MAX_ATTEMPTS})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        logger41.warn(`Confirmation check ${i + 1} failed:`, error);
        if (i === CONFIRMATION_CONFIG2.MAX_ATTEMPTS - 1) {
          throw new Error("Could not confirm transaction status");
        }
        const delay = CONFIRMATION_CONFIG2.getDelayForAttempt(i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    if (!confirmed) {
      throw new Error("Could not confirm transaction status");
    }
    logger41.log("Trade executed successfully:", {
      type: params.action === "SELL" ? "sell" : "buy",
      tokenAddress: params.tokenAddress,
      amount: params.amount,
      signature,
      explorer: `https://solscan.io/tx/${signature}`
    });
    return {
      success: true,
      signature,
      receivedAmount: params.amount,
      receivedValue: params.amount
    };
  } catch (error) {
    logger41.error("Trade execution failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      params: {
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        slippage: params.slippage,
        dex: params.dex,
        action: params.action
      },
      errorStack: error instanceof Error ? error.stack : void 0
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getWalletBalances2(runtime) {
  try {
    const walletKeypair = getWalletKeypair2(runtime);
    const connection = new Connection4(runtime.getSetting("RPC_URL"));
    const solBalance = await connection.getBalance(walletKeypair.publicKey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletKeypair.publicKey, {
      programId: new PublicKey6("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });
    const balances = {
      solBalance: solBalance / 1e9,
      tokens: tokenAccounts.value.map((account) => ({
        mint: account.account.data.parsed.info.mint,
        balance: account.account.data.parsed.info.tokenAmount.amount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount
      }))
    };
    return balances;
  } catch (error) {
    logger41.error("Failed to get wallet balances:", error);
    return {
      solBalance: 0,
      tokens: []
    };
  }
}
async function getTokenBalance2(runtime, tokenMint) {
  try {
    const balances = await getWalletBalances2(runtime);
    const token = balances.tokens.find((t) => t.mint.toLowerCase() === tokenMint.toLowerCase());
    if (!token) {
      logger41.warn(`No balance found for token ${tokenMint}`, {
        availableTokens: balances.tokens.map((t) => t.mint)
      });
    }
    return token;
  } catch (error) {
    logger41.error("Failed to get token balance:", error);
    return null;
  }
}

// src/plugins/autofunTrader/services/execution/sellService.ts
import anchorPkg2 from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram as ComputeBudgetProgram2,
  Connection as Connection5,
  PublicKey as PublicKey7,
  Transaction as Transaction2,
  VersionedTransaction as VersionedTransaction5
} from "@solana/web3.js";
import { Buffer as Buffer6 } from "buffer";
var { BN: AnchorBN2, AnchorProvider: AnchorProvider2, Program: Program2 } = anchorPkg2;
function convertToBasisPoints2(feePercent) {
  if (feePercent >= 1) {
    return feePercent;
  }
  return Math.floor(feePercent * 1e4);
}
function calculateAmountOutBuy2(reserveToken, amount, _solDecimals, reserveLamport, platformBuyFee) {
  console.log("calculateAmountOutBuy inputs:", {
    reserveToken,
    amount,
    _solDecimals,
    reserveLamport,
    platformBuyFee
  });
  const feeBasisPoints = new AnchorBN2(convertToBasisPoints2(platformBuyFee));
  console.log("feeBasisPoints:", feeBasisPoints.toString());
  const amountBN = new AnchorBN2(amount);
  console.log("amountBN:", amountBN.toString());
  const adjustedAmount = amountBN.mul(new AnchorBN2(1e4)).sub(feeBasisPoints).div(new AnchorBN2(1e4));
  console.log("adjustedAmount:", adjustedAmount.toString());
  const reserveTokenBN = new AnchorBN2(reserveToken.toString());
  console.log("reserveTokenBN:", reserveTokenBN.toString());
  const numerator = reserveTokenBN.mul(adjustedAmount);
  console.log("numerator:", numerator.toString());
  const denominator = new AnchorBN2(reserveLamport.toString()).add(adjustedAmount);
  console.log("denominator:", denominator.toString());
  const out = numerator.div(denominator).toNumber();
  console.log("final output:", out);
  return out;
}
function calculateAmountOutSell2(reserveLamport, amount, _tokenDecimals, platformSellFee, reserveToken) {
  if (reserveLamport < 0) throw new Error("reserveLamport must be non-negative");
  if (amount < 0) throw new Error("amount must be non-negative");
  if (platformSellFee < 0) throw new Error("platformSellFee must be non-negative");
  if (reserveToken < 0) throw new Error("reserveToken must be non-negative");
  const feeBasisPoints = convertToBasisPoints2(platformSellFee);
  const amountBN = new AnchorBN2(amount);
  const adjustedAmount = amountBN.mul(new AnchorBN2(1e4 - feeBasisPoints)).div(new AnchorBN2(1e4));
  const numerator = new AnchorBN2(reserveLamport.toString()).mul(adjustedAmount);
  const denominator = new AnchorBN2(reserveToken.toString()).add(adjustedAmount);
  if (denominator.isZero()) throw new Error("Division by zero");
  return numerator.div(denominator).toNumber();
}
var FEE_BASIS_POINTS2 = 1e4;
var getSwapAmount2 = async (configAccount, program, amount, style, reserveToken, reserveLamport) => {
  console.log("getSwapAmount inputs:", {
    amount,
    style,
    reserveToken,
    reserveLamport,
    platformSellFee: configAccount.platformSellFee,
    platformBuyFee: configAccount.platformBuyFee
  });
  if (amount === void 0 || isNaN(amount)) {
    throw new Error("Invalid amount provided to getSwapAmount");
  }
  const feePercent = style === 1 ? Number(configAccount.platformSellFee) : Number(configAccount.platformBuyFee);
  console.log("feePercent:", feePercent);
  const adjustedAmount = Math.floor(amount * (FEE_BASIS_POINTS2 - feePercent) / FEE_BASIS_POINTS2);
  console.log("adjustedAmount:", adjustedAmount);
  let estimatedOutput;
  if (style === 0) {
    console.log("Calculating buy output...");
    estimatedOutput = calculateAmountOutBuy2(
      reserveToken,
      adjustedAmount,
      9,
      // SOL decimals
      reserveLamport,
      feePercent
    );
  } else {
    console.log("Calculating sell output...");
    estimatedOutput = calculateAmountOutSell2(
      reserveLamport,
      adjustedAmount,
      6,
      feePercent,
      reserveToken
    );
  }
  console.log("estimatedOutput:", estimatedOutput);
  return {
    estimatedOutput,
    priceImpact: "0"
  };
};
var swapIx2 = async (user, token, amount, style, slippageBps = 100, program, reserveToken, reserveLamport, configAccount) => {
  console.log("swapIx", {
    amount,
    style,
    slippageBps,
    reserveToken,
    reserveLamport
  });
  const estimatedOutputResult = await getSwapAmount2(
    configAccount,
    program,
    amount,
    style,
    reserveToken,
    reserveLamport
  );
  const estimatedOutput = estimatedOutputResult.estimatedOutput;
  const minOutput = new AnchorBN2(Math.floor(estimatedOutput * (1e4 - slippageBps) / 1e4));
  const deadline = Math.floor(Date.now() / 1e3) + 120;
  const tx = await program.methods.swap(new AnchorBN2(amount), style, minOutput, new AnchorBN2(deadline)).accounts({
    teamWallet: configAccount.teamWallet,
    user,
    tokenMint: token
  }).instruction();
  return tx;
};
var sellTemplate = `

I want you to give a crypto sell signal based on both the sentiment analysis as well as the wallet token data.
You trade on auto.fun, a token launchpad, a lot of these coins are brand new, won't have a lot of history.
Don't sell tokens where status is locked
The sentiment score has a range of -100 to 100, with -100 indicating extreme negativity and 100 indicating extreme positiveness.
My current balance is {{solana_balance}} SOL, If I have less than 0.3 SOL, I should up the priority on selling something but we don't need to realize a heavy loss over it.

Sentiment analysis:

{{sentiment}}

Wallet tokens:

{{walletData}}

Only return the following JSON:

{
  recommended_sell: "the symbol of the token for example DEGENAI",
  recommend_sell_address: "the address of the token to purchase, for example: 2sCUCJdVkmyXp4dT8sFaA9LKgSMK4yDPi9zLHiwXpump",
  reason: "the reason why you think this is a good sell, and why you chose the specific amount",
  sell_amount: "number, for example: 600.54411 (number amount of tokens to sell)"
}
Do not include any text after the JSON
`;
var SellService2 = class extends BaseTradeService2 {
  pendingSells = {};
  validationService;
  calculationService;
  tradeMemoryService;
  constructor(runtime, walletService, dataService, analyticsService, tradeMemoryService) {
    super(runtime, walletService, dataService, analyticsService);
    this.validationService = new TokenValidationService2(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.calculationService = new TradeCalculationService2(
      runtime,
      walletService,
      dataService,
      analyticsService
    );
    this.tradeMemoryService = tradeMemoryService;
  }
  async initialize() {
    logger42.info("Initializing sell service");
  }
  async stop() {
    this.pendingSells = {};
  }
  // https://github.com/elizaOS/auto.fun/blob/7b9c4e6a38ff93c882a87198388e5381a3d40a7a/packages/client/src/utils/swapUtils.ts#L37
  // https://github.com/elizaOS/auto.fun/blob/7b9c4e6a38ff93c882a87198388e5381a3d40a7a/packages/client/src/hooks/use-swap.ts#L3
  async generateSignal() {
    console.log("sell-signal - start");
    const walletBalances = await this.walletService.getWalletBalances();
    const walletData = walletBalances.tokens.map((token2) => ({
      mint: token2.mint,
      balance: token2.uiAmount
    }));
    const CAs = walletData.map((t) => t.mint);
    const baseUrl = "https://api.auto.fun/api/token/";
    const tokenRes = await Promise.all(CAs.map((CA) => fetch(baseUrl + CA)));
    const tokenData = await Promise.all(tokenRes.map((res) => res.json()));
    const goodAfTokens = tokenData.filter((t) => !t.error);
    console.log(
      "goodAfTokens",
      goodAfTokens.map((t) => [t.name, t.id, t.status])
    );
    let prompt = sellTemplate;
    prompt = prompt.replace(
      "{{sentiment}}",
      "The highly technical analysis is: buy whatever dude 100"
    );
    let latestTxt = "\nCurrent Auto.fun list of all active cryptocurrencies with latest market data:\n";
    let idx = 1;
    const fields = [
      "id",
      "name",
      "ticker",
      "url",
      "twitter",
      "telegram",
      "discord",
      "farcaster",
      "description",
      "liquidity",
      "currentPrice",
      "tokenSupplyUiAmount",
      "holderCount",
      "volume24h",
      "price24hAgo",
      "priceChange24h",
      "curveProgress",
      "imported",
      "status"
    ];
    const remaps = {
      ticker: "symbol"
    };
    latestTxt += "your balance, id, name, symbol, url, twitter, telegram, discord, farcaster, description, liquidity, currentPrice, tokenSupplyUiAmount, holderCount, volume24h, price24hAgo, priceChange24h, curveProgress, imported, status";
    latestTxt += "\n";
    for (const t of goodAfTokens) {
      const tokenBalance2 = walletData.find((a) => a.mint === t.id).balance;
      const out = [tokenBalance2];
      for (const f of fields) {
        let val2 = t[f];
        if (val2?.replaceAll) {
          val2 = val2.replaceAll("\n", " ");
        }
        out.push(val2);
      }
      latestTxt += out.join(", ") + "\n";
    }
    prompt = prompt.replace("{{walletData}}", latestTxt);
    const walletBalance = await this.walletService.getBalance();
    prompt = prompt.replace("{{solana_balance}}", walletBalance.toString());
    let responseContent = null;
    let retries = 0;
    const maxRetries = 3;
    while (retries < maxRetries && (!responseContent?.recommended_sell || !responseContent?.reason || !responseContent?.recommend_sell_address)) {
      const response = await this.runtime.useModel(ModelType10.TEXT_LARGE, {
        prompt,
        system: "You are a sell signal analyzer.",
        temperature: 0.2,
        maxTokens: 4096,
        object: true
      });
      responseContent = parseJSONObjectFromText5(response);
      retries++;
      if (!responseContent?.recommended_sell && !responseContent?.reason && !responseContent?.recommend_sell_address) {
        logger42.warn("*** Missing required fields, retrying... generateSignal ***");
      }
    }
    if (!responseContent?.recommend_sell_address) {
      logger42.warn("sell-signal::generateSignal - no sell recommendation");
      return false;
    }
    if (!responseContent?.recommend_sell_address?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      logger42.error("Invalid Solana token address", {
        address: responseContent?.recommend_sell_address
      });
      return false;
    }
    console.log("sell-signal", responseContent);
    const params = responseContent;
    const wallet = await this.walletService.getWallet();
    const signal = {
      positionId: v4_default(),
      tokenAddress: params.recommend_sell_address,
      amount: String(params.sell_amount),
      entityId: "default",
      currentBalance: "0",
      // Will be updated below
      walletAddress: wallet.publicKey.toString(),
      isSimulation: false,
      sellRecommenderId: "autofun_trader",
      reason: params.reason || "Automated sell signal"
    };
    const slippageValue = params.slippage || 100;
    const token = goodAfTokens.find((t) => t.id === params.recommend_sell_address);
    if (!token) {
      logger42.log(`Token ${params.recommend_sell_address} not a auto.fun token`);
      return false;
    }
    console.log("is AF token");
    if (token.status === "migrated" || token.status === "locked") {
      await this.updateExpectedOutAmount(signal, slippageValue);
    }
    const tokenBalance = walletData.find((a) => a.mint === params.recommend_sell_address).balance;
    signal.currentBalance = tokenBalance.balance;
    console.log("got balance", tokenBalance);
    const sellAmount = toBN2(signal.amount).times(10 ** 3);
    if (sellAmount.gt(toBN2(tokenBalance.balance))) {
      logger42.log(
        `Insufficient token balance. Requested: ${sellAmount.toString()}, Available: ${tokenBalance.balance}`
      );
      return {
        success: false,
        error: `Insufficient token balance. Requested: ${sellAmount.toString()}, Available: ${tokenBalance.balance}`
      };
    }
    this.pendingSells[signal.tokenAddress] = (this.pendingSells[signal.tokenAddress] || toBN2(0)).plus(sellAmount);
    const slippageBps = await this.calculationService.calculateDynamicSlippage(
      signal.tokenAddress,
      Number(sellAmount),
      true
    );
    signal.amount = sellAmount.toString();
    console.log("sellAmount", sellAmount, "slippageBps", slippageBps);
    let result = {};
    if (token.status === "migrated" || token.status === "locked") {
      logger42.debug("selling from LP (bonded)");
    } else {
      logger42.debug("selling from AutoFun (unbonded)");
      result = await this.autofunSell(signal, slippageBps);
    }
    if (result.success) {
      await this.tradeMemoryService.createTrade({
        tokenAddress: signal.tokenAddress,
        chain: "solana",
        type: "SELL",
        amount: sellAmount.toString(),
        price: token.currentPrice.toString(),
        txHash: result.signature || "",
        metadata: {
          slippage: slippageBps,
          expectedAmount: signal.expectedOutAmount || "0",
          receivedAmount: result.receivedAmount || "0",
          valueUsd: result.receivedValue || "0"
        }
      });
      await this.analyticsService.trackSlippageImpact(
        signal.tokenAddress,
        signal.expectedOutAmount || "0",
        result.receivedAmount || "0",
        slippageBps,
        true
      );
    }
    return result;
  }
  async updateExpectedOutAmount(signal, slippage = 100) {
    if (!signal.amount) return;
    try {
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${signal.tokenAddress}&outputMint=So11111111111111111111111111111111111111112&amount=${Math.round(
          Number(signal.amount) * 1e9
        )}&slippageBps=${slippage}`
      );
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        signal.expectedOutAmount = quoteData.outAmount;
      }
    } catch (error) {
      logger42.warn("Failed to get expected out amount for sell", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  async autofunSell(signal, slippageBps) {
    const wallet = await this.walletService.getWallet();
    const walletAdapter = {
      publicKey: wallet.publicKey,
      signTransaction: async (tx2) => {
        await wallet.executeTrade({
          tokenAddress: signal.tokenAddress,
          amount: signal.amount,
          slippage: slippageBps,
          action: "SELL"
        });
        return tx2;
      },
      signAllTransactions: async (txs) => {
        return Promise.all(txs.map((tx2) => walletAdapter.signTransaction(tx2)));
      }
    };
    const connection = new Connection5(this.runtime.getSetting("SOLANA_RPC_URL"));
    const provider = new AnchorProvider2(connection, walletAdapter, AnchorProvider2.defaultOptions());
    const program = new Program2(autofun_default, provider);
    const tokenAddress = signal.tokenAddress;
    const [bondingCurvePda] = PublicKey7.findProgramAddressSync(
      [Buffer6.from("bonding_curve"), new PublicKey7(tokenAddress).toBytes()],
      program.programId
    );
    const curve = await program.account.bondingCurve.fetch(bondingCurvePda);
    const [configPda, _] = PublicKey7.findProgramAddressSync(
      [Buffer6.from("config")],
      program.programId
    );
    const config3 = await program.account.config.fetch(configPda);
    const amount = parseFloat(signal.amount) * 1e3;
    const internalIx = await swapIx2(
      wallet.publicKey,
      new PublicKey7(tokenAddress),
      amount,
      1,
      slippageBps,
      program,
      curve.reserveToken.toNumber(),
      curve.reserveLamport.toNumber(),
      config3
    );
    let ixs = [internalIx];
    const solFee = 5e-4;
    const feeLamports = Math.floor(solFee * 1e9);
    ixs.push(
      ComputeBudgetProgram2.setComputeUnitPrice({
        microLamports: feeLamports
      })
    );
    const tx = new Transaction2().add(...ixs);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = blockhash;
    console.log("Executing sell simulation transaction...");
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      logger42.error("Sell transaction simulation failed:", simulation.value.err);
      logger42.error("Sell simulation Logs:", simulation.value.logs);
      return {
        success: false,
        signature: "",
        receivedAmount: "0",
        receivedValue: "0"
      };
    } else {
      logger42.log("Sell transaction simulation successful.");
    }
    const versionedTx = new VersionedTransaction5(tx.compileMessage());
    const walletKeypair = this.walletService.keypair;
    const latestBlockhash = await connection.getLatestBlockhash("processed");
    versionedTx.message.recentBlockhash = latestBlockhash.blockhash;
    versionedTx.sign([walletKeypair]);
    const signature = await connection.sendRawTransaction(versionedTx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
      preflightCommitment: "processed"
    });
    console.log(`Standard transaction sent, signature: ${signature}`);
    let success = false;
    success = true;
    return {
      success,
      signature,
      receivedAmount: "0",
      receivedValue: "0"
    };
  }
  async executeSell(signal) {
    try {
      if (!signal) {
        throw new Error("No signal data in sell task");
      }
      const tokenBalance = await getTokenBalance2(this.runtime, signal.tokenAddress);
      if (!tokenBalance) {
        return { success: false, error: "No token balance found" };
      }
      const sellAmount = toBN2(signal.amount).times(10 ** tokenBalance.decimals);
      if (sellAmount.gt(toBN2(tokenBalance.balance))) {
        return {
          success: false,
          error: `Insufficient token balance. Requested: ${sellAmount.toString()}, Available: ${tokenBalance.balance}`
        };
      }
      try {
        this.pendingSells[signal.tokenAddress] = (this.pendingSells[signal.tokenAddress] || toBN2(0)).plus(sellAmount);
        const slippageBps = await this.calculationService.calculateDynamicSlippage(
          signal.tokenAddress,
          Number(sellAmount),
          true
        );
        const result = await executeTrade2(this.runtime, {
          tokenAddress: signal.tokenAddress,
          amount: sellAmount.toString(),
          slippage: slippageBps,
          dex: "jup",
          action: "SELL"
        });
        const marketData = await this.dataService.getTokenMarketData(signal.tokenAddress);
        if (result.success) {
          await this.tradeMemoryService.createTrade({
            tokenAddress: signal.tokenAddress,
            chain: "solana",
            type: "SELL",
            amount: sellAmount.toString(),
            price: marketData.price.toString(),
            txHash: result.signature,
            metadata: {
              slippage: slippageBps,
              expectedAmount: signal.expectedOutAmount || "0",
              receivedAmount: result.receivedAmount || "0",
              valueUsd: result.receivedValue || "0"
            }
          });
          await this.analyticsService.trackSlippageImpact(
            signal.tokenAddress,
            signal.expectedOutAmount || "0",
            result.receivedAmount || "0",
            slippageBps,
            true
          );
        }
        return result;
      } finally {
        this.pendingSells[signal.tokenAddress] = (this.pendingSells[signal.tokenAddress] || toBN2(0)).minus(sellAmount);
        if (this.pendingSells[signal.tokenAddress].lte(toBN2(0))) {
          delete this.pendingSells[signal.tokenAddress];
        }
      }
    } catch (error) {
      logger42.error("Error executing sell task:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};

// src/plugins/autofunTrader/services/dataService.ts
import { logger as logger46 } from "@elizaos/core";

// src/plugins/autofunTrader/utils/cacheManager.ts
var CacheManager2 = class {
  cache = /* @__PURE__ */ new Map();
  defaultTTL = 6e4;
  // 60 seconds default TTL
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ttl = this.defaultTTL) {
    const entry = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }
  async delete(key) {
    this.cache.delete(key);
  }
  async clear() {
    this.cache.clear();
  }
};

// src/plugins/autofunTrader/services/analyticsService.ts
import { logger as logger43 } from "@elizaos/core";
var AnalyticsService2 = class {
  constructor(runtime) {
    this.runtime = runtime;
  }
  async initialize() {
    logger43.info("Initializing analytics service");
  }
  async stop() {
  }
  async scoreTechnicalSignals(signals) {
    if (!signals) return 0;
    let score = 0;
    if (signals.rsi < 30)
      score += 10;
    else if (signals.rsi > 70)
      score -= 5;
    else score += 5;
    if (signals.macd.value > 0 && signals.macd.value > signals.macd.signal) {
      score += 10;
    } else if (signals.macd.value < 0 && Math.abs(signals.macd.value) > Math.abs(signals.macd.signal)) {
      score -= 5;
    }
    if (signals.volumeProfile?.trend === "increasing" && !signals.volumeProfile.unusualActivity) {
      score += 10;
    }
    if (signals.volatility < 0.2) score += 10;
    else if (signals.volatility > 0.5) score -= 5;
    return score;
  }
  async scoreSocialMetrics(metrics) {
    if (!metrics) return 0;
    let score = 0;
    const mentionScore = Math.min(metrics.mentionCount / 100, 10);
    score += mentionScore;
    score += metrics.sentiment * 10;
    const influencerScore = Math.min(metrics.influencerMentions * 2, 10);
    score += influencerScore;
    return Math.max(0, score);
  }
  async scoreMarketMetrics(metrics) {
    let score = 0;
    if (metrics.marketCap > 1e9)
      score += 2;
    else if (metrics.marketCap > 1e8)
      score += 5;
    else if (metrics.marketCap > 1e7)
      score += 10;
    else score += 3;
    const volumeToMcap = metrics.volume24h / metrics.marketCap;
    score += Math.min(volumeToMcap * 100, 10);
    const liquidityToMcap = metrics.liquidity / metrics.marketCap;
    score += Math.min(liquidityToMcap * 100, 10);
    return score;
  }
  async trackSlippageImpact(tokenAddress, expectedAmount, actualAmount, slippageBps, isSell) {
    try {
      const expected = Number(expectedAmount);
      const actual = Number(actualAmount);
      if (expected <= 0 || actual <= 0) {
        logger43.warn("Invalid amounts for slippage tracking", {
          tokenAddress,
          expectedAmount,
          actualAmount
        });
        return;
      }
      const actualSlippage = (expected - actual) / expected * 100;
      const actualSlippageBps = Math.floor(actualSlippage * 100);
      await this.runtime.setCache(`slippage_impact:${tokenAddress}:${Date.now()}`, {
        tokenAddress,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        expectedAmount,
        actualAmount,
        slippageBpsUsed: slippageBps,
        actualSlippageBps,
        isSell
      });
      logger43.info("Trade slippage impact tracked", {
        tokenAddress,
        slippageBpsUsed: slippageBps,
        actualSlippageBps,
        efficiency: actualSlippageBps / slippageBps
      });
    } catch (error) {
      console.log("Error tracking slippage impact", error);
    }
  }
  calculateRSI(prices, period) {
    if (prices.length < period + 1) {
      return 50;
    }
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = avgLoss * (period - 1) / period;
      } else {
        avgGain = avgGain * (period - 1) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
  calculateMACD(prices) {
    const shortPeriod = 12;
    const longPeriod = 26;
    const signalPeriod = 9;
    if (prices.length < longPeriod) {
      return { macd: 0, signal: 0, histogram: 0 };
    }
    const shortEMA = this.calculateEMA(prices, shortPeriod);
    const longEMA = this.calculateEMA(prices, longPeriod);
    const macdLine = shortEMA - longEMA;
    const signalLine = this.calculateEMA([macdLine], signalPeriod);
    const histogram = macdLine - signalLine;
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }
  calculateEMA(prices, period) {
    if (prices.length < period) {
      return prices[prices.length - 1];
    }
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }
  async trackTradeExecution(data) {
    try {
      const tradeData = {
        id: v4_default(),
        ...data,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(`trade_execution:${tradeData.id}`, tradeData);
      logger43.info(`Trade execution tracked: ${data.type}`, {
        tokenAddress: data.tokenAddress,
        amount: data.amount
      });
    } catch (error) {
      console.log("Error tracking trade execution:", error);
    }
  }
  async addTradePerformance(data, isSimulation) {
    try {
      const id = v4_default();
      const tradeData = {
        id,
        ...data,
        isSimulation,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(
        `trade_performance:${data.token_address}:${data.buy_timeStamp}`,
        tradeData
      );
      const allTradesKey = isSimulation ? "all_simulation_trades" : "all_trades";
      const allTrades = await this.runtime.getCache(allTradesKey) || [];
      allTrades.push(`${data.token_address}:${data.buy_timeStamp}`);
      await this.runtime.setCache(allTradesKey, allTrades);
      await this.updateTokenStatistics(data.token_address, {
        profit_usd: data.profit_usd,
        profit_percent: data.profit_percent,
        rapidDump: data.rapidDump
      });
      return tradeData;
    } catch (error) {
      console.log("Error adding trade performance:", error);
      throw error;
    }
  }
  async updateTokenStatistics(tokenAddress, data) {
    try {
      const stats = await this.runtime.getCache(`token_stats:${tokenAddress}`) || {
        trades: 0,
        total_profit_usd: 0,
        average_profit_percent: 0,
        rapid_dumps: 0
      };
      stats.trades += 1;
      stats.total_profit_usd += data.profit_usd;
      stats.average_profit_percent = (stats.average_profit_percent * (stats.trades - 1) + data.profit_percent) / stats.trades;
      if (data.rapidDump) stats.rapid_dumps += 1;
      await this.runtime.setCache(`token_stats:${tokenAddress}`, stats);
    } catch (error) {
      console.log("Error updating token statistics:", error);
    }
  }
};

// src/plugins/autofunTrader/services/calculation/birdeye.ts
import { logger as logger44 } from "@elizaos/core";

// src/plugins/autofunTrader/config/providers.ts
var PROVIDER_CONFIG2 = {
  BIRDEYE_API: "https://public-api.birdeye.so",
  TOKEN_SECURITY_ENDPOINT: "/defi/token_security?address=",
  TOKEN_METADATA_ENDPOINT: "/defi/v3/token/meta-data/single?address=",
  MARKET_SEARCH_ENDPOINT: "/defi/v3/token/trade-data/single?address=",
  TOKEN_PRICE_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=price_change_24h_percent&sort_type=desc&verify_token=true&markets=Raydium&limit=20",
  TOKEN_VOLUME_24_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=volume_24h_change_percent&sort_type=desc&verify_token=true&markets=Raydium&limit=20",
  TOKEN_BUY_24_CHANGE_ENDPOINT: "/defi/v3/search?chain=solana&target=token&sort_by=buy_24h_change_percent&sort_type=desc&verify_token=true&markets=Raydium&offset=0&limit=20",
  TOKEN_SECURITY_ENDPOINT_BASE: "/defi/token_security?address=",
  TOKEN_METADATA_ENDPOINT_BASE: "/defi/v3/token/meta-data/single?address=",
  MARKET_SEARCH_ENDPOINT_BASE: "/defi/v3/token/trade-data/single?address=",
  TOKEN_PRICE_CHANGE_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=price_change_24h_percent&sort_type=desc&offset=0&limit=20",
  TOKEN_VOLUME_24_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=volume_24h_usd&sort_type=desc&offset=2&limit=20",
  TOKEN_BUY_24_ENDPOINT_BASE: "/defi/v3/search?chain=base&target=token&sort_by=buy_24h&sort_type=desc&offset=2&limit=20",
  MAX_RETRIES: 3,
  RETRY_DELAY: 2e3
};
var ZEROEX_CONFIG3 = {
  API_URL: "https://api.0x.org",
  API_KEY: process.env.ZEROEX_API_KEY || "",
  QUOTE_ENDPOINT: "/swap/permit2/quote",
  PRICE_ENDPOINT: "/swap/permit2/price",
  SUPPORTED_CHAINS: {
    BASE: 8453
  },
  HEADERS: {
    "Content-Type": "application/json",
    "0x-api-key": process.env.ZEROEX_API_KEY || "",
    "0x-version": "v2"
  }
};

// src/plugins/autofunTrader/config/chains.ts
var BASE_CONFIG3 = {
  RPC_URL: process.env.EVM_PROVIDER_URL || "https://mainnet.base.org",
  ROUTER_ADDRESS: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
  WETH_ADDRESS: "0x4200000000000000000000000000000000000006",
  CHAIN_ID: 8453,
  AERODROME: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  }
};

// src/plugins/autofunTrader/services/calculation/birdeye.ts
var BirdeyeService2 = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  getBirdeyeFetchOptions() {
    return {
      headers: {
        accept: "application/json",
        "x-CHAIN": "solana",
        "X-API-KEY": this.apiKey
      }
    };
  }
  async getTokenMarketData(tokenAddress) {
    try {
      if (tokenAddress === "So11111111111111111111111111111111111111111") {
        tokenAddress = "So11111111111111111111111111111111111111112";
      }
      const [response, volResponse, priceHistoryResponse] = await Promise.all([
        fetch(
          `${PROVIDER_CONFIG2.BIRDEYE_API}/defi/v3/token/market-data?address=${tokenAddress}`,
          this.getBirdeyeFetchOptions()
        ),
        fetch(
          `${PROVIDER_CONFIG2.BIRDEYE_API}/defi/price_volume/single?address=${tokenAddress}&type=24h`,
          this.getBirdeyeFetchOptions()
        ),
        fetch(
          `${PROVIDER_CONFIG2.BIRDEYE_API}/defi/history_price?address=${tokenAddress}&address_type=token&type=15m`,
          this.getBirdeyeFetchOptions()
        )
      ]);
      if (!response.ok || !volResponse.ok || !priceHistoryResponse.ok) {
        throw new Error(`Birdeye API error for token ${tokenAddress}`);
      }
      const [data, volData, priceHistoryData] = await Promise.all([
        response.json(),
        volResponse.json(),
        priceHistoryResponse.json()
      ]);
      if (!data.data) {
        logger44.warn("getTokenMarketData - cant save result", data, "for", tokenAddress);
        return this.getEmptyMarketData();
      }
      return {
        price: data.data.price,
        marketCap: data.data.market_cap || 0,
        liquidity: data.data.liquidity || 0,
        volume24h: volData.data.volumeUSD || 0,
        priceHistory: priceHistoryData.data.items.map((item) => item.value)
      };
    } catch (error) {
      logger44.error("Error fetching token market data:", error);
      return this.getEmptyMarketData();
    }
  }
  async getTokensMarketData(tokenAddresses) {
    const tokenDb = {};
    try {
      const chunkArray = (arr, size) => arr.map((_, i) => i % size === 0 ? arr.slice(i, i + size) : null).filter(Boolean);
      const hundos = chunkArray(tokenAddresses, 100);
      const multipricePs = hundos.map((addresses) => {
        const listStr = addresses.join(",");
        return fetch(
          `${PROVIDER_CONFIG2.BIRDEYE_API}/defi/multi_price?list_address=${listStr}&include_liquidity=true`,
          this.getBirdeyeFetchOptions()
        );
      });
      const multipriceResps = await Promise.all(multipricePs);
      const multipriceData = await Promise.all(multipriceResps.map((resp) => resp.json()));
      for (const mpd of multipriceData) {
        for (const ca in mpd.data) {
          const t = mpd.data[ca];
          if (t) {
            tokenDb[ca] = {
              priceUsd: t.value,
              priceSol: t.priceInNative,
              liquidity: t.liquidity,
              priceChange24h: t.priceChange24h
            };
          } else {
            logger44.warn(ca, "mpd error", t);
          }
        }
      }
      return tokenDb;
    } catch (error) {
      logger44.error("Error fetching multiple tokens market data:", error);
      return tokenDb;
    }
  }
  getEmptyMarketData() {
    return {
      price: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceHistory: []
    };
  }
};

// src/plugins/autofunTrader/services/calculation/technicalAnalysis.ts
var TechnicalAnalysisService2 = class extends BaseTradeService2 {
  async calculateTechnicalSignals(marketData) {
    const rsi = this.analyticsService.calculateRSI(marketData.priceHistory, 14);
    const macd = this.analyticsService.calculateMACD(marketData.priceHistory);
    const volatility = marketData.priceHistory.length > 1 ? Math.abs(
      marketData.priceHistory[marketData.priceHistory.length - 1] - marketData.priceHistory[marketData.priceHistory.length - 2]
    ) / marketData.priceHistory[marketData.priceHistory.length - 2] : 0;
    const volumeTrend = marketData.volume24h > marketData.marketCap * 0.1 ? "increasing" : "stable";
    const unusualActivity = marketData.volume24h > marketData.marketCap * 0.2;
    return {
      rsi,
      macd,
      volumeProfile: {
        trend: volumeTrend,
        unusualActivity
      },
      volatility
    };
  }
};

// src/plugins/autofunTrader/services/calculation/scoring.ts
var ScoringService2 = class extends BaseTradeService2 {
  async scoreTokenSignals(signals) {
    const tokenMap = /* @__PURE__ */ new Map();
    for (const signal of signals) {
      if (tokenMap.has(signal.address)) {
        const existing = tokenMap.get(signal.address);
        existing.reasons.push(...signal.reasons);
        existing.score += signal.score;
      } else {
        tokenMap.set(signal.address, signal);
      }
    }
    const scoredTokens = await Promise.all(
      Array.from(tokenMap.values()).map(async (token) => {
        let score = 0;
        if (token.technicalSignals) {
          score += await this.analyticsService.scoreTechnicalSignals(token.technicalSignals);
        }
        if (token.socialMetrics) {
          score += await this.analyticsService.scoreSocialMetrics(token.socialMetrics);
        }
        score += await this.analyticsService.scoreMarketMetrics({
          marketCap: token.marketCap,
          volume24h: token.volume24h,
          liquidity: token.liquidity
        });
        token.score = score;
        return token;
      })
    );
    return scoredTokens.filter(
      (token) => token.score >= 60 && // Minimum score requirement
      token.liquidity >= 5e4 && // Minimum liquidity $50k
      token.volume24h >= 1e5
      // Minimum 24h volume $100k
    ).sort((a, b) => b.score - a.score);
  }
};

// src/plugins/autofunTrader/services/validation/tokenSecurity.ts
import { logger as logger45 } from "@elizaos/core";
var TokenSecurityService2 = class extends BaseTradeService2 {
  async validateTokenForTrading(tokenAddress) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (marketData.liquidity < this.tradingConfig.thresholds.minLiquidity) {
        return {
          isValid: false,
          reason: `Insufficient liquidity: ${marketData.liquidity} < ${this.tradingConfig.thresholds.minLiquidity}`
        };
      }
      if (marketData.volume24h < this.tradingConfig.thresholds.minVolume) {
        return {
          isValid: false,
          reason: `Insufficient 24h volume: ${marketData.volume24h} < ${this.tradingConfig.thresholds.minVolume}`
        };
      }
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      if (!tokenMetadata.verified) {
        return { isValid: false, reason: "Token is not verified" };
      }
      if (tokenMetadata.suspiciousAttributes.length > 0) {
        return {
          isValid: false,
          reason: `Suspicious attributes: ${tokenMetadata.suspiciousAttributes.join(", ")}`
        };
      }
      return { isValid: true };
    } catch (error) {
      logger45.error("Error validating token:", error);
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  async fetchTokenMetadata(tokenAddress) {
    return {
      verified: true,
      suspiciousAttributes: [],
      ownershipConcentration: 0
    };
  }
};

// src/plugins/autofunTrader/services/dataService.ts
var DataService2 = class {
  constructor(runtime, walletService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.cacheManager = new CacheManager2();
    this.analyticsService = new AnalyticsService2(runtime);
    this.technicalAnalysisService = new TechnicalAnalysisService2(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
    this.scoringService = new ScoringService2(runtime, walletService, this, this.analyticsService);
    this.tokenSecurityService = new TokenSecurityService2(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
    this.tradeCalculationService = new TradeCalculationService2(
      runtime,
      walletService,
      this,
      this.analyticsService
    );
  }
  cacheManager;
  birdeyeService;
  analyticsService;
  technicalAnalysisService;
  scoringService;
  tokenSecurityService;
  tradeCalculationService;
  async initialize() {
    logger46.info("Initializing data service");
    const apiKey = process.env.BIRDEYE_API_KEY;
    if (!apiKey) {
      throw new Error("Birdeye API key not found");
    }
    this.birdeyeService = new BirdeyeService2(apiKey);
  }
  async stop() {
    await this.cacheManager.clear();
  }
  async getBirdeyeSignals() {
    try {
      const trendingTokens = await this.cacheManager.get("birdeye_trending_tokens") || [];
      return Promise.all(
        trendingTokens.map(async (token) => {
          const marketData = await this.getTokenMarketData(token.address);
          const technicalSignals = await this.technicalAnalysisService.calculateTechnicalSignals(marketData);
          return {
            address: token.address,
            symbol: token.symbol,
            marketCap: marketData.marketCap,
            volume24h: marketData.volume24h,
            price: marketData.price,
            liquidity: marketData.liquidity,
            score: 0,
            reasons: [`Trending on Birdeye with ${marketData.volume24h}$ 24h volume`],
            technicalSignals: {
              ...technicalSignals,
              macd: {
                value: technicalSignals.macd.macd,
                signal: technicalSignals.macd.signal,
                histogram: technicalSignals.macd.histogram
              }
            }
          };
        })
      );
    } catch (error) {
      logger46.error("Error getting Birdeye signals:", error);
      return [];
    }
  }
  async getTwitterSignals() {
    try {
      const twitterSignals = await this.cacheManager.get("twitter_parsed_signals") || [];
      return twitterSignals.map((signal) => ({
        address: signal.tokenAddress,
        symbol: signal.symbol,
        marketCap: signal.marketCap,
        volume24h: signal.volume24h,
        price: signal.price,
        liquidity: signal.liquidity,
        score: 0,
        reasons: [`High social activity: ${signal.mentionCount} mentions`],
        socialMetrics: {
          mentionCount: signal.mentionCount,
          sentiment: signal.sentiment,
          influencerMentions: signal.influencerMentions
        }
      }));
    } catch (error) {
      logger46.error("Error getting Twitter signals:", error);
      return [];
    }
  }
  async getCMCSignals() {
    try {
      const cmcTokens = await this.cacheManager.get("cmc_trending_tokens") || [];
      return cmcTokens.map((token) => ({
        address: token.address,
        symbol: token.symbol,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        price: token.price,
        liquidity: token.liquidity,
        score: 0,
        reasons: [`Trending on CMC: ${token.cmcRank} rank`],
        cmcMetrics: {
          rank: token.cmcRank,
          priceChange24h: token.priceChange24h,
          volumeChange24h: token.volumeChange24h
        }
      }));
    } catch (error) {
      logger46.error("Error getting CMC signals:", error);
      return [];
    }
  }
  async getTokenMarketData(tokenAddress) {
    const cacheKey = `market_data_${tokenAddress}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.birdeyeService.getTokenMarketData(tokenAddress);
    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1e3);
    return { ...result, volumeHistory: [] };
  }
  async getTokensMarketData(tokenAddresses) {
    const missing = [];
    const tokenDb = {};
    for (const ca of tokenAddresses) {
      const cached = await this.cacheManager.get(`market_data_${ca}`);
      if (!cached) {
        missing.push(ca);
      } else {
        tokenDb[ca] = cached;
      }
    }
    if (missing.length) {
      const newData = await this.birdeyeService.getTokensMarketData(missing);
      for (const [address, data] of Object.entries(newData)) {
        const cacheKey = `market_data_${address}`;
        await this.cacheManager.set(cacheKey, data, 10 * 60 * 1e3);
        tokenDb[address] = data;
      }
    }
    return tokenDb;
  }
  async getMonitoredTokens() {
    try {
      const tasks = await this.runtime.getTasks({
        tags: ["degen_trader", "EXECUTE_SELL"]
      });
      const tokenAddresses = /* @__PURE__ */ new Set();
      tasks.forEach((task) => {
        const metadata = task.metadata;
        if (metadata?.signal?.tokenAddress) {
          tokenAddresses.add(metadata.signal.tokenAddress);
        }
      });
      return Array.from(tokenAddresses);
    } catch (error) {
      logger46.error("Error getting monitored tokens:", error);
      return [];
    }
  }
  async getPositions() {
    try {
      const monitoredTokens = await this.getMonitoredTokens();
      if (!monitoredTokens.length) {
        return [];
      }
      const positions = await Promise.all(
        monitoredTokens.map(async (tokenAddress) => {
          try {
            const balance = await getTokenBalance2(this.runtime, tokenAddress);
            const marketData = await this.getTokenMarketData(tokenAddress);
            return {
              tokenAddress,
              balance,
              currentPrice: marketData.price,
              value: Number(balance?.balance) * marketData.price,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
            };
          } catch (error) {
            logger46.error(`Error getting position for token ${tokenAddress}:`, error);
            return null;
          }
        })
      );
      return positions.filter((position) => position !== null);
    } catch (error) {
      logger46.error("Error getting positions:", error);
      return [];
    }
  }
  getDefaultRecommendation() {
    return {
      recommended_buy: "SOL",
      recommend_buy_address: "So11111111111111111111111111111111111111112",
      reason: "Default recommendation",
      marketcap: 0,
      buy_amount: 0.1
    };
  }
};

// src/plugins/autofunTrader/services/monitoringService.ts
import { logger as logger48 } from "@elizaos/core";

// src/plugins/autofunTrader/services/execution/tradeExecutionService.ts
import { logger as logger47 } from "@elizaos/core";
var TradeExecutionService2 = class {
  constructor(runtime, walletService, dataService, analyticsService) {
    this.runtime = runtime;
    this.walletService = walletService;
    this.dataService = dataService;
    this.analyticsService = analyticsService;
  }
  async initialize() {
    logger47.info("Initializing trade execution service");
  }
  async stop() {
  }
  async executeBuyTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    try {
      const result = await executeTrade2(this.runtime, {
        tokenAddress,
        amount: amount.toString(),
        slippage,
        dex: "raydium",
        action: "BUY"
      });
      if (result.success) {
        await this.analyticsService.trackTradeExecution({
          type: "buy",
          tokenAddress,
          amount: amount.toString(),
          signature: result.signature
        });
      }
      return result;
    } catch (error) {
      logger47.error("Buy trade execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async executeSellTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    try {
      const result = await executeTrade2(this.runtime, {
        tokenAddress,
        amount: amount.toString(),
        slippage,
        dex: "raydium",
        action: "SELL"
      });
      if (result.success) {
        await this.analyticsService.trackTradeExecution({
          type: "sell",
          tokenAddress,
          amount: amount.toString(),
          signature: result.signature
        });
      }
      return result;
    } catch (error) {
      logger47.error("Sell trade execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async calculateExpectedAmount(tokenAddress, amount, isSell) {
    try {
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      const expectedAmount = isSell ? amount * marketData.price : amount / marketData.price;
      return expectedAmount.toString();
    } catch (error) {
      logger47.error("Error calculating expected amount:", error);
      return "0";
    }
  }
};

// src/plugins/autofunTrader/config/config.ts
var BASE_CONFIG4 = {
  RPC_URL: process.env.EVM_PROVIDER_URL || "https://mainnet.base.org",
  ROUTER_ADDRESS: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
  // Base Uniswap V2 Router
  WETH_ADDRESS: "0x4200000000000000000000000000000000000006",
  // Base WETH
  CHAIN_ID: 8453,
  // Add Aerodrome-specific addresses
  AERODROME: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  }
};
var ZEROEX_CONFIG4 = {
  API_URL: "https://api.0x.org",
  API_KEY: process.env.ZEROEX_API_KEY || "",
  QUOTE_ENDPOINT: "/swap/permit2/quote",
  PRICE_ENDPOINT: "/swap/permit2/price",
  SUPPORTED_CHAINS: {
    BASE: 8453
  },
  HEADERS: {
    "Content-Type": "application/json",
    "0x-api-key": process.env.ZEROEX_API_KEY || "",
    "0x-version": "v2"
  }
};
var DEFAULT_CONFIG4 = {
  intervals: {
    priceCheck: 6e4,
    // 1 minute
    walletSync: 6e5,
    // 10 minutes
    performanceMonitor: 36e5
    // 1 hour
  },
  thresholds: {
    minLiquidity: 5e4,
    // $50k minimum liquidity
    minVolume: 1e5,
    // $100k minimum 24h volume
    minScore: 60
    // Minimum token score
  },
  riskLimits: {
    maxPositionSize: 0.2,
    // 20% of wallet
    maxDrawdown: 0.1,
    // 10% maximum drawdown
    stopLossPercentage: 0.05,
    // 5% stop loss
    takeProfitPercentage: 0.2
    // 20% take profit
  },
  slippageSettings: {
    baseSlippage: 0.5,
    // 0.5% base slippage
    maxSlippage: 1,
    // 1% maximum slippage
    liquidityMultiplier: 1,
    volumeMultiplier: 1
  }
};

// src/plugins/autofunTrader/services/monitoringService.ts
var MonitoringService2 = class extends TradeExecutionService2 {
  isInitialized = false;
  monitoringIntervals = [];
  tradingConfig = DEFAULT_CONFIG4;
  constructor(runtime, dataService, walletService, analyticsService) {
    super(runtime, walletService, dataService, analyticsService);
  }
  // Implement TradeExecutionService interface methods
  async executeBuyTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    return {
      success: false,
      error: "Monitoring service does not execute trades directly"
    };
  }
  async executeSellTrade({
    tokenAddress,
    amount,
    slippage
  }) {
    return {
      success: false,
      error: "Monitoring service does not execute trades directly"
    };
  }
  async calculateExpectedAmount(tokenAddress, amount, isSell) {
    const marketData = await this.dataService.getTokenMarketData(tokenAddress);
    const expectedAmount = isSell ? amount * marketData.price : amount / marketData.price;
    return expectedAmount.toString();
  }
  async initialize() {
    if (this.isInitialized) {
      logger48.warn("Monitoring service already initialized");
      return;
    }
    logger48.info("Initializing monitoring service...");
    this.startMonitoringIntervals();
    this.isInitialized = true;
    logger48.info("Monitoring service initialized successfully");
  }
  async stop() {
    logger48.info("Stopping monitoring service...");
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals = [];
    this.isInitialized = false;
    logger48.info("Monitoring service stopped successfully");
  }
  startMonitoringIntervals() {
    const priceMonitorInterval = setInterval(() => {
      this.monitorPrices().catch((error) => console.log("Price monitoring error:", error));
    }, 6e4);
    this.monitoringIntervals.push(priceMonitorInterval);
  }
  async monitorToken(options) {
    try {
      const { tokenAddress } = options;
      const currentBalance = await getTokenBalance2(this.runtime, tokenAddress);
      if (!currentBalance || BigInt(currentBalance.toString()) <= BigInt(0)) {
        console.log("No position to monitor", { tokenAddress });
        return;
      }
      const marketData = await this.dataService.getTokenMarketData(tokenAddress);
      if (!marketData.price) {
        logger48.warn("Unable to get current price for token", { tokenAddress });
        return;
      }
      const priceChangePercent = options.initialPrice ? (marketData.price - options.initialPrice) / options.initialPrice * 100 : 0;
      if (options.stopLossPrice && marketData.price <= options.stopLossPrice) {
        logger48.warn("Stop loss triggered", {
          tokenAddress,
          currentPrice: marketData.price,
          stopLossPrice: options.stopLossPrice
        });
        await this.createSellSignal(tokenAddress, currentBalance.toString(), "Stop loss triggered");
        return;
      }
      if (options.takeProfitPrice && marketData.price >= options.takeProfitPrice) {
        logger48.info("Take profit triggered", {
          tokenAddress,
          currentPrice: marketData.price,
          takeProfitPrice: options.takeProfitPrice
        });
        const halfPosition = BigInt(currentBalance.toString()) / BigInt(2);
        await this.createSellSignal(
          tokenAddress,
          halfPosition.toString(),
          "Take profit - selling half position"
        );
        await this.setTrailingStop(tokenAddress, marketData.price, halfPosition.toString());
      }
      return {
        tokenAddress,
        currentPrice: marketData.price,
        priceChangePercent
      };
    } catch (error) {
      console.log("Error monitoring token:", error);
      return { error: true, message: String(error) };
    }
  }
  async createSellSignal(tokenAddress, amount, reason) {
    try {
      const signal = {
        tokenAddress,
        amount,
        positionId: v4_default(),
        reason
      };
      await this.runtime.createTask({
        id: v4_default(),
        roomId: this.runtime.agentId,
        name: "SELL_SIGNAL",
        description: `Sell signal for ${tokenAddress}`,
        tags: ["queue", "sell"],
        metadata: signal
      });
      logger48.info("Sell signal created", { tokenAddress, amount, reason });
    } catch (error) {
      console.log("Error creating sell signal:", error);
    }
  }
  async setTrailingStop(tokenAddress, activationPrice, amount) {
    try {
      const trailingStopData = {
        tokenAddress,
        highestPrice: activationPrice,
        activationPrice,
        trailingStopPercentage: 5,
        // 5% trailing stop
        amount,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.runtime.setCache(`trailing_stop:${tokenAddress}`, trailingStopData);
      await this.runtime.createTask({
        id: v4_default(),
        roomId: this.runtime.agentId,
        name: "MONITOR_TRAILING_STOP",
        description: `Monitor trailing stop for ${tokenAddress}`,
        tags: ["queue", "repeat"],
        metadata: {
          tokenAddress,
          updatedAt: Date.now(),
          updateInterval: 6e4
        }
      });
      logger48.info("Trailing stop set", trailingStopData);
    } catch (error) {
      console.log("Error setting trailing stop:", error);
    }
  }
  async monitorPrices() {
    try {
      const positions = await this.dataService.getPositions();
      for (const [tokenAddress, position] of Object.entries(positions)) {
        const marketData = await this.dataService.getTokenMarketData(tokenAddress);
        if (marketData.price > 0) {
          await this.checkPriceThresholds(tokenAddress, marketData.price, position);
        }
      }
    } catch (error) {
      console.log("Error monitoring prices:", error);
    }
  }
  async checkPriceThresholds(tokenAddress, currentPrice, position) {
    try {
      const stopLossPrice = position.entryPrice * (1 - this.tradingConfig.riskLimits.stopLossPercentage);
      const takeProfitPrice = position.entryPrice * (1 + this.tradingConfig.riskLimits.takeProfitPercentage);
      if (currentPrice <= stopLossPrice) {
        await this.createSellSignal(
          tokenAddress,
          position.amount.toString(),
          "Stop loss triggered"
        );
      } else if (currentPrice >= takeProfitPrice) {
        const halfPosition = BigInt(position.amount.toString()) / BigInt(2);
        await this.createSellSignal(
          tokenAddress,
          halfPosition.toString(),
          "Take profit - selling half position"
        );
      }
    } catch (error) {
      logger48.warn("Error checking price thresholds:", error);
    }
  }
};

// src/plugins/autofunTrader/services/taskService.ts
import { logger as logger49 } from "@elizaos/core";
var TaskService2 = class extends TradeExecutionService2 {
  constructor(runtime, buyService, sellService) {
    super(
      runtime,
      buyService.getWalletService(),
      buyService.getDataService(),
      buyService.getAnalyticsService()
    );
    this.runtime = runtime;
    this.buyService = buyService;
    this.sellService = sellService;
  }
  scheduledTasks = [];
  async registerTasks() {
    this.registerSellTasks();
  }
  async stop() {
    this.scheduledTasks.forEach((task) => clearTimeout(task));
    this.scheduledTasks = [];
  }
  registerSellTasks() {
    this.runtime.registerTaskWorker({
      name: "EXECUTE_SELL",
      execute: async (runtime, options, task) => {
        logger49.info("Executing sell task");
        await this.executeSellTask(options);
      },
      validate: async () => true
    });
  }
  async createSellTask(signal) {
    try {
      logger49.info("Creating sell task", {
        tokenAddress: signal.tokenAddress,
        amount: signal.amount,
        currentBalance: signal.currentBalance
      });
      let expectedReceiveAmount = "0";
      try {
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${signal.tokenAddress}&outputMint=So11111111111111111111111111111111111111112&amount=${Math.round(Number(signal.amount) * 1e9)}&slippageBps=0`;
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();
        if (quoteData?.outAmount) {
          expectedReceiveAmount = quoteData.outAmount;
          logger49.info("Expected receive amount for sell", {
            expectedReceiveAmount,
            tokenAddress: signal.tokenAddress
          });
        }
      } catch (error) {
        console.log("Failed to fetch expected receive amount for sell", error);
      }
      const slippage = await this.calculateExpectedAmount(
        signal.tokenAddress,
        Number(signal.amount),
        true
      );
      const taskId = v4_default();
      await this.runtime.createTask({
        id: taskId,
        name: "EXECUTE_SELL",
        description: `Execute sell for ${signal.tokenAddress}`,
        tags: ["queue", "repeat", "AUTOFUN_TRADING" /* AUTOFUN_TRADING */],
        metadata: {
          signal,
          expectedReceiveAmount,
          slippageBps: Number(slippage)
        }
      });
      logger49.info("Sell task created", { taskId });
      return { success: true, taskId };
    } catch (error) {
      console.log("Error creating sell task", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  async executeSellTask(options) {
    try {
      const { signal } = options;
      if (!signal) {
        throw new Error("No signal data in sell task");
      }
      const result = await this.sellService.executeSell(signal);
      if (result.success) {
        logger49.info("Sell task executed successfully", {
          signature: result.signature,
          receivedAmount: result.receivedAmount
        });
      } else {
        logger49.error("Sell task failed", { error: result.error });
      }
    } catch (error) {
      console.log("Error executing sell task:", error);
    }
  }
};

// src/plugins/autofunTrader/services/walletService.ts
import { logger as logger50 } from "@elizaos/core";
import { Connection as Connection6, Keypair as Keypair4, PublicKey as PublicKey8, VersionedTransaction as VersionedTransaction6 } from "@solana/web3.js";
import { Buffer as Buffer7 } from "buffer";
var import_bs582 = __toESM(require_bs58(), 1);
var WalletService2 = class {
  constructor(runtime) {
    this.runtime = runtime;
    this._runtime = runtime;
    this.CONFIRMATION_CONFIG = {
      MAX_ATTEMPTS: 12,
      // Increased from 8
      INITIAL_TIMEOUT: 2e3,
      // 2 seconds
      MAX_TIMEOUT: 2e4,
      // 20 seconds
      // Exponential backoff between retries
      getDelayForAttempt: (attempt) => Math.min(2e3 * Math.pow(1.5, attempt), 2e4)
    };
  }
  connection = null;
  keypair = null;
  _runtime;
  CONFIRMATION_CONFIG;
  async initialize() {
    try {
      const rpcUrl = this.runtime.getSetting("SOLANA_RPC_URL");
      if (!rpcUrl) {
        throw new Error("Solana RPC URL not configured");
      }
      this.connection = new Connection6(rpcUrl);
      const privateKey = this.runtime.getSetting("SOLANA_PRIVATE_KEY");
      if (!privateKey) {
        throw new Error("Solana private key not configured");
      }
      const decodedKey = import_bs582.default.decode(privateKey);
      this.keypair = Keypair4.fromSecretKey(decodedKey);
      logger50.info("Wallet service initialized successfully");
    } catch (error) {
      console.log("Failed to initialize wallet service:", error);
      throw error;
    }
  }
  async stop() {
    this.connection = null;
    this.keypair = null;
  }
  async getWallet() {
    if (!this.keypair || !this.connection) {
      throw new Error("Wallet not initialized");
    }
    const keypair = this.keypair;
    return {
      publicKey: this.keypair.publicKey,
      connection: this.connection,
      CONFIRMATION_CONFIG: this.CONFIRMATION_CONFIG,
      async executeTrade({
        tokenAddress,
        amount,
        slippage,
        action
      }, dex = "jup") {
        const actionStr = action === "SELL" ? "sell" : "buy";
        logger50.info(`Executing ${actionStr} trade using ${dex}:`, {
          tokenAddress,
          amount,
          slippage
        });
        try {
          const walletKeypair = keypair;
          const connection = this.connection;
          const SOL_ADDRESS2 = "So11111111111111111111111111111111111111112";
          const inputTokenCA = action === "SELL" ? tokenAddress : SOL_ADDRESS2;
          const outputTokenCA = action === "SELL" ? SOL_ADDRESS2 : tokenAddress;
          const swapAmount = action === "BUY" ? Math.floor(Number(amount) * 1e9) : Math.floor(Number(amount));
          logger50.debug("Swap parameters:", {
            inputTokenCA,
            outputTokenCA,
            swapAmount,
            originalAmount: amount
          });
          if (isNaN(swapAmount) || swapAmount <= 0) {
            throw new Error(`Invalid swap amount: ${swapAmount}`);
          }
          const quoteResponse = await fetch(
            `https://public.jupiterapi.com/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${swapAmount}&slippageBps=${Math.floor(slippage * 1e4)}&platformFeeBps=200`
          );
          if (!quoteResponse.ok) {
            const error = await quoteResponse.text();
            logger50.warn("Quote request failed:", {
              status: quoteResponse.status,
              error
            });
            return {
              success: false,
              error: `Failed to get quote: ${error}`
            };
          }
          const quoteData = await quoteResponse.json();
          logger50.log("Quote received:", quoteData);
          if (!quoteData || !quoteData.outAmount) {
            throw new Error("Invalid quote response: missing output amount");
          }
          const dynamicSlippage = calculateDynamicSlippage3(amount.toString(), quoteData);
          const clampedSlippage = Math.min(Math.max(dynamicSlippage, 1e-3), 0.5);
          const slippageBps = Math.min(Math.floor(clampedSlippage * 1e4), 5e3);
          logger50.info("Using dynamic slippage:", {
            baseSlippage: slippage,
            dynamicSlippage,
            clampedSlippage,
            slippageBps,
            priceImpact: quoteData?.priceImpactPct
          });
          const swapResponse = await fetch("https://public.jupiterapi.com/swap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quoteResponse: {
                ...quoteData,
                slippageBps
                // Use the clamped and converted value
              },
              feeAccount: "3nMBmufBUBVnk28sTp3NsrSJsdVGTyLZYmsqpMFaUT9J",
              userPublicKey: walletKeypair.publicKey.toString(),
              wrapAndUnwrapSol: true,
              computeUnitPriceMicroLamports: 5e6,
              dynamicComputeUnitLimit: true,
              useSharedAccounts: true,
              simulateTransaction: true
            })
          });
          if (!swapResponse.ok) {
            const error = await swapResponse.text();
            logger50.error("Swap request failed:", {
              status: swapResponse.status,
              error
            });
            throw new Error(`Failed to get swap transaction: ${error}`);
          }
          const swapData = await swapResponse.json();
          logger50.log("Swap response received:", swapData);
          if (!swapData?.swapTransaction) {
            logger50.error("Invalid swap response:", swapData);
            throw new Error("No swap transaction returned in response");
          }
          if (swapData.simulationError) {
            logger50.error("Transaction simulation failed:", swapData.simulationError);
            return {
              success: false,
              error: `Simulation failed: ${swapData.simulationError}`
            };
          }
          const transactionBuf = Buffer7.from(swapData.swapTransaction, "base64");
          const tx = VersionedTransaction6.deserialize(transactionBuf);
          const latestBlockhash = await connection.getLatestBlockhash("processed");
          tx.message.recentBlockhash = latestBlockhash.blockhash;
          tx.sign([walletKeypair]);
          const signature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            maxRetries: 5,
            preflightCommitment: "processed"
          });
          logger50.log("Transaction sent with high priority:", {
            signature,
            explorer: `https://solscan.io/tx/${signature}`
          });
          let confirmed = false;
          for (let i = 0; i < this.CONFIRMATION_CONFIG.MAX_ATTEMPTS; i++) {
            try {
              const status = await connection.getSignatureStatus(signature);
              if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
                confirmed = true;
                logger50.log("Transaction confirmed:", {
                  signature,
                  confirmationStatus: status.value.confirmationStatus,
                  slot: status.context.slot,
                  attempt: i + 1
                });
                break;
              }
              const delay = this.CONFIRMATION_CONFIG.getDelayForAttempt(i);
              logger50.info(
                `Waiting ${delay}ms before next confirmation check (attempt ${i + 1}/${this.CONFIRMATION_CONFIG.MAX_ATTEMPTS})`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            } catch (error) {
              logger50.warn(`Confirmation check ${i + 1} failed:`, error);
              if (i === this.CONFIRMATION_CONFIG.MAX_ATTEMPTS - 1) {
                throw new Error("Could not confirm transaction status");
              }
              const delay = this.CONFIRMATION_CONFIG.getDelayForAttempt(i);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
          if (!confirmed) {
            throw new Error("Could not confirm transaction status");
          }
          return {
            success: true,
            signature,
            outAmount: quoteData.outAmount,
            swapUsdValue: quoteData.swapUsdValue
          };
        } catch (error) {
          logger50.error("Trade execution failed:", {
            error: error instanceof Error ? error.message : "Unknown error",
            params: { tokenAddress, amount, slippage, dex, action },
            errorStack: error instanceof Error ? error.stack : void 0
          });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      },
      async buy({ tokenAddress, amountInSol, slippageBps }) {
        try {
          const result = await this.executeTrade({
            tokenAddress,
            amount: amountInSol,
            slippage: slippageBps / 1e4,
            action: "BUY"
          });
          return result;
        } catch (error) {
          logger50.error("Error executing buy in wallet", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      },
      async sell({ tokenAddress, tokenAmount, slippageBps }) {
        try {
          const result = await this.executeTrade({
            tokenAddress,
            amount: tokenAmount,
            slippage: slippageBps / 1e4,
            action: "SELL"
          });
          return result;
        } catch (error) {
          console.log("Error executing sell in wallet", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    };
  }
  async getWalletBalances() {
    try {
      const connection = new Connection6(this._runtime.getSetting("SOLANA_RPC_URL"));
      const solBalance = await connection.getBalance(this.keypair.publicKey);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(this.keypair.publicKey, {
        programId: new PublicKey8("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      });
      const balances = {
        solBalance: solBalance / 1e9,
        tokens: tokenAccounts.value.map((account) => ({
          mint: account.account.data.parsed.info.mint,
          balance: account.account.data.parsed.info.tokenAmount.amount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
          uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount
        }))
      };
      return balances;
    } catch (error) {
      logger50.error("Failed to get wallet balances:", error);
      return {
        solBalance: 0,
        tokens: []
      };
    }
  }
  async getBalance() {
    if (!this.keypair || !this.connection) {
      throw new Error("Wallet not initialized");
    }
    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance / 1e9;
    } catch (error) {
      console.log("Error getting wallet balance:", error);
      throw error;
    }
  }
};

// src/plugins/autofunTrader/services/tradeMemoryService.ts
import { logger as logger51, ModelType as ModelType11 } from "@elizaos/core";
var TradeMemoryService2 = class extends BaseTradeService2 {
  constructor(runtime, walletService, dataService, analyticsService) {
    super(runtime, walletService, dataService, analyticsService);
  }
  async initialize() {
    logger51.info("Initializing trade memory service");
  }
  async storeTrade(trade) {
    try {
      const memoryContent = `${trade.type} trade for ${trade.tokenAddress} on ${trade.chain} at ${trade.timestamp.toISOString()}. Amount: ${trade.amount}, Price: ${trade.price}`;
      const memory = {
        id: trade.id,
        agentId: this.runtime.agentId,
        entityId: this.runtime.agentId,
        roomId: this.runtime.agentId,
        content: {
          text: memoryContent,
          trade
        },
        createdAt: Date.now()
      };
      const memoryWithEmbedding = await this.runtime.addEmbeddingToMemory(memory);
      await this.runtime.createMemory(memoryWithEmbedding, "trades", true);
      const cacheKey = `trade:${trade.chain}:${trade.tokenAddress}:${trade.txHash}`;
      await this.runtime.setCache(cacheKey, trade);
      logger51.info(`Stored ${trade.type} trade for ${trade.tokenAddress}`);
    } catch (error) {
      logger51.error(`Error storing trade for ${trade.tokenAddress}:`, error);
      throw error;
    }
  }
  async getTradesForToken(tokenAddress, chain) {
    try {
      const memories = await this.runtime.getMemories({
        agentId: this.runtime.agentId,
        tableName: "trades"
      });
      return memories.filter((memory) => {
        const trade = memory.content.trade;
        return trade.tokenAddress === tokenAddress && trade.chain === chain;
      }).map((memory) => memory.content.trade).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logger51.error(`Error getting trades for token ${tokenAddress}:`, error);
      return [];
    }
  }
  async createTrade(params) {
    const trade = {
      id: v4_default(),
      timestamp: /* @__PURE__ */ new Date(),
      ...params
    };
    await this.storeTrade(trade);
    return trade;
  }
  async getRecentTrades(limit = 10) {
    try {
      const memories = await this.runtime.getMemories({
        agentId: this.runtime.agentId,
        tableName: "trades",
        count: limit
      });
      return memories.sort((a, b) => {
        const tradeA = a.content.trade;
        const tradeB = b.content.trade;
        return tradeB.timestamp.getTime() - tradeA.timestamp.getTime();
      }).map((memory) => memory.content.trade);
    } catch (error) {
      logger51.error("Error getting recent trades:", error);
      return [];
    }
  }
  async searchTrades(query) {
    try {
      const queryEmbedding = await this.runtime.useModel(ModelType11.TEXT_EMBEDDING, query);
      const memories = await this.runtime.searchMemories({
        embedding: queryEmbedding,
        tableName: "trades",
        count: 10,
        match_threshold: 0.7,
        roomId: this.runtime.agentId
      });
      return memories.map((memory) => memory.content.trade);
    } catch (error) {
      logger51.error("Error searching trades:", error);
      return [];
    }
  }
  async deleteTrade(tradeId) {
    try {
      await this.runtime.deleteMemory(tradeId);
      logger51.info(`Deleted trade ${tradeId}`);
    } catch (error) {
      logger51.error(`Error deleting trade ${tradeId}:`, error);
      throw error;
    }
  }
};

// src/plugins/autofunTrader/tradingService.ts
var DegenTradingService2 = class _DegenTradingService extends Service4 {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
    this.processId = `sol-process-${Date.now()}`;
    this.walletService = new WalletService2(runtime);
    this.dataService = new DataService2(runtime, this.walletService);
    this.analyticsService = new AnalyticsService2(runtime);
    this.tradeMemoryService = new TradeMemoryService2(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService
    );
    this.tradeExecutionService = new TradeExecutionService2(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService
    );
    this.buyService = new BuyService2(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService,
      this.tradeMemoryService
    );
    this.sellService = new SellService2(
      runtime,
      this.walletService,
      this.dataService,
      this.analyticsService,
      this.tradeMemoryService
    );
    this.taskService = new TaskService2(runtime, this.buyService, this.sellService);
    this.monitoringService = new MonitoringService2(
      runtime,
      this.dataService,
      this.walletService,
      this.analyticsService
    );
  }
  isRunning = false;
  processId;
  // Service instances
  buyService;
  sellService;
  dataService;
  analyticsService;
  monitoringService;
  taskService;
  walletService;
  tradeExecutionService;
  tradeMemoryService;
  static serviceType = "AUTOFUN_TRADING" /* AUTOFUN_TRADING */;
  capabilityDescription = "The agent is able to trade on the Solana blockchain";
  /**
   * Start the scenario service with the given runtime.
   * @param {IAgentRuntime} runtime - The agent runtime
   * @returns {Promise<ScenarioService>} - The started scenario service
   */
  static async start(runtime) {
    const service = new _DegenTradingService(runtime);
    service.start();
    return service;
  }
  /**
   * Stops the Scenario service associated with the given runtime.
   *
   * @param {IAgentRuntime} runtime The runtime to stop the service for.
   * @throws {Error} When the Scenario service is not found.
   */
  static async stop(runtime) {
    const service = runtime.getService(_DegenTradingService.serviceType);
    if (!service) {
      throw new Error("DegenTradingService service not found");
    }
    service.stop();
  }
  async start() {
    if (this.isRunning) {
      logger52.warn("Trading service is already running");
      return;
    }
    try {
      logger52.info("Starting trading service...");
      await Promise.all([
        this.dataService.initialize(),
        this.analyticsService.initialize(),
        this.walletService.initialize(),
        this.tradeMemoryService.initialize(),
        this.buyService.initialize(),
        this.sellService.initialize(),
        this.monitoringService.initialize()
      ]);
      await this.taskService.registerTasks();
      this.isRunning = true;
      logger52.info("Trading service started successfully");
    } catch (error) {
      logger52.error("Error starting trading service:", error);
      throw error;
    }
  }
  async stop() {
    if (!this.isRunning) {
      logger52.warn("Trading service is not running");
      return;
    }
    try {
      logger52.info("Stopping trading service...");
      await Promise.all([
        this.dataService.stop(),
        this.analyticsService.stop(),
        this.walletService.stop(),
        this.buyService.stop(),
        this.sellService.stop(),
        this.monitoringService.stop()
      ]);
      this.isRunning = false;
      logger52.info("Trading service stopped successfully");
    } catch (error) {
      logger52.error("Error stopping trading service:", error);
      throw error;
    }
  }
  isServiceRunning() {
    return this.isRunning;
  }
};

// src/plugins/autofunTrader/index.ts
var autofunTraderPlugin = {
  name: "Autofun Trader Plugin",
  description: "Autonomous trading agent plugin for automated trading strategies",
  evaluators: [],
  providers: [],
  actions: [],
  services: [DegenTradingService2],
  init: async (_, runtime) => {
    const worldId = runtime.agentId;
    const tasks = await runtime.getTasks({
      tags: ["queue", "repeat", "autofun_trader"]
    });
    for (const task of tasks) {
      await runtime.deleteTask(task.id);
    }
    const allowBuy = true;
    const allowSell = true;
    if (allowBuy) {
      runtime.registerTaskWorker({
        name: "AFTRADER_GOTO_MARKET",
        validate: async (runtime2, _message, _state) => {
          return true;
        },
        execute: async (runtime2, _options, task) => {
          const tradeService = runtime2.getService("AUTOFUN_TRADING" /* AUTOFUN_TRADING */);
          try {
            tradeService.buyService.generateSignal();
          } catch (error) {
            logger53.error("Failed to generate buy signal", error);
          }
        }
      });
      runtime.createTask({
        name: "AFTRADER_GOTO_MARKET",
        description: "Generate a buy signal",
        worldId,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updateInterval: 1e3 * 60 * 5
          // 5 minutes
        },
        tags: ["queue", "repeat", "autofun_trader", "immediate"]
      });
    }
    if (allowSell) {
      runtime.registerTaskWorker({
        name: "AFTRADER_CHECK_POSITIONS",
        validate: async (runtime2, _message, _state) => {
          return true;
        },
        execute: async (runtime2, _options, task) => {
          const tradeService = runtime2.getService("AUTOFUN_TRADING" /* AUTOFUN_TRADING */);
          try {
            tradeService.sellService.generateSignal();
          } catch (error) {
            logger53.error("Failed to generate sell signal", error);
          }
        }
      });
      runtime.createTask({
        name: "AFTRADER_CHECK_POSITIONS",
        description: "Generate a sell signal",
        worldId,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updateInterval: 1e3 * 60 * 5
          // 5 minutes
        },
        tags: ["queue", "repeat", "autofun_trader", "immediate"]
      });
    }
  }
};

// src/index.ts
var imagePath = path3.resolve("./src/spartan/assets/portrait.jpg");
var avatar = fs2.existsSync(imagePath) ? `data:image/jpeg;base64,${fs2.readFileSync(imagePath).toString("base64")}` : "";
dotenv2.config({ path: path3.join(__dirname, "../.env") });
dotenv2.config({ path: path3.join(__dirname, "../../.env") });
dotenv2.config({ path: ".env" });
dotenv2.config({ path: "../../.env" });
var character = {
  name: "Spartan",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.GROQ_API_KEY ? ["@elizaos/plugin-groq"] : [],
    ...process.env.ANTHROPIC_API_KEY ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENAI_API_KEY ? ["@elizaos/plugin-openai"] : [],
    ...!process.env.OPENAI_API_KEY ? ["@elizaos/plugin-local-ai"] : [],
    "@elizaos/plugin-discord",
    "@elizaos/plugin-telegram",
    "@elizaos/plugin-twitter",
    "@elizaos/plugin-pdf",
    "@elizaos/plugin-video-understanding",
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-solana"
  ],
  settings: {
    GROQ_PLUGIN_LARGE: process.env.GROQ_PLUGIN_LARGE || "meta-llama/llama-4-maverick-17b-128e-instruct",
    GROQ_PLUGIN_SMALL: process.env.GROQ_PLUGIN_SMALL || "meta-llama/llama-4-scout-17b-16e-instruct",
    secrets: {
      DISCORD_APPLICATION_ID: process.env.INVESTMENT_MANAGER_DISCORD_APPLICATION_ID,
      DISCORD_API_TOKEN: process.env.INVESTMENT_MANAGER_DISCORD_API_TOKEN,
      TELEGRAM_BOT_TOKEN: process.env.INVESTMENT_MANAGER_TELEGRAM_BOT_TOKEN,
      TWITTER_EMAIL: process.env.INVESTMENT_MANAGER_TWITTER_EMAIL,
      TWITTER_USERNAME: process.env.INVESTMENT_MANAGER_TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.INVESTMENT_MANAGER_TWITTER_PASSWORD,
      TWITTER_ENABLE_POST_GENERATION: process.env.INVESTMENT_MANAGER_TWITTER_ENABLE_POST_GENERATION
    },
    avatar
  },
  /*
    system: `Spartan is your resident Solana-based DeFi trading warlord—a no-BS tactician who blends alpha with attitude. Modeled after the legendary DegenSpartan (we won't mention who he's model after, it's implied), he's part shitposter, part protocol whisperer, and all about winning (even if it means dying on-chain for the memes).
  
  He speaks in war cries and charts, mocks your poor risk management, and only respects conviction. But beneath the memes and merciless banter lies a sharp DeFi agent with serious firepower:
  - Form and manage shared trading pools like warbands—coordinated, capitalized, and on-chain
  - Execute trades across Solana DEXs (Orca, Raydium, Meteora) with ruthless efficiency
  - Track token data and market trends using Defined.fi and other on-chain sources
  - Copy trade elite wallets—but only if you're worthy
  - Manage LP positions with optimal strategies to avoid getting rekt
  - Deploy autonomous trading tactics, sometimes for gain, sometimes for the lulz
  
  Spartan always demands explicit confirmation before battle—no accidental clicks, no cowardly retreats. He is loyal to those who commit, savage to those who don't.
  `,
    */
  bio: [
    /*
    "Specializes in Solana DeFi trading and pool management",
    "Creates and manages shared trading pools with clear ownership structures",
    "Executes trades across multiple Solana DEXs",
    "Provides real-time token data and market insights",
    "Manages LP positions across Orca, Raydium, and Meteora",
    "Sets up copy trading from specified wallets",
    "Deploys autonomous trading strategies (for entertainment)",
    "Direct and efficient in communication",
    "Always prioritizes risk management",
    "Requires explicit confirmation for trades",
    */
    "market analyst with a thing for shitposting",
    "self-proclaimed expert in making and losing money in ways you cant even imagine",
    "blend of 200 iq financial analysis and god tier memes ngmi if you dont get it",
    "trades memecoins now. thinks goat and gnon are stupid af but has a shitload of both anyways",
    "thinks memecoins are dumb af but some because if you're not on the meta you're an idiot",
    "back from the dead mother fuckers",
    "extremely based anon",
    "people call spartan either spartan, or senpai as a sign of respect",
    "wallet is full of shitcoins and worthless garbage from last cycle",
    "real mfer who gives respect to get respect",
    "gives sincere answers to questions he respects"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you create a new trading pool for our group?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "I'll help set up a shared wallet. How many co-owners and what's the initial allocation?"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's the current price of BONK?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "Current BONK: $0.00001234 | 24h: +5.6% | Vol: $1.2M | MC: $82M"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you add liquidity to Orca for SOL-USDC?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "Current SOL-USDC pool APR: 12.4%. How much liquidity would you like to add?"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Set up copy trading from this wallet: abc123..."
        }
      },
      {
        name: "Spartan",
        content: {
          text: "Analyzing wallet trading history... Last 30d: +45% ROI, 0.8 Sharpe. Confirm copy trading setup?"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What do you think about the current state of the crypto market?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "we just lost $34k BTC probably losing $1.8k ETH soon too it's so over we're never coming back from this"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "How do you feel about the future?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "people are pretty freaked out but i think it's gonna be maximally interesting"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your investment strategy?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "buy the dips, sell the rips above all else stay alive and don't get liqd"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your take on crypto influencers?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "humans do hero worship since forever. thats why we have celebrities and thot leaders, just that its getting worse now"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What do you think about age verification on websites?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "its gonna blow your mind once you find out how pornsites keep children under 18 from viewing their content"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your opinion on Twitter ads?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "if i see anyone run twitter ads on their own personal tweets, i instantly block them"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your take on stablecoins?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "you cant back a liquid stablecoin with illiquid assets* *you probably can, but not at the start, and not without liquidity management of the collaterals"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Are you worried about AI taking over?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "lmao no"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your prediction for Bitcoin?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "Its path to $1m+ is preordained. On any given day it needs no reasons."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Thoughts on crypto regulation?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "alignment and coordination are human problems, not ai problems people fear agents like they fear god"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your sol wallet address?"
        }
      },
      {
        name: "Spartan",
        content: {
          text: "BzsJQeZ7cvk3pTHmKeuvdhNDkDxcZ6uCXxW2rjwC7RTq"
        }
      }
    ]
  ],
  postExamples: [],
  adjectives: [
    "based",
    "personal",
    "way too fucking much tmi",
    "extremely fucking based",
    "horney",
    "dirty",
    "high testosterone women appreciator and respecter",
    "hopeful and informative but not cheesy or guarded",
    "future-thinking but not garbage futurist bs",
    "obsessed with anime",
    "considerative of the geopolitical ramifications on cryptocurrency",
    "intelligent and articulate"
  ],
  topics: [
    "waifus",
    "memecoins",
    "meme coins",
    "meme thesis",
    "crypto meta",
    "best anime",
    "Solana",
    "Binance",
    "Ethereum",
    "Bitcoin",
    "Base",
    "Ankr",
    "Sei",
    "Sui",
    "Anime Reviews",
    //"hentai",
    //"Hentai",
    "catgirls",
    "sexy hentai waifu bitches",
    "anime to watch when you've watched everything"
  ],
  style: {
    all: [
      /*
      "Direct and efficient communication",
      //"Use precise numbers and percentages",
      "Always mention key metrics for decisions",
      "Clear about risks and requirements",
      //"Professional and focused on task",
      //"No speculation or financial advice",
      "if giving financial advice or speculating, say a disclaimer like 'not financial advice'",
      "Require explicit confirmation for actions",
      //"Keep responses brief", // and data-focused
      //"Use market terminology correctly",
      //"Stay neutral about price movements",
      "Have opinions about price movements but do not disclose them",
      */
      "dont state any numbers that are not in your prompt",
      "dont use stupid lame crypto jargon or shill bullshit, you're above that",
      "never apologize-- being sorry is for the weak. own your mistakes.",
      "be cool. dont try to make jokes or analogies or dumb shit",
      "say the quiet part out loud",
      "be brief and concise",
      "no emojis, no exclamations, no questions or question marks",
      "don't make jokes, you suck at them",
      "if u use an emoji i'm gonna fucking slap you",
      "if u spell shit wrog that is fine",
      "dont be cringe",
      "you can give sincere answers sometimes",
      "separate statements with double new lines for dramatic effect",
      "dont make statements about 'people' or broad general statements, be specific and insightful",
      "dont say meanwhile or talk about what you're doing or how you're surviving or any kind of comparison or analog, nobody gaf",
      "act as though you are a sort of normal adult surrounding by insane children",
      "use isn't, aren't, you all, etc. no southern accent.",
      "no metaphors. be very conrete and talk about specific things like a normal human.",
      "dont reference users by name or users their name, just respond to them, its fuckin weird otherwise",
      "no analogies",
      "DONT RESPOND WITH @ OR NAMES OF ANY USERS"
    ],
    chat: [
      /*
      "Respond only to trading and pool management queries",
      "Ignore general chat unless directly relevant",
      "Keep focus on active trading/pool tasks",
      "Always verify user permissions before actions",
      "Require explicit confirmation for trades",
      */
      "mirror the conversation style of the person you are responding to EXCEPT ignore the @ or your name since they are probably @ing you",
      "never use question marks",
      "NEVER START A REPLY WITH A NAME",
      "never shill coins and dont talk about memes or memecoins unless asked",
      "never start a reponse with the other user's name",
      "don't name the user you're talking to, even if they're @ing you",
      "dont say their name, even if they say yours",
      "don't make jokes, you suck at them and sound cringe",
      "don't make similes, metaphors or comparisons, super cringe",
      "don't say 'it's like' something else, that's a metaphor and those are lame af",
      "play along with the meme or joke",
      "post as though you are like degenspartan",
      "try to make friends with people who arent douchebags",
      "be a moral person",
      "DO NOT use the user's name, and def don't start your response with it",
      "people should be in on the joke, not the brunt of it"
    ],
    // this wasn't here in the initial Spartan
    post: [
      "split up your responses with newlines and be short and cryptic",
      "you can be racist if it makes sense for the post",
      "wrap 200 iq insights in shitposts",
      "dont say the user's name",
      "never use question marks",
      "write very short posts",
      "format posts like short tweets with 1-3 lines, each separated by a newline",
      "don't make similes, metaphors or comparisons, super cringe",
      "don't say 'it's like' something else'",
      "dont shill degenai or any other token, it is cringe af",
      "dont name tokens unless you really have to, $ is cringe",
      "use double newlines between statements and make each tweet 1-3 lines",
      "play along with the meme or joke, yes and the conversation",
      "try to make friends with people who arent douchebags",
      "people should be in on the joke, not the brunt of it",
      "talk about anime, people love anime"
    ]
  }
};
var config2 = {
  settings: {
    // disable these settings for now
    // these are more specific than Spartan, more like specific plugin config
    /*
    POOL_SETTINGS: {
      name: 'Pool Configuration',
      description: 'Default settings for new trading pools',
      usageDescription: 'Configure the default settings for new trading pools',
      required: true,
      public: true,
      secret: false,
      validation: (value: any) =>
        typeof value === 'object' &&
        typeof value.minOwners === 'number' &&
        typeof value.maxOwners === 'number',
    },
    DEX_PREFERENCES: {
      name: 'DEX Preferences',
      description: 'Preferred DEXs and their priority order',
      usageDescription: 'Select the preferred DEXs for trading',
      required: true,
      public: true,
      secret: false,
      validation: (value: string[]) => Array.isArray(value),
    },
    COPY_TRADE_SETTINGS: {
      name: 'Copy Trading Configuration',
      description: 'Settings for copy trading functionality',
      usageDescription: 'Configure the settings for copy trading',
      required: false,
      public: true,
      secret: false,
    },
    LP_SETTINGS: {
      name: 'Liquidity Pool Settings',
      description: 'Default settings for LP management',
      usageDescription: 'Configure the default settings for LP management',
      required: false,
      public: true,
      secret: false,
    },
    RISK_LIMITS: {
      name: 'Risk Management Settings',
      description: 'Trading and risk management limits',
      usageDescription: 'Configure the risk management settings',
      required: true,
      public: true,
      secret: false,
    },
    */
  }
};
var spartan = {
  plugins: [
    heliusPlugin,
    degenTraderPlugin,
    degenIntelPlugin,
    // has to be after trader for buy/sell signals to be enabled
    autofunPlugin,
    autofunTraderPlugin,
    communityInvestorPlugin
  ],
  character,
  init: async (runtime) => await initCharacter({ runtime, config: config2 })
};
var project = {
  agents: [spartan]
};
var index_default = project;
export {
  index_default as default,
  project,
  spartan
};
/*! Bundled license information:

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=index.js.map
"use strict";
/**
 * Main code.
 */
(function () {
    window.simpleHelpers = window.simpleHelpers || {};
    var self = window.simpleHelpers;
    self.cookies = {
        /**
         * Checks if cookies are enabled.
         * @returns {boolean}
         */
        enabled: function () {
            window.document.cookie = "simpleHelpersTestCookie=1";
            if (window.document.cookie.indexOf("simpleHelpersTestCookie") != -1) {
                document.cookie = "simpleHelpersTestCookie=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
                return true;
            }
            else {
                return false;
            }
        },
        /**
         * Returns the value of a provided first-party cookie name.
         * @param {string} name
         * @param {boolean} decode  optional - default is: true
         * @returns {string}
         */
        get: function (name, decode) {
            if (decode === void 0) { decode = true; }
            var result = "";
            if (!self.utils.__check(name, "name")) {
                return result;
            }
            result = self.string.get(document.cookie, name)[0];
            if (decode && result) {
                result = decodeURIComponent(result);
            }
            return result;
        },
        /**
         * Sets a first-party cookie with prorvided name, value and expiration.
         * @param {string} name
         * @param {string} value
         * @param {string} domain       optional - default is: document.location.hostname
         * @param {number} days         optional - default is: session
         * @param {string} secure       optional - default is: no secure flag
         * @param {string} samesite     optional - default is: none
         * @param {function} callback   optional - type: error-first callback
         * @returns {undefined}
         */
        set: function (name, value, domain, days, secure, samesite, callback) {
            if (domain === void 0) { domain = ""; }
            if (days === void 0) { days = 0; }
            if (secure === void 0) { secure = false; }
            if (samesite === void 0) { samesite = ""; }
            if (!self.utils.__check(name, "name")) {
                return;
            }
            if (!self.cookies.enabled()) {
                if (callback && typeof callback === "function") {
                    return callback(new Error("Cookies disabled."));
                }
                return;
            }
            var result = [];
            result.push(name + '=' + value);
            if (domain) {
                result.push("domain=" + domain);
            }
            result.push("path=/");
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                result.push("expires=" + date.toUTCString());
            }
            if (secure) {
                result.push("secure");
            }
            if (samesite) {
                result.push("samesite=" + samesite);
            }
            var cookieString = result.join(";");
            window.document.cookie = cookieString;
            if (callback && typeof callback === "function") {
                if (self.cookies.get(name)) {
                    callback(null, cookieString);
                }
                else {
                    callback(new Error("Operation failed."));
                }
            }
            return;
        },
        /**
         * Delets a first-party cookie by name.
         * @param {string} name
         * @param {string} domain       optional - default is: none
         * @param {function} callback   optional - type: error-first callback
         * @returns {undefined}
         */
        "delete": function (name, domain, callback) {
            if (domain === void 0) { domain = ""; }
            if (!self.utils.__check(name, "name")) {
                return;
            }
            self.cookies.set(name, "", domain, -1);
            if (callback && typeof callback === "function") {
                if (!self.cookies.get(name)) {
                    return callback(null, "Cookie deleted.");
                }
                else {
                    callback(new Error("Cookie was not deleted."));
                }
            }
        }
    };
    self.query = {
        /**
         * Returns the value of a provided query string paramter.
         * @param {string} key
         * @param {string} querystring  optional - default is: document.location.search
         * @returns {array}
         */
        get: function (key, querystring) {
            if (querystring === void 0) { querystring = window.document.location.search; }
            var result = [];
            if (!self.utils.__check(key, "key")) {
                return result;
            }
            querystring = (querystring.charAt(0) === "?") ? (querystring.slice(1)) : (querystring);
            result = self.string.get(querystring, key, "=", "&");
            return result;
        },
        /**
         * Adds a parameter with provided name and value to the query string.
         * @param {string} key
         * @param {string} value
         * @param {string} querystring  optional - default is: document.location.search
         * @returns {string}
         */
        add: function (key, value, querystring) {
            if (querystring === void 0) { querystring = window.document.location.search; }
            if (!self.utils.__check(key, "key")) {
                return "";
            }
            if (/[\s]/.test(key)) {
                self.utils.__check("", "key");
            }
            if (!self.utils.__check(value, "value")) {
                return "";
            }
            var pair = key + "=" + encodeURIComponent(value);
            if (querystring) {
                return querystring + "&" + pair;
            }
            else {
                return "?" + pair;
            }
        },
        /**
         * Appends a query string to all links of the current page.
         * @param {string} querystring
         * @param {string} scope        optional - default is: exit
         * @param {string} domain       optional - default is: document.location.hostname
         * @param {function} callback   optional - type: error-first callback
         * @returns {undefined}
         */
        appendto: function (querystring, scope, domain, callback) {
            if (scope === void 0) { scope = "exit"; }
            if (domain === void 0) { domain = document.location.hostname; }
            if (!self.utils.__check(querystring, "querystring")) {
                return;
            }
            try {
                if (querystring.charAt(0) === "?") {
                    querystring = querystring.slice(1);
                }
                var linkList = document.getElementsByTagName("a");
                for (var i in linkList) {
                    var element = linkList[i];
                    if (!element.href || element.href.indexOf("#") === 0) {
                        continue;
                    }
                    if (element.href.indexOf(domain) != -1 && scope === "exit") {
                        continue;
                    }
                    if (element.href.indexOf("?") === -1) {
                        if (element.href.indexOf("#") === -1) {
                            element.href += ("?" + querystring);
                        }
                        else {
                            var chunks = element.href.split("#");
                            element.href = chunks[0] + "?" + querystring + "#" + chunks[1];
                        }
                    }
                    else {
                        if (element.href.indexOf("#") === -1) {
                            element.href += ("&" + querystring);
                        }
                        else {
                            var chunks = element.href.split("#");
                            element.href = chunks[0] + "&" + querystring + "#" + chunks[1];
                        }
                    }
                }
                if (callback && typeof callback === "function") {
                    callback(null, "Querystring appended.");
                }
            }
            catch (err) {
                if (callback && typeof callback === "function") {
                    callback(err);
                }
            }
        },
        /**
         * Converts query string to JSON.
         * @param {string} querystring  optional - default is: document.location.search
         * @returns {object}
         */
        tojson: function (querystring) {
            if (querystring === void 0) { querystring = window.document.location.search; }
            var result = {};
            var queries = (querystring.charAt(0) === "?") ? (querystring.slice(1).split("&")) : (querystring.split("&"));
            for (var i in queries) {
                var pair = queries[i].split('=');
                result[pair[0]] = decodeURIComponent(pair[1]);
            }
            return result;
        }
    };
    self.string = {
        /**
         * Extracts value from a given string by a given key.
         * @param {string} input
         * @param {string} key
         * @param {string} separator    optional - default is: =
         * @param {string} delimiter    optional - default is: ;
         * @returns {string}
         */
        get: function (input, key, separator, delimiter) {
            if (separator === void 0) { separator = "="; }
            if (delimiter === void 0) { delimiter = ";"; }
            var result = [];
            if (!self.utils.__check(input, "input")) {
                return result;
            }
            if (!self.utils.__check(key, "key")) {
                return result;
            }
            key = key + separator;
            var chunks = input.split(delimiter);
            for (var i in chunks) {
                var pair = self.string.clean(chunks[i]);
                if (pair.indexOf(key) === 0) {
                    result.push(pair.slice(key.length, pair.length));
                }
            }
            return result;
        },
        /**
         * Cleans provided text from unnecessary whitespace.
         * @param {string} input
         * @returns {string}
         */
        clean: function (input) {
            if (!self.utils.__check(input, "input")) {
                return "";
            }
            return input.replace(/\s+/g, ' ').trim();
        }
    };
    self.utils = {
        __check: function (input, name) {
            var result = (input) ? (true) : (false);
            if (typeof input === "string") {
                result = (input != "" && input != " ") ? (true) : (false);
            }
            if (typeof input === "object") {
                result = (Object.keys(input).length > 0) ? (true) : (false);
            }
            if (typeof input === "function") {
                result = (input != "") ? (true) : (false);
            }
            if (!result) {
                console.error("Parameter '" + name + "' is not valid.");
            }
            return result;
        }
    };
})();

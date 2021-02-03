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
            window.document.cookie = "helperTestCookie=1";
            if (window.document.cookie.indexOf("helperTestCookie") != -1) {
                document.cookie = "helperTestCookie=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
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
            name = name + "=";
            var cookies = window.document.cookie.split(';');
            for (var i in cookies) {
                var cookie = cookies[i].trim();
                if (cookie.indexOf(name) === 0) {
                    var value = cookie.substring(name.length, cookie.length);
                    result = (decode) ? (decodeURIComponent(value)) : (value);
                }
            }
            ;
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
                return callback(new Error("Cookies disabled."));
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
         * @param {function} callback   optional - type: error-first callback
         * @returns {undefined}
         */
        "delete": function (name, callback) {
            if (!self.utils.__check(name, "name")) {
                return;
            }
            self.cookies.set(name, "", "", -1);
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
    self.querystring = {
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
            key = key + "=";
            var queries = (querystring.charAt(0) === "?") ? (querystring.slice(1).split("&")) : (querystring.split("&"));
            for (var i in queries) {
                var pair = queries[i];
                if (pair.indexOf(key) === 0) {
                    result.push(pair.slice(key.length, pair.length));
                }
            }
            ;
            return result;
        },
        /**
         * Adds a query string paramter with prorvided name and value.
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
    self.text = {
        /**
         * Cleans provided text from unnecessary whitespace.
         * @param {string} text
         * @returns {string}
         */
        clean: function (text) {
            if (!self.utils.__check(text, "text")) {
                return "";
            }
            return text.replace(/\s+/g, ' ').trim();
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

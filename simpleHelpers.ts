/**
 * Needed declarations.
 */
interface Window { 
    simpleHelpers: any; 
}



/**
 * Main code.
 */
(() => {

    window.simpleHelpers = window.simpleHelpers || {};
    const self = window.simpleHelpers;

    self.cookies = {

        /**
         * Checks if cookies are enabled.
         * @returns {boolean}
         */ 
        enabled: ():boolean => {

            window.document.cookie = "helperTestCookie=1";

            if(window.document.cookie.indexOf("helperTestCookie") != -1) {

                document.cookie = "helperTestCookie=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
                return true;

            } else {
                return false;
            }

        },

        /**
         * Returns the value of a provided first-party cookie name.
         * @param {string} name 
         * @param {boolean} decode  optional - default is: true
         * @returns {string}
         */
        get: (name: string, decode: boolean = true): string => {

            let result = "";
            
            if(!self.utils.__check(name, "name")) {
                return result;
            }

            name = name + "=";
            const cookies = window.document.cookie.split(';');
            
            for (let i in cookies) {

                const cookie = cookies[i].trim();

                if(cookie.indexOf(name) === 0) {

                    const value = cookie.substring(name.length, cookie.length);
                    result = (decode) ? (decodeURIComponent(value)) : (value);

                }

            };

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
        set: (name: string, value: string, domain: string = "", days: number = 0, secure: boolean = false, samesite: string = "", callback: Function): void => {

            if(!self.utils.__check(name, "name")) {
                return;
            }

            if(!self.cookies.enabled()) {
                return callback(new Error("Cookies disabled."));
            }

            let result: string[] = [];

            result.push(name + '=' + value);
            if(domain) {
                result.push("domain=" + domain);
            }
            result.push("path=/");
            if(days) {
                const date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                result.push("expires=" + date.toUTCString());
            }
            if(secure) {
                result.push("secure");
            }
            
            if(samesite) {
                result.push("samesite=" + samesite);
            }
            
            const cookieString = result.join(";");
            window.document.cookie = cookieString;

            if(callback && typeof callback === "function") {
                if(self.cookies.get(name)) {
                    callback(null, cookieString);
                } else {
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
        delete: (name: string, callback: Function): void => {
            
            if(!self.utils.__check(name, "name")) {
                return;
            }

            self.cookies.set(name, "", "", -1);

            if(callback && typeof callback === "function") {
                if(!self.cookies.get(name)) {
                    return callback(null, "Cookie deleted.");
                } else {
                    callback(new Error("Cookie was not deleted."));
                }
            }
        }

    }


    self.querystring = {

        /**
         * Returns the value of a provided query string paramter.
         * @param {string} key 
         * @param {string} querystring  optional - default is: document.location.search
         * @returns {array}
         */
        get: (key: string, querystring: string = window.document.location.search): string[] => {

            let result: string[] = [];

            if(!self.utils.__check(key, "key")) {
                return result;
            }
           
            key = key + "=";
            const queries = (querystring.charAt(0)==="?") ? (querystring.slice(1).split("&")) : (querystring.split("&"));
            
            for (let i in queries) {
                const pair = queries[i];
                if(pair.indexOf(key) === 0) {
                    result.push(pair.slice(key.length, pair.length));
                }
            };

            return result;
        },

        /**
         * Adds a query string paramter with prorvided name and value.
         * @param {string} key 
         * @param {string} value 
         * @param {string} querystring  optional - default is: document.location.search 
         * @returns {string}
         */
        add: function(key: string, value: string, querystring: string = window.document.location.search): string {
            
            if(!self.utils.__check(key, "key")) {
                return "";
            }

            if(/[\s]/.test(key)) {
                self.utils.__check("", "key")
            }

            if(!self.utils.__check(value, "value")) {
                return "";
            }

            const pair = key + "=" + encodeURIComponent(value);

            if(querystring) { 
                return querystring + "&" + pair
            } else {
                return "?" + pair;
            }

        },

        /**
         * Delets a first-party cookie by name.
         * @param {string} querystring 
         * @param {string} scope        optional - default is: exit
         * @param {string} domain       optional - default is: document.location.hostname
         * @param {function} callback   optional - type: error-first callback
         * @returns {undefined}
         */
        appendto: function(querystring: string, scope: string = "exit", domain: string = document.location.hostname, callback: Function): void {
            
            if(!self.utils.__check(querystring, "querystring")) {
                return;
            }

            try{
                if(querystring.charAt(0)==="?") {
                    querystring = querystring.slice(1);
                }
                const linkList = document.getElementsByTagName("a");

                for(let i in linkList) {
                    
                    const element = linkList[i];
                    
                    if(!element.href || element.href.indexOf("#") === 0) {
                        continue;
                    }

                    if(element.href.indexOf(domain) != -1 && scope === "exit") {
                        continue;
                    } 

                    if(element.href.indexOf("?") === -1) {
                        if(element.href.indexOf("#") === -1) {
                            element.href += ("?" + querystring);
                        } else {
                            const chunks = element.href.split("#");
                            element.href = chunks[0] + "?" + querystring + "#" + chunks[1];
                        }
                    } else {
                        if(element.href.indexOf("#") === -1) {
                            element.href += ("&" + querystring);
                        } else {
                            const chunks = element.href.split("#");
                            element.href = chunks[0] + "&" + querystring + "#" + chunks[1];
                        }
                    }

                }

                if(callback && typeof callback === "function") {
                    callback(null, "Querystring appended.");
                }
            } catch(err) {
                callback(err);
            }
        },


        /**
         * Converts query string to JSON.
         * @param {string} querystring  optional - default is: document.location.search 
         * @returns {object}
         */
        tojson: (querystring: string = window.document.location.search): Object => {

            let result: any = {};

            const queries = (querystring.charAt(0)==="?") ? (querystring.slice(1).split("&")) : (querystring.split("&"));

            for (let i in queries) {
                const pair = queries[i].split('=');
                result[pair[0]] = decodeURIComponent(pair[1]);
            }
         
            return result; 
        }
    
    }


    self.text = {

        /**
         * Cleans provided text from unnecessary whitespace.
         * @param {string} text
         * @returns {string} 
         */
        clean: (text: string): string => {

            if(!self.utils.__check(text, "text")) {
                return "";
            }

            return text.replace(/\s+/g, ' ').trim();

        }

    }
    

    self.utils = {

        __check: (input: any, name: string): boolean => {

            let result = (input) ? (true) : (false);

            if(typeof input === "string") {
                result = (input!="" && input!=" ") ? (true) : (false);
            }

            if(typeof input === "object") {
                result = (Object.keys(input).length > 0) ? (true) : (false);
            }

            if(typeof input === "function") {
                result = (input!="") ? (true) : (false);
            }

            if(!result) {
                console.error("Parameter '" + name + "' is not valid.");
            }

            return result;
        }

    }

})();
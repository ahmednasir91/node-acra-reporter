"use strict";
/**
* Utils Module
*
* @class utils
*/

/**
 * Converts postdata into structured data.
 * Contents containing \n will be converted to array or object
 * If the array's first line is key=value style, then converted to boject
 *
 * Examples:
 *
 *     utils.strObjectToData({ "field": "Hi\nThere\n" })
 *     // => { field: [ "Hi", "There" ] }
 *
 * @depreciated Covert to using scrubber (https://npmjs.org/package/scrubber)
 * @method strObjectToData
 * @param {Object} hash of cgi params
 * @return {Object} converted data 
 * @api public
 */
exports.strObjectToData = function(data) {
    var ret = {};
    Object.keys(data).forEach(function(key) {
        console.log(key);
        var value = data[key];
        if (key.match(/date/i)) {
            value = new Date(value.trim());
        }
        else if (value.indexOf("\n") !== -1)
        {
            var arr = value.trim().split("\n");
            if (arr[0] && arr[0].match(/^\S+=\S+/))
            {
                value = {};
                arr.forEach(function(row) {
                    var sp = row.split('=');
                    var key = sp[0].replace('.','_');
                    console.log(key);
                    value[key] = sp.slice(1).join('=');
                });
            }
            else 
            {
                value = arr;
            }
        }
        ret[key] = value;
    });
    return ret;
};

exports.normalizeKeys = function (obj) {
    return obj;
};

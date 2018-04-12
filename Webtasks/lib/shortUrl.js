var _ = require('lodash');

function shortUrl(num) {
    // Remove i, l and o to avoid letters which might be confused with numbers.
    var chars = '0123456789abcdefghjkmnpqrstuvwxyz'
        , nbase = 33
        , newNumber = ''
        , r;

    // in r we have the offset of the char that was converted to the new base
    while (num >= nbase) {
        r = num % nbase;
        newNumber = chars[r] + newNumber;
        num = num / nbase;
    }
    // the last number to convert
    newNumber = chars[num] + newNumber;

    return _.padStart(newNumber, 3, '0');
}

module.exports = shortUrl;
function isUndefined(object) { return typeof(object) === 'undefined'; }
function isArray(object) { return Object.prototype.toString.call(object) === '[object Array]'; }
function isObject(object) { return Object.prototype.toString.call(object) === '[object Object]'; }
function isFunction(object) { return Object.prototype.toString.call(object) === '[object Function]'; }
function mergeObjects(a, b) {
    for (var i in b)
    {
        if (isObject(b[i]))
            a[i] = (b[i].__dontMerge ? null : mergeObjects({}, b[i]));
        else if (isArray(b[i]))
            a[i] = mergeObjects([], b[i]);
        else
            a[i] = b[i];
    }
    return a;
}
function randomInt(min, max) { return Math.floor(Math.random() * ((max + 1) - min) + min); }
function randomFloat(min, max) { return min + Math.abs(min - max) * Math.random(); }
function log10(num) { return Math.log(num) / Math.LN10; }
function selectRandom(array) { return array[randomInt(0, array.length - 1)]; }

var player = null;
var battle = null;
var itemTypes = {};
var monsterList = {};

var itemRarityNames = [
    'Normal'
    ,'Refined'
    ,'Spectacular'
    ,'Perfect'
    ,'Legendary'
];
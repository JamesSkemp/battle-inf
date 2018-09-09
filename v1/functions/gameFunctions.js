var getStatDifference = function(statsA, statsB) {
    var statsC = {};
    
    for (var i in statsA)
        statsC[i] = statsA[i] - statsB[i];
    
    return statsC;
};

var addNumberCommas = function(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var getExpRequiredForLevel = function(level) {
    return 25 + (level - 1) * level * level * 10;
};

var getExpRequiredForSkillLevel = function(base, mod, level) {
    return Math.floor(base * Math.pow(mod, level) + base * Math.pow(mod, level - 1) * (level - 1));
};
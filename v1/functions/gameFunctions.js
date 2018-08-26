var createStats = function() {
    return {
        hp: 0
        ,sp: 0
        ,attack: 0
        ,defense: 0
        ,dexterity: 0
        ,magic: 0
    };
};

var getStatDifference = function(statsA, statsB) {
    var statsC = {};
    
    for (var i in statsA)
        statsC[i] = statsA[i] - statsB[i];
    
    return statsC;
};

var statDisplayString = function(statName) {
    switch (statName) {
        case 'hp': return 'HP';
        case 'sp': return 'SP';
        case 'attack': return 'ATK';
        case 'defense': return 'DEF';
        case 'dexterity': return 'DEX';
        case 'magic': return 'MAG';
    }
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
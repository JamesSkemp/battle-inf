var baseMonster = function(genProperties) {
    this.initBattleUnit();
    this.type = 'monster';

    if (!genProperties)
        genProperties = {};

    // Set the level if not specified
    if (!genProperties.level)
    {
        genProperties.level = player.battleLevel;
    }

    // Pick a random type
    if (!genProperties.type)
    {
        for (var i in mLevelBehaviors)
        {
            var levelBehaviors = mLevelBehaviors[i];
            if (genProperties.level < levelBehaviors.maxLevel)
            {
                var r = randomInt(0, levelBehaviors.behaviorIds.length - 1);
                genProperties.type = levelBehaviors.behaviorIds[r];
                break;
            }
        }
	}

    // Pick a monster name
    if (!genProperties.name)
    {
        for (var i in mLevelNames)
        {
            var levelNames = mLevelNames[i];
            if (genProperties.level < levelNames.maxLevel)
            {
                var r = randomInt(0, levelNames.names.length - 1);
                genProperties.name = levelNames.names[r];
                break;
            }
        }

        // Pick a random name if needed
        if (!genProperties.name)
        {
            var levelNames = mLevelNames[randomInt(0, mLevelNames.length - 1)];
            var r = randomInt(0, levelNames.names.length - 1);
            genProperties.name = levelNames.names[r];
        }
    }

    var monsterBehavior = mBehaviors[genProperties.type];
    var monsterName = mNames[genProperties.name];

    // Set the name and level
    this.level = genProperties.level;
    if (genProperties.customName)
        this.name = genProperties.customName;
    else
        this.name = genProperties.name.replace('_', ' ') + ' ' + monsterBehavior.name(this.level);

    var baseStat = 10 * this.level;

    // Set stats
    for (var i in createStats())
    {
        this.stats[i] = 0;
        if (monsterName.statMods[i])
            this.stats[i] = monsterName.statMods[i] * baseStat;
        if (monsterBehavior.statMods[i])
            this.stats[i] *= monsterBehavior.statMods[i];
    }

    // Give the monster all skills, but only one will be called from the actions
    if (monsterBehavior.skills)
    {
        for (var i in monsterBehavior.skills)
        {
            var skillName = monsterBehavior.skills[i];
            this.skills[skillName] = {
                level: this.level
                ,uses: 0
                ,next: 0
            };
        }
    }

    //this.stats.hp = this.stats.maxHp = 30;
    //this.stats.attack = 15;
    //this.stats.defense = 0;

    this.actionCode = compileActions(monsterBehavior.actions());
};
baseMonster.prototype = new BattleUnit();

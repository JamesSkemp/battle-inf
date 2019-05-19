var basePlayer = function() {
    this.money = 0;
    this.inventory = [];
    this.inventoryMax = 20;
    this.inventoryActions = {"type": "root","actions": []};
    this.inventoryActionCode = '';
    //this.inventoryActionCode = "if (player.itemComp(item,'rarity','>=',5)) {if (player.itemComp(item,'level','<=',75)) {result='sell'; return;}}if (player.itemComp(item,'rarity','<=',3)) {}";

    this.shopItems = [];

    this.landUsed = 0;
    this.landMax = 10;
    this.landProgress = 0;
    this.buildings = {};
    this.gpm = 0;
    this.battleLevel = 1;

    this.trainingSlots = [];

    this.heroMax = 8;
    this.heroes = [];
    this.monsters = [];
    this.battleHeroes = [];

    // Special
    this.timeMultiplier = 1;
    this.battleLog = [];
    this.autoSave = true;
    this.endless = false;
    this.paused = false;
    this.inBattle = false;
    this.lastShopRefreshTimestamp = 0;
    this.lastTrainingCheckTimestamp = 0;

    this.unlock = {};

    this.log = function(message) {
        if (this.battleLog.length >= 500)
            this.battleLog.splice(0, 1);
        this.battleLog.push({m:message});

        var scrollHeight = $('#battle_log')[0].scrollHeight + 10000;

        // some jQuery to animate the log scroll
        if(!$('#battle_log_content').is(':animated'))
            $('#battle_log_content').animate({scrollTop: scrollHeight}, 'slow');
    };

    this.clearLog = function() {
        player.battleLog = [];
        player.log('Battle log cleared.');
    };

    this.log('<span style="font-size:20px;">Welcome to <b style="font:inherit">Battle INF</b>.</span>');
    this.log('This is where you will see most game messages, but the more important ones will popup at the top of the window.');
    this.log('Your <b>goal</b> is to <b>complete challanges</b>, which are waves of enemies, <b>but there is a catch</b>.');
    this.log('<b>Each enemy is designed with its own logic, so it is your job to design your heroes with even better logic!</b>');
    this.log('Your heroes will grow based on every little action.  Stat points and skills will all grow based on what a hero does and has done to them in battle.');
    this.log('<br>');
    this.log('Start off by clicking <b>"Start Battle"</b>');

    this.createNewHero = function() {
        var hero = new baseHero();
        hero.setup(this.heroes.length);
        this.heroes.push(mergeObjects({}, hero));
    };

    this.createMonsterParty = function(max) {
        // +/- the max, for some variation, but to keep things even
        var number = randomInt(max - 1, max + 1);
        if (number < 1) number = 1; // Minimum of 1

        var monsters = [];

        for (var i = 0; i < number; i++)
        {
            var monster = new baseMonster();
            //monster.name += ' (' + (i + 1) + ')';
            monster.initForBattle();
            this.log('<b>' + monster.name + '</b> appeared ' + monster.createStatDisplay('hp'));
            monsters.push(monster);
        }

        this.monsters = monsters;
    };

    // Add an item to the inventory, or sell it
    this.addItem = function(item) {
        var result = 'keep';

        // Run logic
        eval('itemFn = function(item) {' + this.inventoryActionCode + '}');
        itemFn(item);

        // If sell selected from logic or the inventory is full
        if (result === 'sell' || this.inventory.length >= this.inventoryMax)
            this.money += Math.floor(item.moneyValue * 0.4);
        else if (this.inventory.length < this.inventoryMax)
            this.inventory.push(item);
    };

    // Compare item properties
    this.itemComp = function(item, prop, comp, value) {
        var valueA = item[prop];
        var valueB = value;

        switch (comp)
        {
            case '>=':
                return valueA >= valueB;
                break;
            case '<=':
                return valueA <= valueB;
                break;
        }
    };

    // Remove an item from the inventory
    this.removeItem = function(item) {
        this.inventory.splice(this.inventory.indexOf(item), 1);
    };

    this.addLandProgress = function(mult) {
        var divisor = (this.landMax * (this.getMaxHeroLevel() / battle.level));
        var min = 0.1 / divisor;
        var max = 0.2 / divisor;
        var progress = randomFloat(min, max) * mult;

        this.log('<b class="green_text">+' + (progress * 100).toFixed(2) + '% land progress</b>');

        this.landProgress += progress;
        if (this.landProgress > 1)
        {
            this.landProgress -= 1;
            this.landMax += 1;
        }
    };

    this.startBattle = function() {
        this.battleHeroes = [];
        for (var i in this.heroes)
        {
            if (!this.heroes[i].reserve)
            {
                this.battleHeroes.push(this.heroes[i]);

            }
        }

        if (this.battleHeroes.length === 0)
        {
            getMessageService().appendMessage('All units are in training or reserve.');
            return;
        }

        this.createMonsterParty(this.battleHeroes.length);

        battle = new Battle();
        battle.addParty(this.battleHeroes);
        battle.addParty(this.monsters);

        var level = 0;
        for (var i in this.monsters)
            level += this.monsters[i].level;
        battle.level = this.battleLevel;

        battle.initBattle();

        this.inBattle = true;
    };

    this.battleDone = function() {
        this.inBattle = false;

        // Only award EXP, money, and land progress if the player won
        if (battle.winningIndex === 0) // The player party will always be 0
        {
            this.log('<p class="emphasize yellow i_trophy">YOU WON</p>');

            var totalLevels = 0;
            for (var i in battle.parties[1].deadUnits)
                totalLevels += battle.parties[1].deadUnits[i].level;

            var addMoney = totalLevels;
            this.log('<b class="yellow_text">+' + addMoney + ' money</b>');
            this.money += addMoney;

            this.addLandProgress(battle.parties[1].deadUnits.length);

            var addExp = Math.round(totalLevels);
            for (var i in this.battleHeroes)
            {
                this.battleHeroes[i].addExp(addExp);
                this.log('<b>' + this.battleHeroes[i].name + '</b> <b class="green_text">+' + addExp + ' exp</b>');
            }

            var r = randomInt(0, 100);
            var chance = 20;

            // Chance to get a random item of the battle level
            if (r <= chance)
            {
                var newItem = new baseItem({ level: battle.level });
                this.log('<p class="emphasize green i_item">Found <b class="rarity_' + newItem.rarity + '">' + newItem.name + '</b></p>');
                player.addItem(newItem);
            }
        }
        else
        {
            this.log('<p class="emphasize yellow i_times">YOU LOST</p>');
        }
    };

    this.updateHeroStats = function() {
        for (var i in this.heroes)
        {
            var hero = this.heroes[i];
            var oldStats = mergeObjects({}, hero.stats);
            hero.calculateStats();

            var statChanges = [];
            for (var j in oldStats)
            {
                var diff = hero.stats[j] - oldStats[j];
                if (diff !== 0)
                    statChanges.push(statDisplayString(j) + '<b class="green_text"> +' + diff.toFixed(2) + '</b>');
            }

            if (statChanges.length > 0)
                player.log('<b>' + hero.name + '</b> ' + statChanges.join(' / '));
        }
    };

    this.buildBuilding = function(building) {
        var name = building.name;

        if (!this.buildings[name])
            this.buildings[name] = [];

        this.buildings[name].push({
            name: name
            ,level: 1
        });

        if (building.onBuild)
            building.onBuild(this.buildings[name].length);

        this.calculateLand();
        this.calculateGPM();

        if (name === 'Weapon Smith' || name === 'Armor Smith')
            this.restockShopItems();
    };

    this.calculateLand = function() {
        var landUsed = 0;

        for (var i in Buildings)
        {
            var building = Buildings[i];
            if (this.buildings[building.name])
                landUsed += building.space * this.buildings[building.name].length;
        }

        this.landUsed = landUsed;
    };

    this.calculateGPM = function() {
        var gpm = 0;

        for (var i in Buildings)
        {
            var building = Buildings[i];
            if (this.buildings[building.name])
                for (var j in this.buildings[building.name])
                    gpm += building.gpm * this.buildings[building.name][j].level;
        }

        this.gpm = gpm;
    };

    this.getMaxHeroLevel = function() {
        var level = 0;
        for (var i in this.heroes)
            if (this.heroes[i].level > level)
                level = this.heroes[i].level;

        return level;
    };

    var armorTypes = ['body', 'feet', 'hands', 'head', 'legs'];

    this.restockShopItems = function() {
        this.shopItems = [];

        if (this.buildings['Armor Smith'])
        {
            var armorCostMod = 1 - log10(this.buildings['Armor Smith'].length + 10) / 2 + 0.5;
            var armorAmount = this.buildings['Armor Smith'].length < 50 ? this.buildings['Armor Smith'].length : 50;

            // Create armor
            for (var i = 0; i < armorAmount; i++)
            {
                var type = armorTypes[randomInt(0, armorTypes.length - 1)];
                var building = this.buildings['Armor Smith'][i];
                var item = new baseItem({
                    level: building.level
                    ,type: type
                });
                this.shopItems.push(item);
            }
        }

        if (this.buildings['Weapon Smith'])
        {
            var weaponCostMod = 1 - log10(this.buildings['Weapon Smith'].length + 10) / 2 + 0.5;
            var weaponAmount = this.buildings['Weapon Smith'].length < 50 ? this.buildings['Weapon Smith'].length : 50;

            // Create weapons
            for (var i = 0; i < weaponAmount; i++)
            {
                var building = this.buildings['Weapon Smith'][i];
                var item = new baseItem({
                    level: building.level
                    ,type: 'hand'
                });
                this.shopItems.push(item);
            }
        }

        // NEED TO ADD GEM CODE
    };

    this.addHeroToTraining = function(hero, buildingIndex) {
        hero.trainingAreaIndex = buildingIndex;
    };

    this.removeHeroInTraining = function(buildingIndex) {
        for (var i in this.heroes)
        {
            var hero = this.heroes[i];
            if (hero.trainingAreaIndex === buildingIndex)
            {
                hero.trainingAreaIndex = -1;
                break;
            }
        }
    };

    this.getActiveHeroCount = function() {
        var count = 0;
        for (var i in this.heroes)
            if (!this.heroes[i].reserve)
                count++;
        return count;
    };

    this.getShopPercentOff = function(buildingName) {
        if (this.buildings[buildingName])
        {
            var amountOff = 1 - log10(this.buildings[buildingName].length + 10) / 2 + 0.5;
            amountOff  = ((1 - amountOff) * 100).toFixed(0);
            return amountOff;
        }

        return 0;
    };






    this.prepareForSave = function() {
        this.inBattle = false;
        this.battleHeroes = [];

        for (var i in this.heroes)
            this.heroes[i].battle = null;

        for (var i in this.monsters)
            this.monsters[i].battle = null;
    };

    // Create new hero objects when data is loaded from storage
    this.loadHeroes = function() {
        for (var i in this.heroes) {
            var hero = new baseHero();
            this.heroes[i] = mergeObjects(hero, this.heroes[i]);
        }
    };
};

var initNewPlayer = function() {
    player.createNewHero();
    player.heroes[0].reserve = false;

    player.buildBuilding(getBuildingByName('Townhall'));
    player.buildBuilding(getBuildingByName('Weapon Smith'));
    player.buildBuilding(getBuildingByName('Armor Smith'));
    player.buildBuilding(getBuildingByName('Housing'));
    player.buildBuilding(getBuildingByName('Housing'));

    for (var i = 0; i < 10; i++)
    {
        player.addItem(new baseItem({
            level: 1
            ,rarity: 1
            //,type: 'hand'
            //,subType: 'SWORD'
        }));
    }
};

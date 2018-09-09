var basePlayer = function() {
    // REMOVED

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
    // REMOVED
    
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
        }));
    }
};
var BattleUnit = function() {
    this.initBattleUnit = function() {
        this.initUnit();

        this.battle = null;

        this.baseStats = createStats();

        this.battleStats = null;
        this.battleStatsMax = null;
        this.battleStatusEffects = {};
        this.actScore = 0;
        
        this.actionCode = '';
    };

    this.initForBattle = function(battle) {
        this.battle = battle;
        this.battleStats = mergeObjects({}, this.stats);
        
        // Floor all stats
        for (var i in this.battleStats)
            this.battleStats[i] = Math.floor(this.battleStats[i]);
        
        // Copy battleStats
        this.battleStatsMax = mergeObjects({}, this.battleStats);
        this.battleStatusEffects = {};
    };
    
    this.updateAfterBattle = function() {
        // Check unit's level
        while (true)
        {
            var reqExp = getExpRequiredForLevel(this.level);
            
            if (this.exp >= reqExp)
            {
                this.level++;
                this.exp = 0;
            }
            else
            {
                break;
            }
        }
        
        // Check each of unit's skill's level
        for (var skillName in this.skills)
        {
            var unitSkill = this.skills[skillName];
            var skill = SkillTree[skillName];
            while (unitSkill.uses >= getExpRequiredForSkillLevel(skill.baseExp, skill.growthRate, unitSkill.level))
                unitSkill.level++;
        }
    };
    
    this.incrementStats = function(statAmounts) {
        for (var i in statAmounts)
            this.baseStats[i] += statAmounts[i] * (battle.level / this.level);
    };
    
    this.createStatDisplay = function(stat) {
        var colorClass = '';
        var ratio = this.battleStats[stat] / (this.battleStatsMax[stat] * 1.0);
        
        if (ratio > 0.66) colorClass = 'green_text';
        else if (ratio > 0.33) colorClass = 'orange_text';
        else colorClass = 'red_text';
        
        return '<b class="' + colorClass + '">[' + this.battleStats[stat] + ' / ' + this.battleStatsMax[stat] + ' ' + statDisplayString(stat) + ']</b>';
    };
    
    // Restore will not go above the max value
    // Return the actual amount restored
    this.restoreStat = function(stat, amount) {
        this.battleStats[stat] += amount;
        if (this.battleStats[stat] > this.battleStatsMax[stat]) {
            amount = this.battleStatsMax[stat] - this.battleStats[stat];
            this.battleStats[stat] = this.battleStatsMax[stat];
        }
        
        var statDisplay = this.createStatDisplay('hp');
        player.log('<p class="padding"><b>' + this.name + '</b> regained ' + amount + ' ' + statDisplayString(stat) + ' ' + statDisplay + '</p>');
        
        return amount;
    };
    
    this.receiveDamage = function(args) {
        // If no special reason, make it an empty string
        if (!args.reason) args.reason = '';
        if (!args.mult) args.mult = 1;
        
        args.damage *= args.mult;
        
        // Dexterity modifies damage
        args.damage /= (1 + (this.battleStats.dexterity * 0.001));
        
        if (args.damage < 1) args.damage = 1;
        args.damage = Math.floor(args.damage);
        
        this.battleStats.hp -= args.damage;
        
        this.incrementStats(StatGrowth.receivedDamage);
        
        var statDisplay = this.createStatDisplay('hp');
        player.log('<p class="padding"><b>' + this.name
            + '</b> receives <b class="red_text">' + args.damage + '</b> damage ' + args.reason + ' ' + statDisplay + '</p>');
    
        if (this.battleStats.hp <= 0)
        {
            if (this.type === 'hero')
                player.log('<p class="emphasize red i_hero"><b>' + this.name + '</b> is defeated</p>');
            else if (this.type === 'monster')
                player.log('<p class="emphasize red i_monster"><b>' + this.name + '</b> is defeated</p>');
            this.battle.unitDead(this);
        }
        
        if (this.gameStats)
            this.gameStats.damageReceived += args.damage;
        
        return args.damage;
    };
    
    this.calculateBaseAttackDamageFor = function(unit) {
        var damage = this.battleStats.attack - (unit.battleStats.defense / 2);
        
        // Dexterity modifies damage
        damage *= (1 + (this.battleStats.dexterity * 0.005));
        damage *= randomFloat(0.8, 1.2);
        
        return damage;
    };
    
    this.willCriticalHit = function() {
        var skill = this.skills['Critical Strike'];
        if (skill)
        {
            skill.uses++;
            if (randomInt(0, 100) < skill.level)
                return true;
        }
        
        return false;
    };
    
    this.willDodge = function() {
        var skill = this.skills['Dodge'];
        
        if (skill)
        {
            skill.uses++;
            var r = randomInt(0, 100);
            if (r < skill.level)
                return true;
        }
        
        return false;
    };
    
    this.attack = function(unit, power, supressAttackMessage) {
        var dodged = unit.willDodge();
        
        if (!supressAttackMessage)
            player.log('<b>' + this.name + '</b> attacks <b>' + unit.name + '</b>');
        
        if (!dodged)
        {
            var damage = this.calculateBaseAttackDamageFor(unit) * power;
            var critical = this.willCriticalHit();
            
            this.incrementStats(StatGrowth.didAttack);
            unit.incrementStats(StatGrowth.wasAttacked);

            if (critical) player.log('<p class="padding">It\'s critical!</p>');

            var actualDamage = unit.receiveDamage({damage:damage, mult:critical ? 2 : 1});
            
            if (this.gameStats)
                this.gameStats.physicalDamageDealt += actualDamage;
            
            return true;
        }
        else
        {
            player.log('<b>' + unit.name + '</b> dodges the attack');
            
            return false;
        }
    };
    
    this.defend = function() {
        player.log(this.name + ' is defending');
    };
    
    this.useSkillOn = function(skillName, unit) {
        var skill = this.skills[skillName];
        var spRequired = SkillTree[skillName].sp;
        
        if (this.battleStats.sp >= spRequired)
        {
            this.battleStats.sp -= spRequired;
            
            if (SkillTree[skillName].magical)
                this.incrementStats(StatGrowth.usedMagicalSkill);
            else
                this.incrementStats(StatGrowth.usedSkill);
            
            skill.fn = SkillTree[skillName].fn; // Set the function for the skill

            skill.uses++;

            player.log('<b>' + this.name + '</b> uses <b class="blue_text">' + skillName + '</b> on <b>' + unit.name + '</b> ' + this.createStatDisplay('sp'));

            skill.fn({
                user:this
                ,skill:skill
                ,target:unit
                ,battle:this.battle
            });
            
            return true;
        }
        else
        {
            return false;
        }
    };
    
    this.addStatusEffect = function(statusEffect, turns, power) {
        var effectName = statusEffect.id;
        
        if (!this.battleStatusEffects[effectName])
        {
            this.battleStatusEffects[effectName] = {
                name:effectName
                ,power: power
                ,totalTurns: turns
                ,turnsRemaining: turns
                ,added: statusEffect.added
                ,update: statusEffect.update
                ,removed: statusEffect.removed
            };
            
            this.battleStatusEffects[effectName].added(this);
        }
    };
    
    this.removeStatusEffect = function(effectName) {
        this.battleStatusEffects[effectName].removed(this);
        this.battleStatusEffects[effectName] = null;
    };
    
    this.hasStatusEffect = function(effectName) {
        if (this.battleStatusEffects[effectName])
            return true;
        else
            return false;
    };
    
    this.knowsSkill = function(skillName) {
        if (this.skills[skillName])
            return true;
        else
            return false;
    };
    
    this.learnSkill = function(skillName) {
        if (!this.skills[skillName])
        {
            var skill = SkillTree[skillName];
            
            this.skills[skillName] = {
                level: 1
                ,uses: 0
            };
        }
    };
};
BattleUnit.prototype = new Unit();
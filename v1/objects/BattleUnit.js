var BattleUnit = function() {
    this.updateAfterBattle = function() {
        // REMOVED
        
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
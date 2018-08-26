var Battle = function () {
    this.__dontMerge = true; // Tells mergeObjects() to ignore the object
    
    this.parties = [];
    this.allUnits = []; // For determining order
    this.round = 0;
    this.level = 0;
    this.done = false;
    this.winningIndex = 0;
    
    this.addParty = function(units) {
        var unitList = [];
        for (var i in units)
        {
            unitList.push(units[i]);
            this.allUnits.push(units[i]);
        }
        
        this.parties.push({
            livingUnits: unitList
            ,deadUnits: []
        });
    };
    ;
    this.initBattle = function() {
        for (var i in this.parties)
            for (var j in this.parties[i].livingUnits)
                this.parties[i].livingUnits[j].initForBattle(this);
        
        // Initialize the act score
        for (var i in this.allUnits)
            this.allUnits[i].actScore = this.allUnits[i].battleStats.dexterity;
        
        player.log('<center style="margin:20px;"><b style="font-size:16px">&mdash; Battle Started &mdash;</b></center>');
    };
    
    this.finalizeBattle = function() {
        player.log('<center style="margin:20px;"><b style="font-size:16px">&mdash; Battle Over &mdash;</b></center>');
        
        // Go through each party and make updates to all units
        for (var i in this.parties)
        {
            // Both living and dead
            for (var j in this.parties[i].livingUnits)
                this.parties[i].livingUnits[j].updateAfterBattle();
            for (var j in this.parties[i].deadUnits)
                this.parties[i].deadUnits[j].updateAfterBattle();
        }
    };
    
    this.nextTurn = function() {
        /*
        if (this.currentPartyIndex === 0 && this.currentUnitIndex === 0)
        {
            this.round++;
            player.log('<center style="margin:20px;"><b style="font-size:16px">&mdash; ROUND ' + this.round + ' &mdash;</b></center>');
        }
        */
        
        this.allUnits.sort(this.unitSorter);
        var performingUnit = this.allUnits[0];
        
//        for (var i in this.allUnits)
//            player.log(this.allUnits[i].name + ': ' + this.allUnits[i].actScore);
        
        var performingParty = this.getPartyOfUnit(performingUnit);
        var opposingParty = null;

        // TODO: this is temporary, update it?
        if (this.parties[0] === performingParty)
            opposingParty = this.parties[1];
        else
            opposingParty = this.parties[0];
        
        this.unitTakeTurn(
            performingUnit
            ,performingParty
            ,opposingParty  
        );
        
        // Adjust act scores
        for (var i in this.allUnits)
        {
            var unit = this.allUnits[i];
            if (unit === performingUnit)
                unit.actScore -= unit.battleStats.dexterity;
            else
                unit.actScore += unit.battleStats.dexterity;
        }
        
        // The battle is over
        if (this.done)
            return this.finalizeBattle();
    };
    
    // b - a to sort in a descending order
    this.unitSorter = function(a, b) {
        return b.actScore - a.actScore;
    };
    
    this.getPartyOfUnit = function(unit) {
        for (var i in this.parties)
        {
            var party = this.parties[i];
            
            for (var j in party.livingUnits)
                if (party.livingUnits[j] === unit)
                    return party;
            
            for (var j in party.deadUnits)
                if (party.deadUnits[j] === unit)
                    return party;
        }
    }
    
    // This allows for easy testing, we can set which unit should take a turn to act
    this.unitTakeTurn = function(unit, performingParty, opposingParty) {
        this.currentPerformingUnit = unit;
        this.currentPerformingParty = performingParty;
        this.currentOpposingParty = opposingParty;
        
        this.checkStatusEffects(unit);
        
        if (unit.skipNextTurn)
        {
            unit.skipNextTurn = false;
            return;
        }
        
        // Create a function to execute
        // TODO: maybe this could be done else where and cached?
        eval('battleFn = function(battle) {' + unit.actionCode + '}');
        battleFn(this);
    };
    
    this.checkStatusEffects = function(unit)
    {
        var effectsToRemove = [];
        
        // Check status effecs and reduce all by 1, remove those at 0
        for (var i in unit.battleStatusEffects)
        {
            var effect = unit.battleStatusEffects[i];
            
            if (effect)
            {
                if (effect.turnsRemaining <= 0)
                {
                    effectsToRemove.push(effect.name);
                    continue;
                }

                effect.update(unit);

                effect.turnsRemaining--;
            }
        }
        
        // Remove effects
        for (var i in effectsToRemove)
            unit.removeStatusEffect(effectsToRemove[i]);
    };
    
    this.unitDead = function(unit) {
        for (var i in this.parties)
        {
            var party = this.parties[i];
            var foundUnit = false;
            
            for (var j in party.livingUnits)
            {
                if (party.livingUnits[j] === unit)
                {
                    foundUnit = true;
                    party.livingUnits.splice(party.livingUnits.indexOf(unit), 1);
                    party.deadUnits.push(unit);
                    break;
                }
            }
            
            if (foundUnit)
            {
                // Check if there are any more living units
                if (party.livingUnits.length === 0)
                    this.done = true;
            }
            
            if (party.livingUnits.length > 0)
            {
                this.winningIndex = parseInt(i); // If the battle is done, this will be set to the winning party
            }
        }
        
        if (unit.gameStats)
            unit.gameStats.totalTimesDefeated++;
    };
};
Battle.prototype = new BattleActions();
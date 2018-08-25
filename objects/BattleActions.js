var BattleActions = function() {
    this.currentPerformingParty = null;
    this.currentPerformingUnit = null;
    
    this.selectedOpponent = null;
    this.selectedAlly = null;
    
    this.getTargetFromSelector = function(targetSelector)
    {
        var target = null;

        if (targetSelector === 'Self')
            target = this.currentPerformingUnit;
        if (targetSelector === 'Selected Opponent')
            target = this.selectedOpponent;
        if (targetSelector === 'Selected Ally')
            target = this.selectedAlly;

        return target;
    };

    this.currentUnitPerformAction = function(action, targetSelector, extra1)
    {
        // Determine the target
        var target = this.getTargetFromSelector(targetSelector);

        if (!target)
            return false;
        
        // Perform the action
        if (action === 'Attack')
            this.currentPerformingUnit.attack(target, 1);
        if (action === 'Defend')
            this.currentPerformingUnit.defend();
        if (action === 'Use Skill') // Skills can return false if the unit does not have the SP
            return this.currentPerformingUnit.useSkillOn(extra1, target);
        
        return true;
    };

    this.targetStatComp = function(targetSelector, stat, comp, constant)
    {
        var target = this.getTargetFromSelector(targetSelector);

        if (target !== null)
        {
            var percent = target.battleStats[stat] / (target.battleStatsMax[stat] * 1.0);
            percent = Math.round(percent * 100);
            constant = parseInt(constant);

            switch (comp)
            {
                case '<':
                    return percent < constant;
                    break;
                case '>':
                    return percent > constant;
                    break;
            }
        }
    };

    this.targetHasStatusEffect = function(targetSelector, effectName)
    {
        var target = this.getTargetFromSelector(targetSelector);
        
        if (target !== null)
            if (target.battleStatusEffects[effectName])
                return true;
        
        return false;
    };

    this.findUnitWithStatusEffect = function(units, effectName)
    {
        for (var i in units)
            if (units[i].hasStatusEffect(effectName))
                return units[i];

        return null;
    };

    this.findUnitWithExtremeStat = function(units, stat, extreme)
    {
        // Always at least select the first unit
        // Could be that all units are dead
        if (units.length > 0)
        {
            var selectedUnit = units[0];

            var currentValue = units[0].battleStats[stat];
            for (var i in units)
            {
                var unit = units[i];
                if (extreme === 'max' && unit.battleStats[stat] > currentValue)
                {
                    selectedUnit = unit;
                    currentValue = unit.battleStats[stat];
                }
                else if (extreme === 'min' && unit.battleStats[stat] < currentValue)
                {
                    selectedUnit = unit;
                    currentValue = unit.battleStats[stat];
                }
            }

            return selectedUnit;
        }
        
        return null;
    };

    this.selectTarget = function(type, selector, extra1)
    {
        var units = [];

        // Decide which units to look at
        if (type === 'Ally')
            units = this.currentPerformingParty.livingUnits;
        else if (type === 'Opponent')
            units = this.currentOpposingParty.livingUnits;

        var selectedUnit = null;

        // Decide which unit to select
        switch (selector)
        {
            case 'With Most':
                selectedUnit = this.findUnitWithExtremeStat(units, extra1, 'max');
                break;
            case 'With Least':
                selectedUnit = this.findUnitWithExtremeStat(units, extra1, 'min');
                break;
            case 'With Status Effect':
                selectedUnit = this.findUnitWithStatusEffect(units, extra1);
                break;
        }
        
        // Decide which unit selection to set
        if (type === 'Ally')
            this.selectedAlly = selectedUnit;
        else if (type === 'Opponent')
            this.selectedOpponent = selectedUnit;
    };
};
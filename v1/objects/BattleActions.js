var BattleActions = function() {
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

};
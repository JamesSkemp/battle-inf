var Battle = function () {
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
        
        // REMOVED
    };
};
Battle.prototype = new BattleActions();
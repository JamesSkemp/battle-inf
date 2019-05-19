var InventoryActionsompiler = new function() {
    this.compileActions = function(actions) {
        var code = '';

        for (var i in actions)
        {
            var action = actions[i];

            switch (action.type)
            {
                case 'Condition':
                    code += this.compileCondition(action);
                    break;
                case 'Sell':
                    code += this.compileSell(action);
                    break;
            }
        }

        return code;
    };

    this.compileCondition = function(condition)
    {
        var conditionCode = '';

        conditionCode += 'if ';

        var functionCode = this.compileFunction(condition);

        conditionCode += '(' + functionCode + ') {';
        conditionCode += this.compileActions(condition.actions);
        conditionCode += '}';

        return conditionCode;
    };

    this.compileFunction = function(condition)
    {
        var args = [];
        var functionName = null;

        switch (condition.condition)
        {
            case 'Rarity':
                functionName = 'player.itemComp';
                args = [
                    'item' // The item variable
                    ,this.makeStr('rarity')
                    ,this.makeStr(condition.comp)
                    ,condition.rarity
                ];
                break;
            case 'Level':
                functionName = 'player.itemComp';
                args = [
                    'item' // The item variable
                    ,this.makeStr('level')
                    ,this.makeStr(condition.comp)
                    ,condition.level
                ];
                break;
        }

        if (functionName !== null)
        {
            return functionName + '(' + args.join(',') + ')';
        }
    };

    this.makeStr = function(string)
    {
        return "'" + string + "'";
    };

    this.compileSell = function(action)
    {
        return "result='sell'; return;";
    };
};

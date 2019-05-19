// This should always refer to a Battle > BattleActions object

function compileActions(actions) {
    var code = '';

    for (var i in actions)
    {
        var action = actions[i];

        switch (action.type)
        {
            case 'Condition':
                code += compileCondition(action);
                break;
            case 'Action':
                code += compileAction(action);
                break;
            case 'Select Target':
                code += compileSelectTarget(action);
                break;
        }
    }
    return code;
}

function compileCondition(condition)
{
    var conditionCode = '';

    conditionCode += 'if ';

    var functionCode = compileFunction(condition);

    conditionCode += '(' + functionCode + ') {';
    conditionCode += compileActions(condition.actions);
    conditionCode += '}';

    return conditionCode;
}

function compileFunction(condition)
{
    var args = [];
    var functionName = null;

    switch (condition.functionName)
    {
        case 'Stat':
            functionName = 'battle.targetStatComp';
            args = [
                makeStr(condition.target)
                ,makeStr(condition.stat)
                ,makeStr(condition.comp)
                ,makeStr(condition.constant)
            ];
            break;
        case 'Status Effected By':
            functionName = 'battle.targetHasStatusEffect';
            args = [
                makeStr(condition.target)
                ,makeStr(condition.effect)
            ];
            break;
        case 'Status Not Effected By':
            functionName = '!battle.targetHasStatusEffect';
            args = [
                makeStr(condition.target)
                ,makeStr(condition.effect)
            ];
            break;
    }

    if (functionName !== null)
    {
        return functionName + '(' + args.join(',') + ')';
    }
}

function makeStr(string)
{
    return "'" + string + "'";
}

function compileAction(action)
{
    switch (action.code)
    {
        case 'Attack':
        case 'Defend':
            return "if (battle.currentUnitPerformAction('" + action.code + "','" + action.target + "')) return;";
        case 'Use Skill':
            return "if (battle.currentUnitPerformAction('Use Skill','" + action.target + "', '" + action.skillName + "')) return;";
    }
}

function compileSelectTarget(action)
{
    switch (action.select)
    {
        case 'With Status Effect':
            return "battle.selectTarget('" + action.targetType + "', '" + action.select + "', '" + action.effect + "');";
        case 'With Least':
        case 'With Most':
            return "battle.selectTarget('" + action.targetType + "', '" + action.select + "', '" + action.stat + "');";
        default:
            return "battle.selectTarget('" + action.targetType + "', '" + action.select + "');";
    }
}

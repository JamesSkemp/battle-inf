var mAct = {
    target_opponent_with_least: function(stat) {
        return {
            "type": "Select Target",
            "targetType": "Opponent",
            "select": "With Least",
            "stat": stat
        };
    }
    
    ,target_ally_with_least: function(stat) {
        return {
            "type": "Select Target",
            "targetType": "Ally",
            "select": "With Least",
            "stat": stat
        };
    }

    ,attack_opponent: function() {
        return {
            "type": "Action",
            "code": "Attack",
            "target": "Selected Opponent"
        };
    }

    ,skill_on_ally: function(skillName) {
        return {
            "type": "Action",
            "code": "Use Skill",
            "target": "Selected Ally",
            "skillName": skillName
        };
    }
    
    ,skill_on_opponent: function(skillName) {
        return {
            "type": "Action",
            "code": "Use Skill",
            "target": "Selected Opponent",
            "skillName": skillName
        };
    }

    ,condition_ally_stat: function(stat, comp, constant, actions) {
        return {
            "type": "Condition",
            "target": "Selected Ally",
            "actions": actions,
            "functionName": "Stat",
            "stat": stat,
            "comp": comp,
            "constant": constant
        };
    }
};
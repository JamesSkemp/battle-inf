var mBehaviors = {
    basic_attack: {
        name: function(level) {
            return '';
        }
        ,actions: function () {
            return [
                mAct.target_opponent_with_least('hp')
                ,mAct.attack_opponent()
            ];
        }
        ,statMods: {
        }
    }
    
    ,basic_soldier: {
        name: function(level) {
            return 'Soldier';
        }
        ,actions: function () {
            var skillName = selectRandom(this.skills);
            
            return [
                mAct.target_opponent_with_least('hp')
                ,mAct.skill_on_opponent(skillName)
                ,mAct.attack_opponent()
            ];
        }
        ,statMods: {
            hp:1.2
            ,sp:1
            ,attack:1.2
        }
        ,skills: ['Slash','Bash']
        ,skillLevel: 1
    }
    
    ,basic_healer: {
        name: function(level) {
            return 'Healer';
        }
        ,actions: function () {
            return [
                mAct.target_ally_with_least('hp')
                ,mAct.condition_ally_stat(
                    'hp', '<', '50%',
                    [mAct.skill_on_ally('Heal')]
                )
                ,mAct.target_opponent_with_least('hp')
                ,mAct.attack_opponent()
            ];
        }
        ,statMods: {
            hp:0.8
            ,sp:2
            ,attack:0.6
        }
        ,skills: ['Heal']
        ,skillLevel: 1
    }
};
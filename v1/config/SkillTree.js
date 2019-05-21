var usableSkillTree = {
    'Slash': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Slash at your opponent'
        ,magical: false
        ,sp: 5
        ,cost: 200
        ,fn: function(args) {
            args.user.attack(args.target, (1.3 + args.skill.level * 0.2), true);
        }
    }
    ,'Bash': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Bash your opponent and possibly paralyze them'
        ,magical: false
        ,sp: 5
        ,cost: 200
        ,fn: function(args) {
            var successful = args.user.attack(args.target, (1.2 + args.skill.level * 0.1), true);
            if (successful && randomInt(0,100) < (10 + args.skill.level))
                args.target.addStatusEffect(StatusEffects.Paralyzed, 2, 1);
        }
    }

    ,'Ignite': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Set your opponent on fire'
        ,magical: true
        ,sp: 5
        ,cost: 200
        ,fn: function(args) {
            var power = 1 + this.level * 0.2 + args.user.battleStats.magic * 0.01;
            if (randomInt(0, 100) < 50)
                args.target.addStatusEffect(StatusEffects.On_Fire, 3, power);

            args.target.receiveDamage({damage:5, mult: power});
        }
    }
    ,'Fireball': {
        req:['Ignite']
        ,reqLevel:[5]
        ,baseExp:150
        ,growthRate:1.5
        ,desc: 'Throw a fireball at your opponent'
        ,magical: true
        ,sp: 10
        ,cost: 1000
        ,fn: function(args) {
            var power = 1 + this.level * 0.5 + args.user.battleStats.magic * 0.03;
            if (randomInt(0, 100) < 25)
                args.target.addStatusEffect(StatusEffects.On_Fire, 2, power);

            args.target.receiveDamage({damage:5, mult: power});
        }
    }
    ,'Fire Slash': {
        req:['Slash', 'Ignite']
        ,reqLevel:[5, 5]
        ,baseExp:150
        ,growthRate:1.5
        ,desc: 'Ignite your weapon and slash your opponent'
        ,magical: true
        ,sp: 10
        ,cost: 1000
        ,fn: function(args) {
            var successful = args.user.attack(args.target, (2 + args.skill.level * 0.2), true);

            var power = 1 + this.level * 0.2 + args.user.battleStats.magic * 0.01;

            if (successful)
            {
                if (randomInt(0, 100) < 50)
                    args.target.addStatusEffect(StatusEffects.On_Fire, 2, power);
                args.target.receiveDamage({damage:5, mult: power});
            }
        }
    }

    ,'Attack Down': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Weaken the attack of an opponent'
        ,magical: true
        ,sp: 5
        ,cost: 500
        ,fn: function(args) {
            var power = 1 + this.level * 0.2 + args.user.battleStats.magic * 0.01;
            args.target.addStatusEffect(StatusEffects.Attack_Down, 3, power);
        }
    }

    ,'Defense Down': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Weaken the defence of an opponent'
        ,magical: true
        ,sp: 5
        ,cost: 500
        ,fn: function(args) {
            var power = 1 + this.level * 0.2 + args.user.battleStats.magic * 0.01;
            args.target.addStatusEffect(StatusEffects.Defense_Down, 3, power);
        }
    }

    ,'Heal': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,desc: 'Restore some HP of an ally'
        ,magical: true
        ,sp: 5
        ,cost: 500
        ,fn: function(args) {
            var power = 1 + this.level * 0.2 + args.user.battleStats.magic * 0.01;
            var amountRestored = args.target.restoreStat('hp', Math.round(power * 10));

        }
    }
};

for (var i in usableSkillTree)
    usableSkillTree[i].type = 'usable';

var passiveSkillTree = {
    'Critical Strike': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,cost: 500
        ,desc: 'Learn how to critically strike an opponent'
    }
    ,'Dodge': {
        req:[]
        ,reqLevel:[]
        ,baseExp:100
        ,growthRate:1.5
        ,cost: 500
        ,desc: 'Learn how to dodge opponents attacks'
    }
};

for (var i in passiveSkillTree)
    passiveSkillTree[i].type = 'passive';

var SkillTree = mergeObjects(usableSkillTree, passiveSkillTree);

var StatusEffects = {
    Paralyzed: {
        name: 'Paralyzed'
        ,added: function(unit) {
            player.log('<p class="padding"><b>' + unit.name + '</b> is now <b class="blue_text">paralyzed</b></p>');
        }
        ,update: function(unit) {
            player.log('<b>' + unit.name + '</b> is <b class="blue_text">paralyzed</b>');
            unit.skipNextTurn = true;
        }
        ,removed: function(unit) {
            player.log('<b>' + unit.name + '</b> is no longer <b class="blue_text">paralyzed</b>');
        }
    }

    ,On_Fire: {
        name: 'On Fire'
        ,added: function(unit) {
            player.log('<p class="padding"><b>' + unit.name + '</b> is now <b class="blue_text">on fire!</b></p>');
        }
        ,update: function(unit) {
            player.log('<b>' + unit.name + '</b> is <b class="blue_text">on fire!</b>');
            unit.receiveDamage({damage:this.power * 5});
        }
        ,removed: function(unit) {
            player.log('<b>' + unit.name + '</b> is no longer <b class="blue_text">on fire</b>');
        }
    }

    ,Poisoned: {
        name: 'Poisoned'
        ,added: function(unit) {
            player.log('<p class="padding"><b>' + unit.name + '</b> is now <b class="blue_text">poisoned!</b></p>');
        }
        ,update: function(unit) {
            player.log('<b>' + unit.name + '</b> is <b class="blue_text">poisoned!</b>');
            unit.receiveDamage({damage:this.power * 5});
        }
        ,removed: function(unit) {
            player.log('<b>' + unit.name + '</b> is no longer <b class="blue_text">poisoned</b>');
        }
    }

    ,Attack_Down: {
        name: 'Attack Down'
        ,added: function(unit) {
            player.log('<p class="padding"><b>' + unit.name + '</b>\'s attack is weakened</p>');
            this.effectAmount = 10;
            unit.battleStats.attack -= this.effectAmount;
        }
        ,update: function(unit) {

        }
        ,removed: function(unit) {
            player.log('<b>' + unit.name + '</b>\'s attack is no longer weakened');
            unit.battleStats.attack += this.effectAmount;
        }
    }

    ,Defense_Down: {
        name: 'Defense Down'
        ,added: function(unit) {
            player.log('<p class="padding"><b>' + unit.name + '</b>\'s defense is weakened</p>');
            this.effectAmount = 10;
            unit.battleStats.defense -= this.effectAmount;
        }
        ,update: function(unit) {

        }
        ,removed: function(unit) {
            player.log('<b>' + unit.name + '</b>\'s defense is no longer weakened');
            unit.battleStats.defense += this.effectAmount;
        }
    }
};

for (var i in StatusEffects)
    StatusEffects[i].id = i;

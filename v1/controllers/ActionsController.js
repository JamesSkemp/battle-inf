app.controller('ActionsController', function($scope, $routeParams, messageService) {
    $scope.$parent.header = 'ACTIONS';

    if (!player.unlock.inventory)
    {
        player.unlock.inventory = true;
        player.unlock.town = true;
        player.unlock.endlessMode = true;
        player.clearLog();

        player.log('This is where you can customize how each hero behaves in battle.');
        player.log('A tutorial on how the logic works and can be put together is <b>in the works</b>.'
                    + 'The most important thing to know is that you should alwasy <b>select an opponent</b> and then <b>perform an action on it</b>.');
        player.log('<a href="#wiki" class="button disabled" target="_blank">Actions Wiki</a>');
        player.log('The current setup simply selects the opponent with the least HP and attacks it.');

        player.log('<b>1)</b> Be sure to <b>test</b> your instructions to make sure they do what you want.');
        player.log('<b>2)</b> Always <b>save</b> your instructions when you\'re done.');
        player.log('<b>3)</b> Use the <b>export</b> and <b>import</b> functions to share your instructions.');

        player.log('Now your <b>inventory</b> and the <b>town</b> are available.');
        player.log('You can now also enable <b>endless mode</b>.');
    }

    // Duplicate the player object
    var playerCopy = mergeObjects({}, player);
    $scope.playerCopy = playerCopy;
    $scope.playerTestCopy = mergeObjects({}, player);

    // Setup test players
    for (var i in $scope.playerTestCopy.heroes)
        $scope.playerTestCopy.heroes[i].initForBattle();

    var heroIndex = parseInt($routeParams.index);
    $scope.heroIndex = heroIndex;
    $scope.hero = playerCopy.heroes[heroIndex];
    $scope.hero.initForBattle();

    $scope.actionsRootContainer = [$scope.hero.actionsRoot];
    var actionsRootContainerJustChanged = true;

    $scope.editing = true;
    $scope.testing = false;
    $scope.needsSave = false;

    $scope.testEffectTurns = 5;

    $scope.exportCode = '';
    $scope.importCode = '';
    $scope.exporting = false;
    $scope.importing = false;

    $scope.$watch('actionsRootContainer', function(val) {
        if (actionsRootContainerJustChanged)
            actionsRootContainerJustChanged = false;
        else
            $scope.needsSave = true;
    }, true);

    $scope.conditionTargets = [
        'Self'
        ,'Selected Ally'
        ,'Selected Opponent'
    ];

    $scope.conditionFunctionOptions = [
        'Stat'
        ,'Status Effected By'
        ,'Status Not Effected By'
    ];

    $scope.statOptions = [
        'hp', 'sp', 'attack', 'defense', 'dexterity', 'magic'
    ];

    $scope.statusEffects = [];
    for (var i in StatusEffects)
        $scope.statusEffects.push(i);

    $scope.comparitors = [
        ,'<'
        ,'>'
    ];

    $scope.testStatsOrder = [
        'hp'
        ,'sp'
        ,'attack'
        ,'defense'
        ,'dexterity'
        ,'magic'
    ];

    $scope.constantOptions = [
        '25%'
        ,'50%'
        ,'75%'
        ,'100%'
    ];

    $scope.heroActions = [
        'Attack'
        ,'Defend'
        ,'Use Skill'
    ];

    $scope.selectTargetTypes = [
        'Ally'
        ,'Opponent'
    ];

    $scope.heroSkills = [];
    for (var i in $scope.hero.skills)
        if (SkillTree[i].type === 'usable')
            $scope.heroSkills.push(i);

    $scope.actionTypes = [
        'Condition'
        ,'Action'
        ,'Select Target'
    ];

    $scope.selectTargetOptions = [
        'With Most'
        ,'With Least'
        ,'With Status Effect'
    ];

    $scope.getComparitorString = function(comparitor)
    {
        switch (comparitor)
        {
            case 'eq': return '==';
            case 'lt': return '<';
            case 'gt': return '>';
        }
    };

    $scope.toggleSelection = function(object, $event) {
        object.selected = !object.selected;
        $event.stopPropagation();
    };

    $scope.removeAction = function(actionsContainer, action, $event) {
        actionsContainer.actions.splice(actionsContainer.actions.indexOf(action), 1);
        $event.stopPropagation();
    };

    var swapActions = function(array, indexA, indexB) {
        if (indexA < 0 || indexB < 0) return;
        if (indexA >= array.length || indexB >= array.length) return;

        var tempA = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tempA;
    };

    $scope.moveActionUp = function(actionsContainer, action, $event) {
        var index = actionsContainer.actions.indexOf(action);
        swapActions(actionsContainer.actions, index, index - 1);
        $event.stopPropagation();
    };

    $scope.moveActionDown = function(actionsContainer, action, $event) {
        var index = actionsContainer.actions.indexOf(action);
        swapActions(actionsContainer.actions, index, index + 1);
        $event.stopPropagation();
    };

    $scope.countActions = function(actions) {
        var count = actions.length;
        for (var i in actions)
        {
            if (actions[i].actions)
                count += $scope.countActions(actions[i].actions);
        }
        return count;
    };

    $scope.addSubAction = function(actionsContainer, $event) {
        $event.stopPropagation();

        if ($scope.countActions($scope.actionsRootContainer[0].actions) >= $scope.hero.level + 5)
        {
            messageService.appendMessage('All logic slots in use.');
            return;
        }

        var newAction = null;
        switch (actionsContainer.newAction)
        {
            case 'Condition':
                newAction = ({
                    type:'Condition'
                    ,target:'Self'
                    ,actions: []
                    ,selected: true
                });
                break;
            case 'Action':
                newAction = {
                    type:'Action'
                    ,code:'Attack'
                    ,target:'Selected Opponent'
                };
                break;
            case 'Select Target':
                newAction = {
                    type:'Select Target'
                    ,targetType:'Opponent'
                    ,select:'Least HP'
                };
                break;
        }

        if (newAction !== null)
            actionsContainer.actions.push(newAction);
    };





    $scope.saveActions = function() {
        $scope.needsSave = false;

        messageService.appendMessage($scope.hero.name + ' actions saved!');

        var code = compileActions($scope.actionsRootContainer[0].actions);

        // Update the player copy version of the hero
        $scope.hero.actionsRoot = $scope.actionsRootContainer[0];
        $scope.hero.actionCode = code;

        // Update the actual hero
        player.heroes[heroIndex].actionsRoot = $scope.actionsRootContainer[0];
        player.heroes[heroIndex].actionCode = code;
    };

    $scope.exportActions = function() {
        $scope.exportCode = angular.toJson($scope.actionsRootContainer[0]);
    };

    $scope.importActions = function() {
        var actions = angular.fromJson($scope.importCode);
        $scope.importCode = '';
        $scope.actionsRootContainer = [actions];
    };

    $scope.testActions = function() {
        $scope.saveActions();

        player.log('<center><b>&mdash; TEST BATTLE START &mdash;</b></center>');

        playerCopy.createMonsterParty();

        // Create a battle, save it locally, and null it out
        // So that the main loop doesn't execute it
        playerCopy.startBattle();
        testBattle = battle;
        battle = null;

        // Setup stats and status effects
        for (var i in $scope.playerTestCopy.heroes)
        {
            var testHero = $scope.playerTestCopy.heroes[i];

            for (var j in testHero.battleStats)
                testHero.battleStats[j] = parseInt(testHero.battleStats[j]);

            playerCopy.heroes[i].battleStats = mergeObjects({}, testHero.battleStats);
            playerCopy.heroes[i].battleStatusEffects = mergeObjects({}, testHero.battleStatusEffects);
        }

        try
        {
            testBattle.unitTakeTurn(
                playerCopy.heroes[heroIndex]
                ,testBattle.parties[0] // Should always be the heroes...for now
                ,testBattle.parties[1] // Should always be the monsters...for now
            );
        }
        catch (e)
        {
            messageService.appendMessage('There is an error with your logic.  Are all the fields filled out?');
            alert(e);
        }

        player.log('<center><b>&mdash; TEST BATTLE FINISH &mdash;</b></center>');
    };

    $scope.addTestEffect = function(testHero) {
        var statusEffect = StatusEffects[testHero.testEffect];

        testHero.addStatusEffect(statusEffect, 5, 1);
    };

    $scope.removeTestEffect = function(testHero, effect) {
        testHero.removeStatusEffect(effect.name);
    };

    $scope.getCode = function() {
        alert(angular.toJson(compileActions($scope.actionsRootContainer[0].actions)));
    };
});

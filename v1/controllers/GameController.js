var globalMessageService = null;

app.controller('GameController', function($scope, $location, $interval, $http, $window, messageService, $sce) {
    globalMessageService = messageService;
    
    $scope.header = '';
    $scope.location = $location;
    $scope.player = null;
    $scope.messages = [];
    $scope.debug = false;
    
    $scope.statOrder = [
        'hp'
        ,'sp'
        ,'attack'
        ,'defense'
        ,'dexterity'
        ,'magic'
    ];
    
    $scope.statDisplayString = statDisplayString;
    $scope.addNumberCommas = addNumberCommas;
    $scope.getExpRequiredForLevel = getExpRequiredForLevel;
    
    
    
    // Get monster data
    $http({
        method: 'GET'
        ,url: 'data/monsters.dat'
    }).success(function(data, status, headers, config) {
        var lines = data.split('\n');
        mNames = {};
        
        for (var i in lines)
        {
            var parts = lines[i].split('\t');
            
            if (parts[0] !== '')
            {
                mNames[parts[0]] = {
                    statMods: {
                        hp: parseInt(parts[1])
                        ,sp: parseInt(parts[6])
                        ,attack: parseInt(parts[2])
                        ,defense: parseInt(parts[3])
                        ,dexterity: parseInt(parts[4])
                        ,magic: parseInt(parts[5])
                    }
                };
            }
        }
    });
    
    
    
    
    
    $scope.save = function() {
        var savePlayer = mergeObjects({}, player);
        savePlayer.prepareForSave();
        
        var saveDataString = LZString.compress(angular.toJson(savePlayer));
        
        localStorage.setItem('save_player', saveDataString);
    };
    
    $scope.load = function() {
        player = new basePlayer();
        
        var saveDataString = localStorage.getItem('save_player');
        
        
        if (saveDataString !== null)
        {
            var playerData = angular.fromJson(LZString.decompress(saveDataString));
            
            player = mergeObjects(player, playerData);
            
            $scope.player = player;

            player.loadHeroes();
        }
        else
        {
            $scope.reset();
        }
        
        // Reset the shop refresh time each page load
        var date = new Date();
        player.lastShopRefreshTimestamp = date.getTime();
        
        if (player.lastTrainingCheckTimestamp === 0)
            player.lastTrainingCheckTimestamp = date.getTime();
        
        updateShopRestockTimer();
    };
    
    $scope.reset = function() {
        $location.path('heroes');
        messageService.appendMessage('New game started.');
        player = new basePlayer();
        initNewPlayer();
        $scope.player = player;
        $scope.save();
        battle = null;
    };
    
    $scope.startBattle = function() {
        if (battle === null)
        {
            player.startBattle();
            messageService.appendMessage('Battle Started!');
        }
    };
    
    $scope.messageService = messageService;
    $scope.clearMessages = messageService.clearAll;
    messageService.setGameControllerScope($scope);
    
    // To allow outputting HTML to the messages
    $scope.sce = $sce;
    
    var updateShopRestockTimer = function() {
        var date = new Date();
        
        if (date.getTime() - player.lastShopRefreshTimestamp > 1000 * 60 * 10) // 10 minutes
        {
            player.restockShopItems();
            player.lastShopRefreshTimestamp = date.getTime();
            messageService.appendMessage('Shop restocked!');
        }
        
        var timeDiff = (1000 * 60 * 10) - (date.getTime() - player.lastShopRefreshTimestamp);
        var minutes = Math.floor(timeDiff / (60 * 1000));
        var seconds = Math.floor(timeDiff / 1000 % 60);
        
        if (minutes < 0) minutes = 0;
        if (seconds < 0) seconds = 0;
        
        player.shopRefreshTimeRemaining = minutes + ' minutes ' + seconds + ' seconds';
    };
    
    /*
     * MAIN TICK
     */
    var mainTick = function() {
        // Check that the monster data has been loaded
        if (Object.keys(mNames).length === 0) return;
        
        // Causes a tick wait after completing a battle, also starts a battle when endless mode is checked
        if (battle === null && player.endlessMode)
            player.startBattle();
        
        if (battle !== null && !player.paused)
        {
            battle.nextTurn();
            if (battle.done)
            {
                player.battleDone();
                player.updateHeroStats();
                
                battle = null;
                
                if (!player.unlock.equip)
                {
                    player.unlock.equip = true;
                    player.log('<br>');
                    player.log('You just fought your first opponent!  Your hero gained one experience and progress toward increasing its stats.');
                    player.log('Your heroes will <b>always start fresh</b> with each new battle.  You don\'t need to worry about restoring HP or removing status effects.');
                    player.log('You now have access to your hero\'s <b>equipment</b>.  Go check it out.');
                }
                
                player.log('<div style="width:100%;height:50px;"></div>');
            }
        }
        
        updateShopRestockTimer();
    };
    $interval(mainTick, 1000);
    
    /*
     * AUTO SAVE
     */
    var autoSave = function() {
        if (player.autoSave)
            $scope.save();
    };
    $interval(autoSave, 30000);
    
    function checkTraining() {
        var date = new Date();
        
        var mult = Math.round((date.getTime() - player.lastTrainingCheckTimestamp) / 60000.0);
        
        for (var i in player.heroes) {
            var hero = player.heroes[i];
            if (hero.trainingAreaIndex >= 0)
            {
                var trainingArea = player.buildings['Training Ground'][hero.trainingAreaIndex];
                var trainingOption = TrainingOptions[trainingArea.selectedId];
                
                if (trainingOption)
                {
                    for (var i in trainingOption.stats)
                        hero.baseStats[i] += trainingOption.stats[i] * mult;
                    
                    hero.calculateStats();
                }
                
                hero.gameStats.totalMinutesTraining += mult;
            }
        };
        
        
        player.lastTrainingCheckTimestamp = date.getTime();
    }
    
    /*
     * INCOME
     * TRAINING
     */
    var minuteTick = function() {
        try {
            ga('send', {
                // Required.
                hitType: 'event'
                // Required.
                ,eventCategory: 'minute_tick'
                // Required.
                ,eventAction: 'tick'
            });
        } catch {
            // Google Analytics was blocked if this fails, and that's okay.
        }
        
        player.money += player.gpm;
        
        checkTraining();
    };
    $interval(minuteTick, 60000);
    
    
    
    
    
    $scope.increaseBattleLevel = function() {
        if (player.battleLevel < player.getMaxHeroLevel())
            player.battleLevel++;
    };
    
    $scope.decreaseBattleLevel = function() {
        if (player.battleLevel > 1)
            player.battleLevel--;
    };
    
    
    
    
    // For quick save/reset buttons
    angular.element($window).bind('keypress', function(event) {
        if (event.which === 100) // d
            $scope.debug = true;
    });
    
    
    
    
    
    
    $scope.load();
    
    //$scope.reset();
});
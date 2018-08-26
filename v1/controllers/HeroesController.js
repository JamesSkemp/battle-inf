app.controller('HeroesController', function($scope, messageService) {
    $scope.$parent.header = 'HEROES';
    
    $scope.upgrades = Upgrades;
    
    $scope.swapUp = function($index, $event) {
        $event.stopPropagation();
        
        if ($index > 0)
        {
            var temp = player.heroes[$index];
            
            // Update hero index
            player.heroes[$index].index--;
            player.heroes[$index - 1].index++;
            
            player.heroes[$index] = player.heroes[$index - 1];
            player.heroes[$index - 1] = temp;
        }
    };
    
    $scope.swapDown = function($index, $event) {
        $event.stopPropagation();
        
        if ($index < player.heroes.length - 1)
        {
            var temp = player.heroes[$index];
            
            // Update hero index
            player.heroes[$index].index++;
            player.heroes[$index + 1].index--;
            
            player.heroes[$index] = player.heroes[$index + 1];
            player.heroes[$index + 1] = temp;
        }
    };
    
    $scope.setReserve = function(hero) {
        hero.reserve = true;
    };
    
    $scope.setUnreserve = function(hero, $event) {
        $event.stopPropagation();
        
        if (player.getActiveHeroCount() < 4)
        {
            hero.reserve = false;
        }
        else
        {
            messageService.appendMessage('You may only have 4 heroes active at a time.  Set one as reserved first.');
        }
    };
    
    $scope.canUpgrade = function(upgrade) {
        return player.money >= upgrade.nextValueCostFunction();
    };
    
    $scope.doUpgrade = function(upgrade) {
        if ($scope.canUpgrade(upgrade))
        {
            player.money -= upgrade.nextValueCostFunction();
            upgrade.upgradeFunction();
        }
    };
});
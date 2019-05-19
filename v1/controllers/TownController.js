app.controller('TownController', function($scope, $window, messageService) {
    $scope.$parent.header = 'TOWN';

    $scope.addNumberCommas = addNumberCommas;
    $scope.buildings = Buildings;

    for (var i in $scope.buildings)
        $scope.buildings[i].collapsed = true;

    $scope.upgrades = Upgrades;

    $scope.buildNew = function(building) {
        if (player.money >= building.cost)
        {
            if (player.landMax - player.landUsed >= building.space)
            {
                player.buildBuilding(building);
                player.money -= building.cost;
            }
            else
            {
                messageService.appendMessage('Not enough space');
            }
        }
    };

    $scope.sellBuilding = function(building, $index) {
        if (!building.cannotSell)
        {
            var playerBuilding = player.buildings[building.name][$index];
            player.buildings[building.name].splice($index, 1);
            player.money += building.upgradeCost * playerBuilding.level;
            player.landUsed -= building.space;
        }
    };

    $scope.upgradeBuilding = function(playerBuilding, target) {
        var building = getBuildingByName(playerBuilding.name);
        var cost = building.upgradeCost * playerBuilding.level;

        if (player.money >= cost)
        {
            playerBuilding.level++;
            player.money -= cost;
            player.calculateGPM();

            $(target).qtip('option', 'content.text', '$' + addNumberCommas(building.upgradeCost * playerBuilding.level)); // Preferred
        }
    };

    $scope.landProgressPercent = function() {
        var percent = Math.round(player.landProgress * 100);
        return percent < 100 ? percent : 100;
    };




    angular.element($window).bind('scroll', function() {
        if (this.pageYOffset > 0) {
            $('#main_header').addClass('fixed');
            var width = $('#left_container').width();
            $('#main_header').width(width);
        } else {
            $('#main_header').removeClass('fixed');
        }
    });

    $scope.$on('$locationChangeStart', function(event) {
        angular.element($window).unbind('scroll');
    });
});

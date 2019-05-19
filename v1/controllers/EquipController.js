app.controller('EquipController', function($scope, $routeParams, messageService, $window) {
    $scope.$parent.header = 'EQUIP';

    if (!player.unlock.skills)
    {
        player.unlock.skills = true;
        player.clearLog();
        player.log('This is where you can customize each hero\'s equipment setup.');
        player.log('You\'ve got <b>10</b> free random items!');
        player.log('Now you have access to your hero\'s <b>skills</b>.');
    }

    $scope.hero = player.heroes[$routeParams.index];
    $scope.itemTypes = itemTypes;
    $scope.compareItem = {item:null};
    $scope.heroStatsChange = null;
    $scope.Math = Math;
    $scope.selectedItem = null;
    $scope.itemFilter = {name:''};

    $scope.equipmentButtons = [
        'unequip'
    ];

    $scope.inventoryButtons = [
        'equip'
        ,'compare'
    ];

    $scope.hero.buildEquipmentList();

    function recalculateChange(item) {
        // Copy the hero
        // Swap the equipment
        // Find the difference
        var heroCopy = mergeObjects({}, $scope.hero);
        heroCopy.equip(item, true);

        $scope.heroStatsChange = getStatDifference(heroCopy.stats, $scope.hero.stats);
    }

    $scope.$watch('compareItem', function(val) {
        if (val.item !== null)
        {
            $scope.selectedItem = val.item;
            recalculateChange($scope.selectedItem);
        }
    }, true);

    $scope.$watch('hero.equipment', function(val) {
        if ($scope.selectedItem)
            recalculateChange($scope.selectedItem);
    }, true);

    angular.element($window).bind("scroll", function() {
        if (this.pageYOffset >= 100) {
            var heroWidth = $('#left_container').width();
            var equipmentWidth = $('#hero_equipment_display').width();

            $('#hero_display').addClass('hero_fixed');
            $('#hero_display').width(heroWidth);

            $('#hero_equipment_display').addClass('equipment_fixed');
            $('#hero_equipment_display').width(equipmentWidth);
        } else {
            $('#hero_display').removeClass('hero_fixed');
            $('#hero_equipment_display').removeClass('equipment_fixed');
        }
    });

    $scope.items = player.inventory;
});

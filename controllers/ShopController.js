app.controller('ShopController', function($scope, messageService) {
    $scope.$parent.header = 'Shop';
    
    $scope.addNumberCommas = addNumberCommas;
    
    $scope.armorAmount = 0;
    $scope.armorAmountOff = 0;

    $scope.weaponAmount = 0;
    $scope.weaponAmountOff = 0;
    
    $scope.gemAmount = 0;
    $scope.gemAmountOff = 0;
    
    if (player.buildings['Armor Smith']) {
        $scope.armorAmount = player.buildings['Armor Smith'].length < 50 ? player.buildings['Armor Smith'].length : 50;
        $scope.armorAmountOff = 1 - log10(player.buildings['Armor Smith'].length + 10) / 2 + 0.5;
        $scope.armorAmountOff = ((1 - $scope.armorAmountOff) * 100).toFixed(0);
    }

    if (player.buildings['Weapon Smith']) {
        $scope.weaponAmount = player.buildings['Weapon Smith'].length < 50 ? player.buildings['Weapon Smith'].length : 50;
        $scope.weaponAmountOff = 1 - log10(player.buildings['Weapon Smith'].length + 10) / 2 + 0.5;
        $scope.weaponAmountOff = ((1 - $scope.weaponAmountOff) * 100).toFixed(0);
    }
    
    if (player.buildings['Gemcutter']) {
        $scope.gemAmount = player.buildings['Gemcutter'].length < 50 ? player.buildings['Weapon Smith'].length : 50;
        $scope.gemAmountOff = 1 - log10(player.buildings['Gemcutter'].length + 10) / 2 + 0.5;
        $scope.gemAmountOff = ((1 - $scope.gemAmountOff) * 100).toFixed(0);
    }
    
    $scope.itemRarityNames = itemRarityNames;
    $scope.player = player;
    
    $scope.canAfford = function(item) {
        return player.money >= item.moneyValue;
    };
    
    $scope.buyItem = function(item) {
        if ($scope.canAfford(item))
        {
            if (player.inventory.length < player.inventoryMax)
            {
                player.addItem(item);
                player.money -= item.moneyValue;
                var index = player.shopItems.indexOf(item);
                player.shopItems.splice(index, 1);
            }
        }
    };
});
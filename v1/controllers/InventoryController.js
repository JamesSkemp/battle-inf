app.controller('InventoryController', function($scope, messageService) {
    $scope.$parent.header = 'INVENTORY';

    $scope.editingLogic = true;

    $scope.items = player.inventory;
    $scope.Math = Math;
    $scope.selectedItems = [];

    $scope.sellItem = function(item) {
        player.removeItem(item);
        player.money += Math.floor(item.moneyValue * 0.4);
    };

    $scope.sellAll = function() {
        for (var i in $scope.items)
            $scope.selectItem($scope.items[i]);
        $scope.sellSelected();
    };

    $scope.sellSelected = function() {
        for (var i in $scope.selectedItems)
            $scope.sellItem($scope.selectedItems[i]);
    };

    $scope.selectItem = function(item) {
        var index = $scope.selectedItems.indexOf(item);

        if (index >= 0)
            $scope.selectedItems.splice(index, 1);
        else
            $scope.selectedItems.push(item);
    };

    $scope.itemIsSelected = function(item) {
        return $scope.selectedItems.indexOf(item) >= 0;
    };



    $scope.actionsRootContainer = [player.inventoryActions];
    $scope.actionsRoot = player.inventoryActions;

    $scope.actionTypes = [
        'Condition'
        ,'Sell'
    ];

    $scope.comparitors = [
        ,'<='
        ,'>='
    ];

    $scope.conditionOptions = [
        ,'Rarity'
        ,'Level'
    ];

    $scope.rarityOptions = [
        {name:'1 - White', value:1}
        ,{name:'2 - Green', value:2}
        ,{name:'3 - Blue', value:3}
        ,{name:'4 - Red', value:4}
        ,{name:'5 - Orange', value:5}
    ];

    $scope.levelOptions = [];
    for (var i = 1; i <= 100; i++)
        $scope.levelOptions.push(i);

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

        var newAction = null;
        switch (actionsContainer.newAction)
        {
            case 'Condition':
                newAction = ({
                    type:'Condition'
                    ,condition:'Rarity'
                    ,actions: []
                    ,selected: true
                });
                break;
            case 'Sell':
                newAction = {
                    type:'Sell'
                };
                break;
        }

        if (newAction !== null)
            actionsContainer.actions.push(newAction);
    };


    $scope.saveLogic = function() {
        player.inventoryActionCode = InventoryActionsompiler.compileActions(player.inventoryActions.actions);
    };
});

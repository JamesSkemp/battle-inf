app.controller('OptionsController', function($scope, messageService) {
    $scope.$parent.header = 'OPTIONS';
    $scope.monsterLevel = 1;
    
    $scope.randomMonster = function() {
        var m = new baseMonster({
            level: $scope.monsterLevel
        });
    };
});
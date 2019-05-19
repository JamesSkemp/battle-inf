app.controller('StatsController', function($scope, $routeParams, messageService) {
    $scope.$parent.header = 'STATS';

    $scope.hero = player.heroes[$routeParams.index];
});

app.controller('TrainingController', function($scope, messageService) {
    $scope.$parent.header = 'TRAINING';
    
    
    $scope.selectionIndex = {
        hero: -1
    };
    
    $scope.trainingOptions = TrainingOptions;
    
    $scope.trainingAreas = player.buildings['Training Ground'];
    
    $scope.heroes = player.heroes;
    
    $scope.unassignedHeroes = function() {
        for (var i in player.heroes)
            if (player.heroes[i].trainingAreaIndex === -1)
                return true;
        
        return true;
    };
    
    $scope.getHeroInTrainingArea = function($index) {
        for (var i in player.heroes)
            if (player.heroes[i].trainingAreaIndex === $index)
                return player.heroes[i];
    };
    
    $scope.assignHero = function($index) {
        if ($scope.selectionIndex.hero >= 0)
        {
            var hero = player.heroes[$scope.selectionIndex.hero];
            $scope.selectionIndex.hero = -1;
            hero.trainingAreaIndex = $index;
            hero.reserve = true;
        }
    };
    
    $scope.unassignHero = function($index) {
        player.removeHeroInTraining($index);
    };
    
    
    $scope.getUnassignedHeroes = function() {
        var availableHeroes = [];
        
        for (var i in player.heroes)
            availableHeroes.push(i);
        
        //for (var i in )
        {
            //var heroIndex = $scope.trainingAreas[i].
            availableHeroes.splice(availableHeroes.indexOf(i), 1);
        }
    };
    
    $scope.trainingAreaSelectedOption = function(trainingArea) {
        for (var i in $scope.trainingOptions)
            if (trainingArea.selectedId === $scope.trainingOptions[i].id);
    };
});
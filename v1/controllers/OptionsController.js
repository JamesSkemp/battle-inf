app.controller('OptionsController', function($scope, messageService) {
    $scope.$parent.header = 'OPTIONS';
	$scope.monsterLevel = 1;
	// textarea to export/import save data
	$scope.exportSaveData = '';
	$scope.importSaveData = '';
    
    $scope.randomMonster = function() {
        var m = new baseMonster({
            level: $scope.monsterLevel
        });
	};
	
	$scope.importData = function() {
		console.log($scope.importSaveData.length);
		console.log($scope.importSaveData);
		if ($scope.importSaveData.length > 0) {
			var data = LZString.compress(angular.toJson($scope.importSaveData.replace("\"", "\\\"")));
			console.log(angular.toJson($scope.importSaveData));
			console.log(data);
			localStorage.setItem('save_player', data);
			$scope.$parent.load();
			messageService.appendMessage('Save game imported');
		}
	};

	$scope.exportData = function() {
		//$scope.exportSaveData = localStorage.getItem('save_player');
		$scope.exportSaveData = angular.fromJson(LZString.decompress(localStorage.getItem('save_player')));
		messageService.appendMessage('Save game exported.');
	};

	// LZString.compress(angular.toJson(savePlayer));
	// var playerData = angular.fromJson(LZString.decompress(saveDataString));
});
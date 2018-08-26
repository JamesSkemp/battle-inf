app = angular.module('GameApp', ['ngRoute']);

app.run(function($rootScope) {
    $rootScope.$safeApply = function(fn) {
        var phase = this.$root.$$phase;
        
        if(phase === '$apply' || phase === '$digest')
        {
            if(fn && (typeof(fn) === 'function')) { fn(); }
        }
        else { this.$apply(fn); }
    };
});

// Not using for now
/*
app.directive('bindOnce', function() {
    return {
        scope: true,
        link: function( $scope, $element ) {
            setTimeout(function() {
                $scope.$destroy();
                $element.removeClass('ng-binding ng-scope');
            }, 0);
        }
    };
});
*/
app.directive('qtip2', function() {
    return function(scope, element, attrs) {
        $(element).qtip({position: { my: 'top center' ,at: 'bottom center' }
            ,content: {text: attrs.qtip2}
            ,style: {classes: 'qtip-dark qtip-shadow'}
        });
    };
});

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/arena', {
                templateUrl: 'templates/arena.html',
                controller: 'ArenaController'
            }).
            when('/heroes', {
                templateUrl: 'templates/heroes.html',
                controller: 'HeroesController'
            }).
            when('/options', {
                templateUrl: 'templates/options.html',
                controller: 'OptionsController'
            }).
            when('/equip/:index', {
                templateUrl: 'templates/equip.html',
                controller: 'EquipController'
            }).
            when('/actions/:index', {
                templateUrl: 'templates/actions.html',
                controller: 'ActionsController'
            }).
            when('/shop', {
                templateUrl: 'templates/shop.html',
                controller: 'ShopController'
            }).
            when('/skills/:index', {
                templateUrl: 'templates/skills.html',
                controller: 'SkillsController'
            }).
            when('/stats/:index', {
                templateUrl: 'templates/stats.html',
                controller: 'StatsController'
            }).
            when('/inventory', {
                templateUrl: 'templates/inventory.html',
                controller: 'InventoryController'
            }).
            when('/town', {
                templateUrl: 'templates/town.html',
                controller: 'TownController'
            }).
            when('/training', {
                templateUrl: 'templates/training.html',
                controller: 'TrainingController'
            }).
            otherwise({
                redirectTo: '/heroes'
            });
    }]
);
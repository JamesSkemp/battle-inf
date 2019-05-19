app.controller('SkillsController', function($scope, $routeParams, messageService) {
    $scope.$parent.header = 'SKILLS';

    if (!player.unlock.actions)
    {
        player.unlock.actions = true;
        player.clearLog();
        player.log('This is where you can select new skills for your heroes and check on each skill\'s level progress');
        player.log('Finally, you have access to your hero\'s <b>actions</b>.  This is where things get interesting.');
    }

    $scope.hero = player.heroes[$routeParams.index];
    $scope.skillTree = SkillTree;

    $scope.heroUsableSkills = {};
    $scope.heroPassiveSkills = {};

    $scope.usableSkills = {};
    $scope.passiveSkills = {};

    function refreshLearnableSkills() {
        for (var skillName in SkillTree)
        {
            var skill = SkillTree[skillName];

            if (!$scope.hero.knowsSkill(skillName))
            {
                var canLearn = true;
                var requirementsMet = 0;

                for (var j = 0; j < skill.req.length; j++)
                {
                    var reqName = skill.req[j];
                    var level = skill.reqLevel[j];

                    if ($scope.hero.knowsSkill(reqName) && $scope.hero.skills[reqName].level >= level)
                        requirementsMet++;
                    else
                        canLearn = false;
                }

                if (canLearn || requirementsMet > 0)
                {
                    skill.reqMet = requirementsMet;
                    skill.canLearn = canLearn;
                    skill.name = skillName;

                    if (skill.type === 'usable')
                        $scope.usableSkills[skillName] = (skill);
                    else if (skill.type === 'passive')
                        $scope.passiveSkills[skillName] = (skill);
                }
            }
            else
            {
                if (skill.type === 'usable')
                    $scope.heroUsableSkills[skillName] = $scope.hero.skills[skillName];
                if (skill.type === 'passive')
                    $scope.heroPassiveSkills[skillName] = $scope.hero.skills[skillName];
            }
        }
    }

    refreshLearnableSkills();

    $scope.learnSkill = function(skill) {
        if (player.money >= skill.cost)
        {
            player.money -= skill.cost;

            $scope.hero.learnSkill(skill.name);

            if (skill.type === 'usable')
            {
                $scope.usableSkills[skill.name] = null;
                $scope.heroUsableSkills[skill.name] = $scope.hero.skills[skill.name];
            }
            else if (skill.type === 'passive')
            {
                $scope.passiveSkills[skill.name] = null;
                $scope.heroPassiveSkills[skill.name] = $scope.hero.skills[skill.name];
            }

            refreshLearnableSkills();
        }
    };



    $scope.skillReqExp = function(skillName, level) {
        var skill = SkillTree[skillName];
        return getExpRequiredForSkillLevel(skill.baseExp, skill.growthRate, level);
    };
});

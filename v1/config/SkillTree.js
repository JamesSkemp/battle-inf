// REMOVED

for (var i in usableSkillTree)
    usableSkillTree[i].type = 'usable';

// REMOVED

for (var i in passiveSkillTree)
    passiveSkillTree[i].type = 'passive';

var SkillTree = mergeObjects(usableSkillTree, passiveSkillTree);
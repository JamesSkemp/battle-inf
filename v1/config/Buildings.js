var getBuildingByName = function(name) {
    for (var i in Buildings)
        if (Buildings[i].name === name)
            return Buildings[i];
    
    return null;
};

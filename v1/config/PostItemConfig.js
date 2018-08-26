var itemTypesList = [];
var itemSubTypesList = {};

for (var i in itemTypes)
{
    itemTypesList.push(i);
    
    for (var j in itemTypes[i])
    {
        if (!itemSubTypesList[i])
            itemSubTypesList[i] = [];
        itemSubTypesList[i].push(j);
    }
}
var baseHero = function() {
    // REMOVED

    // keepInventory, should the item be added or removed from the inventory?
    this.unequip = function(unequipItem, keepInventory) {
        if (!keepInventory)
            player.addItem(unequipItem);
        
        for (var e in this.equipment)
        {
            var slot = this.equipment[e];
            if (isArray(slot))
            {
                for (var j in slot)
                    if (slot[j] === unequipItem)
                        this.equipment[e][j] = null;
            }
            else if (slot !== null)
            {
                if (slot === unequipItem)
                    this.equipment[e] = null;
            }
        }
        
        this.calculateStats();
        this.buildEquipmentList();
    };
};
baseHero.prototype = new BattleUnit();
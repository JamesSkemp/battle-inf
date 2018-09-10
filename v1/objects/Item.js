var baseItem = function(genProperties) {
    // REMOVED - next bit needs reworking since shop perentage should be taken into account when the item is sold/purchased, not when it's created
    
    // Make modifications to the value
    if (this.type === 'hand')
        this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Weapon Smith') / 100));
    else if (this.type === 'gem')
        this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Gemcutter') / 100));
    else // Armor
        this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Armor Smith') / 100));
};

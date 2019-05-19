var baseItem = function(genProperties) {
	this.stats = createStats();

	if (!genProperties)
		genProperties = {};

	if (!genProperties.rarity)
	{
		var total = 5;
		var mod = 1.7;
		var max = Math.ceil(Math.pow(2, total * mod));
		var r = randomInt(0, max);

		for (var i = 1; i <= total; i++)
		{
			if (r <= Math.pow(2, i * mod))
			{
				rarity = total - (i - 1);
				break;
			}
		}

		genProperties.rarity = rarity;
	}

	if (!genProperties.type)
	{
		var itemType = randomInt(0, itemTypesList.length - 1);
		genProperties.type = itemTypesList[itemType];
	}

	if (!genProperties.subType)
	{
		var itemType = genProperties.type;
		var itemSubType = randomInt(0, itemSubTypesList[itemType].length - 1);
		genProperties.subType = itemSubTypesList[itemType][itemSubType];
	}

	this.level = genProperties.level;
	this.rarity = genProperties.rarity;
	this.type = genProperties.type;
	this.subType = genProperties.subType;

	var statBase = this.level * 10;

	var itemProperties = itemTypes[this.type][this.subType];

	if (itemProperties.slots)
		statBase *= itemProperties.slots;

	var totalStats = 0;
	for (var i in itemProperties.statModifiers)
	{
		this.stats[i] += itemProperties.statModifiers[i] * statBase;
		this.stats[i] *= randomFloat(0.8, 1.2) + (this.rarity * 0.2);
		this.stats[i] = Math.round(this.stats[i]);
		totalStats += this.stats[i];
	}

	this.name = itemProperties.name;

	this.moneyValue = totalStats * this.level * this.rarity;

	console.log(player.getShopPercentOff('Armor Smith'));

	// Make modifications to the value
	if (this.type === 'hand')
		this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Weapon Smith') / 100));
	else if (this.type === 'gem')
		this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Gemcutter') / 100));
	else // Armor
		this.moneyValue = Math.round(this.moneyValue * (1 - player.getShopPercentOff('Armor Smith') / 100));
};

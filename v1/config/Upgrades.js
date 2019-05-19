var Upgrades = [
	{
		name:'Inventory Space'
		,description:'Increase your inventory space by 5'
		,maxValue:100
		,currentValue: function() {
			return player.inventoryMax;
		}
		,nextValueFunction:function() {
			return this.currentValue() + 5;
		}
		,nextValueCostFunction:function() {
			return Math.pow(this.currentValue(), 2) * 5;
		}
		,upgradeFunction:function() {
			player.inventoryMax = this.nextValueFunction();
		}
	}
	,{
		name:'Heroes'
		,description:'Recruit an additional hero'
		,maxValue:8
		,currentValue: function() {
			return player.heroes.length;
		}
		,nextValueFunction:function() {
			return this.currentValue() + 1;
		}
		,nextValueCostFunction:function() {
			return Math.pow(this.currentValue() * 10, 2) * 10;
		}
		,upgradeFunction:function() {
			player.createNewHero();
		}
	}
];

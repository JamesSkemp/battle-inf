var Unit = function() {
    this.initUnit = function() {
        this.name = 'Unnamed Unit ' + randomInt(100,999);
        this.level = 1;
        this.exp = 0;
        this.stats = createStats();
        this.skills = {};
    };
};
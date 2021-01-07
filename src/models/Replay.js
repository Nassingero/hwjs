const { characters } = require('../config.json');
const { getAverage, simplify } = require('../Utils.js');

let User, Level;

class Replay {
    constructor(data) {
        if(!User) User = require('./User.js');
        if(!Level) Level = require('./Level.js');

        this.id = data.id;
        this.description = data.description;
        this.character = data.character;
        this.createdAt = data.createdAt;
        this.author = new User(data.author);
        this.votes = data.votes;
        this.level = new Level(data.levelId);
        this.rating = data.rating;
    };

    static fromParsed(data) {
        const attr = (key) => data.getAttribute(key);

        const votes = parseInt(attr('vs'));
        const weighted = parseFloat(attr('rg'));

        let description = data.innerHTML
            .substring(13, data.innerHTML.length - 8);

        if(description === '<uc/>') description = '';

        return new Replay({
            author: {
                username: attr('un'),
                id: attr('ui')
            },
            id: attr('id'),
            levelId: attr('li'),
            description,
            character: characters[attr('pc')],
            createdAt: new Date(attr('dc')),
            votes,
            rating: {
                weighted: simplify(weighted),
                average: simplify(getAverage(weighted, votes))
            }
        });
    };
};

module.exports = Replay;
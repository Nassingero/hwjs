const { baseURL, characters } = require('../config.json');
const { getAverage, getReplays, simplify } = require('../Utils.js');
const fetch = require('node-fetch');

let User;

class Level {
    constructor(data) {
        if(!User) User = require('./User.js');

        if(typeof data === 'string')
            return this.id = data;

        this.name = data.name;
        this.id = data.id;
        this.url = `${baseURL}/happy_wheels.tjf?level_id=${this.id}`;
        this.description = data.description;
        this.playCount = data.playCount;
        this.publishedAt = data.publishedAt;
        this.character = data.character;
        this.votes = data.votes;
        this.author = new User(data.author);
        this.rating = data.rating;
    };

    async getReplays(sortby = 'completion_time') {
        return getReplays({
            level_id: this.id,
            sortby
        });
    };

    async getXML() {
        const response = await fetch(`http://get-level-xml.herokuapp.com/${this.id}?author=${this.author.id}`);

        return this.xml = await response.text();
    };

    static fromParsed(data) {
        const attr = (key) => data.getAttribute(key);

        const votes = parseInt(attr('vs'));
        const weighted = parseFloat(attr('rg'));

        let description = data.innerHTML
            .substring(13, data.innerHTML.length - 8);

        if(description === '<uc/>') description = '';

        return new Level({
            name: attr('ln'),
            id: parseInt(attr('id')),
            description,
            playCount: parseInt(attr('ps')),
            publishedAt: new Date(attr('dp')),
            character: characters[attr('pc')],
            votes,
            author: {
                username: attr('un'),
                id: attr('ui')
            },
            rating: {
                weighted: simplify(weighted),
                average: simplify(getAverage(weighted, votes))
            }
        });
    };
};

module.exports = Level;
const { baseURL } = require('../config.json');
const { tjfRequest, parseLevels } = require('../Utils.js');
const DOMParser = require('dom-parser');

class User {
    constructor(data) {
        this.username = data.username;
        this.id = data.id;
        this.url = `${baseURL}/profile.tjf?uid=${this.id}`;
    };

    async getLevels() {
        const xmlString = await tjfRequest('post', '/get_level.hw', {
            action: 'get_pub_by_user',
            user_id: this.id
        });

        return parseLevels(xmlString);
    };

    // web scraping
    async fetchProfile() {
        const htmlString = await tjfRequest('get', this.url.slice(baseURL.length));

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(htmlString);
        const table = htmlDoc.getElementsByClassName('profile_table')[0];
        const header = htmlDoc.getElementsByClassName('header')[0];

        if(!this.username && header)
            this.username = header.childNodes[0].innerHTML.replace('\'s Profile', '');

        if(!table) return this;

        const items = table.getElementsByTagName('tr');

        for(const item of items) {
            let key = item.childNodes[1].innerHTML;

            key = key.substring(3, key.length - 5).toLowerCase();

            let value = item.childNodes[3].innerHTML.trim();

            if(key === 'date joined') {
                key = 'createdAt';
                value = new Date(value);
            };

            if(key === 'email')
                value = decodeEmail(value.match(/email="(.+?)"/)[1]);

            this[key] = value;
        };

        return this;
    };
};

function decodeEmail(encoded) {
    let email = '', r = parseInt(encoded.substr(0, 2), 16), n, i;

    for (n = 2; encoded.length - n; n += 2){
        i = parseInt(encoded.substr(n, 2), 16) ^ r;
        email += String.fromCharCode(i);
    };

    return email;
};

module.exports = User;
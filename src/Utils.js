const fetch = require('node-fetch');
const { baseURL } = require('./config.json');
const DOMParser = require('dom-parser');

let models;

const parse = (xml) => new DOMParser().parseFromString(xml);

module.exports = class Utils {
    static async tjfRequest(method, route, params = '') {
        if(params)
            params = '?' + new URLSearchParams(params).toString();
    
        const response = await fetch(baseURL + route + params, { method });
    
        return response.text();
    };

    static async getLevels(options) {
        const params = {
            page: 1,
            sortby: 'newest',
            uploaded: 'week',
            ...options
        };
    
        const xmlString = await Utils.tjfRequest('post', '/get_level.hw', params);
    
        return Utils.parseLevels(xmlString);
    };

    static parseLevels(xmlString) {
        if(!models) models = require('./models/');

        const parsed = parse(xmlString);
        const levels = parsed.getElementsByTagName('lv');
    
        return levels.slice(1).map(models.Level.fromParsed);
    };

    static async getReplays(options) {
        const params = {
            page: 1,
            sortby: 'completion_time',
            ...options,
            action: 'get_all_by_level'
        };
    
        const xmlString = await Utils.tjfRequest('post', '/replay.hw', params);
    
        return Utils.parseReplays(xmlString);
    };

    static parseReplays(xmlString) {
        if(!models) models = require('./models/');

        const parsed = parse(xmlString);
        const replays = parsed.getElementsByTagName('rp');

        return replays.slice(1).map(models.Replay.fromParsed);
    };

    static getAverage(rating, votes) {
        let a = 10;
        let b = 2.5;
        let c = 0;
    
        if(votes > 0)
            c = (rating - b * a / (votes + a)) / (votes / (votes + a));
    
        return Math.min(5, Math.max(c, 0));
    };

    static simplify(num, len) {
        return parseFloat(num.toFixed(len));
    };
};
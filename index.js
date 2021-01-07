const { getLevels } = require('./src/Utils.js');
const User = require('./src/models/User.js');

module.exports = class HappyWheels {
    static async searchLevels(query, options = {}) {
        const action = 'search_by_' + (options.searchby || 'name');
        
        return getLevels({
            ...options,
            action,
            sterm: query
        });
    };

    static async getFeatured(options = {}) {
        return getLevels({
            ...options,
            action: 'get_all'
        });
    };

    static async getLevelById(id) {
        const [ level ] = await getLevels({
            level_id: id,
            action: 'get_level'
        });

        return level;
    };

    static async getUserById(id) {
        const user = new User({ id });
      
        return user.fetchProfile();
    };
};
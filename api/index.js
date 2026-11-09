const { app } = require('../dist/app');

module.exports = (req, res) => {
    return app(req, res);
};

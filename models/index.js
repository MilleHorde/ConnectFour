'use strict'
const models_path = __dirname;
const fs = require('fs');

let req = {};

fs.readdirSync(models_path).forEach((file) => {
    req[file.replace(".js", "")] = require(models_path + '/' + file);
})

module.exports = req;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tvs = new Schema({
    name: String,
    province: String
});
exports.default = mongoose.model('TVS', tvs, 'idatage_tvs');

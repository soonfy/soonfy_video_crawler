const mongoose = require('mongoose')

const Schema = mongoose.Schema
const tvs = new Schema({
  name: String, //电视台名称
  province: String //电视台所在省份
})

export default mongoose.model('TVS', tvs, 'idatage_tvs')
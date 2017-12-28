const mongoose = require('mongoose')

const Schema = mongoose.Schema
const mtime_film = new Schema({
  name: String,
  make_company: Array,
  release_company: Array,
  cost: String,
  shooting_date: String,
  film_id: String,
  url: String,
  created_at: Date
})

export default mongoose.model('MTIME', mtime_film, 'mtime_films')

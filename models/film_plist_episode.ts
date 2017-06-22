import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FilmPlistEpisodeSchema = new Schema({
  // film episode vid
  _id: {
    // film_plist_id:site:vid
    type: String,
  },
  // film plist _id
  film_plist_id: {
    type: String,
  },
  // create time
  created_at: {
    type: Date,
  },
})

// index
FilmPlistEpisodeSchema.index({ film_plist_id: 1 });

const FilmPlistEpisode = mongoose.model('FILMPLISTEPISODE', FilmPlistEpisodeSchema, 'film_plist_episodes');

export {
  FilmPlistEpisode
}
/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
// import config from '../../config/config';
const { Schema } = mongoose;

/**
 * Player Schema
 */
const GameSchema = new Schema({
  id: {
    type: Number
  },
  gameId: {
    type: Number
  },
  gameStarter: {
    type: String,
    default: '',
    trim: true
  },
  gameWinner: {
    type: String,
    default: '',
    trim: true
  },
  players: {
    type: [Number]
  }
});

GameSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};
mongoose.model('Game', GameSchema);

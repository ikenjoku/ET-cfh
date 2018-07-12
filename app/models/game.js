/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Game Schema
 */
const GameSchema = new Schema({
  id: {
    type: Number
  },
  gameId: {
    type: Number
  },
  gameWinner: {
    type: String,
    default: '',
    trim: true
  },
  players: {
    type: [String]
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

/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Game Schema
 */
const GameSchema = new Schema({
  gameId: {
    type: Number
  },
  players: [],
  meta: {
    type: Object
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

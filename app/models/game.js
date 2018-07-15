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
  gameWinner: {
    type: Schema.Types.ObjectId,
    trim: true,
    ref: 'User'
  },
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

GameSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};
mongoose.model('Game', GameSchema);

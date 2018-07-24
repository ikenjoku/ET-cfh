/**
 * Games won query
 *
 * @returns {Array} Aggregation pipeline
 */
const gamesWonQuery = () => ([
  {
    $match: {
      'meta.gameWinner.userId': { $not: { $eq: 'unauthenticated' } },
      'meta.gameWinner': { $exists: true },
    }
  },
  { $group: { _id: '$meta.gameWinner.username', gamesWon: { $sum: 1 } } },
  { $project: { _id: 0, username: '$_id', gamesWon: 1 } }
]);

export default gamesWonQuery;

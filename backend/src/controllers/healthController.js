function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'pokemon-battle-hub-backend',
    timestamp: new Date().toISOString()
  });
}

module.exports = { getHealth };

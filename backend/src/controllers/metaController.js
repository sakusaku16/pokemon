function createMetaController(pokemonService) {
  return {
    async getMeta(req, res, next) {
      try {
        const data = await pokemonService.getMetaSummary();
        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = createMetaController;

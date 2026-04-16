function createPokemonController(pokemonService) {
  return {
    async list(req, res, next) {
      try {
        const data = await pokemonService.getPokemonList();
        res.status(200).json({ items: data });
      } catch (error) {
        next(error);
      }
    },

    async detail(req, res, next) {
      try {
        const data = await pokemonService.getPokemonById(req.params.id);

        if (!data) {
          return res.status(404).json({
            message: 'Pokemon not found',
            id: req.params.id
          });
        }

        return res.status(200).json(data);
      } catch (error) {
        return next(error);
      }
    }
  };
}

module.exports = createPokemonController;

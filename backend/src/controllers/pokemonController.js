function createPokemonController(pokemonService) {
  return {
    async list(req, res, next) {
      try {
        const query = req.query.q || '';
        const data = await pokemonService.getPokemonList(query);
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
    },

    async moves(req, res, next) {
      try {
        const data = await pokemonService.getMovesByPokemonId(req.params.id);
        return res.status(200).json({ items: data });
      } catch (error) {
        return next(error);
      }
    },

    async masters(req, res, next) {
      try {
        const data = await pokemonService.getMasters();
        return res.status(200).json(data);
      } catch (error) {
        return next(error);
      }
    },

    async schema(req, res, next) {
      try {
        const data = await pokemonService.getSchema();
        return res.status(200).json(data);
      } catch (error) {
        return next(error);
      }
    },

    async damagePreview(req, res, next) {
      try {
        const data = await pokemonService.getDamagePreview(req.body || {});

        if (!data) {
          return res.status(400).json({
            message: 'attackerId, defenderId, moveId の指定が必要です。'
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

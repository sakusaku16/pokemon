const express = require('express');
const { getHealth } = require('../controllers/healthController');
const createMetaController = require('../controllers/metaController');
const createPokemonController = require('../controllers/pokemonController');
const PokemonRepository = require('../repositories/pokemonRepository');
const PokemonService = require('../services/pokemonService');

const router = express.Router();
const pokemonRepository = new PokemonRepository();
const pokemonService = new PokemonService(pokemonRepository);
const pokemonController = createPokemonController(pokemonService);
const metaController = createMetaController(pokemonService);

router.get('/health', getHealth);
router.get('/meta', metaController.getMeta);
router.get('/pokemon', pokemonController.list);
router.get('/pokemon/:id', pokemonController.detail);

module.exports = router;

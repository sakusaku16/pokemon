const mockPokemon = require('../data/mockPokemon');

class PokemonRepository {
  async findAll() {
    return mockPokemon;
  }

  async findById(id) {
    return mockPokemon.find((pokemon) => pokemon.id === id) || null;
  }

  async findMeta() {
    return {
      generatedAt: new Date().toISOString(),
      source: 'mock'
    };
  }
}

module.exports = PokemonRepository;

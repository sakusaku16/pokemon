const data = require('../data/mockPokemon');

class PokemonRepository {
  async findPokemon(query = '') {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return data.pokemons;
    }

    return data.pokemons.filter((pokemon) =>
      pokemon.pokemon_name.toLowerCase().includes(normalized)
    );
  }

  async findPokemonById(id) {
    const pokemonId = Number(id);
    return data.pokemons.find((pokemon) => pokemon.pokemon_id === pokemonId) || null;
  }

  async findTypes() {
    return data.types;
  }

  async findAbilities() {
    return data.abilities;
  }

  async findRegions() {
    return data.regions;
  }

  async findFormsByPokemonId(id) {
    const pokemonId = Number(id);
    return data.pokemonForms.filter((form) => form.pokemon_id === pokemonId);
  }

  async findDexByPokemonId(id) {
    const pokemonId = Number(id);
    return data.pokemonDex.filter((dex) => dex.pokemon_id === pokemonId);
  }

  async findMovesByPokemonId(id) {
    const pokemonId = Number(id);
    return data.pokemonMoves.filter((move) => move.pokemon_id === pokemonId);
  }

  async findMoveById(moveId) {
    return data.pokemonMoves.find((move) => move.move_id === moveId) || null;
  }

  async findSchema() {
    return data.schema;
  }

  async findMeta() {
    return {
      generatedAt: new Date().toISOString(),
      source: 'spreadsheet-reflected-mock',
      appliedSheets: [
        '機能',
        'UI',
        'DB設計',
        'M_TYPE',
        'M_ABILITIES',
        'M_REGIONS',
        'M_POKEMON',
        'M_POKEMON_FORMS',
        'R_POKEMON_DEX'
      ]
    };
  }
}

module.exports = PokemonRepository;

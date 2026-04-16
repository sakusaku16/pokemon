class PokemonService {
  constructor(repository) {
    this.repository = repository;
  }

  async getPokemonList(query = '') {
    const rows = await this.repository.findPokemon(query);
    return rows.map((row) => ({
      pokemon_id: row.pokemon_id,
      pokemon_name: row.pokemon_name
    }));
  }

  async getPokemonById(id) {
    const pokemon = await this.repository.findPokemonById(id);
    if (!pokemon) {
      return null;
    }

    const [types, abilities, regions, forms, dex] = await Promise.all([
      this.repository.findTypes(),
      this.repository.findAbilities(),
      this.repository.findRegions(),
      this.repository.findFormsByPokemonId(id),
      this.repository.findDexByPokemonId(id)
    ]);

    const typeMap = new Map(types.map((type) => [type.type_id, type.type_name]));
    const abilityMap = new Map(abilities.map((ability) => [ability.ability_id, ability]));
    const regionMap = new Map(regions.map((region) => [region.region_id, region.region_name]));

    return {
      ...pokemon,
      types: [pokemon.type1_id, pokemon.type2_id]
        .filter(Boolean)
        .map((typeId) => ({ type_id: typeId, type_name: typeMap.get(typeId) })),
      abilities: [pokemon.ability1_id, pokemon.ability2_id, pokemon.ability3_id]
        .filter(Boolean)
        .map((abilityId) => abilityMap.get(abilityId))
        .filter(Boolean),
      forms,
      dex_numbers: dex.map((row) => ({
        region_id: row.region_id,
        region_name: regionMap.get(row.region_id),
        dex_no: row.dex_no
      }))
    };
  }

  async getMovesByPokemonId(id) {
    const types = await this.repository.findTypes();
    const typeMap = new Map(types.map((type) => [type.type_id, type.type_name]));

    const moves = await this.repository.findMovesByPokemonId(id);

    return moves.map((move) => ({
      ...move,
      move_type_name: typeMap.get(move.move_type_id)
    }));
  }

  async getSchema() {
    return this.repository.findSchema();
  }

  async getMasters() {
    const [types, abilities, regions] = await Promise.all([
      this.repository.findTypes(),
      this.repository.findAbilities(),
      this.repository.findRegions()
    ]);

    return { types, abilities, regions };
  }

  async getDamagePreview({ attackerId, defenderId, moveId, speedPreset = 'max' }) {
    const attacker = await this.repository.findPokemonById(attackerId);
    const defender = await this.repository.findPokemonById(defenderId);
    const move = await this.repository.findMoveById(moveId);

    if (!attacker || !defender || !move) {
      return null;
    }

    const attackBase = move.category === 'physical' ? attacker.attack : attacker.sp_attack;
    const defenseBase = move.category === 'physical' ? defender.defense : defender.sp_defense;

    const presetMultiplier = speedPreset === 'max' ? 1.15 : speedPreset === 'mid' ? 1.05 : 1.0;
    const attackStat = Math.floor(attackBase * presetMultiplier);
    const defenseStat = Math.max(1, defenseBase);

    const expectedDamage = (attackStat * move.power) / defenseStat;
    const expectedPercent = Math.min(999, (expectedDamage / defender.hp) * 22);

    return {
      attacker: {
        pokemon_id: attacker.pokemon_id,
        pokemon_name: attacker.pokemon_name
      },
      defender: {
        pokemon_id: defender.pokemon_id,
        pokemon_name: defender.pokemon_name
      },
      move: {
        move_id: move.move_id,
        move_name: move.move_name,
        power: move.power,
        category: move.category
      },
      result: {
        min_percent: Number((expectedPercent * 0.85).toFixed(1)),
        expected_percent: Number(expectedPercent.toFixed(1)),
        max_percent: Number((expectedPercent * 1.0).toFixed(1))
      }
    };
  }

  async getMetaSummary() {
    const meta = await this.repository.findMeta();

    return {
      ...meta,
      status: 'ok',
      message: '構成シート以降（機能/UI/DB設計）をベースにモックAPIを更新済みです。'
    };
  }
}

module.exports = PokemonService;

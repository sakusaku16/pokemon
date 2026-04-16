class PokemonService {
  constructor(repository) {
    this.repository = repository;
  }

  async getPokemonList() {
    return this.repository.findAll();
  }

  async getPokemonById(id) {
    return this.repository.findById(id);
  }

  async getMetaSummary() {
    const meta = await this.repository.findMeta();

    return {
      ...meta,
      status: 'ok',
      message: 'DB設計完了後にrepositoryをDB実装へ差し替え可能です。'
    };
  }
}

module.exports = PokemonService;

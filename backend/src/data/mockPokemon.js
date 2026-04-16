const types = [
  { type_id: 1, type_name: 'ノーマル' },
  { type_id: 2, type_name: 'ほのお' },
  { type_id: 3, type_name: 'みず' },
  { type_id: 4, type_name: 'でんき' },
  { type_id: 5, type_name: 'くさ' },
  { type_id: 6, type_name: 'こおり' },
  { type_id: 7, type_name: 'かくとう' },
  { type_id: 8, type_name: 'どく' },
  { type_id: 9, type_name: 'じめん' },
  { type_id: 10, type_name: 'ひこう' },
  { type_id: 11, type_name: 'エスパー' },
  { type_id: 12, type_name: 'むし' },
  { type_id: 13, type_name: 'いわ' },
  { type_id: 14, type_name: 'ゴースト' },
  { type_id: 15, type_name: 'ドラゴン' },
  { type_id: 16, type_name: 'あく' },
  { type_id: 17, type_name: 'はがね' },
  { type_id: 18, type_name: 'フェアリー' }
];

const abilities = [
  {
    ability_id: 1,
    ability_name: 'マルチスケイル',
    description: 'HPが満タンの時、受けるダメージが半減する。'
  },
  {
    ability_id: 2,
    ability_name: 'おうごんのからだ',
    description: '変化技を受けない。'
  },
  {
    ability_id: 3,
    ability_name: 'わざわいのうつわ',
    description: '場にいる間、相手の特攻を下げる。'
  }
];

const regions = [
  { region_id: 1, region_name: 'カントー' },
  { region_id: 2, region_name: 'ジョウト' },
  { region_id: 3, region_name: 'ホウエン' },
  { region_id: 4, region_name: 'シンオウ' },
  { region_id: 5, region_name: 'イッシュ' },
  { region_id: 6, region_name: 'カロス' },
  { region_id: 7, region_name: 'アローラ' },
  { region_id: 8, region_name: 'ガラル' },
  { region_id: 8.5, region_name: 'ヒスイ' },
  { region_id: 9, region_name: 'パルデア' }
];

const pokemons = [
  {
    pokemon_id: 149,
    pokemon_name: 'カイリュー',
    type1_id: 15,
    type2_id: 10,
    ability1_id: 1,
    ability2_id: null,
    ability3_id: null,
    hp: 91,
    attack: 134,
    defense: 95,
    sp_attack: 100,
    sp_defense: 100,
    speed: 80
  },
  {
    pokemon_id: 1000,
    pokemon_name: 'サーフゴー',
    type1_id: 17,
    type2_id: 14,
    ability1_id: 2,
    ability2_id: null,
    ability3_id: null,
    hp: 87,
    attack: 60,
    defense: 95,
    sp_attack: 133,
    sp_defense: 91,
    speed: 84
  },
  {
    pokemon_id: 1003,
    pokemon_name: 'ディンルー',
    type1_id: 16,
    type2_id: 9,
    ability1_id: 3,
    ability2_id: null,
    ability3_id: null,
    hp: 155,
    attack: 110,
    defense: 125,
    sp_attack: 55,
    sp_defense: 80,
    speed: 45
  }
];

const pokemonForms = [
  { form_id: 1, pokemon_id: 149, form_name: 'Normal' },
  { form_id: 2, pokemon_id: 1000, form_name: 'Normal' },
  { form_id: 3, pokemon_id: 1003, form_name: 'Normal' }
];

const pokemonDex = [
  { pokemon_id: 149, region_id: 1, dex_no: 149 },
  { pokemon_id: 149, region_id: 2, dex_no: 242 },
  { pokemon_id: 1000, region_id: 9, dex_no: 392 },
  { pokemon_id: 1003, region_id: 9, dex_no: 318 }
];

const pokemonMoves = [
  {
    move_id: 'dragonite-1',
    pokemon_id: 149,
    move_name: 'しんそく',
    move_type_id: 1,
    category: 'physical',
    power: 80,
    effect: '先制技(+2)'
  },
  {
    move_id: 'dragonite-2',
    pokemon_id: 149,
    move_name: 'じしん',
    move_type_id: 9,
    category: 'physical',
    power: 100,
    effect: '通常攻撃'
  },
  {
    move_id: 'dragonite-3',
    pokemon_id: 149,
    move_name: 'テラバースト',
    move_type_id: 1,
    category: 'special',
    power: 80,
    effect: 'テラスタル時にタイプ変化'
  },
  {
    move_id: 'gholdengo-1',
    pokemon_id: 1000,
    move_name: 'ゴールドラッシュ',
    move_type_id: 17,
    category: 'special',
    power: 120,
    effect: '使用後に特攻が下がる'
  },
  {
    move_id: 'gholdengo-2',
    pokemon_id: 1000,
    move_name: 'シャドーボール',
    move_type_id: 14,
    category: 'special',
    power: 80,
    effect: '特防ダウン追加効果'
  },
  {
    move_id: 'tinglu-1',
    pokemon_id: 1003,
    move_name: 'じしん',
    move_type_id: 9,
    category: 'physical',
    power: 100,
    effect: '通常攻撃'
  }
];

const schema = {
  tables: [
    { logical: 'タイプマスタ', physical: 'M_TYPE', note: '親テーブル' },
    { logical: '特性マスタ', physical: 'M_ABILITIES', note: '親テーブル' },
    { logical: '地方マスタ', physical: 'M_REGIONS', note: '親テーブル' },
    { logical: 'ポケモンマスタ', physical: 'M_POKEMON', note: '' },
    { logical: '姿違いマスタ', physical: 'M_POKEMON_FORMS', note: '' },
    { logical: '紐付けテーブル', physical: 'R_POKEMON_DEX', note: '' }
  ]
};

module.exports = {
  types,
  abilities,
  regions,
  pokemons,
  pokemonForms,
  pokemonDex,
  pokemonMoves,
  schema
};

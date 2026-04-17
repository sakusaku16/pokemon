import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:4000/api/v1';

const TYPE_ORDER = [
  'ノーマル',
  'ほのお',
  'みず',
  'でんき',
  'くさ',
  'こおり',
  'かくとう',
  'どく',
  'じめん',
  'ひこう',
  'エスパー',
  'むし',
  'いわ',
  'ゴースト',
  'ドラゴン',
  'あく',
  'はがね',
  'フェアリー'
];

const STAT_ROWS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: '攻撃' },
  { key: 'defense', label: '防御' },
  { key: 'sp_attack', label: '特攻' },
  { key: 'sp_defense', label: '特防' },
  { key: 'speed', label: '素早さ' }
];

const EMPTY_EVS = {
  hp: 0,
  attack: 0,
  defense: 0,
  sp_attack: 0,
  sp_defense: 0,
  speed: 0
};

const DEFAULT_NATURE = {
  hp: 1.0,
  attack: 1.0,
  defense: 1.0,
  sp_attack: 1.0,
  sp_defense: 1.0,
  speed: 1.0
};

const SPEED_STAGE_MULTIPLIER = {
  0: 1,
  1: 1.5,
  2: 2,
  3: 2.5,
  4: 3,
  5: 3.5,
  6: 4
};

function clampEv(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(252, Math.floor(parsed)));
}

function effortPointFromEv(ev) {
  return Math.floor(clampEv(ev) / 8);
}

function effectiveStat(baseStat, ev, isHp = false, natureMultiplier = 1.0) {
  const effortPoint = effortPointFromEv(ev);
  const baseValue = Math.floor(((baseStat * 2 + 31 + effortPoint * 2) * 50) / 100);

  if (isHp) {
    return baseValue + 60;
  }

  return Math.floor((baseValue + 5) * natureMultiplier);
}

function boostedSpeedValue(speedValue, stage) {
  const multiplier = SPEED_STAGE_MULTIPLIER[stage] || 1;
  return Math.floor(speedValue * multiplier);
}

function calcPresetStat(baseStat, statKey, preset) {
  const isHp = statKey === 'hp';

  if (preset === 'max') {
    return effectiveStat(baseStat, 252, isHp, isHp ? 1.0 : 1.1);
  }

  if (preset === 'mid') {
    return effectiveStat(baseStat, 252, isHp, 1.0);
  }

  if (preset === 'base') {
    return effectiveStat(baseStat, 0, isHp, 1.0);
  }

  return effectiveStat(baseStat, 0, isHp, isHp ? 1.0 : 0.9);
}

function sortTypesByOrder(types) {
  return [...types].sort(
    (left, right) => TYPE_ORDER.indexOf(left.type_name) - TYPE_ORDER.indexOf(right.type_name)
  );
}

function categoryLabel(category) {
  if (category === 'physical') {
    return '物理';
  }
  if (category === 'special') {
    return '特殊';
  }
  return category;
}

function PresetStatsTable({ pokemon }) {
  return (
    <table>
      <thead>
        <tr>
          <th>能力</th>
          <th>最高</th>
          <th>準</th>
          <th>無振り</th>
          <th>下降</th>
        </tr>
      </thead>
      <tbody>
        {STAT_ROWS.map((row) => (
          <tr key={row.key}>
            <td>{row.label}</td>
            <td>{calcPresetStat(pokemon[row.key], row.key, 'max')}</td>
            <td>{calcPresetStat(pokemon[row.key], row.key, 'mid')}</td>
            <td>{calcPresetStat(pokemon[row.key], row.key, 'base')}</td>
            <td>{calcPresetStat(pokemon[row.key], row.key, 'down')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BaseStatsTable({ pokemon, evs, nature }) {
  const baseTotal = STAT_ROWS.reduce((sum, row) => sum + pokemon[row.key], 0);
  const adjustedTotal = STAT_ROWS.reduce(
    (sum, row) => sum + effectiveStat(pokemon[row.key], evs[row.key], row.key === 'hp', nature[row.key]),
    0
  );

  return (
    <table>
      <thead>
        <tr>
          <th>能力</th>
          <th>種族値</th>
          <th>努力値反映</th>
        </tr>
      </thead>
      <tbody>
        {STAT_ROWS.map((row) => (
          <tr key={row.key}>
            <td>{row.label}</td>
            <td>{pokemon[row.key]}</td>
            <td>{effectiveStat(pokemon[row.key], evs[row.key], row.key === 'hp', nature[row.key])}</td>
          </tr>
        ))}
        <tr>
          <td>合計</td>
          <td>{baseTotal}</td>
          <td>{adjustedTotal}</td>
        </tr>
      </tbody>
    </table>
  );
}

function DexNumberRow({ pokemon }) {
  return (
    <div className="dex-inline">
      <span className="dex-chip">全国#{pokemon.pokemon_id}</span>
      {pokemon.dex_numbers.map((entry) => (
        <span key={`${entry.region_id}-${entry.dex_no}`} className="dex-chip">
          {entry.region_name}:{entry.dex_no}
        </span>
      ))}
    </div>
  );
}

function RadarChart({ title, pokemon, evs, nature }) {
  if (!pokemon) {
    return null;
  }

  const center = 110;
  const radius = 80;
  const maxStat = 200;
  const totalEv = Object.values(evs).reduce((sum, value) => sum + value, 0);
  const overLimit = totalEv > 510;

  const points = STAT_ROWS.map((row, index) => {
    const angle = ((Math.PI * 2) / 6) * index - Math.PI / 2;
    const value = effectiveStat(pokemon[row.key], evs[row.key], row.key === 'hp', nature[row.key]);
    const ratio = Math.max(0, Math.min(1, value / maxStat));

    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
      labelX: center + Math.cos(angle) * (radius + 16),
      labelY: center + Math.sin(angle) * (radius + 16),
      label: row.label
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="radar-wrap">
      <h4>{title}</h4>
      <svg viewBox="0 0 220 220" className="radar-svg" role="img" aria-label={`${title}レーダーチャート`}>
        {[50, 100, 150, 200].map((value) => {
          const scale = value / maxStat;
          const ring = STAT_ROWS.map((_, index) => {
            const angle = ((Math.PI * 2) / 6) * index - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
          }).join(' ');

          return <polygon key={value} points={ring} className="radar-ring" />;
        })}

        {points.map((point) => (
          <line key={point.label} x1={center} y1={center} x2={point.labelX} y2={point.labelY} className="radar-axis" />
        ))}

        <polygon points={polygon} className={overLimit ? 'radar-shape radar-shape-over' : 'radar-shape'} />

        {[50, 100, 150, 200].map((value, index) => (
          <text key={`scale-${value}`} x={center + 4} y={center - radius * ((index + 1) / 4) + 10} className="radar-scale">
            {value}
          </text>
        ))}

        {points.map((point) => (
          <text key={`${point.label}-text`} x={point.labelX} y={point.labelY} className="radar-text" textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function EffortEditor({ evs, nature, onChange, onNatureChange }) {
  const total = Object.values(evs).reduce((sum, value) => sum + value, 0);
  const overLimit = total > 510;

  return (
    <div className="ev-editor">
      <h4>努力値振り</h4>
      <div className="ev-grid">
        {STAT_ROWS.map((row) => (
          <div key={row.key} className="ev-row">
            <label>{row.label}</label>
            <button onClick={() => onChange(row.key, clampEv(evs[row.key] - 4))}>-</button>
            <input
              type="number"
              min={0}
              max={252}
              step={4}
              value={evs[row.key]}
              onChange={(event) => onChange(row.key, clampEv(event.target.value))}
            />
            <button onClick={() => onChange(row.key, clampEv(evs[row.key] + 4))}>+</button>
            <button onClick={() => onChange(row.key, 0)}>0</button>
            <button onClick={() => onChange(row.key, 252)}>252</button>
            {row.key === 'hp' ? (
              <span className="nature-fixed">-</span>
            ) : (
              <select value={nature[row.key]} onChange={(event) => onNatureChange(row.key, Number(event.target.value))}>
                <option value={1.1}>↑1.1</option>
                <option value={1.0}>1.0</option>
                <option value={0.9}>↓0.9</option>
              </select>
            )}
          </div>
        ))}
      </div>
      <div className="ev-total-inline">
        <span>合計</span>
        <strong className={overLimit ? 'over-limit' : ''}>{total} / 510</strong>
      </div>
    </div>
  );
}

function PokemonSearchCard({
  title,
  query,
  setQuery,
  onSearch,
  candidates,
  onSelect,
  pokemon,
  evs,
  nature,
  onEvChange,
  onNatureChange,
  chartTitle
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="search-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ポケモン名" />
        <button onClick={onSearch}>検索</button>
      </div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <button key={candidate.pokemon_id} onClick={() => onSelect(candidate.pokemon_id)}>
            #{candidate.pokemon_id} {candidate.pokemon_name}
          </button>
        ))}
      </div>

      {pokemon && (
        <div className="info-block">
          <div className="name-with-dex">
            <h3>{pokemon.pokemon_name}</h3>
            <DexNumberRow pokemon={pokemon} />
          </div>
          <p>タイプ: {sortTypesByOrder(pokemon.types).map((type) => type.type_name).join(' / ')}</p>
          <p>特性: {pokemon.abilities.map((ability) => ability.ability_name).join(' / ') || '-'}</p>

          <div className="after-dex-layout">
            <div className="after-dex-row">
              <div className="equal-panel">
                <BaseStatsTable pokemon={pokemon} evs={evs} nature={nature} />
              </div>
              <div className="equal-panel">
                <RadarChart title={chartTitle} pokemon={pokemon} evs={evs} nature={nature} />
              </div>
            </div>

            <div className="after-dex-row">
              <div className="equal-panel">
                <EffortEditor evs={evs} nature={nature} onChange={onEvChange} onNatureChange={onNatureChange} />
              </div>
              <div className="equal-panel">
                <h4>実数値</h4>
                <PresetStatsTable pokemon={pokemon} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  const [viewMode, setViewMode] = useState('damage');
  const [query, setQuery] = useState('カイリュー');
  const [defenderQuery, setDefenderQuery] = useState('ディンルー');

  const [attackCandidates, setAttackCandidates] = useState([]);
  const [defenseCandidates, setDefenseCandidates] = useState([]);

  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [moves, setMoves] = useState([]);
  const [selectedMoveId, setSelectedMoveId] = useState('');
  const [damage, setDamage] = useState(null);
  const [schema, setSchema] = useState([]);

  const [attackerEvs, setAttackerEvs] = useState(EMPTY_EVS);
  const [defenderEvs, setDefenderEvs] = useState(EMPTY_EVS);
  const [attackerNature, setAttackerNature] = useState(DEFAULT_NATURE);
  const [defenderNature, setDefenderNature] = useState(DEFAULT_NATURE);
  const [attackerSpeedStage, setAttackerSpeedStage] = useState(0);
  const [defenderSpeedStage, setDefenderSpeedStage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedMove = useMemo(
    () => moves.find((move) => move.move_id === selectedMoveId) || null,
    [moves, selectedMoveId]
  );

  const displayMoves = useMemo(() => {
    const indexByType = new Map(TYPE_ORDER.map((type, index) => [type, index]));

    return [...moves].sort((left, right) => {
      const leftType = indexByType.get(left.move_type_name) ?? 999;
      const rightType = indexByType.get(right.move_type_name) ?? 999;

      if (leftType !== rightType) {
        return leftType - rightType;
      }

      const leftTeraburst = left.move_name === 'テラバースト';
      const rightTeraburst = right.move_name === 'テラバースト';

      if (leftTeraburst !== rightTeraburst) {
        return leftTeraburst ? 1 : -1;
      }

      return left.move_name.localeCompare(right.move_name, 'ja');
    });
  }, [moves]);

  useEffect(() => {
    void fetchSchema();
    void searchAttacker('カイリュー');
    void searchDefender('ディンルー');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (viewMode !== 'damage') {
      return;
    }

    if (!attacker || !defender || !selectedMoveId) {
      setDamage(null);
      return;
    }

    void previewDamage();
  }, [viewMode, attacker, defender, selectedMoveId, attackerEvs, defenderEvs]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateAttackerEv(statKey, value) {
    setAttackerEvs((prev) => ({ ...prev, [statKey]: value }));
  }

  function updateDefenderEv(statKey, value) {
    setDefenderEvs((prev) => ({ ...prev, [statKey]: value }));
  }

  function updateAttackerNature(statKey, value) {
    setAttackerNature((prev) => ({ ...prev, [statKey]: value }));
  }

  function updateDefenderNature(statKey, value) {
    setDefenderNature((prev) => ({ ...prev, [statKey]: value }));
  }

  async function fetchSchema() {
    try {
      const response = await fetch(`${API_BASE}/schema`);
      const json = await response.json();
      setSchema(json.tables || []);
    } catch (fetchError) {
      setError(`スキーマ取得に失敗: ${fetchError.message}`);
    }
  }

  async function searchAttacker(keyword = query) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/pokemon?q=${encodeURIComponent(keyword)}`);
      const json = await response.json();
      const items = json.items || [];
      setAttackCandidates(items);

      if (items.length > 0) {
        await selectAttacker(items[0].pokemon_id);
      }
    } catch (fetchError) {
      setError(`攻撃側ポケモン検索に失敗: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function searchDefender(keyword = defenderQuery) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/pokemon?q=${encodeURIComponent(keyword)}`);
      const json = await response.json();
      const items = json.items || [];
      setDefenseCandidates(items);

      if (items.length > 0) {
        await selectDefender(items[0].pokemon_id);
      }
    } catch (fetchError) {
      setError(`受け側ポケモン検索に失敗: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function selectAttacker(pokemonId) {
    try {
      const [pokemonRes, movesRes] = await Promise.all([
        fetch(`${API_BASE}/pokemon/${pokemonId}`),
        fetch(`${API_BASE}/pokemon/${pokemonId}/moves`)
      ]);

      const pokemonJson = await pokemonRes.json();
      const movesJson = await movesRes.json();

      setAttacker(pokemonJson);
      setMoves(movesJson.items || []);
      setAttackerEvs(EMPTY_EVS);
      setAttackerNature(DEFAULT_NATURE);
      setAttackerSpeedStage(0);

      if ((movesJson.items || []).length > 0) {
        setSelectedMoveId(movesJson.items[0].move_id);
      }
    } catch (fetchError) {
      setError(`攻撃側詳細取得に失敗: ${fetchError.message}`);
    }
  }

  async function selectDefender(pokemonId) {
    try {
      const response = await fetch(`${API_BASE}/pokemon/${pokemonId}`);
      const json = await response.json();
      setDefender(json);
      setDefenderEvs(EMPTY_EVS);
      setDefenderNature(DEFAULT_NATURE);
      setDefenderSpeedStage(0);
    } catch (fetchError) {
      setError(`受け側詳細取得に失敗: ${fetchError.message}`);
    }
  }

  async function previewDamage() {
    try {
      const response = await fetch(`${API_BASE}/damage/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attackerId: attacker.pokemon_id,
          defenderId: defender.pokemon_id,
          moveId: selectedMoveId,
          attackerEv: attackerEvs,
          defenderEv: defenderEvs
        })
      });
      const json = await response.json();
      setDamage(json.result || null);
    } catch (fetchError) {
      setError(`ダメージ計算に失敗: ${fetchError.message}`);
    }
  }

  const attackerSpeed = attacker
    ? effectiveStat(attacker.speed, attackerEvs.speed, false, attackerNature.speed)
    : null;
  const defenderSpeed = defender
    ? effectiveStat(defender.speed, defenderEvs.speed, false, defenderNature.speed)
    : null;
  const boostedAttackerSpeed = attackerSpeed !== null ? boostedSpeedValue(attackerSpeed, attackerSpeedStage) : null;
  const boostedDefenderSpeed = defenderSpeed !== null ? boostedSpeedValue(defenderSpeed, defenderSpeedStage) : null;

  return (
    <div className="app-shell">
      <header className="title-row">
        <h1>ポケモン対戦情報サイト</h1>
        <p>努力値変更に応じて数値とグラフを即時更新</p>

        <div className="mode-switch">
          <button
            className={viewMode === 'speed' ? 'mode-button active' : 'mode-button'}
            onClick={() => setViewMode('speed')}
          >
            素早さ比較
          </button>
          <button
            className={viewMode === 'damage' ? 'mode-button active' : 'mode-button'}
            onClick={() => setViewMode('damage')}
          >
            ダメージ計算
          </button>
        </div>
      </header>

      {viewMode === 'damage' ? (
        <main className="four-grid">
          <PokemonSearchCard
            title="ポケモン検索"
            query={query}
            setQuery={setQuery}
            onSearch={() => void searchAttacker()}
            candidates={attackCandidates}
            onSelect={(pokemonId) => void selectAttacker(pokemonId)}
            pokemon={attacker}
            evs={attackerEvs}
            nature={attackerNature}
            onEvChange={updateAttackerEv}
            onNatureChange={updateAttackerNature}
            chartTitle="種族値グラフ 攻撃側"
          />

          <section className="card">
            <h2>覚える技</h2>
            <table>
              <thead>
                <tr>
                  <th>技名</th>
                  <th>タイプ</th>
                  <th>威力</th>
                  <th>分類</th>
                  <th>効果</th>
                </tr>
              </thead>
              <tbody>
                {displayMoves.map((move) => (
                  <tr
                    key={move.move_id}
                    className={move.move_id === selectedMoveId ? 'selected-row' : ''}
                    onClick={() => setSelectedMoveId(move.move_id)}
                  >
                    <td>{move.move_name}</td>
                    <td>{move.move_type_name}</td>
                    <td>{move.power}</td>
                    <td>{categoryLabel(move.category)}</td>
                    <td>{move.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>攻撃側</h2>
            <p>選択技: {selectedMove ? `${selectedMove.move_name} (${selectedMove.power})` : '未選択'}</p>
            <p>タイプ: {selectedMove ? selectedMove.move_type_name : '-'}</p>
            <p>分類: {selectedMove ? categoryLabel(selectedMove.category) : '-'}</p>
            <p>効果: {selectedMove ? selectedMove.effect : '-'}</p>

            <h3>DB設計テーブル</h3>
            <ul className="schema-list">
              {schema.map((row) => (
                <li key={row.physical}>{row.physical} - {row.logical}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>受け側</h2>
            <div className="search-row">
              <input
                value={defenderQuery}
                onChange={(event) => setDefenderQuery(event.target.value)}
                placeholder="防御側ポケモン名"
              />
              <button onClick={() => void searchDefender()}>検索</button>
            </div>
            <div className="candidate-list">
              {defenseCandidates.map((candidate) => (
                <button key={candidate.pokemon_id} onClick={() => void selectDefender(candidate.pokemon_id)}>
                  #{candidate.pokemon_id} {candidate.pokemon_name}
                </button>
              ))}
            </div>

            {defender && (
              <div className="info-block">
                <div className="name-with-dex">
                  <h3>{defender.pokemon_name}</h3>
                  <DexNumberRow pokemon={defender} />
                </div>
                <p>タイプ: {sortTypesByOrder(defender.types).map((type) => type.type_name).join(' / ')}</p>
                <p>特性: {defender.abilities.map((ability) => ability.ability_name).join(' / ') || '-'}</p>

                <div className="after-dex-layout">
                  <div className="after-dex-row">
                    <div className="equal-panel">
                      <BaseStatsTable pokemon={defender} evs={defenderEvs} nature={defenderNature} />
                    </div>
                    <div className="equal-panel">
                      <RadarChart title="種族値グラフ 受け側" pokemon={defender} evs={defenderEvs} nature={defenderNature} />
                    </div>
                  </div>

                  <div className="after-dex-row">
                    <div className="equal-panel">
                      <EffortEditor
                        evs={defenderEvs}
                        nature={defenderNature}
                        onChange={updateDefenderEv}
                        onNatureChange={updateDefenderNature}
                      />
                    </div>
                    <div className="equal-panel">
                      <h4>実数値</h4>
                      <PresetStatsTable pokemon={defender} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {damage && (
              <div className="damage-box">
                <p>最小: {damage.min_percent}%</p>
                <p>期待値: {damage.expected_percent}%</p>
                <p>最大: {damage.max_percent}%</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="speed-mode-grid">
          <PokemonSearchCard
            title="比較A"
            query={query}
            setQuery={setQuery}
            onSearch={() => void searchAttacker()}
            candidates={attackCandidates}
            onSelect={(pokemonId) => void selectAttacker(pokemonId)}
            pokemon={attacker}
            evs={attackerEvs}
            nature={attackerNature}
            onEvChange={updateAttackerEv}
            onNatureChange={updateAttackerNature}
            chartTitle="種族値グラフ 比較A"
          />

          <PokemonSearchCard
            title="比較B"
            query={defenderQuery}
            setQuery={setDefenderQuery}
            onSearch={() => void searchDefender()}
            candidates={defenseCandidates}
            onSelect={(pokemonId) => void selectDefender(pokemonId)}
            pokemon={defender}
            evs={defenderEvs}
            nature={defenderNature}
            onEvChange={updateDefenderEv}
            onNatureChange={updateDefenderNature}
            chartTitle="種族値グラフ 比較B"
          />

          <section className="card speed-summary">
            <h2>素早さ比較結果</h2>
            <div className="stage-row">
              <span>{attacker ? attacker.pokemon_name : '比較A'} 段階</span>
              <select value={attackerSpeedStage} onChange={(event) => setAttackerSpeedStage(Number(event.target.value))}>
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => (
                  <option key={`a-${stage}`} value={stage}>
                    +{stage} ({SPEED_STAGE_MULTIPLIER[stage]})
                  </option>
                ))}
              </select>
            </div>
            <div className="stage-row">
              <span>{defender ? defender.pokemon_name : '比較B'} 段階</span>
              <select value={defenderSpeedStage} onChange={(event) => setDefenderSpeedStage(Number(event.target.value))}>
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => (
                  <option key={`d-${stage}`} value={stage}>
                    +{stage} ({SPEED_STAGE_MULTIPLIER[stage]})
                  </option>
                ))}
              </select>
            </div>

            <p>{attacker ? `${attacker.pokemon_name}: ${attackerSpeed} → ${boostedAttackerSpeed}` : '比較A未選択'}</p>
            <p>{defender ? `${defender.pokemon_name}: ${defenderSpeed} → ${boostedDefenderSpeed}` : '比較B未選択'}</p>
            {boostedAttackerSpeed !== null && boostedDefenderSpeed !== null && (
              <p>
                {boostedAttackerSpeed === boostedDefenderSpeed
                  ? '同速です'
                  : boostedAttackerSpeed > boostedDefenderSpeed
                    ? `${attacker.pokemon_name} が先手`
                    : `${defender.pokemon_name} が先手`}
              </p>
            )}
          </section>
        </main>
      )}

      {(loading || error) && (
        <footer className="status-row">{loading ? '読み込み中...' : error}</footer>
      )}
    </div>
  );
}

export default App;

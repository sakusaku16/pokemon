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

function clampEv(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(252, Math.floor(parsed)));
}

function effectiveStat(baseStat, ev) {
  return baseStat + Math.floor(clampEv(ev) / 8);
}

function calcPresetStat(baseStat, statKey, preset) {
  const isHp = statKey === 'hp';

  if (preset === 'max') {
    return isHp
      ? effectiveStat(baseStat, 252)
      : Math.floor(effectiveStat(baseStat, 252) * 1.1);
  }

  if (preset === 'mid') {
    return effectiveStat(baseStat, 252);
  }

  if (preset === 'base') {
    return effectiveStat(baseStat, 0);
  }

  return isHp ? effectiveStat(baseStat, 0) : Math.floor(effectiveStat(baseStat, 0) * 0.9);
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
          <th>最速</th>
          <th>準速</th>
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

function BaseStatsTable({ pokemon }) {
  return (
    <table>
      <thead>
        <tr>
          <th>能力</th>
          <th>種族値(不変)</th>
        </tr>
      </thead>
      <tbody>
        {STAT_ROWS.map((row) => (
          <tr key={row.key}>
            <td>{row.label}</td>
            <td>{pokemon[row.key]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RadarChart({ title, pokemon, evs }) {
  if (!pokemon) {
    return null;
  }

  const center = 110;
  const radius = 80;
  const maxStat = 220;

  const points = STAT_ROWS.map((row, index) => {
    const angle = ((Math.PI * 2) / 6) * index - Math.PI / 2;
    const value = effectiveStat(pokemon[row.key], evs[row.key]);
    const ratio = Math.max(0.15, Math.min(1, value / maxStat));

    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
      labelX: center + Math.cos(angle) * (radius + 16),
      labelY: center + Math.sin(angle) * (radius + 16),
      label: row.label,
      value
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="radar-wrap">
      <h4>{title}</h4>
      <svg viewBox="0 0 220 220" className="radar-svg" role="img" aria-label={`${title}レーダーチャート`}>
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const ring = STAT_ROWS.map((_, index) => {
            const angle = ((Math.PI * 2) / 6) * index - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
          }).join(' ');

          return <polygon key={scale} points={ring} className="radar-ring" />;
        })}

        {points.map((point) => (
          <line key={point.label} x1={center} y1={center} x2={point.labelX} y2={point.labelY} className="radar-axis" />
        ))}

        <polygon points={polygon} className="radar-shape" />

        {points.map((point) => (
          <text key={`${point.label}-text`} x={point.labelX} y={point.labelY} className="radar-text" textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>
      <div className="radar-legend">
        {points.map((point) => (
          <span key={`${point.label}-value`}>{point.label}:{point.value}</span>
        ))}
      </div>
    </div>
  );
}

function EffortEditor({ evs, onChange }) {
  const total = Object.values(evs).reduce((sum, value) => sum + value, 0);

  return (
    <div className="ev-editor">
      <h4>努力値振り (合計 {total})</h4>
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
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
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
    if (!attacker || !defender || !selectedMoveId) {
      setDamage(null);
      return;
    }

    void previewDamage();
  }, [attacker, defender, selectedMoveId, attackerEvs, defenderEvs]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateAttackerEv(statKey, value) {
    setAttackerEvs((prev) => ({ ...prev, [statKey]: value }));
  }

  function updateDefenderEv(statKey, value) {
    setDefenderEvs((prev) => ({ ...prev, [statKey]: value }));
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
      setError(`防御側ポケモン検索に失敗: ${fetchError.message}`);
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
    } catch (fetchError) {
      setError(`防御側詳細取得に失敗: ${fetchError.message}`);
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

  return (
    <div className="app-shell">
      <header className="title-row">
        <h1>ポケモン対戦情報サイト</h1>
        <p>努力値変更に応じて数値とグラフを即時更新</p>
      </header>

      <main className="four-grid">
        <section className="card">
          <h2>ポケモン検索</h2>
          <div className="search-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="攻撃側ポケモン名" />
            <button onClick={() => void searchAttacker()}>検索</button>
          </div>
          <div className="candidate-list">
            {attackCandidates.map((pokemon) => (
              <button key={pokemon.pokemon_id} onClick={() => void selectAttacker(pokemon.pokemon_id)}>
                #{pokemon.pokemon_id} {pokemon.pokemon_name}
              </button>
            ))}
          </div>

          {attacker && (
            <div className="info-block">
              <h3>{attacker.pokemon_name} (全国図鑑 #{attacker.pokemon_id})</h3>
              <p>タイプ: {sortTypesByOrder(attacker.types).map((type) => type.type_name).join(' / ')}</p>
              <p>特性: {attacker.abilities.map((ability) => ability.ability_name).join(' / ') || '-'}</p>

              <div className="vertical-list">
                <strong>地方図鑑番号</strong>
                {attacker.dex_numbers.map((entry) => (
                  <span key={`${entry.region_id}-${entry.dex_no}`}>{entry.region_name}: {entry.dex_no}</span>
                ))}
              </div>

              <div className="after-dex-grid">
                <div className="after-dex-column">
                  <BaseStatsTable pokemon={attacker} />
                  <RadarChart title="種族値グラフ(攻撃側)" pokemon={attacker} evs={attackerEvs} />
                </div>

                <div className="after-dex-column">
                  <EffortEditor evs={attackerEvs} onChange={updateAttackerEv} />
                  <PresetStatsTable pokemon={attacker} />
                </div>
              </div>
            </div>
          )}
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
            {defenseCandidates.map((pokemon) => (
              <button key={pokemon.pokemon_id} onClick={() => void selectDefender(pokemon.pokemon_id)}>
                #{pokemon.pokemon_id} {pokemon.pokemon_name}
              </button>
            ))}
          </div>

          {defender && (
            <div className="info-block">
              <h3>{defender.pokemon_name} (全国図鑑 #{defender.pokemon_id})</h3>
              <p>タイプ: {sortTypesByOrder(defender.types).map((type) => type.type_name).join(' / ')}</p>
              <p>特性: {defender.abilities.map((ability) => ability.ability_name).join(' / ') || '-'}</p>

              <div className="vertical-list">
                <strong>地方図鑑番号</strong>
                {defender.dex_numbers.map((entry) => (
                  <span key={`${entry.region_id}-${entry.dex_no}`}>{entry.region_name}: {entry.dex_no}</span>
                ))}
              </div>

              <div className="after-dex-grid">
                <div className="after-dex-column">
                  <BaseStatsTable pokemon={defender} />
                  <RadarChart title="種族値グラフ(受け側)" pokemon={defender} evs={defenderEvs} />
                </div>

                <div className="after-dex-column">
                  <EffortEditor evs={defenderEvs} onChange={updateDefenderEv} />
                  <PresetStatsTable pokemon={defender} />
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

      {(loading || error) && (
        <footer className="status-row">
          {loading ? '読み込み中...' : error}
        </footer>
      )}
    </div>
  );
}

export default App;

import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:4000/api/v1';

const speedPresets = [
  { id: 'max', label: '最速', multiplier: 1.15 },
  { id: 'mid', label: '準速', multiplier: 1.05 },
  { id: 'base', label: '無振り', multiplier: 1.0 },
  { id: 'down', label: '下降', multiplier: 0.9 }
];

function calcSpeed(baseSpeed, multiplier) {
  return Math.floor(baseSpeed * multiplier);
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
  const [speedPreset, setSpeedPreset] = useState('max');
  const [damage, setDamage] = useState(null);
  const [schema, setSchema] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedMove = useMemo(
    () => moves.find((move) => move.move_id === selectedMoveId) || null,
    [moves, selectedMoveId]
  );

  // 初期表示時に固定キーワードでロードする仕様のため、依存配列は空に固定。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void fetchSchema();
    void searchAttacker('カイリュー');
    void searchDefender('ディンルー');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 攻撃側・防御側・技・努力値プリセット変更時に再計算。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!attacker || !defender || !selectedMoveId) {
      setDamage(null);
      return;
    }

    void previewDamage();
  }, [attacker, defender, selectedMoveId, speedPreset]); // eslint-disable-line react-hooks/exhaustive-deps

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
          speedPreset
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
        <p>構成シート以降（機能/UI/DB設計）反映版</p>
      </header>

      <main className="four-grid">
        <section className="card">
          <h2>左上: ポケモン検索・基礎情報</h2>
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
              <p>タイプ: {attacker.types.map((type) => type.type_name).join(' / ')}</p>
              <p>特性: {attacker.abilities.map((ability) => ability.ability_name).join(' / ') || '-'}</p>
              <p>
                地方図鑑:{' '}
                {attacker.dex_numbers.map((entry) => `${entry.region_name}:${entry.dex_no}`).join(' / ') || '-'}
              </p>

              <table>
                <thead>
                  <tr>
                    <th>能力</th>
                    <th>数値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>HP</td><td>{attacker.hp}</td></tr>
                  <tr><td>攻撃</td><td>{attacker.attack}</td></tr>
                  <tr><td>防御</td><td>{attacker.defense}</td></tr>
                  <tr><td>特攻</td><td>{attacker.sp_attack}</td></tr>
                  <tr><td>特防</td><td>{attacker.sp_defense}</td></tr>
                  <tr><td>素早さ</td><td>{attacker.speed}</td></tr>
                </tbody>
              </table>

              <div className="speed-row">
                {speedPresets.map((preset) => (
                  <span key={preset.id}>{preset.label}:{calcSpeed(attacker.speed, preset.multiplier)}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2>右上: 攻撃側設定</h2>
          <div className="preset-row">
            {speedPresets.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                className={speedPreset === preset.id ? 'active' : ''}
                onClick={() => setSpeedPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p>選択技: {selectedMove ? `${selectedMove.move_name} (${selectedMove.power})` : '未選択'}</p>
          <p>カテゴリ: {selectedMove ? selectedMove.category : '-'}</p>
          <p>効果: {selectedMove ? selectedMove.effect : '-'}</p>

          <h3>DB設計テーブル</h3>
          <ul className="schema-list">
            {schema.map((row) => (
              <li key={row.physical}>{row.physical} - {row.logical}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>左下: 覚える技</h2>
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
              {moves.map((move) => (
                <tr
                  key={move.move_id}
                  className={move.move_id === selectedMoveId ? 'selected-row' : ''}
                  onClick={() => setSelectedMoveId(move.move_id)}
                >
                  <td>{move.move_name}</td>
                  <td>{move.move_type_name}</td>
                  <td>{move.power}</td>
                  <td>{move.category}</td>
                  <td>{move.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>右下: ダメージ計算</h2>
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
              <h3>{defender.pokemon_name}</h3>
              <p>タイプ: {defender.types.map((type) => type.type_name).join(' / ')}</p>
              <p>HP: {defender.hp} / 防御: {defender.defense} / 特防: {defender.sp_defense}</p>
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

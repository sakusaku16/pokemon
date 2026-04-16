import React from 'react';
import './App.css';

const metaOverview = [
  {
    title: '環境速度',
    value: '中速寄り',
    detail: '素早さ80-110帯の打ち合いが増えやすい構造'
  },
  {
    title: '勝ち筋の主流',
    value: '対面 + 終盤一貫',
    detail: '削りとステロ展開から終盤の高火力技を通す形'
  },
  {
    title: '要注意ギミック',
    value: '積み + 先制技',
    detail: '1ターンの隙を作るとそのまま抜かれやすい'
  }
];

const featuredPokemon = [
  {
    name: 'カイリュー',
    role: 'スイーパー / 先制圧力',
    why: 'マルチスケイルから行動保証を取りやすく、終盤性能が高い。',
    tips: 'ステルスロック対策としてはがね or みず受けと並べる。'
  },
  {
    name: 'サーフゴー',
    role: '崩し / 補助対策',
    why: '補助技無効の圧力で盤面を荒らし、選出を縛りやすい。',
    tips: '地面の一貫を切るためにふゆう持ちや飛行枠と同時採用。'
  },
  {
    name: 'ディンルー',
    role: '起点作成 / クッション',
    why: '高耐久で行動回数を確保し、展開の起点を作りやすい。',
    tips: '受け回しすぎると崩しに弱いので、明確な打点枠を1体入れる。'
  },
  {
    name: 'ハバタクカミ',
    role: '高速アタッカー',
    why: '高い素早さと一致打点で対面性能が非常に高い。',
    tips: '先制技圏内に入らないよう、削り管理を徹底する。'
  }
];

const roleGuides = [
  {
    role: '先発枠',
    summary: '初手で有利対面を作る枠',
    checklist: ['行動保証を持つか', '対面不利でも仕事が残るか', '相手の展開を遅らせられるか']
  },
  {
    role: 'クッション枠',
    summary: '引き先として盤面を安定させる枠',
    checklist: ['受け出し可能範囲が明確か', '回復 or 被ダメ抑制があるか', '崩しへの返し技を持つか']
  },
  {
    role: '崩し枠',
    summary: '相手の受けサイクルを壊す枠',
    checklist: ['受け駒に通る打点があるか', '交代読みの択があるか', '終盤の詰め筋と両立できるか']
  },
  {
    role: 'フィニッシャー枠',
    summary: '終盤に全抜きを狙う枠',
    checklist: ['先制技耐性 or 先制技持ちか', '素早さラインを満たすか', '削りサポートと噛み合うか']
  }
];

const pickTemplates = [
  {
    title: '対面寄りテンプレ',
    picks: '先発: 起点作成 / 中盤: 高速打点 / 終盤: 神速 or スカーフ',
    usage: '3ターン目までに相手の受け駒を削り、終盤の一貫を作る。'
  },
  {
    title: 'サイクル寄りテンプレ',
    picks: '先発: クッション / 中盤: 交代戦で有利交換 / 終盤: 積みエース',
    usage: '相手のテラスタル先出しを誘って、最後に積み技を通す。'
  },
  {
    title: '展開寄りテンプレ',
    picks: '先発: ステロ + 退場 / 中盤: 崩し / 終盤: 全抜きエース',
    usage: '序盤で定数ダメージを入れ、終盤の技範囲で勝ち切る。'
  }
];

const preBattleChecks = [
  '相手の最速枠より1段階上の素早さラインを意識する',
  '先制技の打点で落ちるHP帯に入っていないか確認する',
  'テラスタルの攻守どちらを切るかを事前に決める',
  '受け出し不能な相手に対する最低1つの回答を用意する'
];

function App() {
  return (
    <div className="site-shell">
      <header className="hero">
        <p className="hero-kicker">Pokemon Battle Hub</p>
        <h1>ポケモン対戦情報サイト</h1>
        <p className="hero-text">
          ランク対戦で勝率を上げるための情報を、1画面で確認できる実戦向けダッシュボード。
        </p>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>環境概要</h2>
          <div className="overview-cards">
            {metaOverview.map((item) => (
              <article key={item.title} className="overview-card">
                <p className="meta-label">{item.title}</p>
                <p className="meta-value">{item.value}</p>
                <p className="meta-detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>注目ポケモン</h2>
          <div className="pokemon-list">
            {featuredPokemon.map((pokemon) => (
              <article key={pokemon.name} className="pokemon-card">
                <div className="pokemon-title-row">
                  <h3>{pokemon.name}</h3>
                  <span>{pokemon.role}</span>
                </div>
                <p>{pokemon.why}</p>
                <p className="tips">構築メモ: {pokemon.tips}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>役割別の早見表</h2>
          <div className="role-grid">
            {roleGuides.map((guide) => (
              <article key={guide.role} className="role-card">
                <h3>{guide.role}</h3>
                <p>{guide.summary}</p>
                <ul>
                  {guide.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel two-column">
          <div>
            <h2>選出テンプレ</h2>
            <div className="template-list">
              {pickTemplates.map((template) => (
                <article key={template.title} className="template-card">
                  <h3>{template.title}</h3>
                  <p className="line">{template.picks}</p>
                  <p>{template.usage}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="check-panel">
            <h2>対戦前チェック</h2>
            <ol>
              {preBattleChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ol>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <p>更新しやすいように、データは `App.js` の配列で管理しています。</p>
      </footer>
    </div>
  );
}

export default App;

import { useEffect } from "react";
import { startGame } from "../game/startGame";

export function App() {
  useEffect(() => {
    const game = startGame("game-root");
    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="game-masthead" aria-label="游戏标题">
        <p className="eyebrow">GLEANINGS / ACT 01</p>
        <h1>
          拾遗 <span>· 开坛</span>
        </h1>
        <p className="chapter-note">福建老酒 · 一段被封在坛里的家书</p>
      </header>

      <section className="stage-wrap" aria-label="第一幕游戏画面">
        <div className="corner-mark corner-mark--top" aria-hidden="true" />
        <div id="game-root" className="game-frame" data-testid="game-root" />
        <div className="corner-mark corner-mark--bottom" aria-hidden="true" />
      </section>

      <footer className="controls-note">
        <span>移动 WASD / 方向键</span>
        <span>交互 E / 空格</span>
        <span>背包 I</span>
      </footer>
    </main>
  );
}

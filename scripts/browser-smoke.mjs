// Smoke test real do Phaser no Chromium (GitHub Actions).
// Executar após instalar Playwright: node scripts/browser-smoke.mjs
// Não substitui avaliação visual humana, gameplay dos dez biomas ou benchmark.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const url = 'http://127.0.0.1:4173/';
const artifacts = 'artifacts/browser-smoke';
mkdirSync(artifacts, { recursive: true });

const server = spawn(process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', b => process.stdout.write('[vite] ' + b));
server.stderr.on('data', b => process.stderr.write('[vite] ' + b));

let browser;
try {
  let online = false;
  for (let retry = 0; retry < 90; retry++) {
    if (server.exitCode !== null) throw new Error('Vite encerrou antes de iniciar');
    try {
      const response = await fetch(url);
      if (response.ok) { online = true; break; }
    } catch { /* servidor ainda iniciando */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.equal(online, true, 'Servidor Vite não respondeu dentro do limite');

  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle',
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => Boolean(window.__ABISMO_GAME__?.scene?.isActive('MainMenuScene')),
    null, { timeout: 120000 });
  assert.equal(await page.locator('#game-container canvas').count(), 1,
    'Canvas de Phaser ausente no menu');
  await page.screenshot({ path: `${artifacts}/menu.png`, timeout: 20000 });
  console.log('BROWSER-SMOKE: MainMenuScene ativa; canvas renderizado');

  const box = await page.locator('#game-container canvas').boundingBox();
  assert.ok(box?.width > 0 && box?.height > 0, 'Canvas sem dimensões');
  // Botão Novo Jogo: (W/2, H*0.50) conforme MainMenuScene._buildButton.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
  await page.waitForFunction(
    () => Boolean(window.__ABISMO_GAME__?.scene?.isActive('GameScene') &&
      window.__ABISMO_GAME__.scene.getScene('GameScene').player?.active),
    null, { timeout: 60000 });

  const state = await page.evaluate(() => {
    const game = window.__ABISMO_GAME__;
    const scene = game.scene.getScene('GameScene');
    return {
      seed: scene.seed,
      biome: scene.areaData?.biome?.id,
      rooms: scene.areaData?.rooms?.length,
      enemies: scene._activeEnemies?.length,
      playerHP: scene.player?.hp,
      playerActive: scene.player?.active,
      hasKnight: game.textures.exists('player_idle_0'),
      hasBossArt: game.textures.exists('boss_senhor_das_cinzas'),
    };
  });
  assert.ok(state.playerActive && state.playerHP > 0, 'Jogador não inicializado');
  assert.ok(state.rooms >= 8 && state.biome, 'Área inicial inválida');
  assert.equal(state.hasKnight, true, 'Textura de cavaleiro ausente');
  assert.equal(state.hasBossArt, true, 'Textura de chefe ausente');

  await page.screenshot({ path: `${artifacts}/game.png`, timeout: 20000 });
  console.log('BROWSER-SMOKE: GameScene iniciada: ' + JSON.stringify(state));

  // Input real de teclado para abrir e fechar inventário.
  await page.keyboard.press('Tab');
  await page.waitForFunction(() =>
    window.__ABISMO_GAME__?.scene?.getScene('GameScene')?.inventoryUI?.visible === true,
    null, { timeout: 10000 });
  await page.screenshot({ path: `${artifacts}/inventario.png`, timeout: 20000 });
  await page.keyboard.press('Tab');
  await page.waitForFunction(() =>
    window.__ABISMO_GAME__?.scene?.getScene('GameScene')?.inventoryUI?.visible === false,
    null, { timeout: 10000 });
  console.log('BROWSER-SMOKE: Tab abre e fecha inventário');

  assert.deepEqual(errors, [], 'Erros JavaScript não tratados no navegador: ' + errors.join(' | '));
  console.log('BROWSER-SMOKE: PASSOU (menu, cena, texturas e inventário).');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

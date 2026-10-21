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
      cameraZoom: scene.cameras.main.zoom,
      hasKnight: game.textures.exists('player_idle_0'),
      hasBossArt: game.textures.exists('boss_senhor_das_cinzas'),
    };
  });
  assert.ok(state.playerActive && state.playerHP > 0, 'Jogador não inicializado');
  assert.ok(state.rooms >= 8 && state.biome, 'Área inicial inválida');
  assert.equal(state.cameraZoom, 1, 'Zoom da câmera corta o HUD e inventário');
  assert.equal(state.hasKnight, true, 'Textura de cavaleiro ausente');
  assert.equal(state.hasBossArt, true, 'Textura de chefe ausente');

  // GameScene faz fadeIn(800ms); capturar depois para não confundir
  // o efeito transitório com um defeito permanente de contraste.
  await page.waitForTimeout(1000);
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

  // Verificar descarte de projéteis ao atravessar uma porta válida.
  const beforeTransition = await page.evaluate(() => {
    const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
    const target = scene.areaData.connections.get(scene.currentRoomIndex)?.E;
    if (target === null || target === undefined) return null;
    scene._processPlayerSkill(scene.player, { damage: 10 });
    const before = scene._activeProjectiles.length;
    scene._transitionToRoom(target, 'E');
    return { target, before };
  });
  assert.ok(beforeTransition && beforeTransition.before > 0,
    'Não foi possível preparar projétil na primeira sala');
  await page.waitForFunction(
    target => {
      const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
      return scene.currentRoomIndex === target && !scene._isTransitioning;
    },
    beforeTransition.target, { timeout: 15000 });
  const projectilesAfter = await page.evaluate(() =>
    window.__ABISMO_GAME__.scene.getScene('GameScene')._activeProjectiles.length);
  assert.equal(projectilesAfter, 0, 'Projétil da sala anterior continuou ativo');
  console.log('BROWSER-SMOKE: transição de sala limpa projéteis antigos');

  // Morte real por dano, tela completa e clique real no botão renascer.
  await page.evaluate(() => {
    const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
    scene.player.takeDamage(scene.player.hp + 100);
  });
  await page.waitForFunction(
    () => (window.__ABISMO_GAME__.scene.getScene('GameScene')._deathScreenObjects?.length ?? 0) >= 7,
    null, { timeout: 15000 });
  // Capturar após a transição de fadeIn do modal, não durante tela preta.
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${artifacts}/morte.png`, timeout: 20000 });
  const deathOverlayCount = await page.evaluate(() =>
    window.__ABISMO_GAME__.scene.getScene('GameScene')._deathScreenObjects.length);
  assert.ok(deathOverlayCount >= 7);

  const deathBox = await page.locator('#game-container canvas').boundingBox();
  await page.mouse.click(deathBox.x + deathBox.width * 0.5,
    deathBox.y + deathBox.height * (400 / 720));
  await page.waitForFunction(() => {
    const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
    return scene.player?.active && !scene.player.isDead &&
      (scene._deathScreenObjects?.length ?? 0) === 0;
  }, null, { timeout: 15000 });
  const afterRespawn = await page.evaluate(() => {
    const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
    return { room: scene.currentRoomIndex, hp: scene.player.hp,
      objects: scene._deathScreenObjects?.length ?? 0,
      hasDeathOrb: scene.xpSystem.hasLostXP };
  });
  assert.ok(afterRespawn.hp > 0 && afterRespawn.hasDeathOrb,
    'Renascimento perdeu estado da orbe ou não recuperou HP');
  // O renascimento faz fadeIn(600ms); capturar o quadro estabilizado.
  await page.waitForTimeout(750);
  await page.screenshot({ path: `${artifacts}/respawn.png`, timeout: 20000 });
  console.log('BROWSER-SMOKE: morte, overlay e respawn: ' + JSON.stringify(afterRespawn));

  // Persistência real via IndexedDB, sem mock.
  const saved = await page.evaluate(async () => {
    const scene = window.__ABISMO_GAME__.scene.getScene('GameScene');
    await scene._autosave();
    const state = await scene._saveSystem.load(scene._saveSlot);
    return { seed: state?.seed, room: state?.currentRoom,
      lostXpRoom: state?.xp?.deathRoomIndex };
  });
  assert.equal(saved.seed, state.seed, 'Seed mudou durante o save');
  assert.equal(saved.room, afterRespawn.room, 'Sala divergente no IndexedDB');
  assert.ok(saved.lostXpRoom !== null && saved.lostXpRoom !== undefined);
  console.log('BROWSER-SMOKE: IndexedDB salvou e leu estado da partida');

  assert.deepEqual(errors, [], 'Erros JavaScript não tratados no navegador: ' + errors.join(' | '));
  console.log('BROWSER-SMOKE: PASSOU (menu, cena, texturas e inventário).');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

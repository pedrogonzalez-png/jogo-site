// ============================================================
// ascii/TextureBootManager.js
// Orquestrador que pré-renderiza a biblioteca ASCII de alta densidade
// em texturas WebGL do Phaser durante o BootScene.
// ============================================================
import { AsciiRenderer } from './AsciiRenderer.js';
import { KNIGHT_FRAMES, getReferenceKnightCells } from './KnightArt.js';
import { ENEMY_ART } from './EnemyArt.js';
import { BOSS_ART } from './BossArt.js';
import { ENVIRONMENT_ART } from './EnvironmentArt.js';
import { LIQUIDS_AND_VFX } from './LiquidsAndVFXArt.js';
import { getBiomeSurface } from './BiomeSurfaceArt.js';
import { BIOME_ASCII_PALETTES, MATERIALS } from './AsciiPalette.js';

export class TextureBootManager {
  /**
   * Gera e registra todas as texturas ASCII de alta densidade no Phaser.
   * @param {Phaser.Scene} scene
   */
  static generateAllTextures(scene) {
    // ── 1. PROTAGONISTA (O Cavaleiro) ──────────────────────────
    // charWidth: 1.6, charHeight: 2.2, fontSize: 3.2 para sprite de ~48x62px
    const knightOpts = {
      charWidth: 1.8,
      charHeight: 2.4,
      fontSize: 3.2,
      fontFamily: '"Courier New", Consolas, monospace',
      bold: true,
    };

    AsciiRenderer.registerTexture(scene, 'player_idle_0', {
      lines: KNIGHT_FRAMES.idle_0.lines,
      palette: KNIGHT_FRAMES.idle_0.colorResolver,
      ...knightOpts,
    });

    AsciiRenderer.registerTexture(scene, 'player_idle_1', {
      lines: KNIGHT_FRAMES.idle_1.lines,
      palette: KNIGHT_FRAMES.idle_1.colorResolver,
      ...knightOpts,
    });

    AsciiRenderer.registerTexture(scene, 'player_walk_0', {
      lines: KNIGHT_FRAMES.walk_0.lines,
      palette: KNIGHT_FRAMES.walk_0.colorResolver,
      ...knightOpts,
    });

    AsciiRenderer.registerTexture(scene, 'player_walk_1', {
      lines: KNIGHT_FRAMES.walk_1.lines,
      palette: KNIGHT_FRAMES.walk_1.colorResolver,
      ...knightOpts,
    });

    AsciiRenderer.registerTexture(scene, 'player_attack_0', {
      lines: KNIGHT_FRAMES.attack_0.lines,
      palette: KNIGHT_FRAMES.attack_0.colorResolver,
      charWidth: 2.0,
      charHeight: 2.4,
      fontSize: 3.2,
    });

    AsciiRenderer.registerTexture(scene, 'player_block', {
      lines: KNIGHT_FRAMES.block.lines,
      palette: KNIGHT_FRAMES.block.colorResolver,
      ...knightOpts,
    });

    // Alias 'player' apontando para player_idle_0
    AsciiRenderer.registerTexture(scene, 'player', {
      lines: KNIGHT_FRAMES.idle_0.lines,
      palette: KNIGHT_FRAMES.idle_0.colorResolver,
      ...knightOpts,
    });

    // ── O Cavaleiro de Referência em Alta Resolução (Para HUD / Bestiário / Inspecionar) ──
    try {
      const refRle = getReferenceKnightCells();
      const coloredCells = AsciiRenderer.unpackRLE(refRle);
      AsciiRenderer.registerTexture(scene, 'reference_knight_master', {
        coloredCells,
        charWidth: 3.5,
        charHeight: 5.5,
        fontSize: 5,
      });
    } catch (err) {
      console.warn('Não foi possível carregar o cavaleiro de referência mestre:', err);
    }

    // ── 2. INIMIGOS ──────────────────────────────────────────
    const enemyOpts = {
      charWidth: 1.8,
      charHeight: 2.4,
      fontSize: 3.2,
      bold: true,
    };

    AsciiRenderer.registerTexture(scene, 'enemy_skeleton', {
      lines: ENEMY_ART.skeleton.lines,
      palette: ENEMY_ART.skeleton.colorResolver,
      ...enemyOpts,
    });

    AsciiRenderer.registerTexture(scene, 'enemy_beast', {
      lines: ENEMY_ART.beast.lines,
      palette: (ch, x, y) => ENEMY_ART.beast.colorResolver(ch, x, y, 'MAGMA'),
      ...enemyOpts,
    });

    AsciiRenderer.registerTexture(scene, 'enemy_guardian', {
      lines: ENEMY_ART.guardian.lines,
      palette: ENEMY_ART.guardian.colorResolver,
      charWidth: 2.0,
      charHeight: 2.6,
      fontSize: 3.5,
    });

    AsciiRenderer.registerTexture(scene, 'enemy_mage', {
      lines: ENEMY_ART.mage.lines,
      palette: (ch, x, y) => ENEMY_ART.mage.colorResolver(ch, x, y, 'MAGIC'),
      ...enemyOpts,
    });

    AsciiRenderer.registerTexture(scene, 'enemy_drowned', {
      lines: ENEMY_ART.drowned.lines,
      palette: ENEMY_ART.drowned.colorResolver,
      ...enemyOpts,
    });

    AsciiRenderer.registerTexture(scene, 'enemy_aberration', {
      lines: ENEMY_ART.aberration.lines,
      palette: ENEMY_ART.aberration.colorResolver,
      ...enemyOpts,
    });

    // Fallback 'enemy' aponta para o Esqueleto Desperto detalhado
    AsciiRenderer.registerTexture(scene, 'enemy', {
      lines: ENEMY_ART.skeleton.lines,
      palette: ENEMY_ART.skeleton.colorResolver,
      ...enemyOpts,
    });

    // ── 3. CHEFES (Todos os 10 chefes com escala épica) ──────
    const bossOpts = {
      charWidth: 2.2,
      charHeight: 2.8,
      fontSize: 3.8,
      bold: true,
    };

    for (const [bossKey, bossDef] of Object.entries(BOSS_ART)) {
      AsciiRenderer.registerTexture(scene, `boss_${bossKey}`, {
        lines: bossDef.lines,
        palette: (ch, x, y) => bossDef.colorResolver(ch, x, y, false),
        ...bossOpts,
      });

      // Fase 2 enfurecida
      AsciiRenderer.registerTexture(scene, `boss_${bossKey}_phase2`, {
        lines: bossDef.lines,
        palette: (ch, x, y) => bossDef.colorResolver(ch, x, y, true),
        ...bossOpts,
      });
    }

    // Fallback 'boss' aponta para o Senhor das Cinzas
    AsciiRenderer.registerTexture(scene, 'boss', {
      lines: BOSS_ART.senhor_das_cinzas.lines,
      palette: (ch, x, y) => BOSS_ART.senhor_das_cinzas.colorResolver(ch, x, y, false),
      ...bossOpts,
    });

    // ── 4. CENÁRIO & AMBIENTE (Tiles de 32x32 com 8x8 caracteres) ──
    const tileOpts = {
      charWidth: 4,
      charHeight: 4,
      fontSize: 5,
      bold: true,
      // Preto absoluto + glifos de 4px tornavam o chão quase invisível.
      // Base cinza escuro preserva a atmosfera sem apagar os materiais.
      bgColor: '#171920',
    };

    // Paredes e variantes
    AsciiRenderer.registerTexture(scene, 'tile_wall', {
      lines: ENVIRONMENT_ART.walls.solid_0.lines,
      palette: MATERIALS.STONE_ASH,
      ...tileOpts,
    });

    AsciiRenderer.registerTexture(scene, 'tile_wall_cracked', {
      lines: ENVIRONMENT_ART.walls.cracked_0.lines,
      palette: MATERIALS.STONE_ASH,
      ...tileOpts,
    });

    AsciiRenderer.registerTexture(scene, 'tile_wall_weathered', {
      lines: ENVIRONMENT_ART.walls.weathered_0.lines,
      palette: MATERIALS.STONE_ASH,
      ...tileOpts,
    });

    AsciiRenderer.registerTexture(scene, 'tile_wall_top', {
      lines: ENVIRONMENT_ART.walls.wall_top_0.lines,
      palette: MATERIALS.STONE_ASH,
      ...tileOpts,
    });

    // Chão e variantes
    AsciiRenderer.registerTexture(scene, 'tile_floor', {
      lines: ENVIRONMENT_ART.floors.flagstone_0.lines,
      palette: BIOME_ASCII_PALETTES.ARREDORES_CINZENTOS.floor,
      ...tileOpts,
    });

    AsciiRenderer.registerTexture(scene, 'tile_floor_cracked', {
      lines: ENVIRONMENT_ART.floors.flagstone_cracked.lines,
      palette: BIOME_ASCII_PALETTES.ARREDORES_CINZENTOS.floor,
      ...tileOpts,
    });

    AsciiRenderer.registerTexture(scene, 'tile_floor_debris', {
      lines: ENVIRONMENT_ART.floors.flagstone_debris.lines,
      palette: BIOME_ASCII_PALETTES.ARREDORES_CINZENTOS.floor,
      ...tileOpts,
    });

    // Obstáculo (Pilar entalhado)
    AsciiRenderer.registerTexture(scene, 'tile_obstacle', {
      lines: ENVIRONMENT_ART.pillar.lines,
      palette: (ch, x, y) => ENVIRONMENT_ART.pillar.colorResolver(ch, x, y, 'ARREDORES_CINZENTOS'),
      charWidth: 2.6,
      charHeight: 2.0,
      fontSize: 3.5,
    });

    // Porta monumental
    AsciiRenderer.registerTexture(scene, 'tile_door', {
      lines: ENVIRONMENT_ART.doors.closed.lines,
      palette: ENVIRONMENT_ART.doors.closed.colorResolver,
      charWidth: 2.0,
      charHeight: 2.0,
      fontSize: 3.0,
    });

    // Santuário sagrado
    AsciiRenderer.registerTexture(scene, 'tile_sanctuary', {
      lines: ENVIRONMENT_ART.sanctuary.lines,
      palette: ENVIRONMENT_ART.sanctuary.colorResolver,
      charWidth: 2.0,
      charHeight: 2.0,
      fontSize: 3.2,
    });

    // Baús fechado e aberto
    AsciiRenderer.registerTexture(scene, 'chest', {
      lines: ENVIRONMENT_ART.chest.closed.lines,
      palette: ENVIRONMENT_ART.chest.closed.colorResolver,
      charWidth: 2.0,
      charHeight: 2.2,
      fontSize: 3.2,
    });

    AsciiRenderer.registerTexture(scene, 'chest_open', {
      lines: ENVIRONMENT_ART.chest.open.lines,
      palette: ENVIRONMENT_ART.chest.open.colorResolver,
      charWidth: 2.0,
      charHeight: 2.2,
      fontSize: 3.2,
    });

    // ── 5. LÍQUIDOS VOLUMÉTRICOS (Aqueduto, Sangue, Magma) ──
    const liquidOpts = {
      charWidth: 2.0,
      charHeight: 2.0,
      fontSize: 3.0,
      bold: true,
      bgColor: '#000000',
    };

    AsciiRenderer.registerTexture(scene, 'water_frame_0', {
      lines: LIQUIDS_AND_VFX.water.frame_0,
      palette: LIQUIDS_AND_VFX.water.colorResolver,
      ...liquidOpts,
    });

    AsciiRenderer.registerTexture(scene, 'water_frame_1', {
      lines: LIQUIDS_AND_VFX.water.frame_1,
      palette: LIQUIDS_AND_VFX.water.colorResolver,
      ...liquidOpts,
    });

    AsciiRenderer.registerTexture(scene, 'water_frame_2', {
      lines: LIQUIDS_AND_VFX.water.frame_2,
      palette: LIQUIDS_AND_VFX.water.colorResolver,
      ...liquidOpts,
    });

    AsciiRenderer.registerTexture(scene, 'water_frame_3', {
      lines: LIQUIDS_AND_VFX.water.frame_3,
      palette: LIQUIDS_AND_VFX.water.colorResolver,
      ...liquidOpts,
    });

    AsciiRenderer.registerTexture(scene, 'liquid_blood', {
      lines: LIQUIDS_AND_VFX.blood.frame_0,
      palette: LIQUIDS_AND_VFX.blood.colorResolver,
      charWidth: 4,
      charHeight: 4,
      fontSize: 5,
      bgColor: '#000000',
    });

    AsciiRenderer.registerTexture(scene, 'liquid_magma', {
      lines: LIQUIDS_AND_VFX.magma.frame_0,
      palette: LIQUIDS_AND_VFX.magma.colorResolver,
      charWidth: 4,
      charHeight: 4,
      fontSize: 5,
      bgColor: '#000000',
    });

    // ── 6. EFEITOS DE COMBATE (Cortes e Impactos) ────────────
    AsciiRenderer.registerTexture(scene, 'vfx_slash_light', {
      lines: LIQUIDS_AND_VFX.slashArc.light.lines,
      palette: LIQUIDS_AND_VFX.slashArc.light.colorResolver,
      charWidth: 2.5,
      charHeight: 2.8,
      fontSize: 4,
    });

    AsciiRenderer.registerTexture(scene, 'vfx_slash_heavy', {
      lines: LIQUIDS_AND_VFX.slashArc.heavy.lines,
      palette: LIQUIDS_AND_VFX.slashArc.heavy.colorResolver,
      charWidth: 3.0,
      charHeight: 3.2,
      fontSize: 4.5,
    });

    AsciiRenderer.registerTexture(scene, 'vfx_impact_spark', {
      lines: LIQUIDS_AND_VFX.impactSpark.lines,
      palette: LIQUIDS_AND_VFX.impactSpark.colorResolver,
      charWidth: 2.4,
      charHeight: 2.4,
      fontSize: 3.5,
    });

    // ── 7. ARQUITETURA ASCII POR BIOMA ─────────────────────────
    // Não basta recolorir a mesma pedra: cada bioma recebe matrizes
    // próprias de pisos e paredes. Chaves antigas são preservadas.
    for (const [biomeKey, biomePalette] of Object.entries(BIOME_ASCII_PALETTES)) {
      const floors = {
        ...biomePalette.floor,
        '~': biomePalette.floor['='], // ondulações dos canais do Aqueduto
      };
      const walls = biomePalette.wall;

      AsciiRenderer.registerTexture(scene, `tile_wall_${biomeKey}`, {
        lines: getBiomeSurface(biomeKey, 'wall'),
        palette: walls,
        ...tileOpts,
      });

      AsciiRenderer.registerTexture(scene, `tile_wall_cracked_${biomeKey}`, {
        lines: getBiomeSurface(biomeKey, 'wall', 'cracked'),
        palette: walls,
        ...tileOpts,
      });

      AsciiRenderer.registerTexture(scene, `tile_floor_${biomeKey}`, {
        lines: getBiomeSurface(biomeKey, 'floor'),
        palette: floors,
        ...tileOpts,
      });

      AsciiRenderer.registerTexture(scene, `tile_floor_debris_${biomeKey}`, {
        lines: getBiomeSurface(biomeKey, 'floor', 'debris'),
        palette: floors,
        ...tileOpts,
      });
    }

    // ── 8. REGISTRO DE ANIMAÇÕES NO PHASER ────────────────────
    if (scene.anims) {
      if (!scene.anims.exists('player_idle')) {
        scene.anims.create({
          key: 'player_idle',
          frames: [
            { key: 'player_idle_0' },
            { key: 'player_idle_1' }
          ],
          frameRate: 2,
          repeat: -1,
        });
      }

      if (!scene.anims.exists('player_walk')) {
        scene.anims.create({
          key: 'player_walk',
          frames: [
            { key: 'player_walk_0' },
            { key: 'player_idle_0' },
            { key: 'player_walk_1' },
            { key: 'player_idle_1' }
          ],
          frameRate: 6,
          repeat: -1,
        });
      }

      if (!scene.anims.exists('water_flow')) {
        scene.anims.create({
          key: 'water_flow',
          frames: [
            { key: 'water_frame_0' },
            { key: 'water_frame_1' },
            { key: 'water_frame_2' },
            { key: 'water_frame_3' }
          ],
          frameRate: 3,
          repeat: -1,
        });
      }
    }
  }
}

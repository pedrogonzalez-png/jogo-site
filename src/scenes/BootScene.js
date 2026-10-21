// ============================================================
// scenes/BootScene.js
// Gera texturas programáticas em estilo ASCII art.
// Cada textura é um caractere monoespaçado renderizado via
// Graphics + Canvas, mantendo as mesmas chaves de textura.
// ============================================================
import Phaser from "phaser";
import { TextureBootManager } from "../ascii/TextureBootManager.js";

const TILE = 32;
const CHAR_SIZE = 28; // Tamanho da fonte para tiles
const ENTITY_SIZE = 28; // Tamanho da fonte para entidades

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this._createLoadingScreen();
  }

  create() {
    this._generateTextures();
    this.scene.start("MainMenuScene");
  }

  _createLoadingScreen() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

    const lines = [
      "  ▄▄▄       ▄▄▄▄·  ▪  .▄▄ · • ▌ ▄ ·.        ",
      " ▐█ ▀█     ▐█ ▀█▪ ██ ▐█ ▀. ·██ ▐███▪▪       ",
      " ▄█▀▀█     ▐█▀▀█▄ ▐█·▄▀▀▀█▄▐█ ▌▐▌▐█· ▄█▀▄  ",
      " ▐█ ▪▐▌    ██▄▪▐█ ▐█▌▐█▄▪▐███ ██▌▐█▌▐█▌.▐▌ ",
      "  ▀  ▀     ·▀▀▀▀  ▀▀▀ ▀▀▀▀ ▀▀  █▪▀▀▀ ▀█▄▀▪ ",
    ];

    lines.forEach((line, i) => {
      this.add
        .text(W / 2, H / 2 - 60 + i * 18, line, {
          fontFamily: '"Courier New", "Consolas", monospace',
          fontSize: "14px",
          color: "#664422",
        })
        .setOrigin(0.5);
    });

    this.add
      .text(W / 2, H / 2 + 40, "Carregando o Abismo...", {
        fontFamily: '"Courier New", "Consolas", monospace',
        fontSize: "16px",
        color: "#ffddaa",
      })
      .setOrigin(0.5);
  }

  _generateTextures() {
    // ── Geração da Biblioteca de Arte ASCII de Alta Densidade ──
    TextureBootManager.generateAllTextures(this);

    // ── Orbes e Portais adicionais ──
    this._genCharTexture("xporb",     "$", 14, 0xffcc00, 16, 16);
    this._genCharTexture("portal",    "Ω", 36, 0xcca7ff, 48, 48);
    this._genCharTexture("particle",  "·", 10, 0xffffff, 8, 8);
  }

  /**
   * Gera uma textura com um caractere ASCII centralizado.
   * Usado para entidades e objetos.
   */
  _genCharTexture(key, char, fontSize, color, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);
    ctx.font = `bold ${fontSize}px "Courier New", "Consolas", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Cor base em cinza claro para que setTint funcione corretamente
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    ctx.fillText(char, width / 2, height / 2);

    this.textures.addCanvas(key, canvas);
  }

  /**
   * Gera textura de tile com caractere ASCII no centro,
   * com fundo totalmente preto e grid lines sutis.
   */
  _genTileTexture(key, char, fontSize, color) {
    const canvas = document.createElement("canvas");
    canvas.width = TILE;
    canvas.height = TILE;
    const ctx = canvas.getContext("2d");

    // Fundo preto
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, TILE, TILE);

    // Caractere ASCII
    ctx.font = `${fontSize}px "Courier New", "Consolas", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    ctx.fillText(char, TILE / 2, TILE / 2);

    this.textures.addCanvas(key, canvas);
  }
}

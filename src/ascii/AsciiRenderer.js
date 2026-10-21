// ============================================================
// ascii/AsciiRenderer.js
// Motor de renderização de arte ASCII de alta densidade para Phaser.
// Converte matrizes de caracteres e paletas em texturas Phaser nítidas,
// preservando cada glifo individual e garantindo 60 FPS via WebGL.
// ============================================================
import { MATERIALS } from './AsciiPalette.js';

export class AsciiRenderer {
  /**
   * Renderiza uma matriz ASCII com paleta para um elemento HTMLCanvasElement.
   * 
   * @param {Object} options
   * @param {string[]} options.lines - Linhas de texto com caracteres ASCII
   * @param {Object|Function} [options.palette] - Mapeamento de caractere -> cor hex (#RRGGBB)
   * @param {Array<Array<[string, string]>>} [options.coloredCells] - Células explícitas [char, color]
   * @param {number} [options.charWidth=4] - Largura em pixels de cada caractere
   * @param {number} [options.charHeight=6] - Altura em pixels de cada caractere
   * @param {number} [options.fontSize=5] - Tamanho da fonte monospace em pixels
   * @param {string} [options.bgColor=null] - Cor de fundo (null = transparente)
   * @param {string} [options.fontFamily='"Courier New", Consolas, monospace']
   * @param {boolean} [options.bold=true]
   * @returns {HTMLCanvasElement}
   */
  static renderToCanvas(options) {
    const {
      lines = [],
      palette = MATERIALS.STEEL,
      coloredCells = null,
      charWidth = 4,
      charHeight = 6,
      fontSize = 5,
      bgColor = null,
      fontFamily = '"Courier New", Consolas, monospace',
      bold = true,
    } = options;

    let cols = 0;
    let rows = 0;

    if (coloredCells && coloredCells.length > 0) {
      rows = coloredCells.length;
      cols = coloredCells[0].length;
    } else {
      rows = lines.length;
      for (const line of lines) {
        if (line.length > cols) cols = line.length;
      }
    }

    const width = Math.max(1, cols * charWidth);
    const height = Math.max(1, rows * charHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Desativa suavização para preservar a nitidez dos caracteres ASCII
    ctx.imageSmoothingEnabled = false;

    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (coloredCells && coloredCells.length > 0) {
      for (let y = 0; y < rows; y++) {
        const row = coloredCells[y];
        for (let x = 0; x < cols; x++) {
          const cell = row[x];
          if (!cell) continue;
          const [ch, col] = cell;
          if (ch === ' ' || !col || col === '#000000' || col === 'transparent') continue;

          ctx.fillStyle = col;
          ctx.fillText(ch, x * charWidth + charWidth / 2, y * charHeight + charHeight / 2);
        }
      }
    } else {
      for (let y = 0; y < rows; y++) {
        const line = lines[y] || '';
        for (let x = 0; x < line.length; x++) {
          const ch = line[x];
          if (ch === ' ') continue;

          let color = '#cccccc';
          if (typeof palette === 'function') {
            color = palette(ch, x, y);
          } else if (palette && palette[ch]) {
            color = palette[ch];
          }

          if (!color || color === 'transparent') continue;

          ctx.fillStyle = color;
          ctx.fillText(ch, x * charWidth + charWidth / 2, y * charHeight + charHeight / 2);
        }
      }
    }

    return canvas;
  }

  /**
   * Registra uma textura no TextureManager do Phaser.
   */
  static registerTexture(scene, key, options) {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const canvas = this.renderToCanvas(options);
    scene.textures.addCanvas(key, canvas);

    // Ajusta o modo de filtro para NEAREST para garantir nitidez dos caracteres
    const tex = scene.textures.get(key);
    if (tex && tex.setFilter) {
      tex.setFilter(0); // 0 = FilterMode.NEAREST
    }
    return key;
  }

  /**
   * Converte uma string HTML de spans coloridos (como a de ascii-art.html)
   * em uma matriz de células [char, color].
   */
  static parseHtmlSpans(html) {
    // Aceita tanto <br> quanto <br /> e tolera espaços no CSS, por exemplo
    // style="color: #b5162c". O HTML de referência usa esses formatos.
    const source = String(html ?? '');
    const htmlRows = source.split(/<br\s*\/?\s*>/i);
    const grid = [];
    const spanPattern = /<span\b([^>]*)>([\s\S]*?)<\/span\s*>/gi;

    const decodeCell = (value) => value
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

    for (const htmlRow of htmlRows) {
      const row = [];
      spanPattern.lastIndex = 0;
      for (const match of htmlRow.matchAll(spanPattern)) {
        const attributes = match[1] || '';
        const styleMatch = attributes.match(/\bstyle\s*=\s*(["'])(.*?)\1/i);
        if (!styleMatch) continue;

        const colorMatch = styleMatch[2].match(/\bcolor\s*:\s*(#[\da-f]{6})\b/i);
        if (!colorMatch) continue;

        const character = decodeCell(match[2]);
        if ([...character].length !== 1) continue;
        row.push([character, colorMatch[1].toLowerCase()]);
      }
      if (row.length > 0) grid.push(row);
    }
    return grid;
  }

  /**
   * Descompacta RLE para coloredCells
   */
  static unpackRLE(rleData) {
    return rleData.map(rowRle => {
      const row = [];
      for (const [key, count] of rowRle) {
        if (!key) {
          for (let i = 0; i < count; i++) row.push(null);
        } else {
          const [ch, col] = key.split('|');
          for (let i = 0; i < count; i++) row.push([ch, col]);
        }
      }
      return row;
    });
  }

  /**
   * Gera variações de frames de animação deslocando caracteres ou alternando símbolos.
   */
  static generateWaveFrames(baseLines, count = 4) {
    const waveChars = ['~', '≈', '=', '-', '~'];
    const frames = [];

    for (let f = 0; f < count; f++) {
      const frameLines = baseLines.map((line, y) => {
        return line.split('').map((ch, x) => {
          if (ch === '~' || ch === '≈' || ch === '=') {
            const idx = (x + y + f) % waveChars.length;
            return waveChars[idx];
          }
          if (ch === '*' || ch === '+') {
            return (f % 2 === 0) ? '*' : '+';
          }
          return ch;
        }).join('');
      });
      frames.push(frameLines);
    }
    return frames;
  }
}

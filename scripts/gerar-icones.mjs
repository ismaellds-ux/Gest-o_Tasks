import sharp from "sharp";
import { mkdirSync } from "node:fs";

const origem = "C:\\Users\\Ismael\\Downloads\\Stier 2.png";

mkdirSync("public", { recursive: true });
mkdirSync("src/assets/brand", { recursive: true });

const meta = await sharp(origem).metadata();
const alturaTouro = Math.round(meta.height * 0.68); // recorta fora o texto "STIER" de baixo

// A logo original é preto sobre fundo branco opaco (sem alpha). Construímos uma
// máscara de alpha a partir do brilho (branco -> transparente, preto -> opaco) e
// juntamos a um preenchimento sólido, gerando um touro com fundo de verdade transparente.
async function touroRecortado(corTraco = { r: 0, g: 0, b: 0 }) {
  const mascara = await sharp(origem)
    .extract({ left: 0, top: 0, width: meta.width, height: alturaTouro })
    .grayscale()
    .negate()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return sharp({
    create: { width: meta.width, height: alturaTouro, channels: 3, background: corTraco },
  })
    .joinChannel(mascara.data, { raw: { width: meta.width, height: alturaTouro, channels: 1 } })
    .png()
    .toBuffer();
}

// Redimensiona o touro (mantendo proporção) e compõe centralizado sobre uma tela
// própria — evitar o parâmetro `background` do resize/extend pra letterbox, que
// não respeitou alpha=0 de forma confiável aqui.
async function compor(destino, tamanho, corFundo, margem) {
  const touro = await touroRecortado();
  const ladoConteudo = Math.round(tamanho * (1 - margem * 2));
  const escala = ladoConteudo / Math.max(meta.width, alturaTouro);
  const larguraTouro = Math.round(meta.width * escala);
  const alturaTouroRedim = Math.round(alturaTouro * escala);

  const touroRedimensionado = await sharp(touro).resize(larguraTouro, alturaTouroRedim).png().toBuffer();

  const tela = corFundo
    ? sharp({ create: { width: tamanho, height: tamanho, channels: 3, background: corFundo } })
    : sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

  await tela.composite([{ input: touroRedimensionado, gravity: "center" }]).png().toFile(destino);
}

const bg = { r: 16, g: 21, b: 26 }; // var(--bg)

// logo touro isolado, fundo transparente, pra usar no header/login (HTML)
await compor("src/assets/brand/touro.png", 256, null, 0.02);

// favicon / icon.png do Next (transparente, pequeno)
await compor("src/app/icon.png", 64, null, 0.04);

// apple-icon: fundo sólido (iOS não lida bem com transparência)
await compor("src/app/apple-icon.png", 180, bg, 0.18);

// ícones do manifest PWA (Android "Add to Home Screen")
await compor("public/icon-192.png", 192, bg, 0.18);
await compor("public/icon-512.png", 512, bg, 0.18);

console.log("Ícones gerados.");

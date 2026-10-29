// 2uram 그림 자료(인트로 그릇, 돌 질감, 민트 번짐, 깅엄, 앱 아이콘)를 PNG로 만들어요.
// 실행: node scripts/generate-art.js  (Playwright + Chromium 필요)
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// 결정적인 난수 (매번 같은 그림이 나오도록)
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = (a, b) => a + rand() * (b - a);

// ---------- 인트로 그릇 (위에서 내려다본 크리스탈 딤섬 누들수프) ----------
function noodles(cx, cy, R) {
  let s = '';
  for (let i = 0; i < 260; i++) {
    const a = r(0, Math.PI * 2), d = Math.sqrt(rand()) * R * 0.95;
    const x1 = cx + Math.cos(a) * d, y1 = cy + Math.sin(a) * d;
    const b = 0.5 + r(-0.5, 0.5) + (i % 3 === 0 ? Math.PI / 2 : 0);
    const len = r(R * 0.3, R * 0.9);
    const x2 = x1 + Math.cos(b) * len, y2 = y1 + Math.sin(b) * len;
    const qx = (x1 + x2) / 2 + r(-40, 40), qy = (y1 + y2) / 2 + r(-40, 40);
    s += `<path d="M${x1},${y1} Q${qx},${qy} ${x2},${y2}" stroke="#fbf1d6" stroke-opacity="${r(0.25, 0.65)}" stroke-width="${r(2.2, 3.6)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

function yarrow(x, y, n = 14, spread = 22) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const px = x + r(-spread, spread), py = y + r(-spread * 0.7, spread * 0.7);
    s += `<circle cx="${px}" cy="${py}" r="${r(2.2, 4)}" fill="#fffdf6" stroke="#e7e2cf" stroke-width="0.6"/>`;
  }
  return s;
}

function dill(x, y, ang, len) {
  let s = `<g transform="translate(${x} ${y}) rotate(${ang})" stroke="#86a66a" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85">`;
  s += `<path d="M0,0 Q${len * 0.1},${-len * 0.5} 0,${-len}"/>`;
  for (let i = 1; i < 9; i++) {
    const t = i / 9, yy = -len * t;
    s += `<path d="M0,${yy} q${r(10, 18)},${-r(6, 14)} ${r(16, 26)},${-r(10, 20)}"/><path d="M0,${yy} q${-r(10, 18)},${-r(6, 14)} ${-r(16, 26)},${-r(10, 20)}"/>`;
  }
  return s + '</g>';
}

function dimsum(x, y, size, rot) {
  const k = size / 100;
  const wrapper = 'M0,-100 C22,-52 52,-22 108,0 C52,22 22,52 0,108 C-22,52 -52,22 -108,0 C-52,-22 -22,-52 0,-108 Z';
  const petals = [0, 72, 144, 216, 288].map(a =>
    `<ellipse cx="0" cy="-30" rx="21" ry="31" transform="rotate(${a + r(-8, 8)})" fill="url(#petal)" opacity="0.78"/>`).join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" filter="url(#blur1)">
    <path d="${wrapper}" fill="#2d4f4b" opacity="0.18" transform="translate(6 10)" filter="url(#soft)"/>
    <path d="${wrapper}" fill="url(#aqua)" opacity="0.82"/>
    <path d="${wrapper}" fill="none" stroke="#e9fffb" stroke-opacity="0.55" stroke-width="2.5"/>
    <ellipse cx="0" cy="0" rx="46" ry="42" fill="#f4c3a9" opacity="0.35"/>
    <ellipse cx="0" cy="0" rx="46" ry="42" fill="url(#mound)" opacity="0.75"/>
    <path d="M-30,-70 Q-10,-35 0,-10" stroke="#ffffff" stroke-opacity="0.4" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${dill(-20, -8, -35, 70)}
    ${yarrow(34, 26, 26, 20)}${yarrow(-38, 30, 14, 12)}
    <g transform="rotate(${r(-20, 20)})">${petals}
      <circle r="11" fill="url(#bead)"/>
    </g>
  </g>`;
}

const DEFS = `<defs>
  <radialGradient id="bowl" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#fbfaf7"/><stop offset="0.82" stop-color="#f4f2ee"/><stop offset="1" stop-color="#e6e2dc"/></radialGradient>
  <radialGradient id="well" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#f3f1ed"/><stop offset="1" stop-color="#e2ddd5"/></radialGradient>
  <radialGradient id="broth" cx="45%" cy="40%" r="62%"><stop offset="0" stop-color="#f0e3bf"/><stop offset="0.7" stop-color="#e3cd97"/><stop offset="1" stop-color="#cdb27a"/></radialGradient>
  <linearGradient id="aqua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfeae5"/><stop offset="0.5" stop-color="#8fd3cd"/><stop offset="1" stop-color="#6cbcb6"/></linearGradient>
  <radialGradient id="mound" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#d6f3ef"/><stop offset="1" stop-color="#93d2cc" stop-opacity="0.4"/></radialGradient>
  <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e98fab"/><stop offset="0.55" stop-color="#f4b9c8"/><stop offset="1" stop-color="#fbe0e7"/></linearGradient>
  <radialGradient id="bead" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f2fffd"/><stop offset="1" stop-color="#9ed9d3"/></radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="blur1"><feGaussianBlur stdDeviation="0.9"/></filter>
  <clipPath id="brothClip"><circle cx="512" cy="512" r="318"/></clipPath>
</defs>`;

function bowlSvg() {
  seed = 7;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${DEFS}<g transform="translate(512 512) scale(0.88) translate(-512 -512)">
    <ellipse cx="530" cy="560" rx="470" ry="462" fill="#5a4d40" opacity="0.28" filter="url(#shadow)"/>
    <circle cx="512" cy="512" r="478" fill="url(#bowl)"/>
    <circle cx="512" cy="512" r="478" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
    <circle cx="512" cy="512" r="352" fill="url(#well)"/>
    <circle cx="512" cy="512" r="318" fill="url(#broth)"/>
    <g clip-path="url(#brothClip)" filter="url(#blur1)">${noodles(512, 512, 300)}</g>
    <circle cx="512" cy="512" r="318" fill="url(#broth)" opacity="0.38"/>
    <circle cx="512" cy="512" r="318" fill="none" stroke="#b89b63" stroke-opacity="0.35" stroke-width="10" filter="url(#soft)"/>
    <ellipse cx="420" cy="380" rx="120" ry="50" fill="#fffaf0" opacity="0.18" transform="rotate(-30 420 380)" filter="url(#soft)"/>
    ${dimsum(400, 420, 150, 8)}
    ${dimsum(640, 470, 135, -22)}
    ${dimsum(480, 660, 140, 30)}
  </g></svg>`;
}

// ---------- 돌 질감 타일 ----------
function stoneHtml(base, dots, size = 512) {
  return `<canvas id="c" width="${size}" height="${size}"></canvas><script>
  const c=document.getElementById('c'),x=c.getContext('2d');let s=11;const R=()=>((s=(s*16807)%2147483647)/2147483647);
  x.fillStyle='${base}';x.fillRect(0,0,${size},${size});
  const cols=${JSON.stringify(dots)};
  for(let i=0;i<${size * size / 18};i++){const px=R()*${size},py=R()*${size},rr=R()*1.3+0.2;x.globalAlpha=R()*0.35;x.fillStyle=cols[Math.floor(R()*cols.length)];
    for(const ox of [-${size},0,${size}])for(const oy of [-${size},0,${size}]){x.beginPath();x.arc(px+ox,py+oy,rr,0,7);x.fill();}}
  </script>`;
}

// ---------- 민트/핑크 번짐 (에어브러시 타원) ----------
const glowSvg = (color) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><defs>
  <radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${color}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${color}" stop-opacity="0.55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
  <filter id="b"><feGaussianBlur stdDeviation="22"/></filter></defs>
  <ellipse cx="300" cy="450" rx="250" ry="400" fill="url(#g)" filter="url(#b)"/></svg>`;

// ---------- 깅엄 체크 타일 ----------
const ginghamSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
  <rect width="48" height="48" fill="#fffafb"/>
  <rect width="24" height="48" fill="#f3b8c9" opacity="0.5"/><rect width="48" height="24" fill="#f3b8c9" opacity="0.5"/></svg>`;

async function shot(browser, name, w, h, html, transparent) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<html><body style="margin:0;overflow:hidden;background:transparent">${html}</body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(OUT, name), omitBackground: transparent });
  await p.close();
}

(async () => {
  const b = await chromium.launch();
  const bowl = bowlSvg();
  const img = (svg, w, h) => `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${w}" height="${h}" style="display:block">`;
  const stoneDots = ['#8f857a', '#b5ab9f', '#ffffff', '#6f665c', '#c9bfb3'];

  await shot(b, 'intro-bowl.png', 1024, 1024, img(bowl, 1024, 1024), true);
  await shot(b, 'stone.png', 512, 512, stoneHtml('#cdc6bd', stoneDots), false);
  await shot(b, 'paper.png', 512, 512, stoneHtml('#f4f1ec', ['#d8d0c5', '#e6dfd5', '#ffffff', '#cfc6ba']), false);
  await shot(b, 'glow-mint.png', 600, 900, glowSvg('#bfe9df'), true);
  await shot(b, 'glow-pink.png', 600, 900, glowSvg('#f7cfda'), true);
  await shot(b, 'gingham.png', 48, 48, ginghamSvg, false);

  // 앱 아이콘: 돌 배경 위에 그릇을 크게
  const stoneBg = (size) => `<div style="position:absolute;inset:0;background:#cdc6bd url(data:image/png;base64,${require('fs').readFileSync(path.join(OUT, 'stone.png')).toString('base64')}) repeat;background-size:${size / 2}px"></div>`;
  const centered = (size, scale) => `<div style="position:relative;width:${size}px;height:${size}px">${stoneBg(size)}<div style="position:absolute;left:${size * (1 - scale) / 2}px;top:${size * (1 - scale) / 2}px">${img(bowl, size * scale, size * scale)}</div></div>`;
  const floating = (size, scale) => `<div style="position:relative;width:${size}px;height:${size}px"><div style="position:absolute;left:${size * (1 - scale) / 2}px;top:${size * (1 - scale) / 2}px">${img(bowl, size * scale, size * scale)}</div></div>`;
  await shot(b, 'icon.png', 1024, 1024, centered(1024, 1.34), false);
  await shot(b, 'favicon.png', 48, 48, centered(48, 1.25), false);
  await shot(b, 'splash-icon.png', 512, 512, floating(512, 0.96), true);
  await shot(b, 'android-icon-foreground.png', 512, 512, floating(512, 0.62), true);
  await shot(b, 'android-icon-background.png', 512, 512, stoneBg(512), false);
  const mono = bowl.replace(/fill="url\(#[a-z]+\)"/g, 'fill="#000"').replace(/<path d="M[^"]*Q[^"]*" stroke="#fbf3dc"[^>]*\/>/g, '');
  await shot(b, 'android-icon-monochrome.png', 432, 432, floating(432, 0.7).replace(Buffer.from(bowl).toString('base64'), Buffer.from(mono).toString('base64')), true);
  await b.close();
})();

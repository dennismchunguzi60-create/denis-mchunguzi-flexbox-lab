const $ = (id) => document.getElementById(id);
const playground = $('playground');
const flexControls = $('flexControls');
const gridControls = $('gridControls');
let layout = 'flex';
let itemNumber = 6;
let toastTimer;

const defaults = {
  direction: 'row', justify: 'flex-start', align: 'center', wrap: 'wrap',
  columns: '3', rows: 'auto', gap: 16, tileWidth: 88, tileHeight: 88,
  tileColor: '#19d3b2', radius: '16', animation: 'none', speed: '1.5s'
};

function value(id) { return $(id).value; }
function setValue(id, val) { $(id).value = val; }

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function addTile() {
  if (itemNumber >= 24) return showToast('Maximum of 24 items reached.');
  itemNumber++;
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.num = itemNumber;
  tile.textContent = String(itemNumber).padStart(2, '0');
  playground.appendChild(tile);
  update();
}

function removeTile() {
  if (playground.children.length <= 1) return showToast('Keep at least one item on the canvas.');
  playground.lastElementChild.remove();
  itemNumber = Math.max(...Array.from(playground.children, el => Number(el.dataset.num)));
  update();
}

function update() {
  const gap = Number(value('gap'));
  const width = Number(value('tileWidth'));
  const height = Number(value('tileHeight'));
  const color = value('tileColor');
  const radius = Number(value('radius'));
  $('gapOut').textContent = `${gap} px`;
  $('widthOut').textContent = `${width} px`;
  $('heightOut').textContent = `${height} px`;
  $('colorText').textContent = color.toUpperCase();
  $('itemCount').textContent = playground.children.length;

  playground.style.gap = `${gap}px`;
  playground.style.display = layout === 'flex' ? 'flex' : 'grid';
  flexControls.classList.toggle('hidden', layout !== 'flex');
  gridControls.classList.toggle('hidden', layout !== 'grid');
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.layout === layout));

  if (layout === 'flex') {
    playground.style.flexDirection = value('direction');
    playground.style.justifyContent = value('justify');
    playground.style.alignItems = value('align');
    playground.style.flexWrap = value('wrap');
    playground.style.gridTemplateColumns = '';
    playground.style.gridTemplateRows = '';
  } else {
    playground.style.gridTemplateColumns = `repeat(${value('columns')}, minmax(0, 1fr))`;
    playground.style.gridTemplateRows = value('rows') === 'auto' ? '' : `repeat(${value('rows')}, minmax(0, 1fr))`;
    playground.style.alignItems = 'stretch';
    playground.style.justifyContent = 'stretch';
    playground.style.flexDirection = '';
    playground.style.flexWrap = '';
  }

  Array.from(playground.children).forEach((tile, index) => {
    tile.style.width = `${width}px`;
    tile.style.height = `${height}px`;
    tile.style.backgroundColor = color;
    tile.style.borderRadius = `${radius}px`;
    tile.style.animationDuration = value('speed');
    tile.classList.remove('anim-float', 'anim-pulse', 'anim-spin', 'anim-bounce', 'anim-shake');
    if (value('animation') !== 'none') {
      tile.classList.add(`anim-${value('animation')}`);
      tile.style.animationDelay = `${index * 0.08}s`;
    } else {
      tile.style.animationDelay = '0s';
    }
  });

  $('cssCode').textContent = generateCSS();
}

function generateCSS() {
  let container = layout === 'flex'
    ? `  display: flex;\n  flex-direction: ${value('direction')};\n  justify-content: ${value('justify')};\n  align-items: ${value('align')};\n  flex-wrap: ${value('wrap')};`
    : `  display: grid;\n  grid-template-columns: repeat(${value('columns')}, minmax(0, 1fr));${value('rows') !== 'auto' ? `\n  grid-template-rows: repeat(${value('rows')}, minmax(0, 1fr));` : ''}`;
  const animationNames = {float:'float',pulse:'pulse',spin:'spin',bounce:'bounce',shake:'shake'};
  const animationLine = value('animation') === 'none' ? '' : `\n  animation: ${animationNames[value('animation')]} ${value('speed')} ease-in-out infinite;`;
  return `.container {\n${container}\n  gap: ${value('gap')}px;\n}\n\n.item {\n  width: ${value('tileWidth')}px;\n  height: ${value('tileHeight')}px;\n  background: ${value('tileColor')};\n  border-radius: ${value('radius')}px;${animationLine}\n}`;
}

document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => {
  layout = btn.dataset.layout;
  update();
}));
['direction','justify','align','wrap','columns','rows','gap','tileWidth','tileHeight','tileColor','radius','animation','speed'].forEach(id => {
  $(id).addEventListener('input', update);
  $(id).addEventListener('change', update);
});
$('addBtn').addEventListener('click', addTile);
$('removeBtn').addEventListener('click', removeTile);
$('resetBtn').addEventListener('click', () => {
  Object.entries(defaults).forEach(([id, val]) => setValue(id, val));
  layout = 'flex';
  playground.innerHTML = '';
  itemNumber = 6;
  for (let i = 1; i <= 6; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile'; tile.dataset.num = i; tile.textContent = String(i).padStart(2, '0');
    playground.appendChild(tile);
  }
  update();
  showToast('Settings reset to default.');
});
$('randomBtn').addEventListener('click', () => {
  setValue('gap', Math.floor(Math.random() * 33));
  setValue('tileWidth', 58 + Math.floor(Math.random() * 75));
  setValue('tileHeight', 58 + Math.floor(Math.random() * 75));
  setValue('tileColor', `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`);
  setValue('radius', ['0','8','16','28'][Math.floor(Math.random()*4)]);
  setValue('direction', ['row','column','row-reverse','column-reverse'][Math.floor(Math.random()*4)]);
  setValue('justify', ['flex-start','center','flex-end','space-between','space-around','space-evenly'][Math.floor(Math.random()*6)]);
  setValue('animation', ['none','float','pulse','spin','bounce','shake'][Math.floor(Math.random()*6)]);
  layout = Math.random() > .5 ? 'flex' : 'grid';
  setValue('columns', String(2 + Math.floor(Math.random()*4)));
  update();
  showToast('A fresh layout has been generated!');
});
$('copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('cssCode').textContent);
    showToast('CSS copied to clipboard!');
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('cssCode'));
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    showToast('Select the highlighted code and copy it.');
  }
});
$('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  localStorage.setItem('flexbox-lab-theme', light ? 'light' : 'dark');
  $('themeToggle').textContent = light ? '☾' : '☼';
});
if (localStorage.getItem('flexbox-lab-theme') === 'light') {
  document.body.classList.add('light');
  $('themeToggle').textContent = '☾';
}
$('year').textContent = new Date().getFullYear();

// Version 2 features: layout presets, save/load, undo/redo, and export.
const historyStack = [];
let historyIndex = -1;
let restoringHistory = false;
function snapshot(){ return {layout, settings:Object.fromEntries(Object.keys(defaults).map(id=>[id,value(id)])), items:Array.from(playground.children,t=>({num:t.dataset.num,text:t.textContent}))}; }
function refreshHistoryButtons(){ $('undoBtn').disabled = historyIndex <= 0; $('redoBtn').disabled = historyIndex < 0 || historyIndex >= historyStack.length-1; }
function recordHistory(){ if(restoringHistory)return; const s=snapshot(); if(historyIndex>=0 && JSON.stringify(historyStack[historyIndex])===JSON.stringify(s))return; historyStack.splice(historyIndex+1); historyStack.push(s); if(historyStack.length>40)historyStack.shift(); historyIndex=historyStack.length-1; refreshHistoryButtons(); }
function restoreSnapshot(s){ restoringHistory=true; layout=s.layout; Object.entries(s.settings).forEach(([id,v])=>setValue(id,v)); playground.innerHTML=''; s.items.forEach(item=>{const t=document.createElement('div');t.className='tile';t.dataset.num=item.num;t.textContent=item.text;playground.appendChild(t)}); itemNumber=Math.max(0,...s.items.map(x=>Number(x.num))); update(); restoringHistory=false; refreshHistoryButtons(); }
function applyPreset(name){
 if(name==='default')return;
 if(name==='center'){layout='flex';setValue('direction','row');setValue('justify','center');setValue('align','center');setValue('wrap','wrap');setValue('gap',18);}
 if(name==='navbar'){layout='flex';setValue('direction','row');setValue('justify','space-between');setValue('align','center');setValue('wrap','nowrap');setValue('gap',12);setValue('tileWidth',68);setValue('tileHeight',52);setValue('radius','8');}
 if(name==='cards'){layout='grid';setValue('columns','3');setValue('rows','auto');setValue('gap',18);setValue('tileWidth',88);setValue('tileHeight',110);setValue('radius','16');}
 if(name==='sidebar'){layout='flex';setValue('direction','row');setValue('justify','flex-start');setValue('align','stretch');setValue('wrap','nowrap');setValue('gap',12);setValue('tileWidth',70);setValue('tileHeight',230);setValue('radius','8');}
 if(name==='gallery'){layout='grid';setValue('columns','4');setValue('rows','auto');setValue('gap',10);setValue('tileWidth',68);setValue('tileHeight',68);setValue('radius','8');}
 update();recordHistory();showToast('Preset applied: '+name+'.');
}
function downloadText(filename,content,type){const blob=new Blob([content],{type:type+';charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}
function exportProject(){const tiles=Array.from(playground.children,t=>'  <div class="item">'+t.textContent+'</div>').join('\n');const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>My layout</title><link rel="stylesheet" href="layout.css"></head><body><main class="container">\n'+tiles+'\n</main></body></html>';downloadText('my-layout.html',html,'text/html');downloadText('layout.css',generateCSS(),'text/css');showToast('Exported HTML and CSS as two files.');}
function saveLayout(){try{localStorage.setItem('flexbox-lab-saved-layout',JSON.stringify(snapshot()));showToast('Layout saved in this browser.');}catch{showToast('Could not save layout.');}}
$('presetSelect').addEventListener('change',e=>applyPreset(e.target.value));
$('saveBtn').addEventListener('click',saveLayout);
$('undoBtn').addEventListener('click',()=>{if(historyIndex>0){historyIndex--;restoreSnapshot(historyStack[historyIndex]);}});
$('redoBtn').addEventListener('click',()=>{if(historyIndex<historyStack.length-1){historyIndex++;restoreSnapshot(historyStack[historyIndex]);}});
$('exportBtn').addEventListener('click',exportProject);
document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>setTimeout(recordHistory,0)));
['direction','justify','align','wrap','columns','rows','gap','tileWidth','tileHeight','tileColor','radius','animation','speed'].forEach(id=>$(id).addEventListener('change',recordHistory));
['addBtn','removeBtn','randomBtn','resetBtn'].forEach(id=>$(id).addEventListener('click',()=>setTimeout(recordHistory,0)));
try{const saved=localStorage.getItem('flexbox-lab-saved-layout');if(saved){const b=document.createElement('button');b.className='secondary-button';b.textContent='↥ Load saved';b.addEventListener('click',()=>{restoreSnapshot(JSON.parse(saved));recordHistory();showToast('Saved layout loaded.');});$('saveBtn').parentElement.insertBefore(b,$('saveBtn'));}}catch{}
update();
recordHistory();


// Language selector for the CSS help explanations.
const helpTranslations = {
  en: [
    'Choose Flexbox or Grid. They are two different ways to arrange elements on a page.',
    'Controls whether items follow a row or a column, and can reverse their order.',
    'Arranges items along the main axis. Try center, space-between, or flex-end.',
    'Aligns items along the cross axis, which runs across the main axis.',
    'Decides whether items stay on one line or move to another line when space is limited.',
    'The number of CSS Grid columns. For example, 3 creates three columns.',
    'Sets the number of Grid rows. Auto lets the browser decide based on the content.',
    'Space between items. A gap of 20px leaves 20 pixels between boxes.',
    'The width of each item in the preview and generated CSS.',
    'The height of each item in the preview and generated CSS.',
    'Choose the color used by all items in the preview.',
    'Controls how rounded each item’s corners are. 0 means square corners.',
    'Choose an animation for the items. None turns animation off.',
    'Controls how long one animation cycle takes. A shorter duration means faster animation.'
  ],
  sw: [
    'Chagua Flexbox au Grid. Hizi ni njia mbili tofauti za kupanga elements kwenye ukurasa.',
    'Huamua items zifuate mstari au safu, na inaweza kubadilisha mwelekeo wake.',
    'Hupanga items kwenye main axis. Jaribu center, space-between au flex-end.',
    'Hupanga items kwenye cross axis, yaani mhimili unaovuka main axis.',
    'Huamua kama items zibaki mstari mmoja au zihamie mstari mwingine nafasi ikipungua.',
    'Idadi ya columns za CSS Grid. Kwa mfano, 3 huunda columns tatu.',
    'Huamua idadi ya rows za Grid. Auto huacha browser iamue kulingana na content.',
    'Nafasi kati ya items. Gap ya 20px huacha pixels 20 kati ya boxes.',
    'Upana wa kila item kwenye preview na CSS inayotengenezwa.',
    'Urefu wa kila item kwenye preview na CSS inayotengenezwa.',
    'Chagua rangi itakayotumiwa na items zote kwenye preview.',
    'Hudhibiti mviringo wa pembe za kila item. 0 humaanisha pembe kali.',
    'Chagua animation ya items. None huzima animation.',
    'Hudhibiti muda wa mzunguko wa animation. Muda mfupi humaanisha animation ya kasi zaidi.'
  ],
  es: [
    'Elige Flexbox o Grid. Son dos formas diferentes de organizar elementos en una página.',
    'Decide si los elementos siguen una fila o una columna y si se invierte el orden.',
    'Distribuye los elementos en el eje principal. Prueba center, space-between o flex-end.',
    'Alinea los elementos en el eje transversal, que cruza el eje principal.',
    'Decide si los elementos permanecen en una línea o pasan a otra cuando falta espacio.',
    'Número de columnas de CSS Grid. Por ejemplo, 3 crea tres columnas.',
    'Establece el número de filas de Grid. Auto deja que el navegador lo decida.',
    'Espacio entre elementos. Un gap de 20px deja 20 píxeles entre cajas.',
    'Ancho de cada elemento en la vista previa y en el CSS generado.',
    'Alto de cada elemento en la vista previa y en el CSS generado.',
    'Elige el color de todos los elementos de la vista previa.',
    'Controla lo redondeadas que son las esquinas. 0 significa esquinas rectas.',
    'Elige una animación para los elementos. None desactiva la animación.',
    'Controla la duración de un ciclo de animación. Menos tiempo significa más velocidad.'
  ],
  fr: [
    'Choisissez Flexbox ou Grid. Ce sont deux façons différentes de disposer les éléments.',
    'Détermine si les éléments suivent une ligne ou une colonne et si l’ordre est inversé.',
    'Répartit les éléments sur l’axe principal. Essayez center, space-between ou flex-end.',
    'Aligne les éléments sur l’axe transversal, qui croise l’axe principal.',
    'Détermine si les éléments restent sur une ligne ou passent à la suivante si nécessaire.',
    'Nombre de colonnes CSS Grid. Par exemple, 3 crée trois colonnes.',
    'Définit le nombre de lignes Grid. Auto laisse le navigateur décider.',
    'Espace entre les éléments. Un gap de 20px laisse 20 pixels entre les blocs.',
    'Largeur de chaque élément dans l’aperçu et le CSS généré.',
    'Hauteur de chaque élément dans l’aperçu et le CSS généré.',
    'Choisissez la couleur de tous les éléments dans l’aperçu.',
    'Contrôle l’arrondi des coins. 0 signifie des coins carrés.',
    'Choisissez une animation pour les éléments. None désactive l’animation.',
    'Contrôle la durée d’un cycle d’animation. Une durée plus courte est plus rapide.'
  ]
};
const helpTipElements = Array.from(document.querySelectorAll('.help-tip'));
const originalHelpTips = helpTipElements.map(el => el.getAttribute('data-tip') || '');
function setExplanationLanguage(language) {
  const descriptions = helpTranslations[language] || helpTranslations.en;
  helpTipElements.forEach((el, index) => {
    const description = descriptions[index] || originalHelpTips[index] || '';
    el.setAttribute('data-tip', description);
    el.setAttribute('aria-label', 'Help: ' + description);
  });
  document.documentElement.lang = language;
  localStorage.setItem('flexbox-lab-language', language);
}
const languageSelect = $('languageSelect');
if (languageSelect) {
  const savedLanguage = localStorage.getItem('flexbox-lab-language') || 'sw';
  languageSelect.value = helpTranslations[savedLanguage] ? savedLanguage : 'sw';
  setExplanationLanguage(languageSelect.value);
  languageSelect.addEventListener('change', event => setExplanationLanguage(event.target.value));
}

const ascii = {
  "á": "a",
  "à": "a",
  "â": "a",
  "ä": "a",
  "é": "e",
  "è": "e",
  "ê": "e",
  "ë": "e",
  "í": "i",
  "ì": "i",
  "î": "i",
  "ï": "i",
  "ó": "o",
  "ò": "o",
  "ô": "o",
  "ö": "o",
  "ú": "u",
  "ù": "u",
  "û": "u",
  "ü": "u"
};

const palette = {
  background: "#FBF6EE",
  input: "black",
  suggest: "#FFB534",
  core: "#65B741",
  palindrome: "#C1F2B0"
};

const selection = window.getSelection();

let lastCaret = 0;

const isPalindrome = text => {
  return text.split("").reverse().join("") === text;
};

const getChunks = text => {
  chunks = [];
  for (let i = 0; i < text.length; i++) {
    for (let j = i+1; j <= text.length; j++) {
      if (text[i] !== text[j]) {
        chunks.push(text.substring(i, j));
        i = j-1;
        break;
      }
    }
  }
  return chunks;
};

const suggest = chunks => {
  for (let i = Math.floor(chunks.length / 2); i < chunks.length; i++) {
    for (let j = 1; j < chunks.length - i; j++) {
      if (chunks[i-j] !== chunks[i+j]) {
        break;
      }
      if (i+j === chunks.length - 1) {
        const tail = chunks.slice(0, i-j).reverse().join("");
        return {tail, coreIndex: i};
      }
    }
  }
  const tail = chunks.slice(0, chunks.length - 1).reverse().join("");
  return {tail, coreIndex: chunks.length - 1};
};

const split = (chunks, coreIndex, map, text) => {
  if (chunks.length === 0) return {start: "", core: "", end: ""};
  const normStart = chunks.slice(0, coreIndex).join("");
  const normStartIndex = normStart.length;
  const startIndex = map[normStartIndex];
  const normEndIndex = normStartIndex + chunks[coreIndex].length - 1;
  const endIndex = map[normEndIndex];
  const start = text.substring(0, startIndex);
  const core = text.substring(startIndex, endIndex + 1);
  const end = text.substring(endIndex + 1);
  return {start, core, end};
};

const normalize = text => {
  text = text.toLowerCase();
  for (let chr in ascii) {
    text = text.replaceAll(chr, ascii[chr]);
  }
  const textArray = text.split("");
  const normArray = [];
  const map = {};
  for (let i = 0; i < textArray.length; i++) {
    if (textArray[i].match(/[a-zñ0-9]/)) {
      map[normArray.length] = i;
      normArray.push(textArray[i]);
    }
  }
  map[normArray.length] = textArray.length;
  const norm = normArray.join("");
  return {norm, map};
};

const saveCaret = () => {
  lastCaret = selection.anchorOffset;
};

const restoreCaret = () => {
  selection.selectAllChildren(input);
  selection.collapseToStart();
  for(let i = 0; i < lastCaret; i++) {
    selection.modify("move", "forward", "character");
  }
};

const caretEnd = () => {
  selection.selectAllChildren(input);
  selection.collapseToEnd();
  selection.modify("move", "backward", "character");
  selection.modify("move", "forward", "character");
};

const blink = () => {
  startNode.animate(
    {
      borderColor: [palette.input, "transparent", palette.input],
      easing: "step-end"
    },
    {
      duration: 1000,
      iterations: Infinity
    }
  );
  input.style.caretColor = "transparent";
};

const unblink = () => {
  const animations = startNode.getAnimations();
  animations.forEach(animation => animation.cancel());
  input.style.caretColor = palette.input;
};

const update = () => {
  const text = input.innerText;
  const {norm, map} = normalize(text);
  const chunks = getChunks(norm);
  const {tail, coreIndex} = suggest(chunks);
  tailNode.innerText = tail;
  const {start, core, end} = split(chunks, coreIndex, map, text);
  startNode.innerText = start;
  coreNode.innerText = core;
  endNode.innerText = end;
  if (norm && isPalindrome(norm)) {
    startNode.style.borderColor = palette.palindrome;
    coreNode.style.backgroundColor = palette.palindrome;
    coreNode.style.borderColor = palette.palindrome;
    endNode.style.borderColor = palette.palindrome;
  } else {
    startNode.style.borderColor = "transparent";
    coreNode.style.backgroundColor = "transparent";
    coreNode.style.borderColor = palette.core;
    endNode.style.borderColor = "transparent";
  }
  if (text) unblink(); else blink();
};

const integrate = () => {
  input.innerHTML += tailNode.innerHTML;
  tailNode.innerHTML = "";
  caretEnd();
  update();
};

const keyPress = e => {
  if (["Enter", "Tab"].includes(e.key)) {
    integrate();
    e.preventDefault();
  } else if (e.ctrlKey && ["i", "u", "b"].includes(e.key.toLowerCase()))
    e.preventDefault();
};

const blur = e => {
  saveCaret();
};

const click = e => {
  if (document.activeElement === input) return;
  input.focus();
  caretEnd();
};

const startNode = document.createElement("span");
startNode.style.borderWidth = "0.3rem";
startNode.style.borderStyle = "solid none solid solid";
startNode.style.borderColor = "transparent";

const coreNode = document.createElement("span");
coreNode.style.borderWidth = "0.3rem";
coreNode.style.borderStyle = "solid none";
coreNode.style.borderColor = palette.core;

const endNode = document.createElement("span");
endNode.style.borderWidth = "0.3rem";
endNode.style.borderStyle = "solid solid solid none";
endNode.style.borderColor = "transparent";

const highlight = document.createElement("div");
highlight.style.height = "0px";
highlight.style.color = "transparent";
highlight.append(startNode);
highlight.append(coreNode);
highlight.append(endNode);

const input = document.createElement("span");
input.contentEditable = "true";
input.setAttribute("autofocus", "autofocus");
input.setAttribute("autocomplete", "off");
input.setAttribute("autocorrect", "off");
input.setAttribute("autocapitalize", "off");
input.setAttribute("spellcheck", "false");
input.style.outline = "none";
input.style.borderWidth = "0.3rem";
input.style.borderStyle = "solid none solid solid";
input.style.borderColor = "transparent";
input.style.color = palette.input;
input.onkeydown = keyPress;
input.onkeyup = () => update();
input.oncut = () => setTimeout(update, 0);
input.onpaste = () => setTimeout(update, 0);
input.onblur = blur;

const tailNode = document.createElement("span");
tailNode.style.color = palette.suggest;
tailNode.style.cursor = "pointer";
tailNode.onclick = () => integrate();

const angel = document.createElement("div");
angel.style.display = "inline-block";

const canvas = document.createElement("div");
canvas.style.padding = "1rem";
canvas.style.boxSizing = "border-box";
canvas.style.height = "100%";
canvas.style.backgroundColor = palette.background;
canvas.style.fontSize = "3rem";
canvas.style.fontFamily = "serif";
canvas.style.wordBreak = "break-all";
canvas.style.fontVariantLigatures = "none";
canvas.append(highlight);
canvas.append(input);
canvas.append(tailNode);
canvas.append(angel);

document.body.style.margin = 0;
document.body.style.flex = 1;
document.body.append(canvas);

const html = document.documentElement;
html.style.display = "flex";
html.style.boxSizing = "border-box";
html.style.minHeight = "100%";

window.onclick = click;

blink();

if (window.location.search === "?dev") {
  html.style.border = "5px solid red";
  document.body.style.border = "1px dotted blue";
  canvas.style.border = "2px dashed green";
  highlight.style.border = "2px solid fuchsia";
  coreNode.style.color = "red";
  input.style.border = "2px dashed red";
  tailNode.style.border = "3px solid yellow";
  const button = document.createElement("button");
  button.innerHTML = "focus";
  button.onclick = () => focus();
  canvas.append(button);
}

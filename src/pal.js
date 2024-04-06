const indr = $INDR_URL;

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

let online = false;
let lastCaret = 0;
let lastCardId = 0;

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
    const start = chunks.slice(0, i).join("");
    const end = chunks.slice(i+1).join("");
    for(let j = 0; j < end.length; j++) {
      if (start[start.length - 1 - j] !== end[j]) {
        break;
      }
      if (j === end.length -1) {
        const unmatchedStart = start.substring(0, start.length - 1 - j);
        const tail = unmatchedStart.split("").reverse().join("");
        return {tail, coreIndex: i}
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
    if (textArray[i].match(/[a-z0-9ñçß]/)) {
      map[normArray.length] = i;
      normArray.push(textArray[i]);
    }
  }
  map[normArray.length] = textArray.length;
  const norm = normArray.join("");
  return {norm, map};
};

const getCards = async () => {
  if (!online) return;
  const response = await fetch(indr + "/list?after=" + lastCardId);
  const palindromes = await response.json();
  palindromes.forEach(palindrome => {
    const card = document.createElement("div");
    card.style.borderStyle = "solid";
    card.style.borderWidth = "1px";
    card.style.height = "3rem";
    card.style.fontSize = "2rem";
    card.style.textAlign = "center";
    card.innerText = palindrome["text"];
    list.prepend(card);
  });
  lastCardId = parseInt(palindromes[palindromes.length - 1]["id"]);
};

const publishPalindrome = async () => {
  if (!confirm(input.innerText)) return;
  const response = await fetch(indr + "/publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: input.innerText
    })
  });
  const id = await response.text();
  // TODO: card view
  getCards();
  input.innerText = "";
  update();
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
    publishNode.style.width = input.offsetWidth + "px";
    if (online) publish.style.display = "inline";
  } else {
    startNode.style.borderColor = "transparent";
    coreNode.style.backgroundColor = "transparent";
    coreNode.style.borderColor = palette.core;
    endNode.style.borderColor = "transparent";
    publish.style.display = "none";
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
  else if (e.repeat) update();
};

const blur = e => {
  saveCaret();
};

const click = e => {
  if (document.activeElement === input) return;
  input.focus();
  caretEnd();
}

const isOnline = async () => {
  try {
    await fetch(indr);
    online = true;
  } catch (err) {
    online = false;
  }
};

const start = async () => {
  blink();
  isOnline();
  setInterval(isOnline, 5000);
};

const publish = document.createElement("img");
publish.setAttribute("src", "./publish.png");
publish.style.height = "2rem";
publish.style.display = "none";
publish.style.cursor = "pointer";
publish.onclick = publishPalindrome;

const publishNode = document.createElement("div");
publishNode.style.borderStyle = "solid";
publishNode.style.borderColor = "transparent";
publishNode.style.borderWidth = "0.3rem";
publishNode.style.height = "2rem";
publishNode.style.textAlign = "center";
publishNode.style.lineHeight = "initial";
publishNode.style.fontSize = "initial";
publishNode.append(publish);

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
input.onpaste = e => e.preventDefault();
input.onblur = blur;

const angel = document.createElement("div");
angel.style.display = "inline-block";

const tailNode = document.createElement("span");
tailNode.style.color = palette.suggest;
tailNode.style.cursor = "pointer";
tailNode.onclick = () => integrate();

const canvas = document.createElement("div");
canvas.style.padding = "1rem 0.1rem 1rem 1rem";
canvas.style.boxSizing = "border-box";
canvas.style.backgroundColor = palette.background;
canvas.style.fontSize = "3rem";
canvas.style.lineHeight = 1.3;
canvas.style.fontFamily = "serif";
canvas.style.wordBreak = "break-all";
canvas.style.fontVariantLigatures = "none";
canvas.append(publishNode);
canvas.append(highlight);
canvas.append(input);
canvas.append(angel);
canvas.append(tailNode);

const list = document.createElement("div");
getCards();

document.body.style.margin = 0;
document.body.style.flex = 1;
document.body.append(canvas);
document.body.append(list);

const html = document.documentElement;
html.style.display = "flex";
html.style.boxSizing = "border-box";
html.style.minHeight = "100%";

window.onclick = click;

start();

if (window.location.search === "?dev") {
  html.style.border = "5px solid red";
  document.body.style.border = "1px dotted blue";
  canvas.style.border = "2px dashed green";
  publish.style.border = "1px dashed blue";
  publishNode.style.border = "0.5px dotted red";
  highlight.style.border = "2px solid fuchsia";
  coreNode.style.color = "red";
  input.style.border = "2px dashed red";
  tailNode.style.border = "3px solid yellow";
  const button = document.createElement("button");
  button.innerHTML = "focus";
  button.onclick = () => focus();
  canvas.append(button);
}

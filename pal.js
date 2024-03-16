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

const findEnd = chunks => {
  for (let i = Math.floor(chunks.length / 2); i < chunks.length; i++) {
    for (let j = 1; j < chunks.length - i; j++) {
      if (chunks[i-j] !== chunks[i+j]) {
        break;
      }
      if (i+j === chunks.length - 1) {
        const end = chunks.slice(0, i-j).reverse().join("");
        return {end, coreIndex: i};
      }
    }
  }
  const end = chunks.slice(0, chunks.length - 1).reverse().join("");
  return {end, coreIndex: chunks.length - 1};
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

const integrate = () => {
  input.innerHTML += suggest.innerHTML;
  suggest.innerHTML = "";
  caretEnd();
};

const keyPress = e => {
  if (e.key === "Enter") {
    integrate();
    e.preventDefault();
  } else if (e.ctrlKey && ["i", "u", "b"].includes(e.key.toLowerCase()))
    e.preventDefault();
};

const keyRelease = e => {
  const {norm, map} = normalize(input.innerText);
  const chunks = getChunks(norm);
  const {end, coreIndex} = findEnd(chunks);
  suggest.innerText = end;
  if (input.innerText === "") {
    input.style.borderColor = "transparent";
  } else if (isPalindrome(norm)) {
    input.style.borderColor = "green";
  } else {
    input.style.borderColor = "red";
  }
};

const blur = e => {
  saveCaret();
};

const click = e => {
  if (e.target === input) return;
  input.focus();
  restoreCaret();
};

const input = document.createElement("span");
input.contentEditable = "true";
input.setAttribute("autofocus", "autofocus");
input.setAttribute("autocomplete", "off");
input.setAttribute("autocorrect", "off");
input.setAttribute("autocapitalize", "off");
input.setAttribute("spellcheck", "false");
input.style.outline = "none";
input.style.borderWidth = "2px";
input.style.borderStyle = "dashed";
input.style.borderColor = "transparent";
input.onkeydown = keyPress;
input.onkeyup = keyRelease;
input.onblur = blur;

const suggest = document.createElement("span");
suggest.style.color = "gray";

const canvas = document.createElement("div");
canvas.style.padding = "1rem";
canvas.style.boxSizing = "border-box";
canvas.style.minHeight = "100%";
canvas.style.backgroundColor = "white";
canvas.style.fontSize = "3rem";
canvas.style.fontFamily = "serif";
canvas.style.wordBreak = "break-all";
canvas.append(input);
canvas.append(suggest);

document.body.style.margin = 0;
document.body.style.padding = "1rem";
document.body.style.boxSizing = "border-box";
document.body.style.minHeight = "100%";
document.body.style.backgroundColor = "gray";
document.body.append(canvas);

const html = document.documentElement;
html.style.boxSizing = "border-box";
html.style.height = "100%";

window.onclick = click;

if (window.location.search === "?dev") {
  html.style.border = "5px solid red";
  document.body.style.border = "1px dotted blue";
  canvas.style.border = "2px dashed green";
  suggest.style.border = "3px solid yellow";
  const button = document.createElement("button");
  button.innerHTML = "focus";
  button.onclick = () => focus();
  canvas.append(button);
}

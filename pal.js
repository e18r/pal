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

const safe = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "\'": "&#39;",
  "/": "&#x2F;",
  " ": "&nbsp;"
};

const selection = window.getSelection();

let lastCaret = 0;

const isPalindrome = text => {
  return text.split("").reverse().join("") === text;
};

const palindromize = text => {
  if (isPalindrome(text)) return "";
  let isCore = true;
  let core = text.charAt(text.length - 1);
  let end = "";
  for (let i = text.length - 2; i >= 0; i--) {
    if (!isCore || text.charAt(i) !== core) {
      isCore = false;
      end += text.charAt(i);
    }
  }
  return end;
};

const normalize = text => {
  let norm = text.toLowerCase();
  for (let chr in ascii) {
    norm = norm.replaceAll(chr, ascii[chr]);
  }
  norm = norm.replaceAll(/[^a-zñ]/g, "");
  return norm;
};

const sanitize = text => {
  let sane = text;
  for (let chr in safe) {
    sane = sane.replaceAll(chr, safe[chr]);
  }
  return sane;
};

const caret = () => {
  selection.selectAllChildren(input);
  selection.collapseToStart();
  for(let i = 0; i < lastCaret; i++) {
    selection.modify("move", "forward", "character");
  }
};

const integrate = () => {
  input.innerHTML += suggest.innerHTML;
  suggest.innerHTML = "";
  selection.selectAllChildren(input);
  selection.collapseToEnd();
  selection.modify("move", "backward", "character");
  selection.modify("move", "forward", "character");
};

const keyPress = e => {
  if (e.key === "Enter") {
    integrate();
    e.preventDefault();
  }
};

const keyRelease = e => {
  suggest.innerHTML = palindromize(normalize(input.innerText));
  if (input.innerText === "") {
    input.style.borderColor = "transparent";
    input.style.caretColor = "red";
  } else if (isPalindrome(normalize(input.innerText))) {
    input.style.borderColor = "green";
    input.style.caretColor = "green";
  } else {
    input.style.borderColor = "red";
    input.style.caretColor = "red";
  }
};

const blur = e => {
  lastCaret = selection.anchorOffset;
};

const click = e => {
  if (e.target === input) return;
  input.focus();
  caret();
};

const input = document.createElement("span");
input.contentEditable = "true";
input.setAttribute("autofocus", "autofocus");
input.setAttribute("autocomplete", "off");
input.setAttribute("autocorrect", "off");
input.setAttribute("autocapitalize", "off");
input.setAttribute("spellcheck", "false");
input.style.outline = "none";
input.style.caretColor = "red";
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

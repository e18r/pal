import palette from "./palette.js";

const KEY_DOWN = new CustomEvent("inputKeyDown");
const KEY_UP = new Event("inputKeyUp");
const CUT = new Event("inputCut");
const BLUR = new Event("inputBlur");
const FOCUS = new Event("inputFocus");

const selection = window.getSelection();

let lastCaret = 0;

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

const caretStart = () => {
  selection.selectAllChildren(input);
  selection.collapseToStart();
};

const focus = () => {
  if (document.activeElement === input) return;
  input.focus();
  caretEnd();
};

const flip = () => {
  const flipped = endHigh.innerText + coreHigh.innerText + startHigh.innerText;
  input.innerText = flipped;
};

const erase = () => {
  input.innerText = "";
};

const coreOnly = () => {
  input.innerText = coreHigh.innerText;
};

const highlight = (start, core, end) => {
  startHigh.innerText = start;
  coreHigh.innerText = core;
  endHigh.innerText = end;
};

const togglePalindrome = isPalindrome => {
  if (isPalindrome) {
    startHigh.style.borderColor = palette.palindrome;
    coreHigh.style.borderColor = palette.palindrome;
    coreHigh.style.backgroundColor = palette.palindrome;
    endHigh.style.borderColor = palette.palindrome;
  } else {
    startHigh.style.borderColor = "transparent";
    coreHigh.style.backgroundColor = "transparent";
    coreHigh.style.borderColor = palette.core;
    endHigh.style.borderColor = "transparent";
  }
};

const get = what => {
  if (!what) return input.innerText;
  if (what === "start") return startHigh.innerText;
  if (what === "core") return coreHigh.innerText;
  if (what === "end") return endHigh.innerText;
}

const add = (first, last) => {
  input.innerHTML = first + input.innerHTML + last;
};

const startHigh = document.createElement("span");
startHigh.id = "startHigh";
startHigh.style.borderWidth = "0.3rem";
startHigh.style.borderStyle = "solid none";
startHigh.style.borderColor = "transparent";

const coreHigh = document.createElement("span");
coreHigh.id = "coreHigh";
coreHigh.style.borderWidth = "0.3rem";
coreHigh.style.borderStyle = "solid none";
coreHigh.style.borderColor = palette.core;

const endHigh = document.createElement("span");
endHigh.id = "endHigh";
endHigh.style.borderWidth = "0.3rem";
endHigh.style.borderStyle = "solid none";
endHigh.style.borderColor = "transparent";

const input = document.createElement("span");
input.id = "input";
input.contentEditable = "true";
input.setAttribute("autofocus", "autofocus");
input.setAttribute("autocomplete", "off");
input.setAttribute("autocorrect", "off");
input.setAttribute("autocapitalize", "off");
input.setAttribute("spellcheck", "false");
input.style.outline = "none";
input.style.borderWidth = "0.3rem";
input.style.borderStyle = "solid none";
input.style.borderColor = "transparent";
input.style.color = palette.input;
input.onkeydown = e => {
  const KEY_DOWN = new CustomEvent("inputKeyDown", { detail: e });
  document.dispatchEvent(KEY_DOWN);
}
input.onkeyup = () => document.dispatchEvent(KEY_UP);
input.oncut = () => document.dispatchEvent(CUT);
input.onpaste = e => e.preventDefault();
input.onblur = () => document.dispatchEvent(BLUR);
input.onfocus = () => document.dispatchEvent(FOCUS);

const angel = document.createElement("div");
angel.id = "angel";
angel.style.display = "inline-block";

if (window.location.search === "?dev") {
  coreHigh.style.color = "red";
  input.style.border = "2px dashed red";
}

export default {
  focus,
  saveCaret,
  caretEnd,
  caretStart,
  flip,
  erase,
  coreOnly,
  highlight,
  togglePalindrome,
  get,
  add,
  startHigh,
  coreHigh,
  endHigh,
  input,
  angel
};

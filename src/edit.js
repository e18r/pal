import palette from "./palette.js";
import indr from "./indr.js";

const PUBLISH = new Event("publish");

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
  const chunks = [];
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

const publishPalindrome = async () => {
  if (!confirm(input.innerText)) return;
  publishLoading(true);
  let response;
  try {
    response = await fetch(indr.indr + "/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: input.innerText
      })
    });
  } catch (err) {
    indr.networkIssue();
    publishLoading(false);
    return;
  }
  // const id = await response.text();
  // TODO: card view
  document.dispatchEvent(PUBLISH);
  input.innerText = "";
  update();
  publishLoading(false);
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
  startHigh.animate(
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
  const animations = startHigh.getAnimations();
  animations.forEach(animation => animation.cancel());
  input.style.caretColor = palette.input;
};

const togglePublish = show => {
  if (show) publish.style.display = "inline";
  else publish.style.display = "none";
};

const publishLoading = loading => {
  if (loading) publish.setAttribute("src", "./loading.gif");
  else publish.setAttribute("src", "./publish.png");
};

const update = () => {
  const text = input.innerText;
  const {norm, map} = normalize(text);
  const chunks = getChunks(norm);
  const {tail, coreIndex} = suggest(chunks);
  tailNode.innerText = tail;
  const {start, core, end} = split(chunks, coreIndex, map, text);
  startHigh.innerText = start;
  coreHigh.innerText = core;
  endHigh.innerText = end;
  tailHigh.innerText = tail;
  if (norm && isPalindrome(norm)) {
    input.style.borderStyle = "solid";
    startHigh.style.borderColor = palette.palindrome;
    coreHigh.style.backgroundColor = palette.palindrome;
    coreHigh.style.borderColor = palette.palindrome;
    endHigh.style.borderColor = palette.palindrome;
    tailHigh.style.borderColor = palette.palindrome;
    if (indr.isOnline()) togglePublish(true);
    else togglePublish(false);
  } else {
    input.style.borderStyle = "solid none solid solid";
    startHigh.style.borderColor = "transparent";
    coreHigh.style.backgroundColor = "transparent";
    coreHigh.style.borderColor = palette.core;
    endHigh.style.borderColor = "transparent";
    tailHigh.style.borderColor = "transparent";
    togglePublish(false);
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
  if (["Enter", "Tab", "End"].includes(e.key)) {
    integrate();
    e.preventDefault();
  } else if (e.ctrlKey && ["i", "u", "b"].includes(e.key.toLowerCase()))
    e.preventDefault();
  else if (e.repeat) update();
};

const blur = e => {
  saveCaret();
  unblink();
};

const focus = e => {
  if (input.innerHTML === "") blink();
};

const click = e => {
  if (document.activeElement === input) return;
  input.focus();
  caretEnd();
}

document.addEventListener("online", e => {
  if (input.innerText) update();
});

document.addEventListener("offline", e => {
  if (input.innerText) update();
});

const publish = document.createElement("img");
publish.setAttribute("src", "./publish.png");
publish.style.height = "2rem";
publish.style.display = "none";
publish.style.cursor = "pointer";
publish.onclick = publishPalindrome;

const publishNode = document.createElement("div");
publishNode.style.margin = "auto";
publishNode.style.height = "2rem";
publishNode.style.lineHeight = "initial";
publishNode.style.fontSize = "initial";
publishNode.append(publish);

const startHigh = document.createElement("span");
startHigh.style.borderWidth = "0.3rem";
startHigh.style.borderStyle = "solid none solid solid";
startHigh.style.borderColor = "transparent";

const coreHigh = document.createElement("span");
coreHigh.style.borderWidth = "0.3rem";
coreHigh.style.borderStyle = "solid none";
coreHigh.style.borderColor = palette.core;

const endHigh = document.createElement("span");
endHigh.style.borderWidth = "0.3rem";
endHigh.style.borderStyle = "solid none";
endHigh.style.borderColor = "transparent";

const tailHigh = document.createElement("span");
tailHigh.style.borderWidth = "0.3rem";
tailHigh.style.borderStyle = "solid solid solid none";
tailHigh.style.borderColor = "transparent";

const highlight = document.createElement("div");
highlight.style.height = "0px";
highlight.style.color = "transparent";
highlight.append(startHigh);
highlight.append(coreHigh);
highlight.append(endHigh);
highlight.append(tailHigh);

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
input.onfocus = focus;

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
canvas.style.textAlign = "center";
canvas.onclick = click;
canvas.style.fontVariantLigatures = "none";
canvas.append(publishNode);
canvas.append(highlight);
canvas.append(input);
canvas.append(angel);
canvas.append(tailNode);

if (window.location.search === "?dev") {
  canvas.style.border = "2px dashed green";
  publish.style.border = "1px dashed blue";
  publishNode.style.border = "0.5px dotted red";
  highlight.style.border = "2px solid fuchsia";
  coreHigh.style.color = "red";
  input.style.border = "2px dashed red";
  tailNode.style.border = "3px solid yellow";
  const button = document.createElement("button");
  button.innerHTML = "focus";
  button.onclick = () => focus();
  canvas.append(button);
}

export default { blink, canvas };

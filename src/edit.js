import palette from "./palette.js";
import indr from "./indr.js";
import palindrome from "./palindrome.js";
import tools from "./tools.js";
import freezer from "./freezer.js";

const PUBLISH = new Event("publish");

const selection = window.getSelection();

let lastCaret = 0;

const publishPalindrome = async () => {
  const palindrome = preNode.innerText + input.innerText + postNode.innerText;
  if (!confirm(palindrome)) return;
  tools.publishLoading(true);
  let response;
  try {
    response = await fetch(indr.indr + "/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: palindrome
      })
    });
  } catch (err) {
    indr.networkIssue();
    tools.publishLoading(false);
    return;
  }
  // const id = await response.text();
  // TODO: card view
  document.dispatchEvent(PUBLISH);
  eraseText();
  tools.publishLoading(false);
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
  headHigh.animate(
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
  const animations = headHigh.getAnimations();
  animations.forEach(animation => animation.cancel());
  input.style.caretColor = palette.input;
};

const eraseText = () => {
  input.innerText = "";
  freezer.erase();
  update();
};

const flipText = () => {
  const flipped = endHigh.innerText + coreHigh.innerText + startHigh.innerText;
  input.innerText = flipped;
  update();
};

const freezePalindrome = () => {
  freezer.add(startHigh.innerText, endHigh.innerText);
  input.innerText = coreHigh.innerText;
  update();
};

const thaw = () => {
  input.innerText = freezer.pre() + input.innerText + freezer.post();
  freezer.erase();
  update();
};

const update = () => {
  const text = input.innerText;
  const {norm, map} = palindrome.normalize(text);
  const chunks = palindrome.getChunks(norm);
  const suggestions = palindrome.suggest(chunks);
  const {head, coreIndex, tail} = suggestions[0];
  headNode.innerText = head;
  tailNode.innerText = tail;
  const {start, core, end} = palindrome.split(chunks, coreIndex, map, text);
  headHigh.innerText = head;
  startHigh.innerText = start;
  coreHigh.innerText = core;
  endHigh.innerText = end;
  tailHigh.innerText = tail;
  if (norm && palindrome.isPalindrome(norm)) {
    headHigh.style.borderColor = palette.palindrome;
    startHigh.style.borderColor = palette.palindrome;
    coreHigh.style.backgroundColor = palette.palindrome;
    coreHigh.style.borderColor = palette.palindrome;
    endHigh.style.borderColor = palette.palindrome;
    tailHigh.style.borderColor = palette.palindrome;
    if (end !== start) tools.toggleFlip(true);
    else tools.toggleFlip(false);
    if (start !== "") tools.toggleFreeze(true);
    else tools.toggleFreeze(false);
  } else {
    headHigh.style.borderColor = "transparent";
    startHigh.style.borderColor = "transparent";
    coreHigh.style.backgroundColor = "transparent";
    coreHigh.style.borderColor = palette.core;
    endHigh.style.borderColor = "transparent";
    tailHigh.style.borderColor = "transparent";
    tools.togglePublish(false);
    tools.toggleFlip(false);
    tools.toggleFreeze(false);
  }
  if (indr.isOnline() && palindrome.isPalindrome(norm) &&
      (norm || freezer.pre())) tools.togglePublish(true);
  else tools.togglePublish(false);

  if (text) unblink();
  else blink();
  if (text || freezer.pre()) tools.toggleErase(true);
  else tools.toggleErase(false);
};

const integrate = () => {
  input.innerHTML = headNode.innerHTML + input.innerHTML;
  headNode.innerHTML = "";
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

document.addEventListener("publishClicked", publishPalindrome);
document.addEventListener("eraseClicked", eraseText);
document.addEventListener("flipClicked", flipText);
document.addEventListener("freezeClicked", freezePalindrome);

document.addEventListener("thawClicked", thaw);

const headHigh = document.createElement("span");
headHigh.id = "headHigh";
headHigh.style.borderWidth = "0.3rem";
headHigh.style.borderStyle = "solid none solid solid";
headHigh.style.borderColor = "transparent";

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

const tailHigh = document.createElement("span");
tailHigh.id = "tailHigh";
tailHigh.style.borderWidth = "0.3rem";
tailHigh.style.borderStyle = "solid solid solid none";
tailHigh.style.borderColor = "transparent";

const highlight = document.createElement("div");
highlight.id = "highlight";
highlight.style.height = "0px";
highlight.style.color = "transparent";
highlight.append(freezer.preHigh);
highlight.append(headHigh);
highlight.append(startHigh);
highlight.append(coreHigh);
highlight.append(endHigh);
highlight.append(tailHigh);
highlight.append(freezer.postHigh);

const headNode = document.createElement("span");
headNode.id = "headNode";
headNode.style.borderWidth = "0.3rem";
headNode.style.borderStyle = "solid none solid solid";
headNode.style.borderColor = "transparent";
headNode.style.color = palette.suggest;
headNode.style.cursor = "pointer";
headNode.onclick = () => integrate();

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
input.onkeydown = keyPress;
input.onkeyup = () => update();
input.oncut = () => setTimeout(update, 0);
input.onpaste = e => e.preventDefault();
input.onblur = blur;
input.onfocus = focus;

const angel = document.createElement("div");
angel.id = "angel";
angel.style.display = "inline-block";

const tailNode = document.createElement("span");
tailNode.id = "tailNode";
tailNode.style.borderWidth = "0.3rem";
tailNode.style.borderStyle = "solid solid solid none";
tailNode.style.borderColor = "transparent";
tailNode.style.color = palette.suggest;
tailNode.style.cursor = "pointer";
tailNode.onclick = () => integrate();

const canvas = document.createElement("div");
canvas.id = "canvas";
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
canvas.append(tools.publishNode);
canvas.append(highlight);
canvas.append(freezer.preNode);
canvas.append(headNode);
canvas.append(input);
canvas.append(angel);
canvas.append(tailNode);
canvas.append(freezer.postNode);
canvas.append(tools.tools);

if (window.location.search === "?dev") {
  canvas.style.border = "2px dashed green";
  highlight.style.border = "2px solid fuchsia";
  coreHigh.style.color = "red";
  headNode.style.border = "3px solid yellow";
  input.style.border = "2px dashed red";
  tailNode.style.border = "3px solid yellow";
}

export default { blink, canvas };

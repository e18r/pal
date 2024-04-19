import palette from "./palette.js";
import indr from "./indr.js";

const PUBLISH = new Event("publish");

const selection = window.getSelection();

let lastCaret = 0;

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
  const suggestions = suggest(chunks);
  const {head, coreIndex, tail} = suggestions[0];
  headNode.innerText = head;
  tailNode.innerText = tail;
  const {start, core, end} = split(chunks, coreIndex, map, text);
  headHigh.innerText = head;
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

const headHigh = document.createElement("span");
headHigh.style.borderWidth = "0.3rem";
headHigh.style.borderStyle = "solid none solid solid";
headHigh.style.borderColor = "transparent";

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
highlight.append(headHigh);
highlight.append(startHigh);
highlight.append(coreHigh);
highlight.append(endHigh);
highlight.append(tailHigh);

const headNode = document.createElement("span");
headNode.style.color = palette.suggest;
headNode.style.cursor = "pointer";
headNode.onclick = () => integrate();

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
canvas.append(headNode);
canvas.append(input);
canvas.append(angel);
canvas.append(tailNode);

if (window.location.search === "?dev") {
  canvas.style.border = "2px dashed green";
  publish.style.border = "1px dashed blue";
  publishNode.style.border = "0.5px dotted red";
  highlight.style.border = "2px solid fuchsia";
  coreHigh.style.color = "red";
  headNode.style.border = "3px solid yellow";
  input.style.border = "2px dashed red";
  tailNode.style.border = "3px solid yellow";
}

export default { blink, canvas };

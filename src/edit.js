import palette from "./palette.js";
import indr from "./indr.js";
import palindrome from "./palindrome.js";
import tools from "./tools.js";
import freezer from "./freezer.js";
import suggest from "./suggest.js";
import input from "./input.js";

const PUBLISH = new Event("publish");

const publishPalindrome = async () => {
  const palindrome = freezer.pre() + input.get() + freezer.post();
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

const eraseText = () => {
  input.erase();
  freezer.erase();
  update();
};

const flipText = () => {
  input.flip();
  update();
};

const freezePalindrome = () => {
  freezer.add(input.get("start"), input.get("end"));
  input.coreOnly();
  update();
};

const thaw = () => {
  input.add(freezer.pre(), freezer.post());
  freezer.erase();
  update();
};

const update = () => {
  const text = input.get();
  const {norm, map} = palindrome.normalize(text);
  const chunks = palindrome.getChunks(norm);
  const suggestions = palindrome.suggest(chunks);
  const {head, coreIndex, tail} = suggestions[0];
  suggest.set(head, tail);
  const {start, core, end} = palindrome.split(chunks, coreIndex, map, text);
  input.highlight(start, core, end);
  if (norm && palindrome.isPalindrome(norm)) {
    input.togglePalindrome(true);
    suggest.togglePalindrome(true);
    if (end !== start) tools.toggleFlip(true);
    else tools.toggleFlip(false);
    if (start !== "") tools.toggleFreeze(true);
    else tools.toggleFreeze(false);
  } else {
    input.togglePalindrome(false);
    suggest.togglePalindrome(false);
    tools.togglePublish(false);
    tools.toggleFlip(false);
    tools.toggleFreeze(false);
  }
  if (indr.isOnline() && palindrome.isPalindrome(norm) &&
      (norm || freezer.pre())) tools.togglePublish(true);
  else tools.togglePublish(false);

  if (text) suggest.unblink();
  else suggest.blink();
  if (text || freezer.pre()) tools.toggleErase(true);
  else tools.toggleErase(false);
};

const integrate = () => {
  input.add(suggest.head(), suggest.tail());
  suggest.erase();
  input.caretEnd();
  update();
};

const keyPress = customEvent => {
  const e = customEvent.detail;
  if (["Enter", "Tab", "End"].includes(e.key)) {
    integrate();
    e.preventDefault();
  } else if (e.ctrlKey && ["i", "u", "b"].includes(e.key.toLowerCase()))
    e.preventDefault();
  else if (e.repeat) update();
};

const blur = e => {
  input.saveCaret();
  suggest.unblink();
};

const focus = e => {
  if (input.get() === "") suggest.blink();
};

const click = e => {
  input.focus();
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
document.addEventListener("headClicked", integrate);
document.addEventListener("tailClicked", integrate);
document.addEventListener("inputKeyDown", keyPress);
document.addEventListener("inputKeyUp", update);
document.addEventListener("inputCut", update);
document.addEventListener("inputFocus", focus);
document.addEventListener("inputBlur", blur);

const highlight = document.createElement("div");
highlight.id = "highlight";
highlight.style.height = "0px";
highlight.style.color = "transparent";
highlight.append(freezer.preHigh);
highlight.append(suggest.headHigh);
highlight.append(input.startHigh);
highlight.append(input.coreHigh);
highlight.append(input.endHigh);
highlight.append(suggest.tailHigh);
highlight.append(freezer.postHigh);

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
canvas.append(suggest.headNode);
canvas.append(input.input);
canvas.append(input.angel);
canvas.append(suggest.tailNode);
canvas.append(freezer.postNode);
canvas.append(tools.tools);

if (window.location.search === "?dev") {
  canvas.style.border = "2px dashed green";
  highlight.style.border = "2px solid fuchsia";
}

export default { blink: suggest.blink, canvas };

import palette from "./palette.js";

const THAW_CLICKED = new Event("thawClicked");

const erase = () => {
  preNode.innerText = "";
  preNode.style.borderColor = "transparent";
  postNode.innerText = "";
  postNode.style.borderColor = "transparent";
  preHigh.innerText = "";
  postHigh.innerText = "";
};

const add = (start, end) => {
  preNode.innerText += start;
  preNode.style.borderColor = palette.frozen;
  postNode.innerText = end + postNode.innerText;
  postNode.style.borderColor = palette.frozen;
  preHigh.innerText = preNode.innerText;
  postHigh.innerText = postNode.innerText;
};

const pre = () => preNode.innerText;

const post = () => postNode.innerText;

const preHigh = document.createElement("span");
preHigh.id = "preHigh";
preHigh.style.borderStyle = "solid none solid solid";
preHigh.style.borderWidth = "0.3rem";
preHigh.style.borderColor = "transparent";

const postHigh = document.createElement("span");
postHigh.id = "postHigh";
postHigh.style.borderStyle = "solid solid solid none";
postHigh.style.borderWidth = "0.3rem";
postHigh.style.borderColor = "transparent";

const preNode = document.createElement("span");
preNode.id = "preNode";
preNode.style.borderStyle = "solid none solid solid";
preNode.style.borderWidth = "0.3rem";
preNode.style.borderColor = "transparent";
preNode.style.cursor = "pointer";
preNode.onclick = () => document.dispatchEvent(THAW_CLICKED);

const postNode = document.createElement("span");
postNode.id = "postNode";
postNode.style.borderStyle = "solid solid solid none";
postNode.style.borderWidth = "0.3rem";
postNode.style.borderColor = "transparent";
postNode.style.cursor = "pointer";
postNode.onclick = () => document.dispatchEvent(THAW_CLICKED);

export default { erase, add, pre, post, preHigh, postHigh, preNode, postNode };

import palette from "./palette.js";

const THAW_CLICKED = new Event("thawClicked");

const erase = () => {
  preNode.innerText = "";
  preHigh.innerText = "";
  postNode.innerText = "";
  postHigh.innerText = "";
};

const add = (start, end) => {
  preNode.innerText += start;
  postNode.innerText = end + postNode.innerText;
  preHigh.innerText = preNode.innerText;
  postHigh.innerText = postNode.innerText;
};

const pre = () => preNode.innerText;

const post = () => postNode.innerText;

const preHigh = document.createElement("span");
preHigh.id = "preHigh";

const postHigh = document.createElement("span");
postHigh.id = "postHigh";

const preNode = document.createElement("span");
preNode.id = "preNode";
preNode.style.color = palette.frozen;
preNode.style.cursor = "pointer";
preNode.onclick = () => document.dispatchEvent(THAW_CLICKED);

const postNode = document.createElement("span");
postNode.id = "postNode";
postNode.style.color = palette.frozen;
postNode.style.cursor = "pointer";
postNode.onclick = () => document.dispatchEvent(THAW_CLICKED);

export default { erase, add, pre, post, preHigh, postHigh, preNode, postNode };

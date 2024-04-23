import palette from "./palette.js";

const HEAD_CLICKED = new Event("headClicked");
const TAIL_CLICKED = new Event("tailClicked");

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

const set = (suggestion, location) => {
  erase();
  if (location === "head") {
    headNode.innerText = suggestion;
    headHigh.innerText = suggestion;
  } else if (location === "tail") {
    tailNode.innerText = suggestion;
    tailHigh.innerText = suggestion;
  }
};

const togglePalindrome = isPalindrome => {
  if (isPalindrome) {
    headHigh.style.borderColor = palette.palindrome;
    tailHigh.style.borderColor = palette.palindrome;
  } else {
    headHigh.style.borderColor = "transparent";
    tailHigh.style.borderColor = "transparent";
  }
};

const head = () => headNode.innerHTML;
const tail = () => tailNode.innerHTML;

const erase = () => {
  headNode.innerHTML = "";
  headHigh.innerHTML = "";
  tailNode.innerHTML = "";
  tailHigh.innerHTML = "";
};

const headHigh = document.createElement("span");
headHigh.id = "headHigh";
headHigh.style.borderWidth = "0.3rem";
headHigh.style.borderStyle = "solid none solid solid";
headHigh.style.borderColor = "transparent";

const tailHigh = document.createElement("span");
tailHigh.id = "tailHigh";
tailHigh.style.borderWidth = "0.3rem";
tailHigh.style.borderStyle = "solid solid solid none";
tailHigh.style.borderColor = "transparent";

const headNode = document.createElement("span");
headNode.id = "headNode";
headNode.style.borderWidth = "0.3rem";
headNode.style.borderStyle = "solid none solid solid";
headNode.style.borderColor = "transparent";
headNode.style.color = palette.suggest;
headNode.style.cursor = "pointer";
headNode.onclick = () => document.dispatchEvent(HEAD_CLICKED);

const tailNode = document.createElement("span");
tailNode.id = "tailNode";
tailNode.style.borderWidth = "0.3rem";
tailNode.style.borderStyle = "solid solid solid none";
tailNode.style.borderColor = "transparent";
tailNode.style.color = palette.suggest;
tailNode.style.cursor = "pointer";
tailNode.onclick = () => document.dispatchEvent(TAIL_CLICKED);

if (window.location.search === "?dev") {
  headNode.style.border = "3px solid yellow";
  tailNode.style.border = "3px solid yellow";
}

export default {
  blink,
  unblink,
  set,
  togglePalindrome,
  head,
  tail,
  erase,
  head,
  headHigh,
  tailHigh,
  headNode,
  tailNode,
};

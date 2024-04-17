import indr from "./indr.js";
import list from "./list.js";
import edit from "./edit.js";

const start = async () => {
  list.addLoadingCards();
  indr.monitor();
  if (!indr.isOnline()) list.finishLoading();
  edit.blink();
  setInterval(list.getCards, 10000);
};

document.body.style.margin = 0;
document.body.style.flex = 1;
document.body.style.maxWidth = "100%";
document.body.append(edit.canvas);
document.body.append(list.list);

const html = document.documentElement;
html.style.display = "flex";
html.style.boxSizing = "border-box";
html.style.minHeight = "100%";

start();

if (window.location.search === "?dev") {
  html.style.border = "5px solid red";
  document.body.style.border = "1px dotted blue";
}

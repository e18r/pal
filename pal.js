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
  "ü": "u",
  "ñ": "n"
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
  norm = norm.replaceAll(/[^a-z]/g, "");
  return norm;
};

const sanitize = text => {
  let sane = text;
  for (let chr in safe) {
    sane = sane.replaceAll(chr, safe[chr]);
  }
  return sane;
};

const integrate = () => {
  stem.value += end.innerHTML;
  end.innerHTML = "";
};

const type = e => {
  suggest.innerHTML = palindromize(normalize(stem.innerText));
};

const press = e => {
  // if (
  //   e.key === "Enter"
  //     || (e.key === "ArrowRight" && stem.selectionStart === stem.value.length)
  // ) integrate();
  // else if (e.key === "Backspace" || e.key === "Delete") {
  //   const nextLength = stem.value.length - 1;
  //   placeholder.innerHTML = sanitize(stem.value.substring(0, nextLength));
  // }
  // else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
  //   placeholder.innerHTML = sanitize(stem.value + e.key);
  // }
};

const stem = document.createElement("span");
stem.contentEditable = "plaintext-only";
stem.setAttribute("autofocus", "autofocus");
stem.setAttribute("autocomplete", "off");
stem.setAttribute("autocorrect", "off");
stem.setAttribute("autocapitalize", "off");
stem.setAttribute("spellcheck", "false");
stem.style.outline = "none";
stem.style.caretColor = "red";
stem.onkeydown = press;
stem.onkeyup = type;
window.onmouseover = () => stem.focus();
window.onclick = () => stem.focus();

const suggest = document.createElement("span");
suggest.style.color = "gray";

const canvas = document.createElement("div");
canvas.style.margin = "4rem";
canvas.style.fontSize = "3rem";
canvas.style.fontFamily = "serif";
canvas.style.wordBreak = "break-all";
canvas.append(stem);
canvas.append(suggest);

document.body.style.margin = 0;
document.body.append(canvas);

if (window.location.search === "?dev") {
  canvas.style.border = "2px dotted red";
  stem.style.border = "3px dotted gray";
  suggest.style.border = "2px dashed pink";
}

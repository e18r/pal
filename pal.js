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
  placeholder.innerHTML = sanitize(stem.value);
  end.innerHTML = palindromize(normalize(stem.value));
};

const press = e => {
  if (
    e.key === "Enter"
      || (e.key === "ArrowRight" && stem.selectionStart === stem.value.length)
  ) integrate();
  else if (e.key === "Backspace" || e.key === "Delete") {
    const nextLength = stem.value.length - 1;
    placeholder.innerHTML = sanitize(stem.value.substring(0, nextLength));
  }
  else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    placeholder.innerHTML = sanitize(stem.value + e.key);
  }
};

document.body.style.margin = 0;

const canvas = document.createElement("div");
canvas.style.position = "relative";
canvas.style.margin = "4rem";
document.body.append(canvas);

const stem = document.createElement("input");
stem.setAttribute("autofocus", "autofocus");
stem.setAttribute("autocomplete", "off");
stem.setAttribute("autocorrect", "off");
stem.setAttribute("autocapitalize", "off");
stem.setAttribute("spellcheck", "false");
stem.style.position = "relative";
stem.style.zIndex = 1;
stem.style.width = "100%";
stem.style.borderStyle = "none";
stem.style.outline = "none";
stem.style.padding = 0;
stem.style.fontSize = "3rem";
stem.style.fontFamily = "serif";
stem.style.caretColor = "red";
stem.onkeydown = press;
stem.onkeyup = type;
canvas.append(stem);
window.onmouseover = () => stem.focus();
window.onclick = () => stem.focus();

const endContainer = document.createElement("div");
endContainer.style.position = "absolute";
endContainer.style.top = 0;
endContainer.style.fontSize = "3rem";
endContainer.style.fontFamily = "serif";
canvas.append(endContainer);

const placeholder = document.createElement("span");
placeholder.style.position = "relative";
placeholder.style.zIndex = 0;
endContainer.append(placeholder);

const end = document.createElement("span");
end.style.position = "relative";
end.style.zIndex = 2;
end.style.color = "#A0A0A0";
end.onclick = () => integrate();
endContainer.append(end);

canvas.style.border = "2px dotted red";
stem.style.border = "3px dotted gray";
endContainer.style.border = "2px dashed blue";
placeholder.style.border = "2px outset yellow";
end.style.border = "2px groove green";
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

const isPalindrome = text => {
  return text.split("").reverse().join("") === text;
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

/**
   Given a normalized text, provide all the different ways in which that text
   can become a palindrome. Return an array of suggestions, the first of which
   is the recommended one, i.e., the shortest, with prelation to tail
   suggestions.
*/
const suggest = norm => {
  const suggestions = [];
  for (let div = 0; div < norm.length / 2; div++) {
    const start = norm.substring(0, div).split("").reverse().join("");
    const subEnd = norm.substring(div, div + start.length);
    const subEndCore = norm.substring(div + 1, div + 1 + start.length);
    if (start === subEnd) suggestions.push({
      div,
      hasCore: false,
      suggestion: norm.substring(div + start.length)
        .split("").reverse().join(""),
      location: "head",
    });
    if (start === subEndCore) suggestions.push({
      div,
      hasCore: true,
      suggestion: norm.substring(div + 1 + start.length)
        .split("").reverse().join(""),
      location: "head",
    });
  }
  for (let div = norm.length - 1; div >= norm.length / 2; div--) {
    const end = norm.substring(div).split("").reverse().join("");
    const subStart = norm.substring(div - end.length, div);
    const endCore = norm.substring(div + 1).split("").reverse().join("");
    const subStartCore = norm.substring(div - endCore.length, div);
    if (end === subStart) suggestions.push({
      div,
      hasCore: false,
      suggestion: norm.substring(0, div - end.length)
        .split("").reverse().join(""),
      location: "tail",
    });
    if (endCore === subStartCore) suggestions.push({
      div,
      hasCore: true,
      suggestion: norm.substring(0, div - endCore.length)
        .split("").reverse().join(""),
      location: "tail",
    });
  }
  suggestions.push({
    div: norm.length,
    hasCore: false,
    suggestion: norm.split("").reverse().join(""),
    location: "tail",
  });
  suggestions.sort((a, b) => {
    if (a.suggestion.length === b.suggestion.length) {
      if (a.location === "tail") return -1;
      else return 1;
    }
    else return a.suggestion.length - b.suggestion.length;
  });
  return suggestions;
};

const split = (norm, div, hasCore, map, text) => {
  if (norm.length === 0) return {start: "", core: "", end: ""};
  const start = text.substring(0, map[div]);
  const core = hasCore ? text.charAt(map[div]) : "";
  const end = hasCore ? text.substring(map[div] + 1) : text.substring(map[div]);
  return {start, core, end};
};

export default { isPalindrome, normalize, suggest, split, };

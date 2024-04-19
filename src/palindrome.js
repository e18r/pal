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

const getChunks = text => {
  const chunks = [];
  for (let i = 0; i < text.length; i++) {
    for (let j = i+1; j <= text.length; j++) {
      if (text[i] !== text[j]) {
        chunks.push(text.substring(i, j));
        i = j-1;
        break;
      }
    }
  }
  return chunks;
};

const suggest = chunks => {
  const suggestions = [];
  for (let i = 1; i < chunks.length; i++) {
    const start = chunks.slice(0, i).join("");
    const end = chunks.slice(i+1).join("");
    const length = Math.min(start.length, end.length);
    for(let j = 0; j < length; j++) {
      if (start[start.length - 1 - j] !== end[j]) {
        break;
      }
      if (j === length - 1) {
        const unmatchedEnd = end.substring(j + 1);
        const head = unmatchedEnd.split("").reverse().join("");
        const unmatchedStart = start.substring(0, start.length - 1 - j);
        const tail = unmatchedStart.split("").reverse().join("");
        suggestions.push({coreIndex: i, head, tail});
      }
    }
  }
  suggestions.sort((a, b) => {
    const lengthA = a.head.length + a.tail.length;
    const lengthB = b.head.length + b.tail.length;
    if (lengthA === lengthB) {
      return a.head.length - b.head.length;
    } else return lengthA - lengthB;
  });
  const tail = chunks.slice(0, chunks.length - 1).reverse().join("");
  suggestions.push({coreIndex: chunks.length - 1, head: "", tail});
  if (tail === "") return suggestions;
  const head = chunks.slice(1).reverse().join("");
  suggestions.push({coreIndex: 0, head, tail: ""});
  return suggestions;
};

const split = (chunks, coreIndex, map, text) => {
  if (chunks.length === 0) return {start: "", core: "", end: ""};
  const normStart = chunks.slice(0, coreIndex).join("");
  const normStartIndex = normStart.length;
  const startIndex = map[normStartIndex];
  const normEndIndex = normStartIndex + chunks[coreIndex].length - 1;
  const endIndex = map[normEndIndex];
  const start = text.substring(0, startIndex);
  const core = text.substring(startIndex, endIndex + 1);
  const end = text.substring(endIndex + 1);
  return {start, core, end};
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

export default { isPalindrome, getChunks, suggest, split, normalize };

import indr from "./indr.js";

const LOADING_CARD_TEXT = "Se dice: de ti seré si te decides";
const LOADING_CARD_AMOUNT = 5;

const loadingCards = [];
const cardIds = [];

const createCard = () => {
  const card = document.createElement("div");
  card.style.borderStyle = "solid";
  card.style.borderWidth = "1px";
  card.style.borderColor = "black";
  card.style.height = "4rem";
  card.style.fontSize = "2rem";
  card.style.display = "flex";
  card.style.alignContent = "center";
  card.style.justifyContent = "center";
  card.style.flexWrap = "wrap";
  card.style.overflowX = "auto";
  return card;
};

const setLoading = card => {
  card.className = "loading";
  card.innerText = LOADING_CARD_TEXT;
  card.style.color = "transparent";
  card.style.userSelect = "none";
  card.animate(
    {
      textShadow: ["0 0 10px black", "0 0 10px gray", "0 0 10px black"],
      easing: "ease-in"
    },
    {
      duration: 1500,
      iterations: Infinity
    }
  );
};

const populate = (card, text) => {
  card.className = "populated";
  card.innerText = text;
  card.style.textShadow = "initial";
  card.style.color = "black";
  card.style.userSelect = "initial";
  card.getAnimations().forEach(animation => animation.cancel());
};

const setText = (card, text) => {
  card.innerText = text;
};

const addLoadingCards = () => {
  for (let i = 0; i < LOADING_CARD_AMOUNT; i++) {
    const card = createCard();
    setLoading(card);
    list.prepend(card);
    loadingCards.unshift(card);
  }
};

const addCard = (text, id) => {
  if (cardIds.includes(id)) return;
  else cardIds.push(id);
  if (loadingCards.length) {
    const card = loadingCards.pop();
    populate(card, text);
  } else {
    const card = createCard();
    setText(card, text);
    list.prepend(card);
  }
};

const finishLoading = () => {
  if (loadingCards.length) {
    loadingCards.forEach(card => card.remove());
    loadingCards.splice(0, loadingCards.length);
  }
};

const getCards = async () => {
  if (!indr.isOnline()) return;
  let response;
  try {
    const lastCardId = cardIds[cardIds.length - 1];
    response = await fetch(indr.indr + "/list?after=" + lastCardId);
  } catch (err) {
    indr.networkIssue();
    finishLoading();
    return;
  }
  const palindromes = await response.json();
  if (palindromes.length === 0) {
    finishLoading();
    return;
  }
  palindromes.forEach(palindrome => {
    addCard(palindrome["text"], palindrome["id"]);
  });
  finishLoading();
};

document.addEventListener("online", e => {
  if (!cardIds.length && !loadingCards.length) addLoadingCards();
  getCards();
});

document.addEventListener("offline", e => {
  finishLoading();
});

document.addEventListener("publish", e => {
  getCards();
});

const list = document.createElement("div");

export default { addLoadingCards, finishLoading, getCards, list };

const indr = $INDR_URL;

const INITIAL_ONLINE_INTERVAL = 1000;
const ONLINE_INTERVAL_MULTIPLIER = 1.5;

let online = false;
let onlineInterval = INITIAL_ONLINE_INTERVAL;
let onlineTimeout;

const networkIssue = () => {
  clearTimeout(onlineTimeout);
  onlineInterval = INITIAL_ONLINE_INTERVAL;
  isOnline();
};

const isOnline = async first => {
  try {
    await fetch(indr);
    if (online) onlineInterval *= ONLINE_INTERVAL_MULTIPLIER;
    else {
      online = true;
      onlineInterval = INITIAL_ONLINE_INTERVAL;
      if (!first) {
        addLoadingCards();
        update();
      }
      getCards();
    }
  } catch (err) {
    if (online) {
      online = false;
      onlineInterval = INITIAL_ONLINE_INTERVAL;
      if (!first) update();
    }
    finishLoading();
  }
  onlineTimeout = setTimeout(isOnline, onlineInterval);
};

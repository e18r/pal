const indr = $INDR_URL;

const INITIAL_ONLINE_INTERVAL = 1000;
const ONLINE_INTERVAL_MULTIPLIER = 1.5;

const ONLINE = new Event("online");
const OFFLINE = new Event("offline");

let online = false;
let onlineInterval = INITIAL_ONLINE_INTERVAL;
let nextMonitor;

const networkIssue = () => {
  clearTimeout(nextMonitor);
  onlineInterval = INITIAL_ONLINE_INTERVAL;
  monitor();
};

const monitor = async () => {
  try {
    await fetch(indr);
    if (online) onlineInterval *= ONLINE_INTERVAL_MULTIPLIER;
    else {
      online = true;
      onlineInterval = INITIAL_ONLINE_INTERVAL;
      document.dispatchEvent(ONLINE);
    }
  } catch (err) {
    if (online) {
      online = false;
      onlineInterval = INITIAL_ONLINE_INTERVAL;
      document.dispatchEvent(OFFLINE);
    }
  }
  nextMonitor = setTimeout(monitor, onlineInterval);
};

export default {indr, online, networkIssue, monitor};

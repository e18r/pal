const PUBLISH_CLICKED = new Event("publishClicked");
const INTEGRATE_CLICKED = new Event("integrateClicked");
const ERASE_CLICKED = new Event("eraseClicked");
const FLIP_CLICKED = new Event("flipClicked");
const FREEZE_CLICKED = new Event("freezeClicked");

const togglePublish = enabled => {
  if (enabled) {
    publish.style.cursor = "pointer";
    publish.onclick = () => document.dispatchEvent(PUBLISH_CLICKED);
    publish.style.opacity = 1;
  } else {
    publish.style.cursor = "initial";
    publish.onclick = false;
    publish.style.opacity = 0.2;
  }
};

const publishLoading = loading => {
  if (loading) publish.setAttribute("src", "./loading.gif");
  else publish.setAttribute("src", "./publish.png");
};

const toggleIntegrate = enabled => {
  if (enabled) {
    integrate.style.cursor = "pointer";
    integrate.onclick = () => document.dispatchEvent(INTEGRATE_CLICKED);
    integrate.style.opacity = 1;
  } else {
    integrate.style.cursor = "initial";
    integrate.onclick = false;
    integrate.style.opacity = 0.2;
  }
};

const toggleErase = enabled => {
  if (enabled) {
    erase.style.cursor = "pointer";
    erase.onclick = () => document.dispatchEvent(ERASE_CLICKED);
    erase.style.opacity = 1;
  } else {
    erase.style.cursor = "initial";
    erase.onclick = false;
    erase.style.opacity = 0.2;
  }
};

const toggleFlip = enabled => {
  if (enabled) {
    flip.style.cursor = "pointer";
    flip.onclick = () => document.dispatchEvent(FLIP_CLICKED);
    flip.style.opacity = 1;
  } else {
    flip.style.cursor = "initial";
    flip.onclick = false;
    flip.style.opacity = 0.2;
  }
};

const toggleFreeze = enabled => {
  if (enabled) {
    freeze.style.cursor = "pointer";
    freeze.onclick = () => document.dispatchEvent(FREEZE_CLICKED);
    freeze.style.opacity = 1;
  } else {
    freeze.style.cursor = "initial";
    freeze.onclick = false;
    freeze.style.opacity = 0.2;
  }
};

const publish = document.createElement("img");
publish.id = "publish";
publish.setAttribute("src", "./publish.png");
publish.style.height = "2rem";
publish.style.opacity = 0.2;

const publishNode = document.createElement("div");
publishNode.id = "publishNode";
publishNode.style.lineHeight = "initial";
publishNode.style.fontSize = "initial";
publishNode.style.marginBottom = "1rem";
publishNode.append(publish);

const integrate = document.createElement("img");
integrate.id = "integrate";
integrate.setAttribute("src", "./integrate.png");
integrate.style.height = "2rem";
integrate.style.opacity = 0.2;

const erase = document.createElement("img");
erase.id = "erase";
erase.setAttribute("src", "./erase.png");
erase.style.height = "2rem";
erase.style.opacity = 0.2;
erase.style.marginLeft = "2rem";

const flip = document.createElement("img");
flip.id = "flip";
flip.setAttribute("src", "./flip.png");
flip.style.height = "2rem";
flip.style.opacity = 0.2;
flip.style.marginLeft = "2rem";

const freeze = document.createElement("img");
freeze.id = "freeze";
freeze.setAttribute("src", "./freeze.png");
freeze.style.height = "2rem";
freeze.style.opacity = 0.2;
freeze.style.marginLeft = "2rem";

const tools = document.createElement("div");
tools.id = "tools";
tools.style.lineHeight = "initial";
tools.style.fontSize = "initial";
tools.style.marginTop = "1rem";
tools.append(integrate);
tools.append(erase);
tools.append(flip);
tools.append(freeze);

if (window.location.search === "?dev") {
  publish.style.border = "1px dashed blue";
  tools.style.border = "0.5px dotted red";
}

export default {
  togglePublish,
  publishLoading,
  toggleIntegrate,
  toggleErase,
  toggleFlip,
  toggleFreeze,
  publishNode,
  tools,
};

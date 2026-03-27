export const setFavicon = (iconPath) => {
  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.type = "image/png";
  link.href = iconPath;
};

export const setDocumentTitle = (title) => {
  document.title = title;
};

export const faviconStates = {
  idle: {
    icon: "/preppilot-idle.png",
    title: "PrepPilot AI",
  },
  live: {
    icon: "/preppilot-live.png",
    title: "Interview Live • PrepPilot AI",
  },
  processing: {
    icon: "/preppilot-processing.png",
    title: "Processing... • PrepPilot AI",
  },
};
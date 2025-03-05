import { calcEnvironment } from "./configs.js";
let attemptedLoadCount = 0;
const setTheme = (themeConfigJSON) => {
  let themeStyleString = ``;
  themeConfigJSON?.data?.forEach(({ key, value }) => {
    if (key.indexOf('theme-color') === 0) {
      themeStyleString += `--${key}:${value};`;
    }
  });
  const styleEl = document.createElement('style');
  styleEl.className = 'theme';
  styleEl.textContent = `:root{${themeStyleString}}`;
  document.head.appendChild(styleEl);
}
const checkSessionItem = (key) => {
  return new Promise((resolve, reject) => {
    const themeConfig = sessionStorage.getItem(`config:${key}`);
    if (themeConfig) {
      setTheme(JSON.parse(themeConfig));
      resolve(themeConfig); // Resolve the promise with the session value
    } else {
      initThemeLoader();
      reject("Session item is falsy or does not exist.");
    }
  });
}
const initThemeLoader = () => {
  attemptedLoadCount++;
  switch (attemptedLoadCount) {
    case 1:
      checkSessionItem(calcEnvironment());
      break;
    case 2:
      setTimeout(() => {
        checkSessionItem(calcEnvironment());
      }, 200);
    default:
      break;
  }
}
initThemeLoader();
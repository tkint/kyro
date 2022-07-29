export const absoluteOrRelativeURL = (str: string): URL => {
  let url: URL;
  try {
    url = new URL(str);
  } catch (e) {
    url = new URL(str, window.location.origin);
  }
  return url;
};

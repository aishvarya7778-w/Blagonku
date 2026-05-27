import xss from "xss";

export const stripHtml = (value = "") => value.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

export const sanitizeHtml = (value = "") =>
  xss(value, {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      b: [],
      em: [],
      i: [],
      u: [],
      s: [],
      blockquote: [],
      h2: [],
      h3: [],
      ul: [],
      ol: [],
      li: [],
      a: ["href", "title", "target", "rel"],
      code: [],
      pre: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"]
  });

export const estimateReadingTime = (plainText = "") => {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

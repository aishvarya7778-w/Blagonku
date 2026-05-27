export const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
};

export const includesId = (items = [], id) => items.some((item) => getId(item) === getId(id));

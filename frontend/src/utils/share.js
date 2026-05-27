import toast from "react-hot-toast";

export const shareBlog = async ({ title, text, url }) => {
  const shareUrl = url || window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
  } else {
    const input = document.createElement("textarea");
    input.value = shareUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
  toast.success("Link copied");
};

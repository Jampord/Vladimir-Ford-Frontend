export const useFileView = async ({ id }) => {
  try {
    const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/file/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.GL_KEY },
    });
    const blob = await response.blob();
    const fileURL = URL.createObjectURL(blob);

    // Open new window and store reference
    const newWindow = window.open(fileURL, "_blank");

    if (newWindow) {
      // Add to cache and setup cleanup listener
      blobUrlCache.set(newWindow, fileURL);
      newWindow.addEventListener("unload", () => {
        URL.revokeObjectURL(fileURL);
        blobUrlCache.delete(newWindow);
      });
    } else {
      // Revoke immediately if window failed to open
      URL.revokeObjectURL(fileURL);
    }
  } catch (err) {
    console.error("Error handling file view:", err);
  }
  // Cleanup for main window close (optional safety net)
  window.addEventListener("beforeunload", () => {
    blobUrlCache.forEach((url, win) => {
      URL.revokeObjectURL(url);
      blobUrlCache.delete(win);
    });
  });
};

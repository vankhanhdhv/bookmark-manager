chrome.action.onClicked.addListener(async () => {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await chrome.windows.create({
        url: 'popup.html',
        type: 'popup', 
        width: 800,
        height: 600,
        left: Math.floor(currentWindow.left + (currentWindow.width - 800) / 2),
        top: Math.floor(currentWindow.top + (currentWindow.height - 600) / 2)
      });
    } catch (error) {
      console.error('Error:', error);
    }
   });
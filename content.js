let checkForBonusChestOnFirstLoad = false;

// Function which tries to click the "Claim Bonus" button if it is present
function clickClaimBonusButtonIfPresent() {
  const claimButton = document.querySelector('[aria-label="Claim Bonus"]');
  if (claimButton) {
    claimButton.click();
    console.log("[Twitch Bonus Chest Auto Claimer] Chest claimed!");
    setTimeout(() => {
      setupObserver('[aria-label="Claim Bonus"]');
    }, 5000);

    chrome.storage.local.get("claimedBonusChestCount", function (result) {
      const currentCount = result.claimedBonusChestCount || 0;
      chrome.storage.local.set({ claimedBonusChestCount: currentCount + 1 });
    });
  } else if (!checkForBonusChestOnFirstLoad) {
    // If the bonus chest button is not avalaible on the first load, set up the observer on the bonus chest parent node
    console.log(
      "[Twitch Bonus Chest Auto Claimer] Bonus chest parent node found! Looking for the chest button..."
    );
    setupObserver('[aria-label="Claim Bonus"]');
  }
}

// Function to be executed when the target element is found
function onElementPresent(targetSelector) {
  if (targetSelector === '[data-test-selector="community-points-summary"]') {
    if (!checkForBonusChestOnFirstLoad) {
      // On first page load a chest might be already available, so try to click it
      clickClaimBonusButtonIfPresent();
      checkForBonusChestOnFirstLoad = true;
    } else {
      // If the target element is the bonus chest parent node, set up the observer on the bonus chest button
      console.log(
        "[Twitch Bonus Chest Auto Claimer] Bonus chest parent node found! Looking for the chest button..."
      );
      setupObserver('[aria-label="Claim Bonus"]');
    }
  } else if (targetSelector === '[aria-label="Claim Bonus"]') {
    // If the target element is the bonus chest button, try to click it
    console.log(
      "[Twitch Bonus Chest Auto Claimer] Chest button found! Claiming the bonus chest..."
    );
    clickClaimBonusButtonIfPresent();
  }
}

// Function to set up the observer on a target node
function setupObserver(targetSelector) {
  const targetNode = document.querySelector(targetSelector);

  if (targetNode) {
    onElementPresent(targetSelector);
  } else {
    // Set up a MutationObserver to watch for changes in the target node
    const observer = new MutationObserver(function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if the target element is now present
          const foundElement = document.querySelector(targetSelector);
          if (foundElement) {
            observer.disconnect();
            onElementPresent(targetSelector);
            break;
          }
        }
      }
    });

    // Observe for changes inside the target node
    const config = { childList: true, subtree: true };
    if (targetSelector === '[aria-label="Claim Bonus"]') {
      // If the target element is the bonus chest button, only observe the parent node
      observer.observe(
        document.querySelector(
          '[data-test-selector="community-points-summary"]'
        ),
        config
      );
    } else {
      // If the target element is the bonus chest parent node, observe the entire document
      observer.observe(document, config);
    }
  }
}

console.log(
  "[Twitch Bonus Chest Auto Claimer] Twitch bonus chest claimer loaded! Looking for the parentNode..."
);
setupObserver('[data-test-selector="community-points-summary"]');

let firstCheckOnObserverMode = false;
let claimingMethod = "interval";
let observer;

// CSS selector for the claim bonus button
const CLAIM_BONUS_BUTTON_SELECTOR = ".ScCoreButton-sc-ocjdkq-0.cdqvHM";

// Function which tries to click the "Claim Bonus" button if it is present
function clickClaimBonusButtonIfPresent() {
  const claimButton = document.querySelector(CLAIM_BONUS_BUTTON_SELECTOR);
  if (claimButton) {
    claimButton.click();
    console.log("[Twitch Bonus Chest Auto Claimer] Chest claimed!");

    if (claimingMethod == "observer") {
      setTimeout(() => {
        setupObserver(CLAIM_BONUS_BUTTON_SELECTOR);
      }, 5000);
    }

    chrome.storage.local.get("claimedBonusChestCount", function (result) {
      const currentCount = result.claimedBonusChestCount || 0;
      chrome.storage.local.set({ claimedBonusChestCount: currentCount + 1 });
    });
  } else if (firstCheckOnObserverMode) {
    console.log(
      "[Twitch Bonus Chest Auto Claimer] No chest found during the first observer load, starting the observer for bonus chest"
    );
    setupObserver(CLAIM_BONUS_BUTTON_SELECTOR);
  } else {
    console.log(
      "[Twitch Bonus Chest Auto Claimer] Bonus chest not found! Trying again in 30 seconds..."
    );
  }
}

// Function to be executed when the target element is found
function onElementPresent(targetSelector) {
  if (
    targetSelector === ".community-points-summary" &&
    firstCheckOnObserverMode
  ) {
    // On first page load a chest might be already available, so try to click it
    clickClaimBonusButtonIfPresent();
    firstCheckOnObserverMode = false;
  } else if (targetSelector === CLAIM_BONUS_BUTTON_SELECTOR) {
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
    observer = new MutationObserver(function (mutationsList, observer) {
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
    if (targetSelector === CLAIM_BONUS_BUTTON_SELECTOR) {
      // If the target element is the bonus chest button, only observe the parent node
      observer.observe(
        document.querySelector(".community-points-summary"),
        config
      );
    } else {
      // If the target element is the bonus chest parent node, observe the entire document
      observer.observe(document, config);
    }
  }
}

function changeClaimingMethod(method) {
  if (method == "observer") {
    firstCheckOnObserverMode = true;
    console.log(
      "[Twitch Bonus Chest Auto Claimer] Twitch bonus chest claimer loaded! Looking for the parentNode..."
    );
    setupObserver(".community-points-summary");
    clearInterval(intervalId);
    console.log("[Twitch Bonus Chest Auto Claimer] Interval cleared");
  } else if (method == "interval") {
    if (observer) {
      observer.disconnect();
      console.log("[Twitch Bonus Chest Auto Claimer] Observer disconnected");
    }
    clickClaimBonusButtonIfPresent();
    console.log("[Twitch Bonus Chest Auto Claimer] Interval set");
    intervalId = setInterval(clickClaimBonusButtonIfPresent, 30000);
  }
}

// Function to check the class of the chat-shell element
function checkChatShellClass() {
  const chatShell = document.querySelector(".chat-shell");
  if (chatShell) {
    if (chatShell.classList.contains("chat-shell__expanded")) {
      console.log(
        "[Twitch Bonus Chest Auto Claimer] Changing the claiming method to observer"
      );
      claimingMethod = "observer";
      changeClaimingMethod(claimingMethod);
    } else {
      console.log(
        "[Twitch Bonus Chest Auto Claimer] Changing the claiming method to interval"
      );
      claimingMethod = "interval";
      changeClaimingMethod(claimingMethod);
    }
  }
}

// Function to be called when a mutation is observed
function handleMutation(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      checkChatShellClass();
    }
  }
}

// Observe the chat-shell element for changes
const chatShell = document.querySelector(".chat-shell");
if (chatShell) {
  const observer = new MutationObserver(handleMutation);
  observer.observe(chatShell, { attributes: true });
}

// Check the class when the page initially loads
window.addEventListener("load", checkChatShellClass);

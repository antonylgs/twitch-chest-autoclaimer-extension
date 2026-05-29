// Stable hooks for the "Claim Bonus" chest button, in priority order.
// We deliberately avoid Twitch's auto-generated styled-component class
// hashes (e.g. ".ScCoreButton-sc-ocjdkq-0.fOtgyk") because those change on
// every CSS rebuild. The selectors below are semantic/test hooks that have
// stayed stable for years and are language-independent.
const CLAIM_BONUS_SELECTORS = [
  ".claimable-bonus__icon", // the gift icon inside the chest button (most stable)
  '[data-test-selector="community-points-claim"]',
  'button[data-test-selector="community-points-summary__bonus-claim-button"]',
  'button[data-a-target="chat-claim-bonus-button"]',
];

// Finds the claimable chest button if it is currently present and clickable.
function findClaimButton() {
  const summary = document.querySelector(".community-points-summary");
  const scope = summary || document;

  for (const selector of CLAIM_BONUS_SELECTORS) {
    const match = scope.querySelector(selector);
    if (!match) continue;

    // The match may be the icon; climb to the actual clickable button.
    const button = match.closest("button") || match;
    if (button && !button.disabled) {
      return button;
    }
  }

  return null;
}

function clickClaimBonusButtonIfPresent() {
  const claimButton = findClaimButton();
  if (!claimButton) {
    return;
  }

  claimButton.click();
  console.log("[Twitch Bonus Chest Auto Claimer] Chest claimed!");

  chrome.storage.local.get("claimedBonusChestCount", function (result) {
    const currentCount = result.claimedBonusChestCount || 0;
    chrome.storage.local.set({ claimedBonusChestCount: currentCount + 1 });
  });
}

function initiate() {
  clickClaimBonusButtonIfPresent();
  setInterval(clickClaimBonusButtonIfPresent, 5000);
}

// `load` may have already fired by the time the content script runs; guard it.
if (document.readyState === "complete") {
  initiate();
} else {
  window.addEventListener("load", initiate);
}

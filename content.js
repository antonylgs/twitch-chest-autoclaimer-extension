function clickClaimBonusButtonIfPresent() {
  const claimButton = document.querySelector(".ScCoreButton-sc-ocjdkq-0.cdqvHM");
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
  intervalId = setInterval(clickClaimBonusButtonIfPresent, 5000);
}

window.addEventListener("load", initiate);

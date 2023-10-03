// Function to update the bonus count in the popup
function updateBonusCount() {
  chrome.storage.local.get("claimedBonusChestCount", function (result) {
    const claimedBonusChestCount = result.claimedBonusChestCount || 0;
    document.getElementById("bonusChestCount").textContent =
      claimedBonusChestCount.toString() + " ";
    document.getElementById("bonusPointCount").textContent =
      (claimedBonusChestCount * 50).toString() + " ";
  });
}

updateBonusCount();

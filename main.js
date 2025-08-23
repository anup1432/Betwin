// Dropdown menu toggle
document.getElementById("menuBtn").onclick = () => {
  let dropdown = document.getElementById("dropdown");
  dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
};

// Modals
let depositModal = document.getElementById("depositModal");
let withdrawModal = document.getElementById("withdrawModal");

// Open Deposit Modal
document.getElementById("depositOption").onclick = () => depositModal.style.display = "block";
document.getElementById("addBalanceBtn").onclick = () => depositModal.style.display = "block";

// Open Withdraw Modal
document.getElementById("withdrawOption").onclick = () => withdrawModal.style.display = "block";

// Close Modals
document.getElementById("closeDeposit").onclick = () => depositModal.style.display = "none";
document.getElementById("closeWithdraw").onclick = () => withdrawModal.style.display = "none";

// Confirm Deposit
document.getElementById("confirmDeposit").onclick = () => {
  let amount = document.getElementById("depositAmount").value;
  if (amount) {
    alert("Deposit request submitted for $" + amount);
    depositModal.style.display = "none";
  }
};

// Confirm Withdraw
document.getElementById("confirmWithdraw").onclick = () => {
  let wallet = document.getElementById("withdrawWallet").value;
  let amount = document.getElementById("withdrawAmount").value;
  if (wallet && amount) {
    alert("Withdrawal request of $" + amount + " to " + wallet + " submitted.");
    withdrawModal.style.display = "none";
  }
};

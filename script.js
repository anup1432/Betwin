const BASE_URL = 'https://betwin-winn.onrender.com';

async function fetchBalance() {
  try {
    const response = await fetch(`${BASE_URL}/balance`);
    const data = await response.json();
    if (data.ok) {
      document.getElementById('balance').textContent = data.balance;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

async function submitDeposit(txnId) {
  try {
    const response = await fetch(`${BASE_URL}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ txnId }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.ok) {
      alert('Deposit successful');
      fetchBalance();
    } else {
      alert('Deposit failed');
    }
  } catch (error) {
    console.error('Error submitting deposit:', error);
  }
}

async function submitWithdraw(amount, walletAddr) {
  try {
    const response = await fetch(`${BASE_URL}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, walletAddr }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.ok) {
      alert('Withdraw successful');
      fetchBalance();
    } else {
      alert('Withdraw failed');
    }
  } catch (error) {
    console.error('Error submitting withdraw:', error);
  }
}

async function placeBet(amount, direction) {
  try {
    const response = await fetch(`${BASE_URL}/bet`, {
      method: 'POST',
      body: JSON.stringify({ amount, direction }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.ok) {
      alert('Bet placed successfully');
      fetchBalance();
    } else {
      alert('Bet failed');
    }
  } catch (error) {
    console.error('Error placing bet:', error);
  }
}

// Event listeners for buttons
document.getElementById('submitDeposit').addEventListener('click', () => {
  const txnId = document.getElementById('depositTxn').value;
  submitDeposit(txnId);
});

document.getElementById('submitWithdraw').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('wdAmount').value);
  const walletAddr = document.getElementById('wdWallet').value;
  submitWithdraw(amount, walletAddr);
});

document.getElementById('betUp').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('betAmount').value);
  placeBet(amount, 'UP');
});

document.getElementById('betDown').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('betAmount').value);
  placeBet(amount, 'DOWN');
});

// Initial balance fetch
fetchBalance();

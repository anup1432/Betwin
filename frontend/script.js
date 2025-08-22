const API_BASE = "https://betwin-winn.onrender.com"; // tumhara backend

// Graph update
function getGraph() {
    fetch(`${API_BASE}/graph`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("graph").getContext("2d");

            if (window.myChart) {
                window.myChart.data.labels = data.map(p => p.time);
                window.myChart.data.datasets[0].data = data.map(p => p.value);
                window.myChart.update();
            } else {
                window.myChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: data.map(p => p.time),
                        datasets: [{
                            label: "Price",
                            data: data.map(p => p.value),
                            borderColor: "blue",
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: { animation: false }
                });
            }
        })
        .catch(err => console.error(err));
}

// Countdown update
function getCountdown() {
    fetch(`${API_BASE}/graph/countdown`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("countdown").innerText = `Next result in: ${data.remaining}s`;
        })
        .catch(err => console.error(err));
}

// Interval set
setInterval(getGraph, 2000); // graph update
setInterval(getCountdown, 1000); // countdown update

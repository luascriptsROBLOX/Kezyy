function loginWithGoogle() {
    window.location.href = '/auth/google';
}

function generateKey() {
    const username = document.getElementById('usernameInput').value;
    const duration = document.getElementById('durationInput').value;

    fetch('/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, duration })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('keyOutput').innerText = `Key: ${data.key}, Auth ID: ${data.authId}`;
    });
}

// Monitoring chart
const ctx = document.getElementById('usageChart').getContext('2d');
const usageChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Day 1', 'Day 2', 'Day 3'],
        datasets: [{
            label: 'Key Usage',
            data: [12, 19, 3],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    }
});

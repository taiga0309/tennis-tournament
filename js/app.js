// Main application functions

function createSampleTournament() {
    const playerNames = [
        'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
        'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor'
    ];

    createKnockoutTournament('Sample Tournament', playerNames, 3);
    alert('Sample tournament created! You can now access the Admin Panel.');
}

// Utility functions
function formatMatchName(match) {
    return `${match.player1} vs ${match.player2}`;
}

function getMatchStatusColor(status) {
    switch(status) {
        case 'Playing': return '#28a745';
        case 'Next': return '#ffc107';
        case 'Waiting': return '#6c757d';
        case 'Done': return '#17a2b8';
        default: return '#6c757d';
    }
}

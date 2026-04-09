// Player registration functionality

let registeredPlayers = [];

function addPlayer() {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a player name');
        return;
    }
    
    if (registeredPlayers.includes(name)) {
        alert('Player already registered');
        return;
    }
    
    registeredPlayers.push(name);
    nameInput.value = '';
    updatePlayersDisplay();
    updateCreateButton();
}

function removePlayer(name) {
    registeredPlayers = registeredPlayers.filter(p => p !== name);
    updatePlayersDisplay();
    updateCreateButton();
}

function updatePlayersDisplay() {
    const container = document.getElementById('players-container');
    const countElement = document.getElementById('player-count');
    
    countElement.textContent = registeredPlayers.length;
    
    container.innerHTML = registeredPlayers.map(name => `
        <div class="player-item">
            <span>${name}</span>
            <button onclick="removePlayer('${name}')" class="btn btn-small btn-danger">Remove</button>
        </div>
    `).join('');
}

function importBulkPlayers() {
    const textarea = document.getElementById('bulk-players');
    const names = textarea.value.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    names.forEach(name => {
        if (!registeredPlayers.includes(name)) {
            registeredPlayers.push(name);
        }
    });
    
    textarea.value = '';
    updatePlayersDisplay();
    updateCreateButton();
}

function updateCreateButton() {
    const createBtn = document.getElementById('create-btn');
    const minPlayers = document.getElementById('tournament-type').value === 'knockout' ? 4 : 2;
    
    createBtn.disabled = registeredPlayers.length < minPlayers;
    createBtn.textContent = registeredPlayers.length < minPlayers ? 
        `Need at least ${minPlayers} players` : 
        'Create Tournament';
}

function createTournament() {
    const name = document.getElementById('tournament-name').value;
    const type = document.getElementById('tournament-type').value;
    const courts = parseInt(document.getElementById('court-count').value);
    const duration = parseInt(document.getElementById('match-duration').value);
    
    if (!name || registeredPlayers.length < 2) {
        alert('Please fill all required fields');
        return;
    }
    
    // Create tournament based on type
    switch(type) {
        case 'knockout':
            createKnockoutTournament(name, registeredPlayers, courts, duration);
            break;
        case 'league':
            createLeagueTournament(name, registeredPlayers, courts, duration);
            break;
        case 'league-knockout':
            createLeagueKnockoutTournament(name, registeredPlayers, courts, duration);
            break;
    }
    
    alert('Tournament created successfully!');
    window.location.href = 'admin.html';
}

function clearAll() {
    if (confirm('Clear all data? This cannot be undone.')) {
        registeredPlayers = [];
        document.getElementById('tournament-name').value = '';
        document.getElementById('bulk-players').value = '';
        updatePlayersDisplay();
        updateCreateButton();
    }
}

// Event listeners
document.getElementById('player-name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

document.getElementById('tournament-type').addEventListener('change', updateCreateButton);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCreateButton();
});

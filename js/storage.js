// Simple data storage using localStorage

function saveTournament(tournament) {
    localStorage.setItem('tournament', JSON.stringify(tournament));
}

function getTournament() {
    const data = localStorage.getItem('tournament');
    return data ? JSON.parse(data) : null;
}

function saveMatches(matches) {
    localStorage.setItem('matches', JSON.stringify(matches));
}

function getMatches() {
    const data = localStorage.getItem('matches');
    return data ? JSON.parse(data) : [];
}

function savePlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
}

function getPlayers() {
    const data = localStorage.getItem('players');
    return data ? JSON.parse(data) : [];
}

// Clear all data
function clearTournamentData() {
    localStorage.removeItem('tournament');
    localStorage.removeItem('matches');
    localStorage.removeItem('players');
}

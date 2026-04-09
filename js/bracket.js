// Tournament bracket visualization

function generateBracket() {
    const tournament = getTournament();
    const matches = getMatches();
    
    if (!tournament || matches.length === 0) {
        document.getElementById('tournament-bracket').innerHTML = 
            '<p>No tournament data found. Please create a tournament first.</p>';
        return;
    }
    
    if (tournament.type === 'knockout') {
        generateKnockoutBracket(matches);
    } else if (tournament.type === 'league') {
        generateLeagueTable(matches);
    } else {
        generateLeagueKnockoutBracket(matches);
    }
}

function generateKnockoutBracket(matches) {
    const rounds = groupMatchesByRound(matches);
    const bracketContainer = document.getElementById('tournament-bracket');
    
    const bracketHTML = `
        <div class="bracket">
            ${Object.keys(rounds).map(round => `
                <div class="bracket-round">
                    <h3>${getRoundName(round)}</h3>
                    ${rounds[round].map(match => createBracketMatch(match)).join('')}
                </div>
            `).join('')}
        </div>
    `;
    
    bracketContainer.innerHTML = bracketHTML;
}

function groupMatchesByRound(matches) {
    const rounds = {};
    
    matches.forEach(match => {
        const round = match.round || 'R1';
        if (!rounds[round]) {
            rounds[round] = [];
        }
        rounds[round].push(match);
    });
    
    return rounds;
}

function createBracketMatch(match) {
    const statusClass = match.status.toLowerCase();
    const hasScore = match.score1 !== null && match.score2 !== null;
    
    return `
        <div class="bracket-match ${statusClass}">
            <div class="bracket-player ${hasScore && match.winner === match.player1 ? 'winner' : (hasScore ? 'loser' : '')}">
                <span class="player-name">${match.player1}</span>
                ${hasScore ? `<span class="player-score">${match.score1}</span>` : ''}
            </div>
            <div class="bracket-player ${hasScore && match.winner === match.player2 ? 'winner' : (hasScore ? 'loser' : '')}">
                <span class="player-name">${match.player2}</span>
                ${hasScore ? `<span class="player-score">${match.score2}</span>` : ''}
            </div>
            <div class="match-info">
                ${getMatchStatusText(match)}
            </div>
        </div>
    `;
}

function getRoundName(round) {
    const roundNames = {
        'R1': 'First Round',
        'QF': 'Quarter Finals',
        'SF': 'Semi Finals',
        'F': 'Final'
    };
    return roundNames[round] || round;
}

function getMatchStatusText(match) {
    switch(match.status) {
        case 'Playing':
            return `Playing on Court ${match.court}`;
        case 'Next':
            return 'Up Next';
        case 'Done':
            return `Winner: ${match.winner}`;
        case 'Waiting':
            return match.player1 === 'TBD' || match.player2 === 'TBD' ? 
                'Waiting for players' : 'In Queue';
        default:
            return match.status;
    }
}

function generateLeagueTable(matches) {
    const players = getPlayers();
    const leagueTable = calculateLeagueStandings(matches, players);
    
    const tableHTML = `
        <div class="league-table">
            <h2>League Standings</h2>
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Player</th>
                        <th>Played</th>
                        <th>Won</th>
                        <th>Lost</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${leagueTable.map((player, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${player.name}</td>
                            <td>${player.played}</td>
                            <td>${player.won}</td>
                            <td>${player.lost}</td>
                            <td>${player.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('tournament-bracket').innerHTML = tableHTML;
}

function calculateLeagueStandings(matches, players) {
    const standings = players.map(player => ({
        name: player.name,
        played: 0,
        won: 0,
        lost: 0,
        points: 0
    }));
    
    matches.filter(m => m.status === 'Done').forEach(match => {
        const player1Stats = standings.find(p => p.name === match.player1);
        const player2Stats = standings.find(p => p.name === match.player2);
        
        if (player1Stats && player2Stats) {
            player1Stats.played++;
            player2Stats.played++;
            
            if (match.winner === match.player1) {
                player1Stats.won++;
                player1Stats.points += 3;
                player2Stats.lost++;
            } else {
                player2Stats.won++;
                player2Stats.points += 3;
                player1Stats.lost++;
            }
        }
    });
    
    return standings.sort((a, b) => b.points - a.points || b.won - a.won);
}

// Initialize bracket on page load
document.addEventListener('DOMContentLoaded', generateBracket);

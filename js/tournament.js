// Tournament management functions

function createKnockoutTournament(name, playerNames, courts = 3) {
    // Create tournament
    const tournament = {
        id: 1,
        name: name,
        type: 'knockout',
        courts: courts,
        status: 'active',
        createdDate: new Date().toISOString()
    };

    // Create players
    const players = playerNames.map((name, index) => ({
        id: index + 1,
        name: name,
        status: 'active'
    }));

    // Generate knockout matches
    const matches = generateKnockoutMatches(players);

    // Save data
    saveTournament(tournament);
    savePlayers(players);
    saveMatches(matches);

    // Initialize queue
    initializeMatchQueue(courts);

    return tournament;
}

function generateKnockoutMatches(players) {
    const matches = [];
    let matchId = 1;

    // First round matches
    for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
            matches.push({
                id: matchId++,
                player1: players[i].name,
                player2: players[i + 1].name,
                status: 'Waiting',
                queueOrder: matches.length + 1,
                court: null,
                score1: null,
                score2: null,
                winner: null,
                round: 'R1'
            });
        }
    }

    // Generate subsequent rounds
    let currentRound = matches.length;
    let roundName = 'QF';
    
    while (currentRound > 1) {
        const nextRoundMatches = Math.ceil(currentRound / 2);
        
        for (let i = 0; i < nextRoundMatches; i++) {
            matches.push({
                id: matchId++,
                player1: 'TBD',
                player2: 'TBD',
                status: 'Waiting',
                queueOrder: matches.length + 1,
                court: null,
                score1: null,
                score2: null,
                winner: null,
                round: roundName
            });
        }
        
        currentRound = nextRoundMatches;
        roundName = currentRound === 2 ? 'SF' : (currentRound === 1 ? 'F' : 'QF');
    }

    return matches;
}

function initializeMatchQueue(courts) {
    const matches = getMatches();
    
    // Set first N matches to Playing
    // Next N matches to Next
    // Rest to Waiting
    
    matches.forEach((match, index) => {
        if (index < courts) {
            match.status = 'Playing';
            match.court = index + 1;
        } else if (index < courts * 2) {
            match.status = 'Next';
        } else {
            match.status = 'Waiting';
        }
    });

    saveMatches(matches);
}

function submitMatchResult(matchId, score1, score2) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;

    // Update match
    match.score1 = score1;
    match.score2 = score2;
    match.winner = score1 > score2 ? match.player1 : match.player2;
    match.status = 'Done';
    match.court = null;

    // Advance winner in knockout
    advanceWinner(match);

    // Reorder queue
    reorderQueue();

    saveMatches(matches);
}

function advanceWinner(completedMatch) {
    const matches = getMatches();
    
    // Find next match for winner
    const nextMatch = matches.find(m => 
        (m.player1 === 'TBD' || m.player2 === 'TBD') && 
        m.status !== 'Done'
    );

    if (nextMatch) {
        if (nextMatch.player1 === 'TBD') {
            nextMatch.player1 = completedMatch.winner;
        } else if (nextMatch.player2 === 'TBD') {
            nextMatch.player2 = completedMatch.winner;
        }
    }
}

function reorderQueue() {
    const tournament = getTournament();
    const matches = getMatches().filter(m => m.status !== 'Done');
    
    // Sort by queue order
    matches.sort((a, b) => a.queueOrder - b.queueOrder);

    // Reassign statuses
    matches.forEach((match, index) => {
        if (index < tournament.courts) {
            match.status = 'Playing';
            match.court = index + 1;
        } else if (index < tournament.courts * 2) {
            match.status = 'Next';
            match.court = null;
        } else {
            match.status = 'Waiting';
            match.court = null;
        }
    });
}

function moveMatchToPlaying(matchId, courts) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;

    // Find available court
    const playingMatches = matches.filter(m => m.status === 'Playing');
    const availableCourt = findAvailableCourt(playingMatches, courts);

    if (availableCourt) {
        match.status = 'Playing';
        match.court = availableCourt;
        saveMatches(matches);
    } else {
        alert('No courts available. Finish a match first.');
    }
}

function findAvailableCourt(playingMatches, totalCourts) {
    const usedCourts = playingMatches.map(m => m.court);
    
    for (let court = 1; court <= totalCourts; court++) {
        if (!usedCourts.includes(court)) {
            return court;
        }
    }
    
    return null;
}

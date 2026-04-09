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
// Drag and drop functionality
function makeSortable() {
    const waitingContainer = document.getElementById('waiting-matches');
    
    // Add drag event listeners to match cards
    waitingContainer.addEventListener('dragover', handleDragOver);
    waitingContainer.addEventListener('drop', handleDrop);
}

function createMatchElement(match) {
    const div = document.createElement('div');
    div.className = 'match-card';
    div.draggable = match.status === 'Waiting';
    div.dataset.matchId = match.id;
    
    if (match.status === 'Waiting') {
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
    }
    
    div.innerHTML = `
        ${match.status === 'Waiting' ? '<div class="drag-handle">⋮⋮</div>' : ''}
        <div class="match-header">
            <span class="match-id">Match ${match.id}</span>
            ${match.court ? `<span class="court">Court ${match.court}</span>` : ''}
            ${match.estimatedTime ? `<span class="time">${match.estimatedTime}</span>` : ''}
        </div>
        <div class="match-players">
            <span>${match.player1}</span>
            <span class="vs">vs</span>
            <span>${match.player2}</span>
        </div>
        <div class="match-actions">
            ${match.status === 'Playing' ? 
                `<button onclick="openScoreModal(${match.id})" class="btn btn-small">Enter Score</button>` :
                `<button onclick="moveToPlaying(${match.id})" class="btn btn-small btn-outline">Move to Playing</button>`
            }
        </div>
    `;
    return div;
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    const afterElement = getDragAfterElement(this, e.clientY);
    const dragging = document.querySelector('.dragging');
    
    if (afterElement == null) {
        this.appendChild(dragging);
    } else {
        this.insertBefore(dragging, afterElement);
    }
    
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // Update match order in data
    updateMatchOrder();
    return false;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.match-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateMatchOrder() {
    const waitingContainer = document.getElementById('waiting-matches');
    const matchCards = [...waitingContainer.querySelectorAll('.match-card')];
    
    const matches = getMatches();
    const playingCount = matches.filter(m => m.status === 'Playing').length;
    const nextCount = matches.filter(m => m.status === 'Next').length;
    
    matchCards.forEach((card, index) => {
        const matchId = parseInt(card.dataset.matchId);
        const match = matches.find(m => m.id === matchId);
        if (match) {
            match.queueOrder = playingCount + nextCount + index + 1;
        }
    });
    
    saveMatches(matches);
}

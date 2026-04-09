// Export functionality for tournament data

function exportTournamentData() {
    const tournament = getTournament();
    const matches = getMatches();
    const players = getPlayers();
    
    const exportData = {
        tournament,
        matches,
        players,
        exportDate: new Date().toISOString()
    };
    
    downloadJSON(exportData, `${tournament.name}_data.json`);
}

function exportBracketPDF() {
    // Simple HTML to PDF export
    const bracketHTML = generatePrintableBracket();
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${getTournament().name} - Bracket</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .bracket-print { display: flex; flex-wrap: wrap; }
                .round { margin: 20px; }
                .match { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
                .winner { font-weight: bold; color: green; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>${getTournament().name} - Tournament Bracket</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            ${bracketHTML}
            <button class="no-print" onclick="window.print()">Print</button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function exportResults() {
    const matches = getMatches().filter(m => m.status === 'Done');
    const tournament = getTournament();
    
    let csv = 'Match ID,Player 1,Score 1,Player 2,Score 2,Winner,Duration,Round\n';
    
    matches.forEach(match => {
        csv += `${match.id},${match.player1},${match.score1},${match.player2},${match.score2},${match.winner},${match.duration || 'N/A'},${match.round}\n`;
    });
    
    downloadCSV(csv, `${tournament.name}_results.csv`);
}

function exportLeagueStandings() {
    const players = getPlayers();
    const matches = getMatches();
    const standings = calculateLeagueStandings(matches, players);
    
    let csv = 'Position,Player,Matches Played,Won,Lost,Points\n';
    
    standings.forEach((player, index) => {
        csv

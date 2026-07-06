// Replace these with your actual participant names
const playersG1 = ["player1", "player2", "player3", "player4", "player5"];
const playersG2 = ["player1", "player2", "player3", "player4", "player5"];

function generateSchedule(players) {
    const pairs = [
        [0, 3], [1, 2],
        [0, 4], [2, 3],
        [1, 4], [0, 2],
        [1, 3], [2, 4],
        [0, 1], [3, 4]
    ];
    return pairs.map(p => ({ p1: players[p[0]], p2: players[p[1]], s1: null, s2: null }));
}

let matchesG1 = generateSchedule(playersG1);
let matchesG2 = generateSchedule(playersG2);

function updateTournament() {
    renderTable('table-g1', playersG1, matchesG1);
    renderTable('table-g2', playersG2, matchesG2);
}

function renderTable(tableId, players, matches) {
    let stats = {};
    players.forEach(p => stats[p] = { name: p, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0, form: [] });

    matches.forEach(m => {
        if(m.s1 !== null && m.s2 !== null) {
            stats[m.p1].p++; stats[m.p2].p++;
            stats[m.p1].gf += m.s1; stats[m.p1].ga += m.s2;
            stats[m.p2].gf += m.s2; stats[m.p2].ga += m.s1;
            
            if(m.s1 > m.s2) { 
                stats[m.p1].w++; stats[m.p1].pts += 3; stats[m.p1].form.push('W');
                stats[m.p2].l++; stats[m.p2].form.push('L');
            } else if(m.s1 < m.s2) { 
                stats[m.p2].w++; stats[m.p2].pts += 3; stats[m.p2].form.push('W');
                stats[m.p1].l++; stats[m.p1].form.push('L');
            } else { 
                stats[m.p1].d++; stats[m.p1].pts++; stats[m.p1].form.push('D');
                stats[m.p2].d++; stats[m.p2].pts++; stats[m.p2].form.push('D');
            }
        }
    });

    let sorted = Object.values(stats).sort((a,b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
    
    let tbody = document.getElementById(tableId);
    tbody.innerHTML = sorted.map((p, idx) => {
        let formHtml = p.form.slice(-5).map(f => `<div class="form-circle form-${f}">${f}</div>`).join('');
        return `
            <tr class="${idx < 2 ? 'ucl-spot' : ''}">
                <td class="pos-num">${idx + 1}</td>
                <td class="left-align player-name">${p.name}</td>
                <td>${p.p}</td>
                <td>${p.w}</td>
                <td>${p.d}</td>
                <td>${p.l}</td>
                <td>${p.gf}</td>
                <td>${p.ga}</td>
                <td>${p.gf - p.ga >= 0 ? '+' : ''}${p.gf - p.ga}</td>
                <td class="pts-col">${p.pts}</td>
                <td><div class="form-container">${formHtml || '-'}</div></td>
            </tr>
        `;
    }).join('');
}

function renderFixtures(containerId, matches, updateKey) {
    let container = document.getElementById(containerId);
    container.innerHTML = matches.map((m, idx) => `
        <div class="match">
            <span class="team-name">${m.p1}</span>
            <div class="score-box">
                <input type="number" min="0" value="${m.s1 !== null ? m.s1 : ''}" oninput="updateScore('${updateKey}', ${idx}, 1, this.value)">
                <span class="vs-text">vs</span>
                <input type="number" min="0" value="${m.s2 !== null ? m.s2 : ''}" oninput="updateScore('${updateKey}', ${idx}, 2, this.value)">
            </div>
            <span class="team-name right">${m.p2}</span>
        </div>
    `).join('');
}

window.updateScore = function(group, idx, teamNum, val) {
    let list = group === 'G1' ? matchesG1 : matchesG2;
    let score = val === "" ? null : parseInt(val);
    if(teamNum === 1) list[idx].s1 = score;
    else list[idx].s2 = score;
    updateTournament();
}

// Initial initialization
renderFixtures('fixtures-g1', matchesG1, 'G1');
renderFixtures('fixtures-g2', matchesG2, 'G2');
updateTournament();
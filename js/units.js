// Zmienne globalne
export let selectedGermanUnit = 'tiger';
export let selectedSovietUnit = 't34';


// Mapa plików jednostek
export const unitData = {
    german: {
        tiger: { name: 'Panzer VI Tiger', menu: 'Tiger2_3d.gif', game: 'Tiger_3d.png' },
        panther: { name: 'Panzer V Panther', menu: 'panther3d.gif', game: 'panther.png' },
        stug: { name: 'Stug IV', menu: 'stug43d.gif', game: 'stug.png' },
        leopard: { name: 'Leopard I', menu: 'leo13d.gif', game: 'leo.png' }
    },
    soviet: {
        t34: { name: 'T-34', menu: 't34_3d.gif', game: 't34.png' }
    }
};

export function getUnitTemplate(faction, unitType) {
    const file = `assets/images/${unitData[faction][unitType].game}`;
    return `
        <div class="unit" data-faction="${faction}" data-unit-type="${unitType}" style="left: 10%; top: ${faction === 'german' ? '70%' : '60%'}; background-image: url('${file}');">
            <div class="health-bar"><div class="health-fill" data-health="100"></div></div>
            <div class="battle-indicator">WALKA!</div>
        </div>
    `;
}

export function getEnemyTemplate(faction) {
    const enemyFaction = faction === 'german' ? 'soviet' : 'german';
    const enemyUnitType = faction === 'german' ? 't34' : 'tiger'; // Domyślny wróg
    const file = `assets/images/${unitData[enemyFaction][enemyUnitType].game}`;
    return `
        <div class="enemyUnit" data-faction="${enemyFaction}" data-unit-type="${enemyUnitType}" style="left: 70%; top: 60%; background-image: url('${file}');">
            <div class="health-bar"><div class="health-fill" data-health="90"></div></div>
            <div class="battle-indicator">WALKA!</div>
        </div>
    `;
}
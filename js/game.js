import { getUnitTemplate, getEnemyTemplate } from './units.js';

export function initGame(faction, selectedPlayerUnit) {
    const gameScreen = document.getElementById(`${faction}-campaign`); // Odwołanie do ekranu gry na podstawie frakcji
    const gameMap = gameScreen.querySelector('.game-map');
    const victoryScreen = gameScreen.querySelector('.victory-screen');

    // Ustaw display na 'block' (lub 'flex', w zależności od Twojego CSS)
    // Aby ekran gry był widoczny po rozpoczęciu kampanii.
    gameScreen.style.display = 'block'; // Zmień na 'flex', jeśli Twój CSS używa flexboxa dla game-screen.
                                        // Sprawdź, jak stylizujesz 'game-screen' w CSS!

    gameMap.innerHTML = getUnitTemplate(faction, selectedPlayerUnit) + getEnemyTemplate(faction); // Użycie 'faction'
    
    const units = gameScreen.querySelectorAll('.unit');
    const enemyUnits = gameScreen.querySelectorAll('.enemyUnit');
    let selectedUnit = null;
    let battles = [];

    // Inicjalizacja zdrowia jednostek
    units.forEach(unit => {
        unit.dataset.health = 100;
        unit.addEventListener('click', function(e) {
            e.stopPropagation(); // Zapobiega propagacji kliknięcia do mapy gry
            
            if (selectedUnit) {
                selectedUnit.classList.remove('selected');
            }
            
            selectedUnit = this;
            selectedUnit.classList.add('selected');
        });
    });

    enemyUnits.forEach(enemy => {
        enemy.dataset.health = 90;
    });

    // Obsługa ruchu wybranej jednostki po kliknięciu na mapę
    gameMap.addEventListener('click', (e) => {
        if (selectedUnit && e.target === gameMap) {
            const unitRect = selectedUnit.getBoundingClientRect();
            const gameRect = gameMap.getBoundingClientRect();
            
            const unitX = unitRect.left - gameRect.left + unitRect.width / 2;
            const unitY = unitRect.top - gameRect.top + unitRect.height / 2;
            const targetX = e.clientX - gameRect.left;
            const targetY = e.clientY - gameRect.top;

            // Obliczanie kąta i indeksu klatki dla animacji obrotu (ODWRÓCONE)
            const deltaX = targetX - unitX;
            const deltaY = targetY - unitY;
            let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            angle = (angle + 360 + 180) % 360; // Dodaj 180 stopni, aby odwrócić kierunek

            const frameIndex = Math.round(angle / 4) % 90; // 90 klatek w sprice
            const col = (5 - (frameIndex % 5) - 1) % 5; // Odwrócone kolumny (0→4, 1→3 itd.)
            const row = Math.floor(frameIndex / 5); // 18 rzędów

            // Ustawienie pozycji sprite'a
            selectedUnit.style.backgroundPosition = `${-col * 100}% ${-row * 100}%`;

            // Obliczanie nowej pozycji i zapobieganie wyjściu poza mapę
            const newLeft = Math.max(0, Math.min(
                targetX - selectedUnit.clientWidth / 2, 
                gameMap.clientWidth - selectedUnit.clientWidth
            ));
            const newTop = Math.max(0, Math.min(
                targetY - selectedUnit.clientHeight / 2,
                gameMap.clientHeight - selectedUnit.clientHeight
            ));

            selectedUnit.style.left = `${newLeft}px`;
            selectedUnit.style.top = `${newTop}px`;
        }
    });

    // Anulowanie zaznaczenia jednostki po kliknięciu poza nią na mapie
    gameMap.addEventListener('click', (e) => {
        if (e.target === gameMap && selectedUnit) {
            selectedUnit.classList.remove('selected');
            selectedUnit = null;
        }
    });

    // System wykrywania kolizji i walki
    function checkCollisions() {
        // Wyczyść poprzednie bitwy i zatrzymaj ich timery
        battles.forEach(battle => {
            clearInterval(battle.timer);
        });
        battles = [];
        
        // Ukryj wszystkie wskaźniki bitew
        gameScreen.querySelectorAll('.battle-indicator').forEach(indicator => {
            indicator.style.display = 'none';
        });

        // Sprawdź nowe kolizje z większym promieniem wykrywania
        units.forEach(unit => {
            if (unit.dataset.health <= 0) return; // Jeśli jednostka zniszczona, pomiń
            
            enemyUnits.forEach(enemy => {
                if (enemy.dataset.health <= 0) return; // Jeśli wróg zniszczony, pomiń
                
                if (isNearby(unit, enemy)) {
                    startBattle(unit, enemy);
                }
            });
        });
    }

    // Funkcja sprawdzająca, czy dwie jednostki są blisko siebie
    function isNearby(unit1, unit2) {
        const rect1 = unit1.getBoundingClientRect();
        const rect2 = unit2.getBoundingClientRect();
        
        // Większy obszar wykrywania (1.5x rozmiar jednostki)
        const detectionMargin = rect1.width * 0.5;
        
        return !(
            rect1.right + detectionMargin < rect2.left - detectionMargin || 
            rect1.left - detectionMargin > rect2.right + detectionMargin || 
            rect1.bottom + detectionMargin < rect2.top - detectionMargin || 
            rect1.top - detectionMargin > rect2.bottom + detectionMargin
        );
    }

    // Rozpoczęcie symulacji bitwy między dwiema jednostkami
    function startBattle(unit, enemy) {
        // Pokaż wskaźniki bitew
        unit.querySelector('.battle-indicator').style.display = 'block';
        enemy.querySelector('.battle-indicator').style.display = 'block';
        
        const battleDuration = 2000; // Czas trwania bitwy w ms
        const interval = 20; // Interwał aktualizacji w ms
        const steps = battleDuration / interval; // Liczba kroków bitwy
        
        const unitDamage = (100 / steps); // Obrażenia zadawane przez jednostkę w każdym kroku
        const enemyDamage = (100 / steps); // Obrażenia zadawane przez wroga w każdym kroku
        
        let stepsCompleted = 0;
        
        const battleInterval = setInterval(() => {
            // Zmniejsz zdrowie jednostek
            unit.dataset.health = Math.max(0, unit.dataset.health - enemyDamage);
            enemy.dataset.health = Math.max(0, enemy.dataset.health - unitDamage);
            
            // Zaktualizuj paski zdrowia
            unit.querySelector('.health-fill').style.width = `${unit.dataset.health}%`;
            enemy.querySelector('.health-fill').style.width = `${enemy.dataset.health}%`;
            
            stepsCompleted++;
            
            // Zakończ bitwę, gdy czas się skończy lub jedna z jednostek zostanie zniszczona
            if (stepsCompleted >= steps || unit.dataset.health <= 0 || enemy.dataset.health <= 0) {
                clearInterval(battleInterval); // Zatrzymaj interwał bitwy
                
                const loser = unit.dataset.health <= 0 ? unit : enemy;
                
                if (loser.dataset.health <= 0) {
                    setTimeout(() => {
                        loser.remove(); // Usuń zniszczoną jednostkę z DOM
                        
                        // Odznacz jednostkę, jeśli to ona została zniszczona
                        if (selectedUnit === loser) {
                            selectedUnit.classList.remove('selected');
                            selectedUnit = null;
                        }
                        
                        // Sprawdź, czy wszyscy wrogowie zostali pokonani
                        const remainingEnemies = gameScreen.querySelectorAll('.enemyUnit').length;
                        if (remainingEnemies === 0) {
                            victoryScreen.style.display = 'flex'; // Pokaż ekran zwycięstwa
                        }
                    }, 200); // Małe opóźnienie przed usunięciem
                }
                
                // Ukryj wskaźniki bitew po jej zakończeniu
                setTimeout(() => {
                    unit.querySelector('.battle-indicator').style.display = 'none';
                    enemy.querySelector('.battle-indicator').style.display = 'none';
                }, 200);
                
                // Usuń bitwę z listy aktywnych bitew
                battles = battles.filter(b => b.unit !== unit && b.enemy !== enemy);
            }
        }, interval);
        
        // Dodaj bitwę do listy aktywnych bitew
        battles.push({
            unit,
            enemy,
            timer: battleInterval
        });
    }

    // Częste sprawdzanie kolizji
    setInterval(checkCollisions, 50);
}
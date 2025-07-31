import { selectedGermanUnit, selectedSovietUnit } from './units.js'; // Pozostawiamy to, ale window.selectedUnit są teraz inicjowane w UI
import { initGame } from './game.js';

export function setupUI() {
    // Ustaw początkowe wartości selectedUnit na podstawie domyślnego wyboru.
    // Dzięki temu initGame zawsze będzie miało poprawną wartość, nawet jeśli użytkownik nie kliknie żadnej karty.
    window.selectedGermanUnit = document.querySelector('#german-campaign-selection .unit-card').dataset.unit;
    window.selectedSovietUnit = document.querySelector('#soviet-campaign-selection .unit-card').dataset.unit;

    // Funkcja powrotu do menu głównego
    function backToMenu() {
        // Ukryj wszystkie ekrany gry i wyboru kampanii
        document.querySelectorAll('.game-screen, .campaign-selection').forEach(screen => {
            screen.style.display = 'none';
            // Ukryj również ekran zwycięstwa, jeśli istnieje
            const victoryScreen = screen.querySelector('.victory-screen');
            if (victoryScreen) victoryScreen.style.display = 'none';
        });
        // Pokaż menu główne
        document.getElementById('main-menu').style.display = 'flex';
    }

    // Funkcja do obsługi wyboru karty jednostki
    function selectUnitCard() {
        const container = this.closest('.units-container');
        const cards = container.querySelectorAll('.unit-card');
        
        // Usuń klasę 'selected' ze wszystkich kart w danym kontenerze
        cards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Dodaj klasę 'selected' do klikniętej karty
        this.classList.add('selected');
        
        // Zapisz wybraną jednostkę w zmiennych globalnych (window)
        if (container.parentElement.id === 'german-campaign-selection') {
            window.selectedGermanUnit = this.dataset.unit;
        } else {
            window.selectedSovietUnit = this.dataset.unit;
        }
    }

    // Obsługa przycisku "Kampania Niemiecka" - przełącza na ekran wyboru jednostek niemieckich
    document.getElementById('german-campaign-btn').addEventListener('click', () => {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('german-campaign-selection').style.display = 'block';
    });

    // Obsługa przycisku "Kampania Radziecka" - przełącza na ekran wyboru jednostek radzieckich
    document.getElementById('soviet-campaign-btn').addEventListener('click', () => {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('soviet-campaign-selection').style.display = 'block';
    });

    // Obsługa przycisku "Rozpocznij Kampanię" dla strony niemieckiej
    document.getElementById('start-german-campaign').addEventListener('click', () => {
        document.getElementById('german-campaign-selection').style.display = 'none';
        // Rozpocznij grę, przekazując frakcję 'german' i wybraną jednostkę
        initGame('german', window.selectedGermanUnit); 
    });

    // Obsługa przycisku "Rozpocznij Kampanię" dla strony radzieckiej
    document.getElementById('start-soviet-campaign').addEventListener('click', () => {
        document.getElementById('soviet-campaign-selection').style.display = 'none';
        // Rozpocznij grę, przekazując frakcję 'soviet' i wybraną jednostkę
        initGame('soviet', window.selectedSovietUnit); 
    });

    // Dodaj event listener dla wszystkich kart jednostek, aby można było je klikać
    document.querySelectorAll('.unit-card').forEach(card => {
        card.addEventListener('click', selectUnitCard);
    });

    // Ustawia domyślny wybór pierwszej jednostki w każdej kampanii przy ładowaniu UI
    // To wizualnie zaznacza pierwszą kartę, co odpowiada początkowym wartościom w `window.selectedGermanUnit`
    document.querySelector('#german-campaign-selection .unit-card').classList.add('selected');
    document.querySelector('#soviet-campaign-selection .unit-card').classList.add('selected');

    // Obsługa przycisków powrotu i zwycięstwa, które prowadzą z powrotem do menu
    document.querySelectorAll('.back-btn, .victory-btn').forEach(button => {
        button.addEventListener('click', backToMenu);
    });
}
let score = 0
let target = 21
let playerHand = []
let enemyHand = []
isEnemyTurn = false

window.addEventListener("DOMContentLoaded", () => {
    StartGame();
});

function showCard() {
    const cardGame = document.getElementById("card-game");
    cardGame.hidden = !cardGame.hidden
}

function restartGame() {
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) restartBtn.hidden = true;

    score = 0;
    const scoreElem = document.getElementById("score");
    if (scoreElem) scoreElem.textContent = "SKOR: " + score;

    StartGame();
}

function StartGame() {
    //player için kart
    playerHand = [];
    for (let index = 0; index < 4; index++) {
        let random = Math.floor(Math.random() * 10) + 1;
        playerHand.push(random);
    }

    // enemy için kart
    enemyHand = [];
    for (let index = 0; index < 4; index++) {
        let random = Math.floor(Math.random() * 10) + 1;
        enemyHand.push(random);
    }

    UploadCard();

    // Kartların dokunulmazlık ve opaklık durumlarını sıfırla
    for (let index = 1; index <= 4; index++) {
        const pCard = document.getElementById(`p-card${index}`);
        const eCard = document.getElementById(`e-card${index}`);
        if (pCard) {
            pCard.style.opacity = "1";
            pCard.disabled = false;
        }
        if (eCard) {
            eCard.style.opacity = "1";
            eCard.disabled = true; // Rakip kartları oyuncu tarafından tıklanamaz
        }
    }
}

function UploadCard() {
    for (let index = 0; index < 4; index++) {
        const playerCardElem = document.getElementById(`p-card${index + 1}`);
        const enemyCardElem = document.getElementById(`e-card${index + 1}`);
        if (playerCardElem) {
            playerCardElem.textContent = playerHand[index].toString();
        }
        if (enemyCardElem) {
            enemyCardElem.textContent = enemyHand[index].toString();
        }
    }
}

function SetScore1() {
    if (playerHand[0] === null) return; // Kart daha önce oynandıysa hiçbir şey yapma

    score += playerHand[0];
    playerHand[0] = null; // Kartı elden düş

    document.getElementById("score").textContent = `SKOR: ${score}`;
    document.getElementById(`p-card1`).style.opacity = "0.3";
    document.getElementById(`p-card1`).disabled = true

    if (checkGameOver(true)) return;

    isEnemyTurn = true
    EnemyTurn()
}

function SetScore2() {
    if (playerHand[1] === null) return; // Kart daha önce oynandıysa hiçbir şey yapma

    score += playerHand[1];
    playerHand[1] = null; // Kartı elden düş

    document.getElementById("score").textContent = `SKOR: ${score}`;
    document.getElementById(`p-card2`).style.opacity = "0.3";
    document.getElementById(`p-card2`).disabled = true
    if (checkGameOver(true)) return;

    isEnemyTurn = true
    EnemyTurn()
}

function SetScore3() {
    if (playerHand[2] === null) return; // Kart daha önce oynandıysa hiçbir şey yapma

    score += playerHand[2];
    playerHand[2] = null; // Kartı elden düş

    document.getElementById("score").textContent = `SKOR: ${score}`;
    document.getElementById(`p-card3`).style.opacity = "0.3";
    document.getElementById(`p-card3`).disabled = true
    
    if (checkGameOver(true)) return;

    isEnemyTurn = true
    EnemyTurn()
}

function SetScore4() {
    if (playerHand[3] === null) return; // Kart daha önce oynandıysa hiçbir şey yapma

    score += playerHand[3];
    playerHand[3] = null; // Kartı elden düş

    document.getElementById("score").textContent = `SKOR: ${score}`;
    document.getElementById(`p-card4`).style.opacity = "0.3";
    document.getElementById(`p-card4`).disabled = true

    if (checkGameOver(true)) return;

    isEnemyTurn = true
    EnemyTurn()
}

function EnemyTurn() {
    let bestScore = -Infinity;
    let bestCardIndex = -1;

    for (let i = 0; i < enemyHand.length; i++) {
        if (enemyHand[i] !== null) { // Oynanabilir kartlar
            let card = enemyHand[i];
            enemyHand[i] = null;

            // Atılacak kartı simüle et
            let simulateScore = score + card;

            // Sırayı Oyuncuya devrediyoruz -> false
            let moveScore = Minimax(simulateScore, playerHand, enemyHand, false, -Infinity, Infinity);

            enemyHand[i] = card; // Backtrack

            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestCardIndex = i;
            }
        }
    }

    // Oynanacak kart bulunduysa masaya sür ve arayüzü güncelle
    if (bestCardIndex !== -1) {
        let chosenCard = enemyHand[bestCardIndex];
        score += chosenCard;
        enemyHand[bestCardIndex] = null;

        // Arayüzü güncelle: Düşman kartını soluklaştır ve skoru yaz
        const enemyCardElem = document.getElementById(`e-card${bestCardIndex + 1}`);
        if (enemyCardElem) {
            enemyCardElem.style.opacity = "0.3";
            enemyCardElem.disabled = true
        }
        document.getElementById("score").textContent = `SKOR: ${score}`;

        // Düşman oynadıktan sonra oyun bitti mi kontrol et
        checkGameOver(false); // false: Hamleyi düşman yaptı
    }

    isEnemyTurn = false; // Sıra tekrar oyuncuya geçti
}

function Minimax(currentScore, pHand, eHand, isEnemyTurn, alfa, beta) {
    if ((currentScore == target && isEnemyTurn)) {
        return -1 //Yenilgi
    }
    if ((currentScore == target && !isEnemyTurn)) {
        return 1 //Kazanma
    }
    if (currentScore > target && isEnemyTurn) {
        return 1 //Kazanma
    }
    if (currentScore > target && !isEnemyTurn) {
        return -1 //Yenilgi
    }

    // Kartlar bitti mi diye kontrol ediyoruz
    let hasPlayerCard = pHand.some(card => card !== null);
    let hasEnemyCard = eHand.some(card => card !== null);

    if (!hasPlayerCard && !hasEnemyCard) {
        return 0; //Beraberlik
    }

    if (isEnemyTurn) {
        let maxScore = -Infinity
        // let currentScore = score satırı kaldırıldı!
        for (let i = 0; i < eHand.length; i++) {
            if (eHand[i] != null) {
                let currentCard = eHand[i]
                eHand[i] = null
                let newScore = currentScore + currentCard

                // Bu kartı seçsem sonuç ne olabilir?
                let simulated = Minimax(newScore, pHand, eHand, false, alfa, beta) //Sırayı oyuncuya veriyoruz false ile

                eHand[i] = currentCard // Backtrack

                if (simulated > maxScore) {
                    maxScore = simulated
                }

                alfa = Math.max(alfa, maxScore); //Enemy'nin garantilediği max puan

                if (beta <= alfa) { //Player'ın kabul ettiği sınırdan daha iyi bir yol bulduysan aramayı bırak ve buraya odaklan
                    break;
                }
            }
        }
        return maxScore
    } else {
        let minScore = Infinity
        for (let i = 0; i < pHand.length; i++) {
            if (pHand[i] != null) {
                let currentCard = pHand[i]
                pHand[i] = null
                let newScore = currentScore + currentCard

                // Bu kartı seçsem sonuç ne olabilir?
                let simulated = Minimax(newScore, pHand, eHand, true, alfa, beta) //Sırayı enemy'ye veriyoruz true ile

                pHand[i] = currentCard // Backtrack

                if (simulated < minScore) {
                    minScore = simulated
                }

                beta = Math.min(beta, minScore) //Player'ın garantilediği min puan

                if (beta <= alfa) {
                    break
                }
            }
        }
        return minScore
    }
}

function disableAllCards() {
    for (let index = 1; index <= 4; index++) {
        const pCard = document.getElementById(`p-card${index}`);
        const eCard = document.getElementById(`e-card${index}`);
        if (pCard) {
            pCard.disabled = true;
            pCard.style.opacity = "0.3";
        }
        if (eCard) {
            eCard.disabled = true;
            eCard.style.opacity = "0.3";
        }
    }
}

function checkGameOver(lastMoveByPlayer) {
    // Skor Hedefe Ulaştı
    if (score === target) {
        disableAllCards();
        document.getElementById("restart-btn").hidden = false;
        if (lastMoveByPlayer) { // Son hamle oyuncuda
            alert("Tebrikler! Skoru " + target + " yaptın ve kazandın!");
        } else { // Son hamle rakipte
            alert("Yapay Zekâ skoru " + target + " yaptı! Kaybettin!");
        }
        return true; // Oyun bitti
    }

    // Skor Hedef'ten büyük
    if (score > target) {
        disableAllCards();
        document.getElementById("restart-btn").hidden = false;
        if (lastMoveByPlayer) {  // Son hamle oyuncuda
            alert(`Skor ${score} oldu! ${target}'i aştığın için kaybettin!`);
        } else {
            alert(`Yapay zekâ skoru ${score} yaptı ve patladı! Sen kazandın!`);
        }
        return true; // Oyun bitti
    }

    // Kartlar bitti mi?
    let pCardsLeft = playerHand.some(card => card !== null); //Oyuncunun elinde kart kaldı mı
    let eCardsLeft = enemyHand.some(card => card !== null); // Rakibin elinde kart kaldı mı

    if (!pCardsLeft && !eCardsLeft) {
        disableAllCards();
        document.getElementById("restart-btn").hidden = false;
        alert("Atılacak kart kalmadı! Oyun berabere bitti.");
        return true; // Oyun bitti
    }

    return false; // Oyun henüz bitmedi, devam ediyor
}
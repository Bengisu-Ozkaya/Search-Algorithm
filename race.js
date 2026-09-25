let canvas;
let ctx;

const COLS = 25;
const ROWS = 25;
let CELL_SIZE = 24;

let grid = [];

window.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("mazeCanvas");
    if (canvas) {
        ctx = canvas.getContext("2d");
        CELL_SIZE = canvas.width / COLS;
    }
});

function showRace() {
    const raceContainer = document.getElementById("race-container");
    const sudoku = document.getElementById("sudoku");
    const cardGame = document.getElementById("card-game");
    if (!raceContainer) return;

    const willShow = raceContainer.hidden;
    if (sudoku) sudoku.hidden = true;
    if (cardGame) cardGame.hidden = true;
    raceContainer.hidden = !willShow;

    if (!raceContainer.hidden) {
        initMaze();
    }
}

class Cell {
    constructor(r, c) {
        this.r = r;
        this.c = c;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }

    draw() {
        const x = this.c * CELL_SIZE;
        const y = this.r * CELL_SIZE;

        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 2;

        if (this.walls.top) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + CELL_SIZE, y);
            ctx.stroke();
        }
        if (this.walls.right) {
            ctx.beginPath();
            ctx.moveTo(x + CELL_SIZE, y);
            ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
            ctx.stroke();
        }
        if (this.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
            ctx.lineTo(x, y + CELL_SIZE);
            ctx.stroke();
        }
        if (this.walls.left) {
            ctx.beginPath();
            ctx.moveTo(x, y + CELL_SIZE);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    getRandomUnvisitedNeighbor() {
        const neighbors = [];
        const { r, c } = this;

        if (r > 0 && !grid[r - 1][c].visited) neighbors.push(grid[r - 1][c]);
        if (c < COLS - 1 && !grid[r][c + 1].visited) neighbors.push(grid[r][c + 1]);
        if (r < ROWS - 1 && !grid[r + 1][c].visited) neighbors.push(grid[r + 1][c]);
        if (c > 0 && !grid[r][c - 1].visited) neighbors.push(grid[r][c - 1]);

        if (neighbors.length > 0) {
            const randIdx = Math.floor(Math.random() * neighbors.length);
            return neighbors[randIdx];
        }
        return null;
    }
}

function removeWalls(current, next) {
    const xDiff = current.c - next.c;
    if (xDiff === 1) {
        current.walls.left = false;
        next.walls.right = false;
    } else if (xDiff === -1) {
        current.walls.right = false;
        next.walls.left = false;
    }

    const yDiff = current.r - next.r;
    if (yDiff === 1) {
        current.walls.top = false;
        next.walls.bottom = false;
    } else if (yDiff === -1) {
        current.walls.bottom = false;
        next.walls.top = false;
    }
}

function generateMaze() {
    const stack = [];
    let current = grid[0][0];
    current.visited = true;

    while (true) {
        const next = current.getRandomUnvisitedNeighbor();

        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
}

function drawStartAndGoal() {
    // Başlangıç: Sol Üst (0,0) - Yeşil Nokta
    ctx.fillStyle = "#2ecc71";
    ctx.beginPath();
    ctx.arc(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Bitiş: Sağ Alt (ROWS-1, COLS-1) - Kırmızı Nokta
    const goalX = (COLS - 1) * CELL_SIZE + CELL_SIZE / 2;
    const goalY = (ROWS - 1) * CELL_SIZE + CELL_SIZE / 2;
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(goalX, goalY, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
}

function initMaze() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid = [];

    if (raceInterval) {
    clearInterval(raceInterval);
    isRacing = false;
    const startBtn = document.getElementById("start-race-btn");
    if (startBtn) startBtn.disabled = false;
}

    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = new Cell(r, c);
        }
    }

    generateMaze();

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            grid[r][c].draw();
        }
    }

    drawStartAndGoal();
}

// ŞİMDİLİK: BFS ve DFS Yarışı
let raceInterval = null;
let isRacing = false;

function startRace() {
    // Zaten koşan bir yarış varsa baştan başlatmak için durdur
    if (isRacing) {
        clearInterval(raceInterval);
        isRacing = false;
    }

    // 1. Labirent çizgilerini ve noktaları temizleyip yeniden çiz
    redrawMaze();

    // 2. İki yarışçıyı başlangıç çizgisine (0,0) koy
    initBFS();
    initDFS();

    // 3. Kullanıcının tahminini al
    const userBetSelect = document.getElementById("user-bet");
    const userChoice = userBetSelect ? userBetSelect.value : "";

    isRacing = true;
    const startBtn = document.getElementById("start-race-btn");
    if (startBtn) startBtn.disabled = true;

    // 4. Yarış Motoru: Her 40 milisaniyede 1 adım at (hızı buradan ayarlayabilirsin)
    raceInterval = setInterval(() => {
        let bfsStatus = stepBFS();
        let dfsStatus = stepDFS();

        // Hakem Kontrolleri:

        // Senaryo 1: BFS Kazandı
        if (bfsStatus === "kazandı") {
            finishRace("BFS (Yeşil)", userChoice);
            return;
        }

        // Senaryo 2: DFS Kazandı
        if (dfsStatus === "kazandı") {
            finishRace("DFS (Kırmızı)", userChoice);
            return;
        }

        // Senaryo 3: İki algoritma da çıkmazda kaldıysa
        if (bfsStatus === "yol_yok" && dfsStatus === "yol_yok") {
            clearInterval(raceInterval);
            isRacing = false;
            if (startBtn) startBtn.disabled = false;
            alert("Her iki algoritma da çıkışa ulaşamadı!");
        }
    }, 40);
}

function finishRace(winnerName, userChoice) {
    clearInterval(raceInterval);
    isRacing = false;

    const startBtn = document.getElementById("start-race-btn");
    if (startBtn) startBtn.disabled = false;

    // Seçim kontrolü
    let wonBet = false;
    if (winnerName.includes("BFS") && userChoice === "BFS") wonBet = true;
    if (winnerName.includes("DFS") && userChoice === "DFS") wonBet = true;

    setTimeout(() => {
        if (wonBet) {
            alert(`🎉 TEBRİKLER! Tahminin doğru çıktı!\nKazanan: ${winnerName}`);
        } else {
            alert(`Yarışı ${winnerName} kazandı!\nSenin seçimin: ${userChoice}`);
        }
    }, 50);
}

// Labirent çizgilerini silmeden sadece boyaları temizlemek için yardımcı:
function redrawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            grid[r][c].draw();
        }
    }
    drawStartAndGoal();
}

//BFS Algoritması
let bfsQueue = [];
let bfsVisited = [];

function initBFS() {
    // 25x25'lik Tabloyu oluşturduk (hepsi false -gezilmemiş- olarak işaretli)
    bfsVisited = []; // ziyaret edilen hücreler
    for (let r = 0; r < ROWS; r++) {
        bfsVisited[r] = [];
        for (let c = 0; c < COLS; c++) {
            bfsVisited[r][c] = false;
        }
    }

    bfsQueue = []; //başlangıç noktasından başla (0, 0)
    bfsQueue.push({ r: 0, c: 0 });
    bfsVisited[0][0] = true; // Başlangıç karesini gezildi olarak işaretle
}

function stepBFS() {
    // Kuyrukta gidilecek kare kalmadıysa (yol yoksa) dur
    if (bfsQueue.length === 0) return "yol_yok";

    // Kuyruğun en başındaki kareyi eline al
    let current = bfsQueue.shift();
    let r = current.r;
    let c = current.c;

    // Hedefe (sağ alt köşeye) geldik mi?
    if (r === ROWS - 1 && c === COLS - 1) {
        return "kazandı";
    }

    // Bulunduğumuz bu kareyi Canvas'ta açık yeşile boya (BFS'nin gezdiği yer)
    drawCell(r, c, "rgba(46, 204, 113, 0.4)");

    // ŞİMDİ 4 YÖNE BAKIYORUZ: Duvar yoksa ve daha önce gezilmediyse komşuyu kuyruğa ekle!

    // ÜST KARE: r > 0 olmalı, üst duvarı kapalı olmamalı, üst kare gezilmemiş olmalı
    if (r > 0 && !grid[r][c].walls.top && !bfsVisited[r - 1][c]) {
        bfsVisited[r - 1][c] = true;
        bfsQueue.push({ r: r - 1, c: c });
    }

    // SAĞ KARE: c < COLS - 1 olmalı, sağ duvarı açık olmalı, sağ kare gezilmemiş olmalı
    if (c < COLS - 1 && !grid[r][c].walls.right && !bfsVisited[r][c + 1]) {
        bfsVisited[r][c + 1] = true;
        bfsQueue.push({ r: r, c: c + 1 });
    }

    // ALT KARE: r < ROWS - 1 olmalı, alt duvarı açık olmalı, alt kare gezilmemiş olmalı
    if (r < ROWS - 1 && !grid[r][c].walls.bottom && !bfsVisited[r + 1][c]) {
        bfsVisited[r + 1][c] = true;
        bfsQueue.push({ r: r + 1, c: c });
    }

    // SOL KARE: c > 0 olmalı, sol duvarı açık olmalı, sol kare gezilmemiş olmalı
    if (c > 0 && !grid[r][c].walls.left && !bfsVisited[r][c - 1]) {
        bfsVisited[r][c - 1] = true;
        bfsQueue.push({ r: r, c: c - 1 });
    }

    return "devam";
}

function drawCell(r, c, color) {
    ctx.fillStyle = color;
    // Duvarların içini hafif boşluk bırakarak boyar
    ctx.fillRect(c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
}

//DFS Algoritması
let dfsStack = [];
let dfsVisited = [];

function initDFS() {
    // 25x25'lik Tabloyu oluşturduk (hepsi false -gezilmemiş- olarak işaretli)
    dfsVisited = []; // ziyaret edilen hücreler
    for (let r = 0; r < ROWS; r++) {
        dfsVisited[r] = [];
        for (let c = 0; c < COLS; c++) {
            dfsVisited[r][c] = false;
        }
    }

    dfsStack = []; //başlangıç noktasından başla (0, 0)
    dfsStack.push({ r: 0, c: 0 });
    dfsVisited[0][0] = true; // Başlangıç karesini gezildi olarak işaretle
}

function stepDFS() {
    // Kuyrukta gidilecek kare kalmadıysa (yol yoksa) dur
    if (dfsStack.length === 0) return "yol_yok";

    // Kuyruğun en başındaki kareyi eline al
    let current = dfsStack.pop();
    let r = current.r;
    let c = current.c;

    // Hedefe (sağ alt köşeye) geldik mi?
    if (r === ROWS - 1 && c === COLS - 1) {
        return "kazandı";
    }

    // Bulunduğumuz bu kareyi Canvas'ta kırmızıya boya (DFS'nin gezdiği yer)
    drawCell(r, c, "rgba(231, 76, 60, 0.4)");

    // ŞİMDİ 4 YÖNE BAKIYORUZ: Duvar yoksa ve daha önce gezilmediyse komşuyu kuyruğa ekle!

    // ÜST KARE: r > 0 olmalı, üst duvarı kapalı olmamalı, üst kare gezilmemiş olmalı
    if (r > 0 && !grid[r][c].walls.top && !dfsVisited[r - 1][c]) {
        dfsVisited[r - 1][c] = true;
        dfsStack.push({ r: r - 1, c: c });
    }

    // SAĞ KARE: c < COLS - 1 olmalı, sağ duvarı açık olmalı, sağ kare gezilmemiş olmalı
    if (c < COLS - 1 && !grid[r][c].walls.right && !dfsVisited[r][c + 1]) {
        dfsVisited[r][c + 1] = true;
        dfsStack.push({ r: r, c: c + 1 });
    }

    // ALT KARE: r < ROWS - 1 olmalı, alt duvarı açık olmalı, alt kare gezilmemiş olmalı
    if (r < ROWS - 1 && !grid[r][c].walls.bottom && !dfsVisited[r + 1][c]) {
        dfsVisited[r + 1][c] = true;
        dfsStack.push({ r: r + 1, c: c });
    }

    // SOL KARE: c > 0 olmalı, sol duvarı açık olmalı, sol kare gezilmemiş olmalı
    if (c > 0 && !grid[r][c].walls.left && !dfsVisited[r][c - 1]) {
        dfsVisited[r][c - 1] = true;
        dfsStack.push({ r: r, c: c - 1 });
    }

    return "devam";
}
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
    if (isRacing) {
        clearInterval(raceInterval);
        isRacing = false;
    }

    // 1. Ekranı temizle ve labirenti yeniden çiz
    redrawMaze();

    // 2. Dört yarışçıyı da başlangıç çizgisine oturt
    initBFS();
    initDFS();
    initDijkstra();
    initAStar();

    // 3. Kullanıcı tahminini al
    const userBetSelect = document.getElementById("user-bet");
    const userChoice = userBetSelect ? userBetSelect.value : "";

    isRacing = true;
    const startBtn = document.getElementById("start-race-btn");
    if (startBtn) startBtn.disabled = true;

    // 4. Yarış Döngüsü: Her 35 milisaniyede 4 algoritmadan da birer adım iste
    raceInterval = setInterval(() => {
        let bfsStatus = stepBFS();
        let dfsStatus = stepDFS();
        let dijkstraStatus = stepDijkstra();
        let aStarStatus = stepAStar();

        // Hakem Kontrolleri: İlk ulaşan kazanır!
        if (aStarStatus === "kazandı") {
            finishRace("A* (Mavi)", userChoice);
            return;
        }
        if (bfsStatus === "kazandı") {
            finishRace("BFS (Yeşil)", userChoice);
            return;
        }
        if (dfsStatus === "kazandı") {
            finishRace("DFS (Kırmızı)", userChoice);
            return;
        }
        if (dijkstraStatus === "kazandı") {
            finishRace("Dijkstra (Sarı)", userChoice);
            return;
        }

        // Dördü de çıkmazda kaldıysa
        if (bfsStatus === "yol_yok" && dfsStatus === "yol_yok" && dijkstraStatus === "yol_yok" && aStarStatus === "yol_yok") {
            clearInterval(raceInterval);
            isRacing = false;
            if (startBtn) startBtn.disabled = false;
            alert("Hiçbir algoritma çıkışa ulaşamadı!");
        }
    }, 35);
}

function finishRace(winnerName, userChoice) {
    clearInterval(raceInterval);
    isRacing = false;

    const startBtn = document.getElementById("start-race-btn");
    if (startBtn) startBtn.disabled = false;

    let wonBet = false;
    if (winnerName.includes("A*") && userChoice === "A*") wonBet = true;
    if (winnerName.includes("BFS") && userChoice === "BFS") wonBet = true;
    if (winnerName.includes("DFS") && userChoice === "DFS") wonBet = true;
    if (winnerName.includes("Dijkstra") && userChoice === "Dijkstra") wonBet = true;

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
    drawCell(r, c, "rgba(0, 255, 0, 0.4)");

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
    drawCell(r, c, "rgba(255, 0, 0, 0.4)");

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

// ==========================================
// 3. DIJKSTRA ALGORİTMASI (Sarı Yarışçı)
// Mantık: Her adımda başlangıç noktasına en yakın (maliyeti en düşük) hücreyi seçer.
// ==========================================

let dijkstraList = [];    // İncelenmeyi bekleyen aday hücreler havuzu (Priority Queue mantığı)
let dijkstraVisited = []; // Ziyaret edilen hücrelerin 25x25 boolean tablosu
let dijkstraDist = [];    // Başlangıç noktasından (0,0) her hücreye olan en kısa mesafelerin tablosu

function initDijkstra() {
    dijkstraList = [];
    dijkstraVisited = [];
    dijkstraDist = [];

    // 1. 25x25'lik tabloları oluşturuyoruz
    for (let r = 0; r < ROWS; r++) {
        dijkstraVisited[r] = [];
        dijkstraDist[r] = [];
        for (let c = 0; c < COLS; c++) {
            dijkstraVisited[r][c] = false;
            // Başlangıçta hedefin mesafesini bilmediğimiz için en kötümser değeri (sonsuz) atıyoruz:
            dijkstraDist[r][c] = Infinity;
        }
    }

    // 2. Başlangıç noktasının (0,0) kendine olan mesafesi 0'dır
    dijkstraDist[0][0] = 0;

    // 3. Listeye sadece başlangıç hücresini nesne olarak ekliyoruz
    dijkstraList.push({ r: 0, c: 0, dist: 0 });
}

function stepDijkstra() {
    // 1. ADIM: İncelenecek hücre kalmadıysa yol yok demektir
    if (dijkstraList.length === 0) return "yol_yok";

    // 2. ADIM: Listede bekleyenler arasından maliyeti (dist) EN KÜÇÜK olanı bul
    let minIndex = 0;
    for (let i = 1; i < dijkstraList.length; i++) {
        if (dijkstraList[i].dist < dijkstraList[minIndex].dist) {
            minIndex = i;
        }
    }

    // En düşük maliyetli hücreyi listeden çıkarıp alıyoruz (splice diziden silip silineni döner)
    let current = dijkstraList.splice(minIndex, 1)[0];
    let r = current.r;
    let c = current.c;

    // Eğer bu hücre daha önce başka bir koldan işlendiyse pas geç (gereksiz tekrarı önler)
    if (dijkstraVisited[r][c]) return "devam";
    dijkstraVisited[r][c] = true;

    // 3. ADIM: Hedefe ulaştık mı kontrolü (Sağ alt köşe: 24, 24)
    if (r === ROWS - 1 && c === COLS - 1) {
        return "kazandı";
    }

    // Bulunduğumuz hücreyi sarı renkle boyuyoruz
    drawCell(r, c, "rgb(255, 255, 0)");

    // 4. ADIM: Komşuları Gezme ve Maliyet Güncelleme (Relaxation)
    // Her adım 1 birim mesafe maliyeti taşır
    let currentDistance = dijkstraDist[r][c];

    // ÜST KOMŞU: Sınır kontrolü + Duvar kontrolü + Ziyaret edilmemiş olma şartı
    if (r > 0 && !grid[r][c].walls.top && !dijkstraVisited[r - 1][c]) {
        let newDist = currentDistance + 1;
        // Eğer bulduğumuz bu yeni yol, komşunun önceden bildiği yoldan daha kısaysa:
        if (newDist < dijkstraDist[r - 1][c]) {
            dijkstraDist[r - 1][c] = newDist; // Tabloyu güncelle
            dijkstraList.push({ r: r - 1, c: c, dist: newDist }); // Listeye ekle
        }
    }

    // SAĞ KOMŞU
    if (c < COLS - 1 && !grid[r][c].walls.right && !dijkstraVisited[r][c + 1]) {
        let newDist = currentDistance + 1;
        if (newDist < dijkstraDist[r][c + 1]) {
            dijkstraDist[r][c + 1] = newDist;
            dijkstraList.push({ r: r, c: c + 1, dist: newDist });
        }
    }

    // ALT KOMŞU
    if (r < ROWS - 1 && !grid[r][c].walls.bottom && !dijkstraVisited[r + 1][c]) {
        let newDist = currentDistance + 1;
        if (newDist < dijkstraDist[r + 1][c]) {
            dijkstraDist[r + 1][c] = newDist;
            dijkstraList.push({ r: r + 1, c: c, dist: newDist });
        }
    }

    // SOL KOMŞU
    if (c > 0 && !grid[r][c].walls.left && !dijkstraVisited[r][c - 1]) {
        let newDist = currentDistance + 1;
        if (newDist < dijkstraDist[r][c - 1]) {
            dijkstraDist[r][c - 1] = newDist;
            dijkstraList.push({ r: r, c: c - 1, dist: newDist });
        }
    }

    return "devam";
}

// ==========================================
// 4. A* (A-STAR) ALGORİTMASI (Mavi Yarışçı)
// Mantık: Dijkstra gibi çalışır ama körlemesine yayılmaz.
// Formülü: f(n) = g(n) + h(n)
// g(n): Başlangıçtan buraya harcanan gerçek adım sayısı.
// h(n): Manhattan Sezgisi -> Buradan hedefe kuş uçuşu/ızgara tahmini mesafe.
// f(n): Toplam tahmini maliyet. Listeden her zaman f değeri EN KÜÇÜK olan seçilir.
// ==========================================

let aStarList = [];    // İncelenmeyi bekleyen aday hücreler havuzu (Priority Queue)
let aStarVisited = []; // Ziyaret edilen hücrelerin 25x25 boolean tablosu
let aStarGScore = [];  // Başlangıçtan (0,0) her hücreye olan en kısa gerçek maliyet matrisi: g(n)

// Sezgi Fonksiyonu (Manhattan Heuristic):
// Izgara üzerinde çapraz hareket olmadan hedefe kalan tahmini blok mesafesi: |r1 - r2| + |c1 - c2|
function heuristic(r, c) {
    const goalR = ROWS - 1; // Hedef Satır: 24
    const goalC = COLS - 1; // Hedef Sütun: 24
    return Math.abs(r - goalR) + Math.abs(c - goalC);
}

function initAStar() {
    aStarList = [];
    aStarVisited = [];
    aStarGScore = [];

    // 1. 25x25'lik tabloları kuruyoruz
    for (let r = 0; r < ROWS; r++) {
        aStarVisited[r] = [];
        aStarGScore[r] = [];
        for (let c = 0; c < COLS; c++) {
            aStarVisited[r][c] = false;
            // Başlangıçta tüm mesafeleri bilinmediği için sonsuz yapıyoruz
            aStarGScore[r][c] = Infinity;
        }
    }

    // 2. Başlangıç noktasının (0,0) kendine olan gerçek mesafesi g(0,0) = 0
    aStarGScore[0][0] = 0;

    // 3. Başlangıç hücresinin toplam tahmini maliyeti: f = g + h
    let startH = heuristic(0, 0);
    let startF = 0 + startH;

    // 4. Listeye başlangıç hücresini g ve f değerleriyle birlikte atıyoruz
    aStarList.push({ r: 0, c: 0, g: 0, f: startF });
}

function stepAStar() {
    // 1. ADIM: Listede incelenecek hücre kalmadıysa yol yok demektir
    if (aStarList.length === 0) return "yol_yok";

    // 2. ADIM: Listede bekleyenler arasından f değeri (g + h) EN KÜÇÜK olanı bul
    // Dijkstra'da sadece g'ye (dist) bakıyorduk, A*'da hedefe yönlendiren f değerine bakıyoruz!
    let minIndex = 0;
    for (let i = 1; i < aStarList.length; i++) {
        if (aStarList[i].f < aStarList[minIndex].f) {
            minIndex = i;
        }
    }

    // En düşük f değerine sahip hücreyi listeden çıkarıp alıyoruz
    let current = aStarList.splice(minIndex, 1)[0];
    let r = current.r;
    let c = current.c;

    // Eğer bu hücre daha önce işlendiyse atla
    if (aStarVisited[r][c]) return "devam";
    aStarVisited[r][c] = true;

    // 3. ADIM: Hedefe ulaştık mı kontrolü (Sağ alt köşe: 24, 24)
    if (r === ROWS - 1 && c === COLS - 1) {
        return "kazandı";
    }

    // Bulunduğumuz hücreyi Canvas'ta maviye boyuyoruz (A*'ın arama izi)
    drawCell(r, c, "rgba(52, 152, 219, 0.4)");

    // 4. ADIM: Komşuları Gezme ve Maliyet Hesaplama
    let currentG = aStarGScore[r][c];

    // --- ÜST KOMŞU ---
    if (r > 0 && !grid[r][c].walls.top && !aStarVisited[r - 1][c]) {
        let tentativeG = currentG + 1; // Komşuya gitmenin yeni gerçek maliyeti
        // Eğer bu yeni yol daha önce bilinen yoldan daha kısaysa:
        if (tentativeG < aStarGScore[r - 1][c]) {
            aStarGScore[r - 1][c] = tentativeG;
            let h = heuristic(r - 1, c); // Hedefe kalan tahmini Manhattan mesafesi
            let f = tentativeG + h;      // f = g + h
            aStarList.push({ r: r - 1, c: c, g: tentativeG, f: f });
        }
    }

    // --- SAĞ KOMŞU ---
    if (c < COLS - 1 && !grid[r][c].walls.right && !aStarVisited[r][c + 1]) {
        let tentativeG = currentG + 1;
        if (tentativeG < aStarGScore[r][c + 1]) {
            aStarGScore[r][c + 1] = tentativeG;
            let h = heuristic(r, c + 1);
            let f = tentativeG + h;
            aStarList.push({ r: r, c: c + 1, g: tentativeG, f: f });
        }
    }

    // --- ALT KOMŞU ---
    if (r < ROWS - 1 && !grid[r][c].walls.bottom && !aStarVisited[r + 1][c]) {
        let tentativeG = currentG + 1;
        if (tentativeG < aStarGScore[r + 1][c]) {
            aStarGScore[r + 1][c] = tentativeG;
            let h = heuristic(r + 1, c);
            let f = tentativeG + h;
            aStarList.push({ r: r + 1, c: c, g: tentativeG, f: f });
        }
    }

    // --- SOL KOMŞU ---
    if (c > 0 && !grid[r][c].walls.left && !aStarVisited[r][c - 1]) {
        let tentativeG = currentG + 1;
        if (tentativeG < aStarGScore[r][c - 1]) {
            aStarGScore[r][c - 1] = tentativeG;
            let h = heuristic(r, c - 1);
            let f = tentativeG + h;
            aStarList.push({ r: r, c: c - 1, g: tentativeG, f: f });
        }
    }

    return "devam";
}
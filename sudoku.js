const gridSize = 9
let board = []

function showSudoku() {
    const sudoku = document.getElementById("sudoku");
    sudoku.hidden = !sudoku.hidden
}

function resetSudoku() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            document.getElementById(`r${row}${col}`).value = ""
        }
    }
}

function solveSudoku() {
    getBoard(board)

    if (isBoardEmpty(board)) {
        alert("Lütfen önce en azından birkaç sayı girin!")
        return
    }

    if (!isValidInitialBoard(board)) {
        alert("Hatalı Giriş! Aynı satırda, sütunda veya 3x3 kutuda aynı sayı birden fazla kez bulunamaz.");
        return;
    }

    let solveNumber = prompt("Hangi Yöntemle Çözdürmek isterseniz? (1 - Yavaş, 2 - Orta, 3 - Hızlı)")
    switch (solveNumber) {
        case "1":
            if (solve(board)) {
                alert("Çözüm Yapıldı!")
                printBoard(board)
                updateBoard(board)
            }
            else {
                alert("Çözüm Yapılamadı!")
            }
            break
        case "2":
            if (solveMRV(board)) {
                alert("Çözüm Yapıldı!")
                printBoard(board)
                updateBoard(board)
            }
            else {
                alert("Çözüm Yapılamadı!")
            }
            break
        case "3":
            if (solveFC(board)) {
                alert("Çözüm Yapıldı!")
                printBoard(board)
                updateBoard(board)
            }
            else {
                alert("Çözüm Yapılamadı!")
            }
            break
        default:
            alert("Geçersiz Giriş! Lütfen Doğru Giriş Yapınız.")
    }


}

function getBoard(board) {
    for (let row = 0; row < gridSize; row++) {
        board[row] = []
        for (let col = 0; col < gridSize; col++) {
            let val = document.getElementById(`r${row}${col}`).value.trim()
            if (val === "" || val === "0" || val === "-") {
                board[row][col] = 0
            } else {
                board[row][col] = parseInt(val, 10) || 0
            }
        }
    }

    printBoard(board)
}

function isBoardEmpty(board) {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== 0) return false;
        }
    }
    return true;
}

function updateBoard(board) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            document.getElementById(`r${row}${col}`).value = board[row][col]
        }
    }
}

function printBoard(board) {
    for (let i = 0; i < gridSize; i++) {
        let row = "";

        for (let j = 0; j < gridSize; j++) {
            row += (board[i][j] == 0 ? "*" : board[i][j]) + " ";

            if ((j + 1) % 3 == 0 && j !== gridSize - 1) {
                row += "| ";
            }
        }

        console.log(row)
        if ((i + 1) % 3 == 0) {
            console.log("----------------------")
        }
    }
}

function canPlace(board, num, row, col) {
    //Satır Kontrolü
    for (let r = 0; r < gridSize; r++) {
        if (board[row][r] === num) {
            return false
        }
    }

    //Sütun Kontrolü
    for (let c = 0; c < gridSize; c++) {
        if (board[c][col] === num) {
            return false
        }
    }

    //3x3'lük Kare kontrolü
    let boxRowStart = row - (row % 3);
    let boxColStart = col - (col % 3);

    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
            if (board[r][c] === num) {
                return false;
            }
        }
    }

    return true
}

function getCellDomain(board, row, col) {
    let domain = []

    for (let num = 1; num <= gridSize; num++) {
        if (canPlace(board, num, row, col)) {
            domain.push(num)
        }
    }
    return domain
}

// Kısıt kontrollü
function solve(board) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (canPlace(board, num, row, col)) {
                        board[row][col] = num

                        if (solve(board)) {
                            return true;
                        }
                        // Çıkmaza girildiyse geri al (backtrack)
                        board[row][col] = 0;
                    }
                }
                // 1'den 9'a kadar hiçbir sayı uymadıysa false dön
                return false;
            }
        }
    }
    return true
}

// Min domain kontrollü
function solveMRV(board) {
    let minOptions = Infinity // en az elemanlı domain'i bulmak için
    let bestCellDomain = null // en az elemanlı domain
    let bestRow = -1 // en az elemanlı domainin bulunduğu hücrenin satırı
    let bestCol = -1 // en az elemanlı domainin bulunduğu hücrenin sütunu

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                let cellDomain = getCellDomain(board, row, col)

                if (cellDomain.length < minOptions) {
                    minOptions = cellDomain.length
                    bestRow = row
                    bestCol = col
                    bestCellDomain = cellDomain
                }
            }

            if (minOptions === 0) break
        }

        if (minOptions === 0) break
    }

    // Tahtada hiç boş hücre yoksa -> ÇÖZÜLDÜ
    if (bestRow === -1) {
        return true
    }

    // boş kare var ancak alabileceği bir sayı yok -> ÇIKMAZ
    if (bestCellDomain.length === 0) {
        return false
    }

    // En az elemana sahip hücrenin elemanlarını dene
    for (let num of bestCellDomain) {
        board[bestRow][bestCol] = num //domain'deki elemanı veriyor

        if (solveMRV(board)) { //verilen değerden sonra bulmaca doğru çözülüyor mu diye bakıyor
            return true
        }

        board[bestRow][bestCol] = 0 //Çıkmaza girmişsek (verilen değerler yazılamıyorsa) geri al
    }
    return false
}

function solveFC(board) {
    let minOptions = Infinity // en az elemanlı domain'i bulmak için
    let bestCellDomain = null // en az elemanlı domain
    let bestRow = -1 // en az elemanlı domainin bulunduğu hücrenin satırı
    let bestCol = -1 // en az elemanlı domainin bulunduğu hücrenin sütunu

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                let cellDomain = getCellDomain(board, row, col)

                if (cellDomain.length < minOptions) {
                    minOptions = cellDomain.length
                    bestRow = row
                    bestCol = col
                    bestCellDomain = cellDomain
                }
            }

            if (minOptions === 0) break
        }

        if (minOptions === 0) break
    }

    // Tahtada hiç boş hücre yoksa -> ÇÖZÜLDÜ
    if (bestRow === -1) {
        return true
    }

    // boş kare var ancak alabileceği bir sayı yok -> ÇIKMAZ
    if (bestCellDomain.length === 0) {
        return false
    }

    // En az elemana sahip hücrenin elemanlarını dene
    for (let num of bestCellDomain) {
        board[bestRow][bestCol] = num //domain'deki elemanı veriyor

        if (forwardCheck(board, bestRow, bestCol)) {
            if (solveFC(board)) { //verilen değerden sonra bulmaca doğru çözülüyor mu diye bakıyor
                return true
            }
        }

        board[bestRow][bestCol] = 0 //Çıkmaza girmişsek (verilen değerler yazılamıyorsa) geri al
    }
    return false
}

function forwardCheck(board, row, col) {
    // Satır
    for (let r = 0; r < gridSize; r++) {
        if (board[row][r] == 0) {
            let domain = getCellDomain(board, row, r)

            if (domain.length == 0) return false
        }
    }

    // Sütun
    for (let c = 0; c < gridSize; c++) {
        if (board[c][col] == 0) {
            let domain = getCellDomain(board, c, col)

            if (domain.length == 0) return false
        }
    }

    //3x3 Kare 
    let startRow = row - (row % 3)
    let startCol = col - (col % 3)

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r][c] == 0) {
                let domain = getCellDomain(board, r, c)

                if (domain.length == 0) return false
            }
        }
    }

    return true
}

function isValidInitialBoard(board) {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            let num = board[r][c];

            // Sadece dolu hücreleri test ediyoruz
            if (num !== 0) {
                // Hücreyi geçici olarak boşaltıp canPlace kuralını test ediyoruz
                board[r][c] = 0;
                let valid = canPlace(board, num, r, c);
                board[r][c] = num; // Sayıyı geri koy

                // Eğer canPlace false dönerse, kural ihlali vardır (yan yana, alt alta veya kutuda aynı sayı)
                if (!valid) {
                    return false;
                }
            }
        }
    }
    return true;
}


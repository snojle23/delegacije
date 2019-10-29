const fs = require('fs');
function preveriCeSodnikObstaja(worksheet, sodnik) {
    //   let worksheet = woorkbook.getWorksheet('AHL');
    let countCell = 1;
    while (1) {
        if (worksheet.getRow(3).getCell(countCell).value == sodnik) {
            return countCell;
        }
        if (worksheet.getRow(3).getCell(countCell).value == null) {
            worksheet.getRow(3).getCell(countCell).value = sodnik;
            console.log("Nov sodnik dodan v bazo: " + sodnik);
            let today = new Date();
            fs.appendFileSync("logs.txt", "[" + today + "] " + "Nov sodnik" + sodnik + " uspesno dodan " + "\n");
            return countCell;
        }
        countCell++;
    }
}
exports.preveriCeSodnikObstaja = preveriCeSodnikObstaja;

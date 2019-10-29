function preveriAliObstajaDatum(worksheet, datum) {
    //   let worksheet= workbook.getWorksheet('AHL_DAT');
    let ret = true;
    let countCell1 = 1;
    while (1) {
        if (worksheet.getRow(3).getCell(countCell1).value == null) {
            console.log("na voljo je nov datum");
            return true;
        }
        else if (worksheet.getRow(3).getCell(countCell1).value == datum) {
            ret = false;
            return false;    
        }
        countCell1++;
    }
    return ret;
}
exports.preveriAliObstajaDatum = preveriAliObstajaDatum;

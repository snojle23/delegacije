const exceljs = require('exceljs');
(async () => {
    const wb = new exceljs.Workbook();
    await wb.xlsx.readFile('C:/Users/TadejS/Downloads/Copy of ICE_Assigment-Draft_0_popravil.xlsx');
    const ws = wb.getWorksheet('Draft');
    function fmt(v) {
        if (v && typeof v === 'object') return JSON.stringify({f: v.formula || v.sharedFormula, res: v.result, ref: v.ref, shareType: v.shareType});
        return JSON.stringify(v);
    }
    console.log('--- row2 cols AE(31)-AV(48) ---');
    for (let c = 31; c <= 48; c++) {
        console.log(c, ws.getColumn(c).letter, fmt(ws.getRow(2).getCell(c).value));
    }
    console.log('--- row3 cols AG(33)-AV(48) ---');
    for (let c = 33; c <= 48; c++) {
        console.log(c, ws.getColumn(c).letter, fmt(ws.getRow(3).getCell(c).value));
    }
    console.log('--- row34 (TOTAL) cols AE(31)-AV(48) ---');
    for (let c = 31; c <= 48; c++) {
        console.log(c, ws.getColumn(c).letter, fmt(ws.getRow(34).getCell(c).value));
    }
    console.log('--- merges ---');
    console.log(JSON.stringify(ws.model.merges));
    console.log('--- style of AS4 and AT4 (number fmt, font, fill, border) ---');
    const as4 = ws.getRow(4).getCell(45);
    const at4 = ws.getRow(4).getCell(46);
    console.log('AS4 style', JSON.stringify(as4.style));
    console.log('AT4 style', JSON.stringify(at4.style));
    console.log('AS3 style', JSON.stringify(ws.getRow(3).getCell(45).style));
    console.log('AT3 style', JSON.stringify(ws.getRow(3).getCell(46).style));
    console.log('AS2 style', JSON.stringify(ws.getRow(2).getCell(45).style));
    console.log('AT2 style', JSON.stringify(ws.getRow(2).getCell(46).style));
    console.log('--- column widths AS,AT,AU ---');
    console.log(ws.getColumn(45).width, ws.getColumn(46).width, ws.getColumn(47).width);
})();

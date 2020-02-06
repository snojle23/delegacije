const {delegacije} = require('./delegacije');
const { magicUmesni } = require('./umesniDel');
const fs = require('fs')
    
let json_data = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));
getAll();

async function getAll(){
    console.log("klicem delegaije.js");
    await delegacije(json_data);

    console.log("klicem umesni del");
    await magicUmesni(json_data);
};
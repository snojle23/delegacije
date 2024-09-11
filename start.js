const { delegacije } = require('./delegacije');
const { getData2 } = require('./getNewData')
const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({ // 'ICEObvescanje1'
    service: 'gmail',
    auth: {
        user: 'delegacijeice@gmail.com',
        pass: 'eduainbjitlfxdma'
    }
});
let counter = 1;
let countHour = 0;
scheduledFunction();

function scheduledFunction() {
    setInterval(async function () {
        const today = new Date();
        // console.log("1. Pridobivam nove podatke, poizkus " + counter + " " + today);
        // const mess = await getNewJson();
        //await sleep(5000);
        //console.log("  " + mess);
        //const json_data = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));

        const json_data = await getData2();

        if (json_data.length > 0) {
            const arrayForMail = [];
            await delegacije(json_data, arrayForMail);

            const mailing = {
                "snojta": "tadej.snoj@gmail.com",
                // "bajtmi": "miha.bajt@gmail.com",
                // "miklicgr": "gregor.miklic.sp@gmail.com",
                "rezekgr": "gregor.rezek@gmail.com",
                "hribarma": "matjazhribar@hotmail.com",
                "zrnicmi": "milan_zrnic@hotmail.com",
                // "trilarvi": "viki@hokej.si", -- viki ni dal sixpacka za 2022-23 in za 2023-24
                // "zgoncga": "jaka.zgonc@gmail.com",
                // "bergantan": "anze.bergant@gmail.com", bergi ni plaču za 2022-23 in za 2023-24
                "bulovecmi": "miha.bulovec@gmail.com", //plačano do konca 2024-25
                "piragictr": "trpimir.piragic@gmail.com",
                "seewaldel": "seewald30@gmail.com",
                "murnikpe": "petja.murnik@gmail.com",
                "markizetigr": "grega.markizeti@gmail.com"
            }


            // 'snojta', 'hribarma', 'zrnicmi', 'seewaldel', 'markizetigr', 'rezekgr', 'piragictr' teli so mel poravnan za 2022-23
            // bajtmi, miklicgr, zgoncga
            arrayForMail.forEach(i => {
                const tekme = JSON.stringify(i.tekme);
                if (Object.keys(mailing).includes(i.sodnik)) {
                    let htmlTekst = `
                            <p><strong>Dobrodošli v sezono 2024-25.</strong>🍻 Če si dobil ta mail pomeni, da si za 2022-23 prinesel pivo. Praksa je enaka za prejšno sezono - 2023-24🍻</p>
                            <p>Pivo pričakujem najkasneje do CC-ja v Romuniji, kar je 18.10.2024</p>
                            <p>Nove tekme:</p>
                            <ul>
                                ${i.tekme.map(t => `<li>${t.liga} - ${t.datum}</li>`).join('')}
                            </ul>
                            `;
                    if (['markizetigr', 'murnikpe'].includes(i.sodnik)) { 
                        htmlTekst = `
                        <p><strong>Dobrodošli v sezono 2024-25.</strong>🍻</p>
                        <p>Pivo za prejšno sezono pričakujem najkasneje do CC-ja v Romuniji, kar je 18.10.2024</p>
                        <p>Nove tekme:</p>
                        <ul>
                            ${i.tekme.map(t => `<li>${t.liga} - ${t.datum}</li>`).join('')}
                        </ul>
                        `;
                    }

                    if (['snojta', 'seewaldel', "bulovecmi"].includes(i.sodnik)) {
                        htmlTekst = `
                            <p>New games in https://www.referee-manager.com/, check them:</p>
                            <ul>
                                ${i.tekme.map(t => `<li>${t.liga} - ${t.datum}</li>`).join('')}
                            </ul>
                            `;
                    }
                    const mailOptions = {
                        from: 'delegacijeice@gmail.com',
                        to: mailing[i.sodnik],
                        subject: `New game AHL/ICEHL`,
                        html: htmlTekst
                        //text: `Program is back on!\nWelcome to the season 2023-24!.\n\n Please do not forget for yearly subscription of one six-pack for season 2022-23 :) \n\n here are new games for you: ${tekme}`
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response + "to " + i.sodnik);
                            console.log(tekme)
                            console.log("----------------------------------")
                        }
                    });
                }
            });
        }
        countHour++
        if (countHour === 24) {
            const today = new Date();
            console.log('');
            console.log("Še 6 ur je šlo mimo. Skupen stevec: " + counter + " datum:" + `${today.getHours()}:${today.getMinutes()}`);
            countHour = 0;
        } else {
            process.stdout.write(`\rProgress: ${(countHour / 24 * 100).toFixed(2)}% Zadnja ura: ${today.getHours()}:${today.getMinutes()}`);
        }

        counter++;
    }, 1 * 15 * 60 * 1000); // 1 hour = 1 * 60 * 60 * 1000
}       // 1 * 1 * 30 * 1000 30sec
// 1 * 15 * 60 * 1000 15min

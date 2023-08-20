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
                "bajtmi": "miha.bajt@gmail.com",
                "miklicgr": "gregor.miklic.sp@gmail.com",
                "rezekgr": "gregor.rezek@gmail.com",
                "hribarma": "matjazhribar@hotmail.com",
                "zrnicmi": "milan_zrnic@hotmail.com",
                "trilarvi": "viki@hokej.si",
                "zgoncga": "jaka.zgonc@gmail.com",
                "bergantan": "anze.bergant@gmail.com",
                "bulovecmi": "miha.bulovec@gmail.com",
                "piragictr": "trpimir.piragic@gmail.com",
                "seewaldel": "seewald30@gmail.com"
            }
            arrayForMail.forEach(i => {
                const tekme = JSON.stringify(i.tekme);
                if (Object.keys(mailing).includes(i.sodnik)) {
                    const mailOptions = {
                        from: 'delegacijeice@gmail.com',
                        to: mailing[i.sodnik],
                        subject: `New game AHL/ICEHL`,
                        html: `
                            <p>Program is back on!🚀</p>
                            <p>Welcome to the season 2023-24🎉</p>
                            <p><strong>🍻Please do not forget</strong> for yearly subscription of one six-pack for season 2022-23🍻</p>
                            <p><em>Note: The subscription is not mandatory and is completely voluntary.😊</em></p>
                            <p>Here are new games for you:</p>
                            <ul>
                                ${i.tekme.map(t => `<li>${t.liga} - ${t.datum}</li>`).join('')}
                            </ul>
                            `
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
        if (countHour === 120) {
            const today = new Date();
            console.log('');
            console.log("Še ena ura je šla mimo. Skupen stevec: " + counter + " datum:" + today);
            countHour = 0;
        } else {
            process.stdout.write(`\rProgress: ${(countHour / 120 * 100).toFixed(2)}%`);
        }

        counter++;
    }, 1 * 1 * 30 * 1000); // 1 hour = 1 * 60 * 60 * 1000
}       // 1 * 1 * 30 * 1000 30sec

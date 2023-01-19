const { delegacije } = require('./delegacije');
const fs = require('fs')
const { getNewJson, magic } = require('./getNewJson');
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

scheduledFunction();


function scheduledFunction() {
    setInterval(async function () {
        const today = new Date();
        console.log("1. Pridobivam nove podatke, poizkus " + counter + " " + today);
        const mess = await getNewJson();
        await sleep(5000);
        console.log("  " + mess);
        const json_data = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));
        const arrayForMail = []
        console.log("2. klicem delegaije.js");
        await delegacije(json_data, arrayForMail);

        console.log("3. klicem delegaije.js");
        await delegacije(json_data, arrayForMail);

        // console.log("4. klicem delegaije.js");
        // await delegacije(json_data, arrayForMail);


        // POSLJI MAIL
        if (arrayForMail.length > 0) {
            console.log('posiljam mail');
        } else {
            console.log("-------------------------------------------------------------------")
        }
        const mailing = {
            "snoj": "tadej.snoj@gmail.com",
            "bajt": "miha.bajt@gmail.com",
            "miklic": "gregor.miklic.sp@gmail.com",
            "rezek": "gregor.rezek@gmail.com",
            "hribar": "matjazhribar@hotmail.com",
            "zrnic": "milan_zrnic@hotmail.com",
            "trilar": "viki@hokej.si",
            "zgonc": "jaka.zgonc@gmail.com",
            "bergant": "anze.bergant@gmail.com",
            "bulovec": "miha.bulovec@gmail.com"
        }
        arrayForMail.forEach(i => {
            const tekme = JSON.stringify(i.tekme);
            if (Object.keys(mailing).includes(i.sodnik)) {
                const mailOptions = {
                    from: 'delegacijeice@gmail.com',
                    to: mailing[i.sodnik],
                    subject: `Nova tekma AHL/ICEHL`,
                    text: `Dobil si nove tekme ${tekme}`
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
        counter++;
    }, 1 * 30 * 60 * 1000); // 1 hour = 1 * 60 * 60 * 1000
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
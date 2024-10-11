
const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({ // 'ICEObvescanje1'
    service: 'gmail',
    auth: {
        user: 'delegacijeice@gmail.com',
        pass: 'eduainbjitlfxdma'
    }
});

opomnik();
function opomnik() {
    // "grega.markizeti@gmail.com", "petja.murnik@gmail.com", "milan_zrnic@hotmail.com", "matjazhribar@hotmail.com", "trpimir.piragic@gmail.com", 
    ["tadej.snoj@gmail.com", "grega.markizeti@gmail.com", "petja.murnik@gmail.com", "matjazhribar@hotmail.com"].forEach(i => {
        let htmlTekst = `
    <p><strong>NOVE TEKME, NOVE TEKME, NOVE TEKME</strong></p>
    <br></br>
    <br> </br>
    <br> </br>
    <p>Ni novih tekem, samo opomnik, da se bliža 18.10.2024 in še nimaš poravnane LANSKE sezone!</p>
    <p>Še enkrat: Pivo pričakujem najkasneje do CC-ja v Romuniji, kar je 18.10.2024, oziroma se lahko na tvoj predlog kaj drugega dogovoriva</p>
    `;
        const mailOptions = {
            from: 'delegacijeice@gmail.com',
            to: i,
            subject: `New game AHL/ICEHL`,
            html: htmlTekst
            //text: `Program is back on!\nWelcome to the season 2023-24!.\n\n Please do not forget for yearly subscription of one six-pack for season 2022-23 :) \n\n here are new games for you: ${tekme}`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Opomnik: ' + i);
            }
        });
    })
}
"use strict";

// Periodično (privzeto vsakih 15 min) preveri "pending" dodelitve na
// referee-manager.com in po e-pošti javi, če je prišla NOVA čakajoča
// dodelitev, ki je ob prejšnjem preverjanju še ni bilo.
//
// Zasnovano po vzoru obstoječega start.js (setInterval + nodemailer/gmail).
//
// Uporaba:
//   node watchPending.js --email=tvoj@email.com --password=geslo --notify=kam@ti.pridejo.mail
// ali z okoljskimi spremenljivkami RM_EMAIL / RM_PASSWORD / NOTIFY_EMAIL.
//
// Pusti tek v ozadju (npr. v svojem terminalskem oknu ali kot Windows opravilo).

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { checkPendingAssignments, formatGame } = require("./rmClient");

const STATE_FILE = path.join(__dirname, "data", "pendingWatchState.json");
const INTERVAL_MIN = 15;

// Isti pošiljateljski račun, ki ga aplikacija že uporablja v start.js.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "delegacijeice@gmail.com",
        pass: "lblukykpnrgzngtu",
    },
});

function parseArgs(argv) {
    const out = {};
    for (const arg of argv) {
        const m = arg.match(/^--(email|password|notify)=(.*)$/s);
        if (m) out[m[1]] = m[2];
    }
    return out;
}

function loadSeenIds() {
    try {
        const raw = fs.readFileSync(STATE_FILE, "utf-8");
        return new Set(JSON.parse(raw));
    } catch {
        return new Set();
    }
}

function saveSeenIds(idSet) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify([...idSet]), "utf-8");
}

function sendNewPendingMail(notifyEmail, newOnes) {
    const htmlList = newOnes.map((occ) => `<li>${formatGame(occ)}</li>`).join("");
    const mailOptions = {
        from: "delegacijeice@gmail.com",
        to: notifyEmail,
        subject: `Nova pending dodelitev na Referee Manager (${newOnes.length})`,
        html: `<p>Dobil si ${newOnes.length} novo čakajočo dodelitev:</p><ul>${htmlList}</ul>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Napaka pri pošiljanju maila:", error.message);
        } else {
            console.log("Mail poslan: " + info.response);
        }
    });
}

async function tick(email, password, notifyEmail, seenIds) {
    const today = new Date();
    try {
        const { pendingCount, myPending } = await checkPendingAssignments({ email, password });
        const newOnes = myPending.filter((occ) => !seenIds.has(occ.id));

        console.log(`[${today.toLocaleString()}] pendingCount=${pendingCount}, tvojih pending=${myPending.length}, novih=${newOnes.length}`);

        if (newOnes.length > 0) {
            sendNewPendingMail(notifyEmail, newOnes);
        }

        // Posodobi seznam "videnih" na trenutno stanje (tudi tiste, ki so
        // medtem izginile - če se kdaj spet pojavijo, jih spet štejemo za nove).
        seenIds.clear();
        for (const occ of myPending) seenIds.add(occ.id);
        saveSeenIds(seenIds);
    } catch (err) {
        console.log(`[${today.toLocaleString()}] Napaka pri preverjanju: ${err.message}`);
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const email = args.email || process.env.RM_EMAIL;
    const password = args.password || process.env.RM_PASSWORD;
    const notifyEmail = args.notify || process.env.NOTIFY_EMAIL || "tadej.snoj@gmail.com";

    if (!email || !password) {
        console.error(
            "Manjkajo prijavni podatki. Podaj jih kot parametre:\n" +
            "  node watchPending.js --email=tvoj@email.com --password=geslo --notify=kam@ti.pridejo.mail\n" +
            "ali kot okoljske spremenljivke RM_EMAIL / RM_PASSWORD / NOTIFY_EMAIL."
        );
        process.exit(1);
    }

    console.log(`Zaganjam nadzor pending dodelitev vsakih ${INTERVAL_MIN} min. Obvestila grejo na: ${notifyEmail}`);

    const seenIds = loadSeenIds();
    await tick(email, password, notifyEmail, seenIds); // takoj ob zagonu
    setInterval(() => tick(email, password, notifyEmail, seenIds), INTERVAL_MIN * 60 * 1000);
}

main();

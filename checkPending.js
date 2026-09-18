"use strict";

// Enkraten ročni pregled "pending" (čakajočih) dodelitev na
// https://www.referee-manager.com/assignments?tab=pending
//
// Uporaba s parametri:
//   node checkPending.js --email=tvoj@email.com --password=geslo
//
// Uporaba z okoljskimi spremenljivkami:
//   $env:RM_EMAIL = "tvoj@email.com"; $env:RM_PASSWORD = "tvoje geslo"
//   node checkPending.js

const { checkPendingAssignments, formatGame } = require("./rmClient");

function parseArgs(argv) {
    const out = {};
    for (const arg of argv) {
        const m = arg.match(/^--(email|password)=(.*)$/s);
        if (m) out[m[1]] = m[2];
    }
    return out;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const email = args.email || process.env.RM_EMAIL;
    const password = args.password || process.env.RM_PASSWORD;
    if (!email || !password) {
        console.error(
            "Manjkajo prijavni podatki. Podaj jih kot parametra:\n" +
            "  node checkPending.js --email=tvoj@email.com --password=geslo\n" +
            "ali kot okoljski spremenljivki RM_EMAIL / RM_PASSWORD."
        );
        process.exit(1);
    }

    const { pendingCount, approvedCount, myId, myPending } = await checkPendingAssignments({ email, password });

    console.log(`pendingCount (stran): ${pendingCount}`);
    console.log(`approvedCount (stran): ${approvedCount}`);
    if (myId != null) console.log(`Tvoj user_id: ${myId}`);
    console.log("");

    if (myPending.length === 0) {
        console.log("Ni novih pending dodelitev zate.");
    } else {
        console.log(`Imaš ${myPending.length} čakajočih (pending) dodelitev:\n`);
        for (const occ of myPending) {
            console.log("- " + formatGame(occ));
        }
    }
}

main().catch((err) => {
    console.error("Napaka:", err.message);
    process.exit(1);
});

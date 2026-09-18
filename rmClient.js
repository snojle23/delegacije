"use strict";

// Skupna logika za prijavo v referee-manager.com in branje "pending"
// dodelitev z zavihka /assignments?tab=pending. Uporabljata jo
// checkPending.js (enkraten ročni pregled) in watchPending.js (periodično
// preverjanje + mail obvestila).

const BASE = "https://www.referee-manager.com";
const PENDING_URL = `${BASE}/assignments?tab=pending`;

class CookieJar {
    constructor() {
        this.jar = new Map();
    }
    update(setCookieHeaders) {
        for (const sc of setCookieHeaders || []) {
            const pair = sc.split(";")[0];
            const idx = pair.indexOf("=");
            if (idx === -1) continue;
            this.jar.set(pair.slice(0, idx), pair.slice(idx + 1));
        }
    }
    header() {
        return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    }
    get(name) {
        return this.jar.get(name);
    }
}

function getSetCookies(res) {
    return typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
}

function decodeHtmlEntities(str) {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

function extractDataPage(html) {
    const match = html.match(/data-page="([^"]*)"/);
    if (!match) {
        throw new Error("Ne najdem data-page atributa v HTML-ju (stran se je morda spremenila, ali prijava ni uspela).");
    }
    return JSON.parse(decodeHtmlEntities(match[1]));
}

async function login(jar, email, password) {
    let res = await fetch(`${BASE}/login`, { headers: { Accept: "text/html" } });
    jar.update(getSetCookies(res));

    const xsrfRaw = jar.get("XSRF-TOKEN");
    if (!xsrfRaw) {
        throw new Error("Ni prejel XSRF-TOKEN piškotka - stran se je morda spremenila.");
    }
    const xsrfToken = decodeURIComponent(xsrfRaw);

    res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": xsrfToken,
            Cookie: jar.header(),
        },
        body: JSON.stringify({ email, password }),
        redirect: "manual",
    });
    jar.update(getSetCookies(res));

    if (res.status >= 400) {
        const text = await res.text();
        throw new Error(`Prijava ni uspela (status ${res.status}): ${text.slice(0, 300)}`);
    }
}

function formatGame(occ) {
    const g = occ.game || {};
    const home = g.home_team?.name || "?";
    const away = g.away_team?.name || "?";
    const date = g.date ? g.date.slice(0, 16).replace("T", " ") : "?";
    const venue = g.venue?.name || "?";
    return `${date}  ${home} - ${away}  (${venue})  pozicija: ${occ.position}`;
}

// Prijavi se in prebere trenutno stanje "pending" zavihka.
// Vrne { pendingCount, approvedCount, myId, myPending } - myPending je
// filtriran seznam SAMO tvojih (ne tujih) čakajočih dodelitev.
async function checkPendingAssignments({ email, password }) {
    const jar = new CookieJar();
    await login(jar, email, password);

    const res = await fetch(PENDING_URL, {
        headers: { Cookie: jar.header(), Accept: "text/html" },
    });
    jar.update(getSetCookies(res));
    const html = await res.text();
    const data = extractDataPage(html);
    const props = data.props;

    const myId = props.auth?.user?.id;
    const occupations = Array.isArray(props.occupations) ? props.occupations : [];
    const mine = myId != null ? occupations.filter((o) => o.user_id === myId) : occupations;
    const myPending = mine.filter((o) => o.status === "pending");

    return {
        pendingCount: props.pendingCount,
        approvedCount: props.approvedCount,
        myId,
        myPending,
    };
}

module.exports = { checkPendingAssignments, formatGame, PENDING_URL };

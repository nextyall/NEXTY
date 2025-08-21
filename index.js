const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require("@whiskeysockets/baileys")

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, console.log)
        },
        printQRInTerminal: true
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startSock()
            } else {
                console.log("Logged out. Delete session folder and reconnect.")
            }
        } else if (connection === "open") {
            console.log("✅ WhatsApp Connected Successfully!")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0]
        if (!m.message) return

        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text

        if (!body) return

        if (body === ".menu") {
            const menuText = `┏▣ ◈ *𓆩𝚴𝚵𝚾𝚻𝐘𓆪* ◈
┃ *ᴏᴡ

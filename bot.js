const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "-chatentreserv";
const DB_FILE = "./database.json";

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  if (message.content === `${PREFIX} add`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("❌ Tu dois être admin.");
    const db = readDB();
    db.servers = db.servers.filter(s => s.guildId !== message.guild.id);
    db.servers.push({ guildId: message.guild.id, channelId: message.channel.id });
    writeDB(db);
    return message.reply("✅ Salon configuré pour le chat inter-serveurs !");
  }

  if (message.content === `${PREFIX} remove`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("❌ Tu dois être admin.");
    const db = readDB();
    db.servers = db.servers.filter(s => s.guildId !== message.guild.id);
    writeDB(db);
    return message.reply("🗑 Salon retiré du système.");
  }

  const db = readDB();
  const serverData = db.servers.find(s => s.guildId === message.guild.id);
  if (!serverData || message.channel.id !== serverData.channelId) return;

  if (message.content.includes("@everyone") || message.content.includes("@here")) return message.reply("❌ Mentions globales interdites.");

  const embed = new EmbedBuilder()
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
    .setDescription(message.content || "*Message sans texte*")
    .addFields({ name: "🏷 Serveur", value: message.guild.name })
    .setTimestamp();

  for (const server of db.servers) {
    if (server.guildId === message.guild.id) continue;
    try {
      const guild = client.guilds.cache.get(server.guildId);
      if (!guild) continue;
      const channel = guild.channels.cache.get(server.channelId);
      if (!channel) continue;
      await channel.send({ embeds: [embed] });
    } catch (err) { console.log("Erreur :", err.message); }
  }

  message.react("✔️");
});

// ⚠️ Ne mets jamais ton vrai token dans le code si tu publies
client.login(process.env.TOKEN);

const { SlashCommandBuilder } = require('discord.js');

async function Main(Interaction) {
    await Interaction.reply("Hello!")
}

module.exports = {
    runner: Main,
    data: new SlashCommandBuilder()
    .setName('testing2')
    .setDescription('Testing'),
}
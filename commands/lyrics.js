require('dotenv').config()
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Genius = require("genius-lyrics");
const Client = new Genius.Client(process.env.GENIUSAUTH);

async function GetLyrics(SongName, SongArtist) { // https://github.com/angeloanan/lyrics-finder - authentication method
    try {
        const AllResults = await Client.songs.search(`${SongName} ${SongArtist}`)
        const FirstResult = AllResults[0]
        const ResultLyrics = await FirstResult.lyrics()
        
        return {
            Lyrics: ResultLyrics
        }
    } catch (err) {
        return false;
    }
}

async function Main(Interaction) {
    const SongName = Interaction.options.getString('song');
    const SongArtist = Interaction.options.getString('artist');
    const LyricsResult = await GetLyrics(SongName, SongArtist)

    let RichResult;

    if (LyricsResult === false) {
        RichResult = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`מילים לשיר: ${SongName} על ידי ${SongArtist}`)
            .setDescription(`הייתה בעיה בפעולה.`)
    } else {
        RichResult = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`מילים לשיר: ${SongName} על ידי ${SongArtist}`)
            .setDescription(`\`\`\`${LyricsResult.Lyrics}\`\`\``)
    }

    await Interaction.reply({
        embeds: [RichResult]
    })
}

module.exports = {
    runner: Main,
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription(`מציאת מילים`)
        .addStringOption(option =>
            option.setName('song')
                .setDescription('שם השיר')
                .setRequired(true))

        .addStringOption(option =>
            option.setName('artist')
                .setDescription('שם הזמר/ת')
                .setRequired(true)),
}
require('dotenv').config()
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Genius = require("genius-lyrics");
const Client = new Genius.Client(process.env.GENIUSAUTH);

function splitStringByLength(string, length) { // bard.google.com - this func is AI generated because I was failing to make the logic
    const splitStrings = [];
    let startIndex = 0;
    while (startIndex < string.length) {
        const endIndex = Math.min(startIndex + length, string.length);
        splitStrings.push(string.substring(startIndex, endIndex));
        startIndex = endIndex;
    }

    return splitStrings;
}

async function GetLyrics(SongName) { // removed SongArtist for the API implementation, was not needed however I left it in the bot for replication purposes
    try {
        const AllResults = await Client.songs.search(`${SongName}`)
        const FirstResult = AllResults[0]
        const ResultLyrics = await FirstResult.lyrics()

        return {
            Lyrics: ResultLyrics,
            Artists: FirstResult.artist.name, // artist name and song name because the result may not be what was searched
            SongName: FirstResult.title
        }
    } catch (err) {
        return false;
    }
}

async function Main(Interaction) {
    const SongName = Interaction.options.getString('song');
    const LyricsResult = await GetLyrics(SongName)

    let RichEmbeds = [];

    if (LyricsResult === false) {
        const RichEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`בעיה`) // 
            .setDescription(`הייתה בעיה בפעולה.`)

        RichEmbeds.push(RichEmbed)
    } else {
        const SplitLyrics = splitStringByLength(LyricsResult.Lyrics, 1500) // Slice lyrics to allow for the full song to be sent back. Niche little perk :)
        let SplitIndex = 0;

        for (const IdentifiedLyric of SplitLyrics) {
            if (SplitIndex === 0) {
                const RichEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(`מילים לשיר: ${LyricsResult.SongName} על ידי ${LyricsResult.Artists}`)
                    .setDescription(`\`\`\`${IdentifiedLyric}\`\`\``) // Implementing the slice

                RichEmbeds.push(RichEmbed)
                SplitIndex += 1
            } else {
                const RichEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setDescription(`\`\`\`${IdentifiedLyric}\`\`\``) // Implementing the slice

                RichEmbeds.push(RichEmbed)
                SplitIndex += 1
            }
        }
    }

    await Interaction.reply({
        embeds: RichEmbeds,
        ephemeral: true
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
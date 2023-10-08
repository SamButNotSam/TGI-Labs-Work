const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch')

async function GetJoke() { // originally was going to use sv443-joke-api but it's broken with JSON flags so custom implementation it is
    const URL = "https://v2.jokeapi.dev/joke/Any?format=json&safe-mode&type=twopart&amount=1" // https://jokeapi.dev/#safe-mode
    try {
        const Response = await fetch(URL, {method: 'GET'});
        const ParsedResponse = await Response.json();
        
        if (ParsedResponse.error === true) {
            return false;
        } else {
            return {
                Setup: ParsedResponse.setup,
                Delivery: ParsedResponse.delivery
            }
        }
    } catch(err) {
        return false;
    }
}

async function Main(Interaction) {
    await Interaction.deferReply(); // Hotfix to prevent application erroring for larger/unloaded jokes
    const JokeButton = new ButtonBuilder()
        .setCustomId('joke')
        .setLabel(`כן!`)
        .setStyle(ButtonStyle.Primary)

    const ActionRow = new ActionRowBuilder()
        .addComponents(JokeButton)

    const FirstReply = await Interaction.reply({
        content: `האם את/ה רוצה לשמוע בדיחה רנדומלי?`,
        components: [ActionRow],
        ephemeral: true
    });

    try {
        const InteractionUIDFilter = i => i.user.id === Interaction.user.id;
        const JokeButtonPressed = await FirstReply.awaitMessageComponent({ filter: InteractionUIDFilter, time: 60000 });

        if (JokeButtonPressed.customId === 'joke') {
            const JokeData = await GetJoke();

            if (JokeData === false) {
                await Interaction.editReply({
                    content: `הייתה בעיה בפעולה.`,
                    components: [],
                    ephermal: true
                });
            } else {
                await JokeButtonPressed.update({ // Update instead of reply because I want to remove the clutter of the button
                    content: `${JokeData.Setup} \n||${JokeData.Delivery}||`, // Spoiler for delivery, plaintext for setup!
                    components: [],
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        await Interaction.editReply({
            content: `לא ענית בזמן.`,
            components: [],
            ephermal: true
        });
    }
}

module.exports = {
    runner: Main,
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription(`תקבל בדיחה רנדומלי באנגלית מהאינטרנט!`),
}
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const NumberOptions = [
    { name: '0', value: 0 },
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
    { name: '9', value: 9 },
]

const Operations = [
    { name: '+', value: '+' },
    { name: '-', value: '-' },
    { name: '*', value: '*' },
    { name: '/', value: '/' },
]

const OperationHandles = {
    '*': function (a, b) {return a * b},
    '-': function (a, b) {return a - b},
    '/': function (a, b) {return a / b},
    '+': function (a, b) {return a + b},
}

async function Main(Interaction) {
    const FirstDigit = Interaction.options.getInteger('first_digit');
    const SecondDigit = Interaction.options.getInteger('second_digit');
    const Operation = Interaction.options.getString('operation');
    const MathResult = OperationHandles[Operation](FirstDigit, SecondDigit)
    const RichResult = new EmbedBuilder()
        .setColor('#ffcc99')
        .setTitle('מחשבון')
        .setDescription(`התוצאה לחישוב \`${FirstDigit} ${Operation} ${SecondDigit}\` היא \`${MathResult}\``)

    await Interaction.reply({
        embeds: [RichResult],
        ephemeral: true
    })
}

module.exports = {
    runner: Main,
    data: new SlashCommandBuilder()
        .setName('calc')
        .setDescription(`מחשב פעולת מתמטית בין שני מספרים.`)
        .addIntegerOption(option =>
            option.setName('first_digit')
                .setDescription('מספר ראשון')
                .setRequired(true)
                .addChoices(...NumberOptions))

        .addStringOption(option =>
            option.setName('operation')
                .setDescription('פעולה מתמטית')
                .setRequired(true)
                .addChoices(...Operations))

        .addIntegerOption(option =>
            option.setName('second_digit')
                .setDescription('מספר שני')
                .setRequired(true)
                .addChoices(...NumberOptions)),
}
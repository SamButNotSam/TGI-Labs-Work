/* 

    Project Name : TGI Labs Bot
    Project Date : 9/26/2023
    Project Author : @realsamtheman / businessforsamyt@gmail.com

    Notes : Every external source that I used should be cited, if not let me know!

*/

// Packages
const dotenv = require("dotenv");
const path = require("path");
const filesystem = require("fs");
const { Client, Events, GatewayIntentBits, REST, Routes } = require('discord.js');

// Static vars
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = path.join(__dirname, 'commands');
const commands_loaded = filesystem.readdirSync(commands).filter(command => command.endsWith('.js'));
const commands_set_stripped = []; // Just for registering commands
const commands_set = [];
const rest = new REST()

// Configs
dotenv.config();
rest.setToken(process.env.TOKEN);

// Functions
async function CreateCommands() {
    for (let loaded_command of commands_loaded) {
        const command_loc = path.join(commands, loaded_command);
        const required_command = require(command_loc);

        if ('runner' in required_command && 'data' in required_command) {
            commands_set_stripped.push(required_command.data.toJSON());
            commands_set.push({
                cmdData: required_command.data.toJSON(),
                cmdFunc: required_command.runner
            });
        } else {
            console.log(`Dead command file: ${loaded_command}. This command will not be loaded`);
        }
    }
    return true;
}

async function RegisterBot() {
    await CreateCommands(); // Prevent premature loading 

    (async () => {
        try {
            console.log(`Loading ${commands_set.length} commands.`);
    
            await rest.put(
                Routes.applicationCommands(process.env.BOTID),
                { body: commands_set_stripped },
            );
    
        } catch (err) {
            console.log(`Unexpected error caught in RegisterBot: ${err}`);
        }
    })();
}

async function HandleInteraction(Interaction) {
    if (!Interaction.isChatInputCommand()) return;
    const fetched_command = commands_set.find((command) => command.cmdData.name === Interaction.commandName);

    if (!fetched_command) {
        return await Interaction.reply({
            content: "This command is not registered.",
            ephermal: true
        });
    };

    try {
        await fetched_command.cmdFunc(Interaction);
    } catch (err) {
        console.log(`Unexpected error caught: ${err}`);
        if (Interaction.replied || Interaction.deferred) {
            await Interaction.followUp({
                content: "The command errored.",
                ephermal: true
            })
        } else {
            await Interaction.reply({
                content: "The command errored.",
                ephermal: true
            })
        }
    }
}

// Registers

client.once(Events.ClientReady, c => {
    console.log(`OAuth2 for bot: https://discord.com/oauth2/authorize?client_id=${process.env.BOTID}&scope=bot`);
    console.log(`Ready! Logged in as ${c.user.tag}`);
    RegisterBot();
});

client.on(Events.InteractionCreate, async Interaction => {
    HandleInteraction(Interaction);
});

client.login(process.env.TOKEN);
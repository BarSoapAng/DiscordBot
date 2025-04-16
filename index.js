const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const axios = require('axios');
const schedule = require('node-schedule');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

schedule.scheduleJob('16 19 * * *', postDailyChallenge);

client.commands = new Collection();
// Grab all the command folders from the commands directory you created earlier
function loadCommands() {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

// Handle command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMessage = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Refresh application commands in the guild
async function refreshCommands() {
    try {
        console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
        const data = await new REST().setToken(token).put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: client.commands.map(command => command.data) },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }
}

async function getDailyLeetCodeChallenge() {
	try {
		const response = await axios.post('https://leetcode.com/graphql', {
			query: `
				query questionOfToday {
					activeDailyCodingChallengeQuestion {
						date
						link
						question {
							title
							difficulty
							topicTags {
								name
							}
						}
					}
				}
			`
		});

		return response.data.data.activeDailyCodingChallengeQuestion;
	} catch (error) {
		console.error('Error fetching LeetCode challenge:', error);
		return null;
	}
}

async function postDailyChallenge() {
    const challenge = await getDailyLeetCodeChallenge();

    const { title, difficulty } = challenge.question;
    const link = `https://leetcode.com${challenge.link}`;
    const difficultyEmoji = {
        Easy: '🟢',
        Medium: '🟡',
        Hard: '🔴'
    }[difficulty] || '❓';

    const message = `🌟 **${title}** 🌟\n** ${difficultyEmoji} (${difficulty})`;

    const Embed = new EmbedBuilder()
        .setColor(0xffd000)
        .setTitle(`${challenge.date}`)
        .setURL(link)
        .setDescription(message);

    const channel = client.channels.cache.get("1352311704050204793");

    await channel.send({ embeds: [Embed] });

	console.log("Daily Updated.");

}

(async () => {
    await client.login(token);      // Log in the bot
    loadCommands();        // Load commands dynamically
    await refreshCommands(); // Refresh commands
})();
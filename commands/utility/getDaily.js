//require('dotenv').config();
const { SlashCommandBuilder, Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.once('ready', () => {
    
//     // Schedule the bot to post daily at 9 AM EST
//     schedule.scheduleJob('0 20 * * *', 'America/New_York', async () => {
//         postDailyChallenge();
//     });

// });

module.exports = {

    data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Replies with Pong!'),
    async execute(interaction) {
        await postDailyChallenge(interaction);
    },
};

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

async function postDailyChallenge(interaction) {

    const challenge = await getDailyLeetCodeChallenge();
    if (!challenge) {
        await interaction.reply('⚠️ Failed to fetch the daily LeetCode challenge.');
        return;
    }

    const { title, difficulty } = challenge.question;
    const link = `https://leetcode.com${challenge.link}`;
    const difficultyEmoji = {
        Easy: '🟢',
        Medium: '🟡',
        Hard: '🔴'
    }[difficulty] || '❓';

    const message = `🌟 **LeetCode Daily Challenge (${challenge.date})** 🌟\n**${title}** ${difficultyEmoji} (${difficulty})\n🔗 ${link}`;

    const Embed = new Discord.MessageEmbed()
        .setColor("YELLOW")
        .setTitle(`Daily Alert`)
        .setDescription(message)
        .setFooter("!sugest I would like marshmallows.")
        message.channel.send(Embed)
        message.react('👍');
        message.react('👎');

    await interaction.reply(message);
}
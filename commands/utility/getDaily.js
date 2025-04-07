//require('dotenv').config();
const { SlashCommandBuilder, Client, GatewayIntentBits, EmbedBuilder  } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');

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

    const message = `🌟 **${title}** 🌟\n** ${difficultyEmoji} (${difficulty})`;

    const Embed = new EmbedBuilder()
		.setColor(0xffd000)
		.setTitle(`${challenge.date}`)
        .setURL(link)
		.setDescription(message)

        const channel = interaction.client.channels.cache.get("1352311704050204793");

        await channel.send({ embeds: [Embed] });
}
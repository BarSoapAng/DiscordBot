//require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits  } = require('discord.js');
const axios = require('axios');
module.exports = {

    data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Show the daily problem')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
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

    const { title, difficulty, topicTags } = challenge.question;
    
    const link = `https://leetcode.com${challenge.link}`;
    const color = {
        Easy: 0x008000,
        Medium: 0xFFD700,
        Hard: 0xFF0000
    }[difficulty] || '❓';

    const tags = topicTags.map(tag => tag.name).join(', ');

    const Embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`🌟 ${title} 🌟`)
		.setDescription(difficulty)
        .setFields(
            {name: '🔗 URL', value: link},
            {name: '🏷️ Topics', value: tags}
        )

        const channel = interaction.client.channels.cache.get("1352311704050204793");

        await channel.send(`<@&1357169483059429447>`);
        await channel.send({ embeds: [Embed] });

    console.log("Daily Updated.");
}

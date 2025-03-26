const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	
	
	
});

async function getStreak() {
	try {
		const response = await axios.post('https://leetcode.com/graphql', {
			query: `
				query getStreakCounter {
					streakCounter {
						streakCount
						currentDayCompleted
					}
				}
			`
		});

		return response.data.data.getStreakCounter;
	} catch (error) {
		console.error('Error fetching LeetCode profile:', error);
		return null;
	}
}

async function displayStreak(name) {
    // const channel = await client.channels.fetch(CHANNEL_ID);
    // if (!channel) {
    //     console.error('Invalid channel ID.');
    //     return;
    // }
    const streak = await getStreak();
    if (!streak) {
        await channel.send('⚠️ Failed to fetch profile.');
        return;
    }

    const { count, current } = challenge.streakCounter;
    const difficultyEmoji = {
        Easy: '🟢',
        Medium: '🟡',
        Hard: '🔴'
    }[difficulty] || '❓';

    const message = `🌟 **Name: ** ${name}\n**Streak: **${streak}`;
    await channel.send(message);
}

module.exports = {
	data: new SlashCommandBuilder()
	.setName('streak')
	.setDescription('Get your current streak')
	.addStringOption(option => option.setName('username').setDescription('Your LeetCode username').setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString('username');

		await displayStreak(username);
	},
};
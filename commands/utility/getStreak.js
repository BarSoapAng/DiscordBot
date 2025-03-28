const { Client, SlashCommandBuilder, GatewayIntentBits } = require('discord.js');
const axios = require('axios');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('streak')
		.setDescription('Get your current streak')
		.addStringOption(option => option.setName('username').setDescription('Your LeetCode username').setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString('username');

		await displayStreak(username, interaction);
	},
};

async function getStreak(name) {
	try {
		const response = await axios.post('https://leetcode.com/graphql', {
			query: `
				query userProfileCalendar($username: "${name}", $year: 2025) {
					matchedUser(username: $username) {
						userCalendar(year: $year) {
						activeYears
						streak
						
					}
				}
			`
		});

		// totalActiveDays
		// dccBadges {
		// 	timestamp
		// 	badge {
		// 	name
		// 	icon
		// 	}
		// }
		// submissionCalendar
		// }

		return response.data.data.getStreakCounter;
	} catch (error) {
		console.error('Error fetching LeetCode profile:', error);
		return null;
	}
}

async function displayStreak(name, interaction) {
    // const channel = await client.channels.fetch(CHANNEL_ID);
    // if (!channel) {
    //     console.error('Invalid channel ID.');
    //     return;
    // }
    const streak = await getStreak(name);
    if (!streak) {
        await interaction.reply('⚠️ Failed to fetch profile.');
        return;
    }

    const { count, current } = streak.matchedUser;

    const message = `🌟 **Name: ** ${name}\n**Streak: **${streak}`;
    await interaction.reply(message);
}
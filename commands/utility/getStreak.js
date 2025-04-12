const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('streak')
		.setDescription('Get your current streak')
		.addStringOption(option => option.setName('username').setDescription('Your LeetCode ID').setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString('username');
		await displayStreak(username, interaction);
	},
};

async function getStreak(username) {
	try {
		const response = await axios.post('https://leetcode.com/graphql', {
            query: `
                query userProfileCalendar($username: String!, $year: Int) {
                    matchedUser(username: $username) {
                        userCalendar(year: $year) {
                            streak
                        }
                    }
                }
            `,
            variables: {
                username: username,
                year: new Date().getFullYear()
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
			timeout: 10000
        });

		const userData = response.data?.data?.matchedUser;
		if (!userData || !userData.userCalendar) {
			console.error("Invalid response:", response.data);
			return null;
		}

		return userData.userCalendar;

	} catch (error) {
		console.error('Error fetching LeetCode profile:', error);
		return null;
	}
} 

async function displayStreak(name, interaction) {
	const streakInfo = await getStreak(name);

	if (streakInfo === null) {
		await interaction.reply('Invalid username.');
		return;
	}

	const message = `**ID:** ${name}\n**Max Streak:** ${streakInfo.streak} days`;
	await interaction.reply(message);
}
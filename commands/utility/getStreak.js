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

async function getStreak(username) {
	try {
		const response = await axios.post('https://leetcode.com/graphql', {
            query: `
                query userProfileCalendar($username: String!, $year: Int) {
                    matchedUser(username: $username) {
                        userCalendar(year: $year) {
                            activeYears
                            streak
                            totalActiveDays
                            dccBadges {
                                timestamp
                                badge {
                                    name
                                    icon
                                }
                            }
                            submissionCalendar
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

		// Ensure we got valid data
		console.log(response.data);
		const userData = response.data?.data?.matchedUser;
		if (!userData || !userData.userCalendar) {
			console.error("Invalid response:", response.data);
			return null;
		}

		return userData.userCalendar.streak;

	} catch (error) {
		console.error('Error fetching LeetCode profile:', error);
		return null;
	}
}

async function displayStreak(name, interaction) {
	const streakInfo = await getStreak(name);

	if (streakInfo === null) {
		await interaction.reply('⚠️ Failed to fetch profile. Make sure the username is correct.');
		return;
	}

	const message = `🌟 **Username:** ${name}\n🔥 **Current Streak:** ${streakInfo} days`;
	await interaction.reply(message);
}
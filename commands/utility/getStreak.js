const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streak')
        .setDescription('Get your current streak')
        .addStringOption(option => option.setName('username').setDescription('Your LeetCode ID (it won\'t show)').setRequired(true)),
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

async function displayStreak(username, interaction) {
    const streakInfo = await getStreak(username);

    if (streakInfo === null) {
        await interaction.reply({
            content: 'Username\'s wrong :(',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

	const member = interaction.guild.members.cache.get(interaction.user.id);
    const serverDisplayName = member ? member.nickname || interaction.user.username : interaction.user.username;

	const streakNum = streakInfo.streak;

    // Create an embed message with the streak information
    const streakEmbed = new EmbedBuilder()
	
        .setColor(0xffccf6) // Green color for positive streak
        .setTitle(`${serverDisplayName}'s Maximum LeetCode Streak`)
        .addFields(
            { name: 'Max Streak', value: `${streakNum} days`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Leaderboard coming soon...' });

    // Send the embed as a response
    await interaction.reply({
        embeds: [streakEmbed]
    });

    console.log("Get streak used.");
}
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('streak')
		.setDescription('Get your current streak'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};

const { InteractionContextType, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('send_announcement')
        .setDescription('Send announcement to announcement channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('title').setDescription('Announcement title').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Announcement message').setRequired(true))
        .setContexts(InteractionContextType.Guild),
	async execute(interaction) {
        const msg = interaction.options.getString('message');
        const title = interaction.options.getString('title');
		await postRules(interaction, title, msg);
	},
};
    
async function postRules(interaction, title, msg) {

    const Embed = new EmbedBuilder()
        .setColor(0xF18383)
        .setTitle(`**${title}**`)
        .setDescription(msg)

        const channel = interaction.client.channels.cache.get("1352133342408998946");
        await channel.send("<@&1357905380981739764>");
        await channel.send({ embeds: [Embed] });

        await interaction.reply('New announcement posted in <#1352133342408998946>.');
    
}
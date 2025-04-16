const {  SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('send_message')
        .setDescription('Send message to specified channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('message').setDescription('Announcement message').setRequired(true))
        .addStringOption(option => option.setName('channel').setDescription('Channel ID').setRequired(true)),
        
        async execute(interaction) {
        const msg = interaction.options.getString('message');
        const channel = interaction.options.getString('channel');
                await postRules(interaction, msg, channel);
        },
};
    
async function postRules(interaction, msg, id) {

        const channel = interaction.client.channels.cache.get(id);

        await channel.send(msg);
        await interaction.reply(`Message posted in <#${id}>.`);

        console.log("Sent message.");
}
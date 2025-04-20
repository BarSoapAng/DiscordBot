const { InteractionContextType, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('setrules')
        .setDescription('Set rules in the rules channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		await postRules(interaction);
	},
};
    
async function postRules(interaction) {

    const Embed = new EmbedBuilder()
        .setColor(0xE6C1D2)
        .setTitle("**Village Laws**")
        .setDescription(
            `
            **1. No Bullying or Harassment:** Please be respectful to other members of the community.\n
            **2. Don't Reveal Personal Information:** This applies to your own and others' information including, but not exclusive to, addresses, phone numbers and bank details.\n
            **3. No Spamming:** Avoid promo, unless in the appropriate channels.\n
            **4. Keep Discussions in the Appropriate Channels:** Informal conversations should occur in <#1352133342408998948> and <#1352352810632609882>.\n
            **5. No Hate Speech or Profanity:** The use of slurs, death threats, racism, or derogatory terms is a bannable offense. This includes usernames.\n
            **6. Refer to Posting Rules:** Forum/discussion channels have their own rules for posting. Please consult the rules section before posting.\n
            7. React when done reading. Thank you for joining, and I hope your time here will be enjoyable :)
            `
        )

        const channel = interaction.client.channels.cache.get("1352313584717402122");
        await channel.send({ embeds: [Embed] });

        await interaction.reply('Rules have been posted in <#1352313584717402122>.');

        console.log("Rules Updated.");
    
}
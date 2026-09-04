const { ApplicationCommandOptionType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        const targetUserId = interaction.options.getUser('target-user')?.id  || interaction.user.id;

        await interaction.deferReply();

        try {
            let userProfile = await UserProfile.findOne({ userId: targetUserId });

            if (!userProfile) {
                userProfile = new UserProfile({ userId: targetUserId });
            } 

            interaction.editReply(
                targetUserId === interaction.user.id ? `-# <@${interaction.user.id}>\nYou have **${userProfile.balance} Dabloons**.\nHighest Win-Streak: **${userProfile.recordWinStreak}**\nHighest Lose-Streak: **${userProfile.recordLoseStreak}**` : `-# <@${interaction.user.id}>\n**<@${targetUserId}>** has **${userProfile.balance} Dabloons**.\nHighest Win-Streak: **${userProfile.recordWinStreak}**\nHighest Lose-Streak: **${userProfile.recordLoseStreak}**`
            );
        }   catch (error) {
            console.log(`Error handling /profile: ${error}`);
        }
    },

    data: {
        name: 'profile',
        description: "Check a persons Profile.",
        options: [
            {
                name: 'target-user',
                description: "The user whose Profile you want to see.",
                type: ApplicationCommandOptionType.User,
            }
        ]
    }
}
const { ApplicationCommandOptionType, User } = require('discord.js');
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

        try {
            await interaction.deferReply();
            const targetUser = interaction.options.getUser('target-user');
            const amount = interaction.options.getNumber('amount');

            let userProfile = await UserProfile.findOne({
                userId: interaction.user.id,
            });
            const targetUserProfile = await UserProfile.findOne({userId: targetUser.id,});
            
            console.log('from /pay:')
            console.log(targetUser)

            if (interaction.user.id === targetUser.id) {
                interaction.editReply({
                    content: 'You cannot pay yourself.',
                    ephemeral: true,
                });
                return;
            }

            if (targetUser.bot) {
                interaction.editReply({
                    content: 'You cannot pay a bot.',
                    ephemeral: true,
                });
                return;
            }
            if (amount < 1) {
                interaction.editReply({
                    content: 'You must pay at least 1 Dabloon.',
                    ephemeral: true,
                });
                return;
            }
            if (!Number.isInteger(amount)) {
                interaction.editReply({
                    content: 'Your amount must not contain decimal points.',
                    ephemeral: true,
                });
                return;
            }
    
            if (!userProfile) {
                userProfile = new UserProfile({
                    userId: interaction.user.id,
                });
            }

            if (!targetUserProfile) { interaction.editReply('The user you want to pay, dosnt have a userprofile yet.\nHe should collect his daily.') }
    
            if (amount > userProfile.balance) {
                interaction.editReply("You don't have enough Dabloons.");
                return;
            }

            userProfile.balance -= amount;
            targetUserProfile.balance += amount;

            await Promise.all([targetUserProfile.save(), userProfile.save()]);


            interaction.editReply(
                `You paid **${amount}** Dabloons to ${targetUser}.`
            );
        }   catch (error) {
            console.log(`Error handling /pay: ${error}`);
        }
    },

    data: {
        name: 'pay',
        description: "Pay a person a specific amount of Dabloons.",
        dm_permission: false,
        options: [
            {
                name: 'target-user',
                description: "The user who you want to pay.",
                type: ApplicationCommandOptionType.User,
                require: true,
            },
            {
                name: 'amount',
                description: "The amount you want to pay.",
                type: ApplicationCommandOptionType.Number,
                require: true,
            }
        ]
    }
}
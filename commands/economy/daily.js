const UserProfile = require('../../schemas/UserProfile');

const dailyAmount = 500;

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

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });

            if (userProfile) {
                const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                    interaction.editReply("You have already collected your dailies today. Come back tommorrow.");
                    return;
                }
            } else {
                userProfile = new UserProfile({
                    userId: interaction.member.id,
                });
            }

            userProfile.balance += dailyAmount;
            userProfile.lastDailyCollected = new Date();

            await userProfile.save();

            interaction.editReply(
                `**${dailyAmount} Dabloons** were added to your balance.\nNew balance: **${userProfile.balance} Dabloons**\nhttps://cdn.discordapp.com/attachments/1335176354127151110/1512427274916593815/thumbnail.jpg?ex=6a240d29&is=6a22bba9&hm=d29d229c762d899aafd996af887bc3414c863f64fa563f5ff913fbbf02995c16&`
            );
        }   catch (error) {
            console.log(`Error handling /daily: ${error}`);
        }
    },
    data: {
        name: 'daily',
        description: "Collect your daily Dabloons!",
    },
};
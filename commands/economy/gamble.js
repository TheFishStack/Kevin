const { ApplicationCommandOptionType } = require("discord.js");
const UserProfile = require('../../schemas/UserProfile');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
            return;
        }

        const amount = interaction.options.getNumber('amount');

        if (amount < 10) {
            interaction.reply("You must gamble at least 10 Dabloons");
            return;
        }
        if (!Number.isInteger(amount)) {
            interaction.reply('Your amount must not contain decimal points.');
            return;
        }

        let userProfile = await UserProfile.findOne({
            userId: interaction.user.id,
        });

        if (!userProfile) {
            userProfile = new UserProfile({
                userId: interaction.user.id,
            });
        }

        if (amount > userProfile.balance) {
            interaction.reply("You don't have enough Dabloons.");
            return;
        }

        await interaction.deferReply();
		await interaction.editReply('**3**');
        await wait(1_000);
		await interaction.editReply('**2**');
        await wait(1_000);
		await interaction.editReply('**1**');
        await wait(1_000);

        const didWin = Math.random() > 0.5;

        if (!didWin) {
            userProfile.balance -= amount;
            await userProfile.save();

            interaction.editReply(`You **lost** ${amount} Dabloons.\nNew balance: **${userProfile.balance}** Dabloons.`);
            return;
        }

        const amountWon = Number((amount).toFixed(0));

        userProfile.balance += amountWon;
        await userProfile.save();
        interaction.editReply(`You **won** ${amountWon} Dabloons.\nNew balance: **${userProfile.balance}** Dabloons.`);
    },
    data: {
        name: 'gamble',
        description: "Gamble some of your Dabloons.",
        options: [
            {
                name: 'amount',
                description: "The amount you want to gamble.",
                type: ApplicationCommandOptionType.Number,
                require: true,
            }
        ]
    }
}
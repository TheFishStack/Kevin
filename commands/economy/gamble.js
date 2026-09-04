const { ApplicationCommandOptionType } = require("discord.js");
const UserProfile = require('../../schemas/UserProfile');
const wait = require('node:timers/promises').setTimeout;

function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}

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
            interaction.reply(`-# <@${interaction.user.id}>\nYou must gamble at least 10 Dabloons`);
            return;
        }
        if (!Number.isInteger(amount)) {
            interaction.reply(`-# <@${interaction.user.id}>\nYour amount must not contain decimal points.`);
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
            interaction.reply(`-# <@${interaction.user.id}>\nYou don't have enough Dabloons.`);
            return;
        }

        await interaction.deferReply();
		await interaction.editReply(`-# <@${interaction.user.id}>\nAmount: **${amount}**\n**3**`);
        await wait(1_000);
		await interaction.editReply(`-# <@${interaction.user.id}>\nAmount: **${amount}**\n**2**`);
        await wait(1_000);
		await interaction.editReply(`-# <@${interaction.user.id}>\nAmount: **${amount}**\n**1**`);
        await wait(1_000);

        const didWin = Math.random() > 0.5;

        if (!didWin) {
            userProfile.currentWinStreak = 0;
            userProfile.currentLoseStreak += 1;
            if (userProfile.currentLoseStreak > userProfile.recordLoseStreak) {
                userProfile.recordLoseStreak = userProfile.currentLoseStreak;
            }
            userProfile.balance -= amount;
            await userProfile.save();

            interaction.editReply(`-# <@${interaction.user.id}>\nYou **lost** ${amount} Dabloons.\nNew balance: **${userProfile.balance}** Dabloons.\n-# Lose Streak: **${userProfile.currentLoseStreak}**`);
            return;
        }

        const amountWon = Number((amount).toFixed(0));

        userProfile.currentLoseStreak = 0;
        userProfile.currentWinStreak += 1;
        if (userProfile.currentWinStreak > userProfile.recordWinStreak) {
            userProfile.recordWinStreak = userProfile.currentWinStreak;
        }
        userProfile.balance += amountWon;
        await userProfile.save();
        if (amountWon === 100 && getRandomNumber(0, 100) < 10) {
            interaction.editReply(`-# <@${interaction.user.id}>\nYou **won** ${amountWon} Dabloons.\nNew balance: **${userProfile.balance}** Dabloons[.](https://klipy.com/gifs/100doubloons)\n-# Win Streak: **${userProfile.currentWinStreak}**`);
            return;
        }
        interaction.editReply(`-# <@${interaction.user.id}>\nYou **won** ${amountWon} Dabloons.\nNew balance: **${userProfile.balance}** Dabloons.\n-# Win Streak: **${userProfile.currentWinStreak}**`);
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
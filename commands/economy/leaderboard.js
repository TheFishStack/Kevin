const { ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: "This command can only be executed inside a server.",
                ephemeral: true,
            });
        }

        try {
            let page = 0;

            async function refreshLeaderboard() {
                const userProfiles = await UserProfile.find()
                    .sort({ balance: -1 })
                    .skip(page * 10)
                    .limit(10);

                if (userProfiles.length === 0) return "No profiles found.";

                return userProfiles
                    .map((profile, index) => {
                        const position = page * 10 + index + 1;
                        return `**${position}.** <@${profile.userId}> — **${profile.balance} Dabloons**`;
                    })
                    .join('\n');
            }

            const embed = new EmbedBuilder()
                .setTitle('Dabloons Leaderboard')
                .setDescription(await refreshLeaderboard())
                .setColor('Yellow')
                .setTimestamp(new Date());

            const button_left = new ButtonBuilder()
                .setCustomId('left')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⬅️');

            const button_right = new ButtonBuilder()
                .setCustomId('right')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('➡️');

            const row = new ActionRowBuilder().addComponents(button_left, button_right);

            const reply = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) => i.user.id === interaction.user.id,
                time: 500_000, // 500 seconds
            });

            collector.on('collect', async (btnInteraction) => {
                if (btnInteraction.customId === 'right') {
                    page += 1;
                } else if (btnInteraction.customId === 'left') {
                    page = Math.max(0, page - 1);
                }

                embed.setDescription(await refreshLeaderboard());

                await btnInteraction.update({
                    embeds: [embed],
                    components: [row],
                });
            });

            collector.on('end', async () => {
                button_left.setDisabled(true);
                button_right.setDisabled(true);

                embed.setFooter({ text: 'Time ran out. Use /leaderboard again.' });

                await interaction.editReply({
                    embeds: [embed],
                    components: [row],
                }).catch(() => {});
            });

        } catch (error) {
            console.error(`Error handling /leaderboard: ${error}`);
        }
    },

    data: {
        name: 'leaderboard',
        description: "Check the leaderboard.",
    }
};
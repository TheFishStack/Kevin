module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with Pong!'
    },

    run: ({ interaction }) => {
        interaction.reply('https://klipy.com/gifs/pong-1');
    },
};
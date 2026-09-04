module.exports = (message) => {
    // console.log(message);

    if (message.author.bot) return;

    if (message.content === 'wha-') {
        message.reply('https://tenor.com/view/meme-gif-23192656');
    }

    if (message.content === 'Hii <@1136630114558423080>') {
        message.reply('https://tenor.com/view/dead-chat-dead-group-chat-dead-chat-xd-gif-11830707118005268792');
    }
}
const { reply } = require('../../utils/messageUtils')

exports.command = {
	name: 'message',
	aliases: [],
	description: 'Messages a user.',
	long: 'Messages a user. Supports attachments such as .mp4, .mp3, .gif, .png, .jpg',
	args: {
		'User ID': 'ID of user.',
		'message': 'Message to send.'
	},
	examples: ['message 168958344361541633 hello!'],
	permissions: ['sendMessages', 'addReactions', 'embedLinks', 'externalEmojis'],
	ignoreHelp: false,
	requiresAcc: false,
	requiresActive: false,
	guildModsOnly: false,

	async execute (app, message, { args, prefix, guildInfo }) {
		const userID = args[0]
		const messageIn = args.slice(1).join(' ')

		if (message.channel.id !== app.config.modChannel) {
			return reply(message, '❌ You must be in the moderator channel to use this command.')
		}
		else if (!userID) {
			return reply(message, '❌ You forgot to include a user ID.')
		}
		else if (!messageIn) {
			return reply(message, '❌ You need to include a message. `message <id> <message>`.')
		}

		const user = await app.common.fetchUser(userID, { cacheIPC: false })
		const imageAttached = message.attachments

		const userMsg = new app.Embed()
			.setTitle(`New message from ${`${message.author.username}#${message.author.discriminator}`}`)
			.setThumbnail(message.author.avatarURL)
			.setDescription(messageIn)
			.setColor('#ADADAD')
			.addBlankField()
			.setFooter('https://lootcord.com | Only moderators can send you messages.')

		if (Array.isArray(imageAttached) && imageAttached.length) {
			if (imageAttached[0].url.endsWith('.mp4') || imageAttached[0].url.endsWith('.mp3')) {
				userMsg.addField('File', imageAttached[0].url)
			}
			else {
				userMsg.setImage(imageAttached[0].url)
			}
		}

		try {
			await app.common.messageUser(userID, userMsg, { throwErr: true })

			await reply(message, `📨 Message sent to **${user.username}#${user.discriminator}**!`)
		}
		catch (err) {
			await reply(message, `Error sending message:\`\`\`js\n${err}\`\`\``)
		}
	}
}

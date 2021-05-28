const BADGES_PER_PAGE = 20
const { reply } = require('../../utils/messageUtils')

exports.command = {
	name: 'badge',
	aliases: ['badges'],
	description: 'Shows information about a badge.',
	long: 'Specify a badge to see detailed information about it.',
	args: { badge: 'Badge to search.' },
	examples: ['badge elitist'],
	permissions: ['sendMessages', 'embedLinks', 'externalEmojis'],
	ignoreHelp: false,
	requiresAcc: false,
	requiresActive: false,
	guildModsOnly: false,
	worksInDMs: true,

	async execute (app, message, { args, prefix, guildInfo }) {
		const badgeSearched = app.parse.badges(args)[0]

		if (badgeSearched) {
			const badge = app.badgedata[badgeSearched]

			const badgeEmbed = new app.Embed()
				.setTitle(`${badge.icon} ${badgeSearched}`)
				.setThumbnail(badge.image)
				.setDescription(badge.description)
				.setColor(13451564)

			if (badge.artist !== '') {
				const artistInfo = await app.common.fetchUser(badge.artist, { cacheIPC: false })

				badgeEmbed.setFooter(`Art by ${artistInfo.username}#${artistInfo.discriminator}`)
			}

			await message.channel.createMessage(badgeEmbed)
		}
		else if (!args.length) {
			const badgeList = Object.keys(app.badgedata)

			if (badgeList.length > BADGES_PER_PAGE) {
				return app.btnCollector.paginate(message, generatePages(app, Object.keys(app.badgedata).sort(), BADGES_PER_PAGE))
			}

			await message.channel.createMessage(generatePages(app, badgeList, BADGES_PER_PAGE)[0])
		}
		else {
			return reply(message, '❌ I don\'t recognize that badge.')
		}
	}
}

function generatePages (app, badges, itemsPerPage) {
	const pages = []
	const maxPage = Math.ceil(badges.length / itemsPerPage)

	for (let i = 1; i < maxPage + 1; i++) {
		const indexFirst = (itemsPerPage * i) - itemsPerPage
		const indexLast = itemsPerPage * i
		const filteredBadges = badges.slice(indexFirst, indexLast)

		const pageEmbed = new app.Embed()
			.setTitle('Badge List')
			.setDescription(filteredBadges.sort().map(badge => `${app.badgedata[badge].icon} \`${badge}\``).join('\n'))
			.setFooter('Use badge <badge> to see more information about a badge.')
			.setColor(13451564)

		pages.push(pageEmbed)
	}

	return pages
}


module.exports = {
    name: 'craft',
    aliases: [''],
    description: 'Craft new items!',
    long: 'Use components from `recycling` to craft items such as:\n`rail_cannon`\n`ray_gun`\n`ultra_box`.',
    args: {"item": "Item to craft.", "amount": "**OPTIONAL** Amount of items to craft."},
    examples: ["craft rail_cannon 2"],
    ignoreHelp: false,
    requiresAcc: true,
    requiresActive: false,
    guildModsOnly: false,
    
    async execute(app, message){
        let craftAmount = app.parse.numbers(message.args)[0] || 1;
        let craftItem = app.parse.items(message.args)[0];

        if(craftItem){
            if(app.itemdata[craftItem].craftedWith == ""){
                return message.reply('That item cannot be crafted!');
            }
            
            if(craftAmount > 20) craftAmount = 20;

            let itemMats = getItemMats(app.itemdata[craftItem].craftedWith.materials, craftAmount);

            const embedInfo = new app.Embed()
            .setTitle(`Craft ${craftAmount}x ${app.itemdata[craftItem].icon}\`${craftItem}\` for`)
            .setDescription(getMatsDisplay(app, itemMats))
            .setColor('#818181')
            .setThumbnail("https://cdn.discordapp.com/attachments/497302646521069570/601372871301791755/craft.png")

            const botMessage = await message.channel.createMessage({content: `<@${message.author.id}>`, embed : embedInfo.embed});
            
            try{
                const confirmed = await app.react.getConfirmation(message.author.id, botMessage);
                
                if(confirmed){
                    const hasEnough = await app.itm.hasItems(message.author.id, itemMats);
                    if(hasEnough){
                        message.reply(`Successfully crafted ${craftAmount}x ${app.itemdata[craftItem].icon}\`${craftItem}\`!`);
                        await app.itm.removeItem(message.author.id, itemMats);
                        await app.itm.addItem(message.author.id, craftItem, craftAmount);
                    }
                    else{
                        message.reply('You are missing the required materials for this item!');
                    }
                }
                else{
                    botMessage.delete();
                }
            }
            catch(err){
                embedInfo.setFooter('Command timed out.');
                botMessage.edit(embedInfo);
            }
        }
        else{
            message.reply(`Use \`${message.prefix}help craft\` to see how to use this command!`);
        }
    },
}

function getItemMats(itemMats, craftAmount){
    var itemPrice = [];

    for(var i = 0; i < itemMats.length; i++){
        let matAmount = itemMats[i].split('|');

        itemPrice.push(matAmount[0] + '|' + (matAmount[1] * craftAmount));
    }

    return itemPrice;
}

function getMatsDisplay(app, itemMats){
    var displayTxt = '';

    for(var i = 0; i < itemMats.length; i++){
        let matAmount = itemMats[i].split('|');

        displayTxt += matAmount[1] + 'x ' + app.itemdata[matAmount[0]].icon + matAmount[0] + '\n';
    }

    return displayTxt;
}
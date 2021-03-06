const { prefix, embedColors } = require('../../config.json');

module.exports = {
    name: 'removecurrencymultiplier',
    description: 'Removes a currency multiplier.',
    aliases: ['rcm'],
    args: true,
    argCount: 2,
    usage(){ return `${prefix}${this.name} [currency] [multiplier]`; },
    cooldown: 0,
    guildOnly: true,
    async execute(message, args) {
        const currencyHandler = message.client.currencyHandler;
        const member = message.guild.member(message.author);
        let embed = new message.client.discord.RichEmbed()
            .setAuthor(member.displayName);
        const currency = currencyHandler.Currency(message.guild.id, args[0], null, message.author.id);
        const validCurrency = await currencyHandler.validCurrency(currency);
        if(!validCurrency){
            let currencyList = await currencyHandler.getCurrencies(message.guild.id);
            embed.setColor(embedColors.error)
            .addField("Error", `'${currency.name}' is not a valid currency.`)
            .addField("Valid Currencies", currencyList);
            return message.channel.send(embed).catch(console.error);
        }
        const allowUpdate = await currencyHandler.canUpdate(currency);
        if(!member || (member.guild.ownerID != member.id && !allowUpdate)) {
            embed.setColor(embedColors.error)
            .addField("Error", `Only the guild owner or a ${currency.name} updater can use command ${this.name}.`);
            return message.channel.send(embed).catch(console.error);
        }
        const multiplierName = args[1];
        let currencyInfo = await currencyHandler.getCurrencyInfo(currency.guildId);
        if(multiplierName.length > 1 || !currencyInfo[currency.name].currencyMultipliers[multiplierName]){
            embed.setColor(embedColors.error)
            .addField("Error", `'${args[1]}' is not a valid multiplier.`);
            return message.channel.send(embed).catch(console.error);
        }
        const result  = await currencyHandler.removeMultiplier(currency, multiplierName).catch(console.error);
        if(result){
                embed.setColor(embedColors.general)
                .addField("Success", `Multiplier '${multiplierName}' was successfully removed for ${currency.name}.`);
                return message.channel.send(embed).catch(console.error);
        } else {
                embed.setColor(embedColors.error)
                .addField("Error", `An error occurred while trying to remove the multiplier '${multiplierName}' for ${currency.name}.`);
                return message.channel.send(embed).catch(console.error);
        }
    },
};
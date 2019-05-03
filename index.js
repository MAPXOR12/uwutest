const Discord               = require('discord.js');
const config                = require('./json/_config.json');
const { connectSQL, query } = require('./mysql.js');
const testAPI               = require('./utils/testAPI.js');
const manager               = new Discord.ShardingManager('./app.js', {
    token: config.botToken
});
const voteHandler           = require('./utils/votes.js').votingManager(manager); // Handles DBL webhooks

manager.spawn();

manager.on('launch', shard => {

    if(shard.id == manager.totalShards - 1){
        console.log('Shards successfully loaded...');

        //set bot status
        setTimeout(() => {
            manager.broadcastEval(`
                this.shard.fetchClientValues('guilds.size').then(results => {
                    var result = results.reduce((prev, guildCount) => prev + guildCount, 0);
                    this.user.setActivity('t-help | ' + result + ' servers!', {type: 'LISTENING'});
                    result;
                })
            `);
        }, 10000);
    }
});

manager.on('message', (shard, message) => {
    console.log(shard.id + " says " + message._eval);
});

process.on('exit', () => {
    console.log('Ending process...');
    manager.broadcastEval('process.exit(0)');
});

function refreshAirdrops(){
    // Decided to move this into each shard's start-up instead of here because it might take long for all the shards to launch and this code has to wait until all shards have launched before it can give users cooldowns.
    
    query(`SELECT * FROM guildInfo`).then(rows => {
        let airdropsCalled = 0;
        rows.forEach((guild) => {
            if(guild.guildId !== undefined && guild.guildId !== null && guild.dropChan !== 0){
                airdropper.initAirdrop(client, guild.guildId);
            }
        });
        console.log(airdropsCalled + " airdrops called.")
    });
}
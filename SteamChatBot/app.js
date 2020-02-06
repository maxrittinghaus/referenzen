let fs = require('fs'),
    jsonfile = require('jsonfile'),
    log = console.log,
    SteamUser = require('steam-user'),
	config = null,
    authkeys = null;
	
const CONFIG_PATH = './config.json',
      AUTHKEY_PATH = './auth.json';

if (!fs.existsSync(CONFIG_PATH)) {
    jsonfile.writeFileSync(CONFIG_PATH, {
        credentials: {
            username: "user123",
            password: "*********",
        },
        commands: {
            command_name : {
                description: "Description for the command list",
                reply: "message"
            },
        },
        prefix: "!",
        errormessage: "Unknown Command! Please type !commands for a list of all commands!",
        greetingmessage: "Hello!"

    });
    throw new Error("No Config found! Created a default-config! Please edit the config and start the script again!");
}

if (!fs.existsSync(AUTHKEY_PATH)) {
    jsonfile.writeFileSync(AUTHKEY_PATH, {});
}
authkeys = require(AUTHKEY_PATH) || null;

function saveAuthKey(username, key) {
    authkeys[username] = key;
    jsonfile.writeFileSync(AUTHKEY_PATH, authkeys);
}


config = require(CONFIG_PATH) || null;

if (config === null || !(config.hasOwnProperty('commands') && config.hasOwnProperty('errormessage')  && config.hasOwnProperty('prefix') && config.hasOwnProperty('credentials') && config.credentials.hasOwnProperty('username') && config.credentials.hasOwnProperty('password'))) throw new Error('Config is corrupt! Please delete the existing Config and restart the script!');

if(config.commands.hasOwnProperty('dev'))
    console.log("Warning: command 'dev' is a reserved command!");
if(config.commands.hasOwnProperty('commands'))
    console.log("Warning: command 'commands' is a reserved command!");

let client = new SteamUser();

client.setOption('autoRelogin', true);

log('Logging in...');

client.logOn({
    accountName: config.credentials.username,
    password: config.credentials.password,
    rememberPassword: true,
    loginKey: authkeys[config.credentials.username] || '',
});


client.on('loggedOn', () => {
    log("Successfully logged in!");
    client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('loginKey', (key) => {
    saveAuthKey(config.credentials.username, key);
});

client.on('friendMessage', function (steamID, message) {
    //log("Message from " + steamID.getSteam3RenderedID() + ": " + message);
    if (message.includes(config.prefix)) {
        let command = message.substr(config.prefix.length);

        switch(command){
            case "commands":
                let helpText = "\n" + config.prefix +"commands - Shows all available commands.\n" + config.prefix +"dev - Displays information about the creator of the bot\n";
                for(let key in config.commands)
                    helpText +=  config.prefix +key + " - " + config.commands[key].description + '\n';
                client.chatMessage(steamID,helpText);
                break;
            case "dev":
                client.chatMessage(steamID,"This Bot was created by ArayniMax.\nYou can contact him on Twitter: https://www.twitter.com/araynimax\nor on Steam: http://steamcommunity.com/profiles/76561198340410332");
                break;
            default:
                if (config.commands.hasOwnProperty(command)) {
                    client.chatMessage(steamID, config.commands[command].reply);
                }
                else {
                    log("Unknown command from " + steamID.getSteam3RenderedID() + ": " + message);
                    client.chatMessage(steamID, config.errormessage);
                }
                break;

        }
    }
    else {
        //log("Sending greeting to.. " + steamID.getSteam3RenderedID());
        client.chatMessage(steamID, config.greetingmessage);
    }
});

client.on('error', (err) => {
    log(err);
});
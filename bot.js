const request = require('request');
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TelegramBot = require('node-telegram-bot-api');
const options = {
    webHook: {
        // Port to which you should bind is assigned to $PORT variable
        // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
        port: process.env.PORT
        // you do NOT need to set up certificates since Heroku provides
        // the SSL certs already (https://<app-name>.herokuapp.com)
        // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
    }
};
// Heroku routes from port :443 to $PORT
// Add URL of your app to env variable or enable Dyno Metadata
// to get this automatically
// See: https://devcenter.heroku.com/articles/dyno-metadata
const url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, options);

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`);



bot.onText(/^\d{10}$/, function (message) {
    console.log('sending post request');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    request.post(
        'https://zaprosto.kz/api-testing-1234/?aurumit=true',
        { form: { 'number': message.text } },
        function (error, response, body) {
            console.log('error',error);
            if (!error && response.statusCode == 200) {
                console.log('body',body);

                var parsed = JSON.parse(body);
                var operator;
                if(parsed.status == 'SUCCESS'){
                    var owner = parseInt(parsed.owner);

                    switch (owner){
                        case 1:
                            operator = "Beeline";
                            break;
                        case 2:
                            operator = "Kcell/Activ";
                            break;
                        case 77:
                            operator = "Tele 2";
                            break;
                        case 7:
                            operator = "Altel";
                            break;
                        default:
                            operator = "Other";
                            break;
                    }
                    bot.sendMessage(message.chat.id, operator);
                }
            }
        }
    );
});


function help(msg) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "Введите номер в формате 7XXххххххх");
}

bot.onText(/\/start/, help);
bot.onText(/\/help/, help);

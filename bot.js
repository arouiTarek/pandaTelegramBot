const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const db = require('./db/database');
const app = express();
app.use(bodyParser.json());

const TOKEN_users = '5144073165:AAFWhbp3xzTwjsOXvVM0_6HpV7vkJ5ZqCsg';
const bot_users = new TelegramBot(TOKEN_users, { polling: true });

const CHANNELS = ['@citationset', '@kilwa_trading', '@Pandadz'];

// التحقق من الاشتراك
async function checkAllSubscriptions(userId) {
    for (const channel of CHANNELS) {
        const isSubscribed = await bot_users.getChatMember(channel, userId)
            .then((member) => ['member', 'administrator', 'creator'].includes(member.status))
            .catch(() => false);
        if (!isSubscribed) return false;
    }
    return true;
}

// استجابة /start
bot_users.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'غير معروف';
    const lastName = msg.from.last_name || 'غير معروف';
    const username = msg.from.username || 'غير موجود';
    const languageCode = msg.from.language_code || 'غير معروف';
    const inviteCode = msg.text.split(' ')[1] || null;

    try {
        const existingUser = await db.getUser(userId);
        if (!existingUser) {
            if (inviteCode) await db.updateInviter(inviteCode);
            await db.insertUser(userId, firstName, lastName, username, languageCode);
        }

        const isSubscribedToAll = await checkAllSubscriptions(userId);
        if (isSubscribedToAll) {
            bot_users.sendMessage(chatId, '✅ للمشاركة في المسابقة والفوز بحساب تمويل 5000$ عليك بتنفيذ الشروط :', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'رابط دعوة', callback_data: 'link_invite' }],
                        [{ text: 'بياناتي', callback_data: 'user_info' }],
                    ],
                },
            });
        } else {
            bot_users.sendMessage(chatId, '✅ للمشاركة في المسابقة والفوز بحساب تمويل 5000$ عليك بتنفيذ الشروط :', {
                reply_markup: {
                    inline_keyboard: [
                        ...CHANNELS.map((channel) => [{ text: `📢 ${channel}`, url: `https://t.me/${channel.replace('@', '')}` }]),
                        [{ text: '✅ تحقق من الاشتراك', callback_data: 'check_subscription' }],
                    ],
                },
            });
        }
    } catch (error) {
        console.error('Error in /start:', error.message);
        bot_users.sendMessage(chatId, '❌ حدث خطأ.');
    }
});

// استجابة callback
bot_users.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data === 'check_subscription') {
        const isSubscribedToAll = await checkAllSubscriptions(userId);
        if (isSubscribedToAll) {
            await db.updateSubscription(userId);
            //bot_users.sendMessage(chatId, '✅ تم التحقق بنجاح!');
            bot_users.sendMessage(chatId, '✅ للمشاركة في المسابقة والفوز بحساب تمويل 5000$ عليك بتنفيذ الشروط :', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'رابط دعوة', callback_data: 'link_invite' }],
                        [{ text: 'بياناتي', callback_data: 'user_info' }],
                    ],
                },
            });

        } else {
            bot_users.sendMessage(chatId, '❌ يرجى الاشتراك أولاً.');
        }
    } else if (data === 'link_invite') {
        bot_users.sendMessage(chatId, `🔗 رابط الدعوة الخاص بك: \n https://t.me/TarekArouiBot?start=${userId}`);
    } else if (data === 'user_info') {
        const user = await db.getUser(userId);
        console.log(user);
        bot_users.sendMessage(chatId, 
                                     `🔍 بياناتي:\n` +
                                     `- اسم المستخدم: ${user.username || "غير متوفر"}\n` +
                                     `- الاسم: ${user.first_name} ${user.last_name}\n` +
                                     `- رقم الحساب: ${user.user_id || "غير متوفر"}\n` +
                                     `- عدد الدعوات: ${user.invites_count} \n` +
                                     `- رابط الدعوة: https://t.me/TarekArouiBot?start=${user.user_id}`
        );
    }
});
// بدء الخادم
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




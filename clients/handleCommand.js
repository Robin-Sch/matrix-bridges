const { calculateInterestedCoinPrices, calculatePortfolio, getCoinPriceChart, getPortfolioChart } = require('../crypto-portfolio-calculator/utils/calculate.js');
const { loadWalletsFromEnv } = require('../crypto-portfolio-calculator/utils/wallets.js');

const {
    FIAT,
} = process.env;
const INTERESTING_COINS = JSON.parse(process.env.INTERESTING_COINS) || [];

const handleCommand = async (args, channel, reply) => {
    const command = args[0].slice('!'.length);

	if (command === 'prices') {
        const prices = await calculateInterestedCoinPrices(FIAT);

        let msg = '';

        for (let i = 0; i < INTERESTING_COINS.length; i++) {
            const name = INTERESTING_COINS[i];

            msg += `Current price of ${name}: ${prices[name][FIAT]} ${FIAT}\n`;

            if (i === INTERESTING_COINS.length - 1) {
                return reply(channel, msg, []);
            }
        }
    } else if (command === 'priceChart') {
        const coin = args[1];
        const days = args[2];

        if (!coin || !days || isNaN(days)) return reply(channel, 'Invalid usage, !priceChart <coin> <days>.\nFor example: !pricesChart bitcoin 7', []);

        const chart = await getCoinPriceChart(coin, FIAT, days);

        return reply(channel, '', [chart]);
    } else if (command === 'portfolio') {
        const res = await calculatePortfolio(FIAT);
        if (res.length === 0) return reply(channel, 'You don\'t have added your wallet(s) yet', []);

        let total_fiat = 0;
        let msg = '';

        for(let i = 0; i < res.length; i++) {
            const current = res[i];
            const { amount, coin, extra, amount_fiat } = current;

            total_fiat += current.amount_fiat;

            msg += `You have ${extra ? extra + ' ' : ''}${amount} ${coin} (${amount_fiat.toFixed(2)} ${FIAT})\n`;

            if (i === res.length - 1) {
                msg += `You have ${total_fiat.toFixed(2)} ${FIAT} in total\n`;
                return reply(channel, msg, []);
            }
        }
    } else if (command === 'portfolioChart') {
        const days = args[1];

        if (!days || isNaN(days)) return reply(channel, 'Invalid usage, !portfolioChart <days>.\nFor example: !portfolioChart 7', []);

        const chart = await getPortfolioChart(FIAT, days);

        return reply(channel, '', [chart]);
    } else if (command === 'loadWallets') {
        loadWalletsFromEnv();
        return reply(channel, 'All wallets have been added!', []);
    } else if (command === 'help') {
        return reply(channel, 'You can use the following commands:\n!prices\n!priceChart <coin> <days>\n!portfolio\nportfolioChart <days>\n!loadWallets\n!help', []);
    }
};

module.exports = { handleCommand };
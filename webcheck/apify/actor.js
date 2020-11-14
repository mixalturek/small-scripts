const Apify = require('apify');
const request = require('request-promise');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('My input:');
    console.dir(input);

    const html = await request(input.url);

    const subResults = input.tokens.map(token => {
        return { token, result: html.includes(token) ? 'present' : 'missing' };
    });

    const result = subResults.find(r => !r.result) === undefined;

    const output = {
        // html,
        crawledAt: new Date(),
        url: input.url,
        subResults,
        result,
    };

    console.log('My output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);

    if (!result) {
        // https://github.com/apify/actor-send-mail
        console.log('Notifying about failure by email...')
        await Apify.call('apify/send-mail', {
            to: '...',
            subject: '...',
            text: JSON.stringify(output, null, 4),
        });
    }
});
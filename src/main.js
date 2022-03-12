require('dotenv').config();
const { writeFileSync, readFileSync } = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const nodeFetch = require('node-fetch');
const { getZipCode, getNeighbourhoodData, convertResidentsToPercentage} = require('./utils/utils');

const WIDTH = 1920;
const HEIGHT = 1080;

const data = readFileSync('db.json', { encoding:'utf8', flag: 'r' });
const pastResults = new Set(JSON.parse(data) || []);
console.log('pastResults:', pastResults);
const newResults = new Set();
const houses = [];
const { CHAT_ID, BOT_API } = process.env;

const urls = [
    'https://www.funda.nl/en/koop/amsterdam/beschikbaar/0-300000/40+woonopp/2+slaapkamers/1-dag/',
    'https://www.funda.nl/en/koop/haarlem/beschikbaar/0-300000/40+woonopp/2+slaapkamers/1-dag/',
];

const runTask = async () => {
    for (const url of urls) {
        await runPuppeteer(url);
    }

    console.log('newResults:', newResults);

    if (newResults.size > 0) {
        writeFileSync('db.json', JSON.stringify(Array.from([
            ...newResults,
            ...pastResults,
        ])));

        console.log('sending messages to Telegram');
        const date = (new Date()).toISOString().split('T')[0];
        houses.forEach(({
            path,
            income,
            residentsAge0to14,
            residentsAge15to24,
            residentsAge25to44,
            residentsAge45to64,
            residentsAge65AndOlder,
            householdsWithChildren,
            shareOfMorocco,
            shareOfAntillesOrAruba,
            shareOfSuriname,
            shareOfTurkey,
            neighbourhoodName,
            municipalityName,
            shareOfNonImmigrants,
            residentsCount,
            totalImmigrantsCount,
        }) => {
            let text = `New house on ${date}: [click here](${path})`;

            if (income) {
                let extraStuff = `
residentsIncome: **${income}**
neighbourhoodName: **${neighbourhoodName}**
municipalityName: **${municipalityName}**
residentsAge0to14: **${residentsAge0to14}**
residentsAge15to24: **${residentsAge15to24}**
residentsAge25to44: **${residentsAge25to44}**
residentsAge45to64: **${residentsAge45to64}**
residentsAge65AndOlder: **${residentsAge65AndOlder}**
householdsWithChildren: **${householdsWithChildren}**
residentsCount: **${residentsCount}**
totalImmigrantsCount: **${totalImmigrantsCount}**
shareOfNonImmigrants: **${shareOfNonImmigrants}**
shareOfMorocco: **${shareOfMorocco}**
shareOfAntillesOrAruba: **${shareOfAntillesOrAruba}**
shareOfSuriname: **${shareOfSuriname}**
shareOfTurkey: **${shareOfTurkey}**
`;
                text = `${text}\n${extraStuff}`;
            }

            nodeFetch(`https://api.telegram.org/bot${BOT_API}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    chat_id : CHAT_ID,
                    parse_mode : 'markdown',
                }),
            });
        });
    }
};

const runPuppeteer = async (url) => {
    console.log('opening headless browser');
    const browser = await puppeteer.launch({
        headless: true,
        args: [`--window-size=${WIDTH},${HEIGHT}`],
        defaultViewport: {
            width: WIDTH,
            height: HEIGHT,
        },
    });

    const page = await browser.newPage();
    // https://stackoverflow.com/a/51732046/4307769 https://stackoverflow.com/a/68780400/4307769
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36');

    console.log('going to funda');
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const htmlString = await page.content();
    const dom = new jsdom.JSDOM(htmlString);


    console.log('parsing funda.nl data');
    const result = dom.window.document.querySelectorAll('.search-result');
    for (const element of result) {
        const urlPath = element?.querySelectorAll('a')?.[0]?.href;
        const headerSubtitle = element?.querySelector('.search-result__header-subtitle');
        const subtitleText = headerSubtitle?.innerHTML?.trim();

        let path = urlPath;
        if (!path.includes('https://www.funda.nl')) {
            path = `https://www.funda.nl${urlPath}`;
        }

        path = path.replace('?navigateSource=resultlist', '');
        if (path && !pastResults.has(path) && !newResults.has(path)) {
            let extraDetails = {};
            const zipCode = getZipCode(subtitleText || '');

            if (zipCode) {
                const neighbourhoodData = await getNeighbourhoodData(zipCode);

                if (neighbourhoodData) {
                    const residentsCount = neighbourhoodData?.['AantalInwoners_5']?.value || 0;
                    const westernImmigrantsCount = neighbourhoodData?.['WestersTotaal_17']?.value || 0;
                    const nonWesternImmigrantsCount = neighbourhoodData?.['NietWestersTotaal_18']?.value || 0;
                    const totalImmigrantsCount = westernImmigrantsCount + nonWesternImmigrantsCount;
                    const income = neighbourhoodData?.['GemiddeldInkomenPerInwoner_66']?.value * 1000;

                    extraDetails = {
                        ...extraDetails,
                        income,
                        residentsAge0to14: neighbourhoodData['k_0Tot15Jaar_8'].value,
                        residentsAge15to24: neighbourhoodData['k_15Tot25Jaar_9'].value,
                        residentsAge25to44: neighbourhoodData['k_25Tot45Jaar_10'].value,
                        residentsAge45to64: neighbourhoodData['k_45Tot65Jaar_11'].value,
                        residentsAge65AndOlder: neighbourhoodData['k_65JaarOfOuder_12'].value,
                        householdsWithChildren: neighbourhoodData['HuishoudensMetKinderen_31'].value,
                        totalImmigrantsCount,
                        shareOfMorocco: convertResidentsToPercentage(residentsCount, neighbourhoodData['Marokko_19'].value),
                        shareOfAntillesOrAruba: convertResidentsToPercentage(residentsCount, neighbourhoodData['NederlandseAntillenEnAruba_20'].value),
                        shareOfSuriname: convertResidentsToPercentage(residentsCount, neighbourhoodData['Suriname_21'].value),
                        shareOfTurkey: convertResidentsToPercentage(residentsCount, neighbourhoodData['Turkije_22'].value),
                        shareOfNonImmigrants: convertResidentsToPercentage(residentsCount, residentsCount - totalImmigrantsCount),
                        neighbourhoodName: neighbourhoodData.neighbourhoodName.value,
                        municipalityName: neighbourhoodData.municipalityName.value,
                        residentsCount,
                    };
                }
            }

            newResults.add(path);
            houses.push({
                ...extraDetails,
                path,
            });
        }
    }

    console.log('closing browser');
    await browser.close();
};

if (CHAT_ID && BOT_API) {
    runTask();
} else {
    console.log('Missing Telegram API keys!');
}

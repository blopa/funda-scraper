// Code mostly from https://github.com/nikitaindik/funda-neighbourhoods/blob/de9b65b255a4c03a9ddb581e1472f6970240d9f7/src/content/content.js#L17
import { fetchNeighbourhoodMeta, fetchNeighbourhoodStats } from './api';

export const convertResidentsToPercentage = (residentsCount, categoryCount) => {
    const shareOfResidents = categoryCount / residentsCount;
    const integerPercentage = Math.round(shareOfResidents * 100);
    return `${categoryCount} (${integerPercentage}%)`;
}

export const getZipCode = (elementText) => {
    const zipCodeRe = /\d\d\d\d\s*[A-Z][A-Z]/;
    const match = elementText.match(zipCodeRe);

    if (match[0]) {
        return match[0].replaceAll(' ', '');
    }

    return null;
}

export const getNeighbourhoodData = async (zipCode) => {
    const neighbourhoodMeta = await fetchNeighbourhoodMeta(zipCode);
    if (!neighbourhoodMeta) {
        return null;
    }

    const { neighbourhoodCode, neighbourhoodName, municipalityName } = neighbourhoodMeta;
    const neighbourhood = await fetchNeighbourhoodStats(neighbourhoodCode);
    if (!neighbourhood) {
        return null;
    }

    return {
        neighbourhoodName: { value: neighbourhoodName },
        municipalityName: { value: municipalityName },
        ...neighbourhood,
    };
}

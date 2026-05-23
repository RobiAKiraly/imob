// ===============================
// XPATH HELPER
// ===============================
function getXPathNode(xpath, context = document) {
    return document.evaluate(xpath, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function getXPathNodes(xpath, context = document) {
    return document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

// ===============================
// FETCH DETAIL PAGE
// ===============================
async function fetchListingDetails(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const address = doc.querySelector('[data-cy="listing-address"]')
            ?.textContent.trim() || 'N/A';

        const heading = doc.querySelector('[data-cy="listing-heading"]')
            ?.textContent.trim() || 'N/A';

        const partitioning = doc.querySelector('[data-cy="listing-amenities-excerpt-component"]')
            ?.textContent.trim().split('\n')[0].trim() || 'N/A';

        const basicInfoSection = doc.querySelector('[data-cy="basic-info-section"]');
        let basicInfo = {};
        if (basicInfoSection) {
            const rows = basicInfoSection.querySelectorAll('li, tr, div[class*="row"], div[class*="detail"]');
            rows.forEach(row => {
                const text = row.textContent.trim().replace(/\s+/g, ' ');
                if (text) basicInfo[text] = true;
            });
        }
        const basicInfoText = Object.keys(basicInfo).join(' | ') || 'N/A';

        const amenities = doc.querySelector('[data-cy="listing-amenities-component"]');
        const amenitiesText = amenities
            ? [...amenities.querySelectorAll('li, span, div')]
                .map(el => el.textContent.trim())
                .filter(t => t.length > 1 && t.length < 60)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ')
            : 'N/A';

        const description = doc.querySelector('[data-cy="listing-description-section"]')
            ?.textContent.trim().replace(/\s+/g, ' ').substring(0, 200) + '...' || 'N/A';

        return { address, heading, partitioning, basicInfoText, amenitiesText, description };

    } catch (e) {
        return { address: 'ERROR', heading: 'ERROR', partitioning: 'ERROR', basicInfoText: 'ERROR', amenitiesText: 'ERROR', description: 'ERROR' };
    }
}

// ===============================
// DOWNLOAD JSON HELPER
// ===============================
function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'imobiliare_listings.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

// ===============================
// MAIN SCRAPER
// ===============================
async function scrapeAll() {
    const listings = getXPathNodes('//a[starts-with(@id,"listing-link-")]');
    console.log(`Found ${listings.snapshotLength} listings. Starting cross-page fetch...\n`);

    const results = [];

    for (let i = 0; i < listings.snapshotLength; i++) {
        const link = listings.snapshotItem(i);
        const card = getXPathNode('./ancestor::div[contains(@class,"relative")][1]', link);
        if (!card) continue;

        const url          = link.href || 'N/A';
        const titleNode    = getXPathNode('.//h3//span[contains(@class,"text-title")]', card);
        const title        = titleNode ? titleNode.textContent.trim() : 'N/A';
        const price        = card.querySelector('[data-cy="card-price"]')?.textContent.trim() || 'N/A';
        const bedrooms     = card.querySelector('[data-cy="card-bedroom_count"]')?.textContent.trim() || 'N/A';
        const surface      = card.querySelector('[data-cy="card-usable_surface"]')?.textContent.trim() || 'N/A';
        const floor        = card.querySelector('[data-cy="card-floor_number"]')?.textContent.trim() || 'N/A';
        const buildingType = card.querySelector('[data-cy="card-building_type"]')?.textContent.trim() || 'N/A';

        console.log(`⏳ Fetching listing ${i + 1} / ${listings.snapshotLength}...`);
        const details = await fetchListingDetails(url);

        const listing = {
            index:         i + 1,
            url,
            title,
            heading:       details.heading,
            address:       details.address,
            price,
            bedrooms,
            buildingType,
            floor,
            usableSurface: surface,
            partitioning:  details.partitioning,
            basicDetails:  details.basicInfoText,
            amenities:     details.amenitiesText,
            description:   details.description
        };

        results.push(listing);
        console.log(`✅ Done: ${title}`);

        await new Promise(r => setTimeout(r, 500));
    }

    // ===============================
    // DOWNLOAD
    // ===============================
    downloadJSON(results);
    console.log(`\n🎉 Finished! Downloaded ${results.length} listings as imobiliare_listings.json`);
}

scrapeAll();

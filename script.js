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

        // ADDRESS
        const address = doc.querySelector('[data-cy="listing-address"]')
            ?.textContent.trim() || 'N/A';

        // FULL HEADING
        const heading = doc.querySelector('[data-cy="listing-heading"]')
            ?.textContent.trim() || 'N/A';

        // PARTITIONING (ex: Semidecomandat)
        const partitioning = doc.querySelector('[data-cy="listing-amenities-excerpt-component"]')
            ?.textContent.trim().split('\n')[0].trim() || 'N/A';

        // BASIC INFO SECTION (all label/value pairs)
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

        // UTILITIES / AMENITIES
        const amenities = doc.querySelector('[data-cy="listing-amenities-component"]');
        const amenitiesText = amenities
            ? [...amenities.querySelectorAll('li, span, div')]
                .map(el => el.textContent.trim())
                .filter(t => t.length > 1 && t.length < 60)
                .filter((v, i, a) => a.indexOf(v) === i) // dedupe
                .join(', ')
            : 'N/A';

        // DESCRIPTION
        const description = doc.querySelector('[data-cy="listing-description-section"]')
            ?.textContent.trim().replace(/\s+/g, ' ').substring(0, 200) + '...' || 'N/A';

        return { address, heading, partitioning, basicInfoText, amenitiesText, description };

    } catch (e) {
        return { address: 'ERROR', heading: 'ERROR', partitioning: 'ERROR', basicInfoText: 'ERROR', amenitiesText: 'ERROR', description: 'ERROR' };
    }
}

// ===============================
// MAIN SCRAPER
// ===============================
async function scrapeAll() {
    const listings = getXPathNodes('//a[starts-with(@id,"listing-link-")]');
    console.log(`Found ${listings.snapshotLength} listings. Starting cross-page fetch...\n`);

    for (let i = 0; i < listings.snapshotLength; i++) {
        const link = listings.snapshotItem(i);
        const card = getXPathNode('./ancestor::div[contains(@class,"relative")][1]', link);
        if (!card) continue;

        // ---- CARD LEVEL ----
        const url          = link.href || 'N/A';
        const titleNode    = getXPathNode('.//h3//span[contains(@class,"text-title")]', card);
        const title        = titleNode ? titleNode.textContent.trim() : 'N/A';
        const price        = card.querySelector('[data-cy="card-price"]')?.textContent.trim() || 'N/A';
        const bedrooms     = card.querySelector('[data-cy="card-bedroom_count"]')?.textContent.trim() || 'N/A';
        const surface      = card.querySelector('[data-cy="card-usable_surface"]')?.textContent.trim() || 'N/A';
        const floor        = card.querySelector('[data-cy="card-floor_number"]')?.textContent.trim() || 'N/A';
        const buildingType = card.querySelector('[data-cy="card-building_type"]')?.textContent.trim() || 'N/A';

        // ---- DETAIL PAGE ----
        const details = await fetchListingDetails(url);

        // ---- OUTPUT ----
        console.log(`🏠 Listing ${i + 1}`);
        console.log(`   URL             : ${url}`);
        console.log(`   Title           : ${title}`);
        console.log(`   Heading         : ${details.heading}`);
        console.log(`   Address         : ${details.address}`);
        console.log(`   Price           : ${price}`);
        console.log(`   Bedroom Count   : ${bedrooms}`);
        console.log(`   Building Type   : ${buildingType}`);
        console.log(`   Floor Number    : ${floor}`);
        console.log(`   Usable Surface  : ${surface}`);
        console.log(`   Partitioning    : ${details.partitioning}`);
        console.log(`   Basic Details   : ${details.basicInfoText}`);
        console.log(`   Amenities       : ${details.amenitiesText}`);
        console.log(`   Description     : ${details.description}`);
        console.log('-----------------------------------');

        // delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('✅ Done!');
}

scrapeAll();

// ===============================
// XPATH HELPER
// ===============================
function getXPathNode(xpath, context = document) {
    return document.evaluate(
        xpath,
        context,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}

function getXPathNodes(xpath, context = document) {
    return document.evaluate(
        xpath,
        context,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
}

// ===============================
// GET ALL LISTINGS
// ===============================
const listings = getXPathNodes('//a[starts-with(@id,"listing-link-")]');

for (let i = 0; i < listings.snapshotLength; i++) {

    const link = listings.snapshotItem(i);

    // main card
    const card = getXPathNode('./ancestor::div[contains(@class,"relative")][1]', link);

    if (!card) continue;

    // ===============================
    // TITLE
    // ===============================
    const titleNode = getXPathNode(
        './/h3//span[contains(@class,"text-title")]',
        card
    );

    const title = titleNode
        ? titleNode.textContent.trim()
        : 'N/A';

    // ===============================
    // PRICE
    // ===============================
    const priceNode = getXPathNode(
        './/div[contains(@class,"text-xl") and contains(@class,"font-bold")]',
        card
    );

    const price = priceNode
        ? priceNode.textContent.trim().split('\n')[0]
        : 'N/A';

    // ===============================
    // BEDROOMS
    // ===============================
    const bedroomNode = getXPathNode(
        './/span[contains(@data-cy,"bedroom")]',
        card
    );

    const bedrooms = bedroomNode
        ? bedroomNode.textContent.trim()
        : 'N/A';

    // ===============================
    // USABLE SURFACE
    // ===============================
    const mpNode = getXPathNode(
    './/span[@data-cy="card-usable_surface"]',
    card
);

    const usableSurface = mpNode
        ? mpNode.textContent.trim()
        : 'N/A';

    // ===============================
    // FLOOR NUMBER
    // ===============================
    const floorNode = getXPathNode(
        './/span[contains(text(),"Etaj")]',
        card
    );

    const floor = floorNode
        ? floorNode.textContent.trim()
        : 'N/A';

    // ===============================
    // BUILDING TYPE
    // ===============================
    const buildingNode = getXPathNode(
    './/span[@data-cy="card-building_type"]',
    card
);

    const buildingType = buildingNode
        ? buildingNode.textContent.trim()
        : 'N/A';

    // ===============================
    // OUTPUT
    // ===============================
    console.log(`🏠 Listing ${i + 1}`);
    console.log(`   Title           : ${title}`);
    console.log(`   Price           : ${price}`);
    console.log(`   Bedroom Count   : ${bedrooms}`);
    console.log(`   Building Type   : ${buildingType}`);
    console.log(`   Floor Number    : ${floor}`);
    console.log(`   Usable Surface  : ${usableSurface}`);
    console.log('------------------alalalalalaalalalalallalalalalal-----------------');
}

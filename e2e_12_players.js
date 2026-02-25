import { chromium } from 'playwright';

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true }); // better to be headless for 12 contexts so it doesn't crash windows

    // Host context
    const hostContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const hostPage = await hostContext.newPage();

    console.log('Navigating host to local app...');
    await hostPage.goto('http://localhost:5173');

    // Wait for the Create Room button and click it
    await hostPage.getByText('Create Room', { exact: false }).first().click();

    // Fill in the host details
    await hostPage.getByPlaceholder('e.g. Scrum Master').fill('Host');
    await hostPage.getByRole('button', { name: 'Start Session' }).click();

    // Wait to enter room and grab the room ID from the URL
    await hostPage.waitForURL(/\/room\/(.+)/, { timeout: 10000 });
    const roomId = hostPage.url().split('/room/')[1];

    console.log(`Room created: ${roomId}`);
    console.log('Spawning 11 guest players...');

    const guestContexts = [];

    for (let i = 1; i <= 11; i++) {
        // Must be a NEW context to avoid sharing localStorage
        const gContext = await browser.newContext();
        guestContexts.push(gContext);
        const p = await gContext.newPage();

        await p.goto(`http://localhost:5173/room/${roomId}`);

        // Wait for Guest modal to load
        await p.getByPlaceholder('e.g., Alex').waitFor({ state: 'visible' });
        await p.getByPlaceholder('e.g., Alex').fill(`Player ${i}`);

        // Wait for Join Session button and click
        await p.getByRole('button', { name: 'Join Session' }).click();

        // Verify joined
        await p.getByText('Current Estimation').waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
    }

    console.log('All 12 players joined. Taking screenshot of host view...');

    // Wait for a few seconds for layouts/animations to settle
    await hostPage.waitForTimeout(3000);

    await hostPage.screenshot({ path: 'test_asset.png', fullPage: true });

    console.log('Screenshot saved as test_asset.png');

    await browser.close();
    console.log('Test complete!');
})();

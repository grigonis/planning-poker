const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to landing page...');
  await page.goto('http://localhost:5173');
  await page.screenshot({ path: '01-landing.png' });

  console.log('Clicking Create Room...');
  await page.click('text=Create Room');
  await page.waitForURL(/\/room\/.*/);
  const roomId = page.url().split('/').pop();
  console.log('Room created:', roomId);
  await page.screenshot({ path: '02-room-initial.png' });

  console.log('Joining as Armin (Host)...');
  await page.fill('input[placeholder="Enter your name"]', 'Armin');
  await page.click('button:has-text("Join Session")');
  await page.waitForSelector('text=Armin');
  await page.screenshot({ path: '03-room-joined.png' });

  console.log('Opening Room Navbar gear dropdown...');
  // RoomNavbar has a button with the gear icon or similar. 
  // Based on Room.jsx, it has onOpenSettings, onOpenEditRoom, etc.
  // Let's look for the Host Settings button.
  await page.click('button:has-text("Host Settings")');
  await page.screenshot({ path: '04-host-settings-menu.png' });

  console.log('Opening Edit Room Details...');
  await page.click('text=Edit Room Details');
  await page.waitForSelector('text=Room Details');
  await page.fill('input[value=""]', 'GSD Project Poker');
  await page.fill('textarea', 'Verifying task T01');
  await page.click('button:has-text("Save Changes")');
  await page.screenshot({ path: '05-room-details-updated.png' });

  console.log('Opening Customize Cards...');
  await page.click('button:has-text("Host Settings")');
  await page.click('text=Customize Cards');
  await page.waitForSelector('text=Customize Card Values');
  // Add a card value
  await page.click('button:has-text("Add Card")');
  await page.fill('input[value="☕"]', '100'); // Assuming it adds at the end or we can find the new input
  await page.click('button:has-text("Save Configuration")');
  await page.screenshot({ path: '06-cards-customized.png' });

  console.log('Opening Settings...');
  await page.click('button:has-text("Host Settings")');
  await page.click('text=Settings');
  await page.waitForSelector('text=Room Settings');
  await page.screenshot({ path: '07-settings-dialog.png' });
  await page.click('button:has-text("Close")');

  console.log('Starting a round...');
  await page.click('button:has-text("Start New Round")');
  await page.waitForSelector('text=Voting in progress');
  await page.screenshot({ path: '08-round-started.png' });

  console.log('Voting...');
  await page.click('button:has-text("5")');
  await page.screenshot({ path: '09-voted.png' });

  console.log('Revealing...');
  await page.click('button:has-text("Reveal Cards")');
  await page.waitForSelector('text=Results');
  await page.screenshot({ path: '10-revealed.png' });

  await browser.close();
  console.log('Flow completed successfully.');
})();

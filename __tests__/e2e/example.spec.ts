import { test, expect } from '@playwright/test';
import { createQuestion } from './create-question';

test.skip('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/application');

  await expect(page).toHaveTitle(/Chomp/);
  await expect(page.locator('#expiring')).toHaveText("Expiring soon!")
});

test.setTimeout(300_000)
test('answer and reveal', async ({ page }) => {
  // create test deck
  const {deckId, questionOptions} = await createQuestion()
  console.log("Created deck", deckId)

  // go to the deck
  await page.goto(`http://localhost:3000/application/answer/deck/${deckId}`);

  // select the first option
  const firstOption = questionOptions[0]
  await page.getByTestId(firstOption.id.toString()).click()
  await page.getByTestId('multi-first-order-next').click()
  await expect(page.locator('#multi-second-order-title')).toContainText("How many people do you think picked")
});


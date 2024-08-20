import { test, expect } from '@playwright/test';
import { createQuestion } from './create-question';

test.skip('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/application');

  await expect(page).toHaveTitle(/Chomp/);
  await expect(page.locator('#expiring')).toHaveText("Expiring soon!")
});

test.setTimeout(200_000)
test('answer and reveal', async ({ page }) => {
  // create test deck
  const {deckId, questionOptions} = await createQuestion()
  console.log("Created deck", deckId)

  // go to the deck
  console.log("visiting deck")
  await page.goto(`http://localhost:3000/application/answer/deck/${deckId}`);

  // select the 1st order
  console.log("selecting 1st order")
  const firstOption = questionOptions[0]
  await page.getByTestId(firstOption.id.toString()).click()
  await page.getByTestId('multi-first-order-next').click()
  await expect(page.locator('#multi-second-order-title')).toContainText("How many people do you think picked")

  // select the 2nd order
  console.log("selecting 2nd order")
  await page.getByRole('slider').click()
  console.log("slider clicked")
  // await page.locator(".test-id-range-class-name").click()
  await page.getByTestId('multi-second-order-next').click()
  await expect(page.locator('#post-answer-title')).toContainText("Nice!")

  // todo: update the reveal at time
  // todo: perform actual reveal
});


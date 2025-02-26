import { test, expect } from '@playwright/test'

test('Homepage title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Daily Fun Fact')
    const factText = await page.textContent('[data-testid="fun-fact-text"]')
    expect(factText).toBeTruthy()
})

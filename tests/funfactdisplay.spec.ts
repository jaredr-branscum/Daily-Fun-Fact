import { test, expect } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'
import { format } from 'date-fns'

test('FunFactCard displays correct data for today', async ({ page }) => {
    // Get today's date in the format YYYY-MM-DD
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    // Construct the expected filename
    const filename = `${month}-${day}-${year}.json`
    const filepath = path.join(process.cwd(), 'data', String(year), String(month).padStart(2, '0'), filename)

    // Read the fun fact from the JSON file
    let expectedFact: string | undefined = undefined
    let expectedTopic: string | undefined = undefined
    let expectedCategory: string | undefined = undefined
    let expectedDidYouKnow: string | undefined = undefined

    try {
        const fileContents = await fs.readFile(filepath, 'utf8')
        const data = JSON.parse(fileContents)
        expectedFact = data.fact
        expectedTopic = data.topic
        expectedCategory = data.category
        expectedDidYouKnow = data.didYouKnow
    } catch (error) {
        console.error(`Error reading/parsing ${filename}:`, error)
        throw error // Fail the test if the file cannot be read
    }

    await page.goto('/') // Navigate to the page where FunFactDisplay is rendered

    await expect(page.locator('[data-testid="fun-fact-card"]')).toBeVisible()

    await expect(page.locator('[data-testid="fun-fact-topic"]')).toHaveText(expectedTopic || '')
    await expect(page.locator('[data-testid="fun-fact-text"]')).toHaveText(expectedFact || '')
    await expect(page.locator('[data-testid="fun-fact-did-you-know"]')).toHaveText(expectedDidYouKnow || '')
    await expect(page.locator('[data-testid="fun-fact-category"]')).toHaveText(expectedCategory || '')
})

test('Navigation to archive page works', async ({ page }) => {
    await page.route('/api/funfacts', async (route) => {
        const mockFunFacts = {
            '2025-25-02': {
                fact: 'Mocked fact for testing!',
                topic: 'Mocked topic',
                category: 'Mocked category',
                didYouKnow: 'Mocked didYouKnow',
            },
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockFunFacts),
        })
    })

    await page.goto('/')

    // Click the "View Past Fun Facts" link
    await page.locator('[data-testid="archive-link"]').click()

    await page.waitForURL('/archive')

    await expect(page).toHaveURL('/archive')
    await expect(page.locator('[data-testid="fun-fact-archive"]')).toHaveText('Fun Facts Archive')

    // Select the year and month to trigger loading the fun facts
    await page.locator('[data-testid="fun-fact-archive-select-year"]').selectOption({ label: '2025' })
    await page.locator('[data-testid="fun-fact-archive-select-month"]').selectOption({ label: 'February' })

    // Wait for the fun facts to load.
    await page.waitForSelector('[data-testid="fun-fact-card"]', { timeout: 2000 })
    await expect(page.locator('[data-testid="fun-fact-text"]')).toContainText('Mocked fact for testing!')
})

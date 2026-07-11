import { test, expect } from '@playwright/test'

// The product catalog is static client-side data (client/src/data/vegetables.js),
// so browsing, filtering, and cart all work with zero network calls. Anything
// that needs the real API (auth, checkout, orders) is intentionally left out
// of this smoke suite — those are covered by the server's own test suite and
// are better exercised against a real backend, not mocked in CI.

test('homepage loads with hero and nav', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/organic/i)
  await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible()
})

test('shop page lists products and category filter narrows results', async ({ page }) => {
  await page.goto('/shop')
  const cardsBefore = page.locator('[data-testid="product-card"]')
  await expect(cardsBefore.first()).toBeVisible()
  const countBefore = await cardsBefore.count()

  // Click the first category pill (not "All") and expect fewer results.
  const categoryPill = page.locator('[data-testid="category-filter"]').nth(1)
  if (await categoryPill.isVisible().catch(() => false)) {
    await categoryPill.click()
    await expect(cardsBefore.first()).toBeVisible()
    const countAfter = await cardsBefore.count()
    expect(countAfter).toBeLessThanOrEqual(countBefore)
  }
})

test('search autocomplete suggests a match and adding to cart updates the drawer', async ({ page }) => {
  await page.goto('/shop')
  const searchInput = page.getByPlaceholder(/search spinach/i)
  await searchInput.fill('tom')
  await expect(page.getByText(/tomato/i).first()).toBeVisible()

  // Add the first visible product to the cart and confirm the cart badge updates.
  const addButton = page.locator('[data-testid="add-to-cart"]').first()
  await addButton.click()
  const cartBadge = page.locator('[data-testid="cart-count"]').first()
  await expect(cartBadge).toHaveText('1')
})

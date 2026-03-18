import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

type PageWindow = Window & {
  __copiedText?: string
}

const dismissTutorialIfNeeded = async (page: Page) => {
  const startButton = page.getByRole('button', { name: '시작하기' })

  if (await startButton.isVisible()) {
    await startButton.click()
  }
}

const installClipboardStub = async (page: Page) => {
  await page.addInitScript(() => {
    let copiedText = ''

    Object.defineProperty(window, '__copiedText', {
      configurable: true,
      writable: true,
      value: '',
    })

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copiedText = text
          ;(window as PageWindow).__copiedText = text
        },
        readText: async () => copiedText,
      },
    })
  })
}

test('storage access failures do not break initial render', async ({ page }) => {
  await page.addInitScript(() => {
    const throwSecurityError = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }

    Object.defineProperty(Storage.prototype, 'getItem', {
      configurable: true,
      value: throwSecurityError,
    })
    Object.defineProperty(Storage.prototype, 'setItem', {
      configurable: true,
      value: throwSecurityError,
    })
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Image Sort Studio' })).toBeVisible()
})

test('user can prepare and complete a sort run', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByRole('button', { name: '설정' }).click()

  const settingsDialog = page.getByRole('dialog', { name: '설정' })
  const stripSlider = settingsDialog.getByRole('slider', { name: '조각 개수' })
  const speedSlider = settingsDialog.getByRole('slider', { name: '속도' })

  await stripSlider.focus()
  await stripSlider.press('Home')
  await speedSlider.focus()
  await speedSlider.press('Home')
  await settingsDialog.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: '조각내고 섞기' }).click()

  const startButton = page.getByRole('button', { name: '정렬 시작' })
  await expect(startButton).toBeEnabled()
  await startButton.click()

  await expect(page.getByRole('dialog', { name: '정렬 완료!' })).toBeVisible({
    timeout: 15_000,
  })
})

test('compare mode shows both algorithm descriptions and updates the title', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await expect(page).toHaveTitle(/Quick Sort/)

  await page.getByLabel('주 알고리즘').selectOption('tim')
  await expect(page).toHaveTitle(/Tim Sort/)

  await page.getByRole('button', { name: '비교 모드' }).click()
  await page.getByLabel('비교 알고리즘').selectOption('merge')

  await expect(page).toHaveTitle(/Tim Sort vs Merge Sort/)

  await page.getByRole('button', { name: '알고리즘 설명' }).click()

  const dialog = page.getByRole('dialog', { name: '알고리즘 설명' })
  await expect(dialog.getByText('기준 알고리즘')).toBeVisible()
  await expect(dialog.getByText('비교 알고리즘')).toBeVisible()
  await expect(dialog.getByText('Tim Sort')).toBeVisible()
  await expect(dialog.getByText('Merge Sort')).toBeVisible()
})

test('bogo algorithms do not show a fixed total progress upfront', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByLabel('주 알고리즘').selectOption('bogo')
  await page.getByRole('button', { name: '설정' }).click()

  const settingsDialog = page.getByRole('dialog', { name: '설정' })
  const stripSlider = settingsDialog.getByRole('slider', { name: '조각 개수' })
  await stripSlider.focus()
  await stripSlider.press('Home')
  await settingsDialog.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: '조각내고 섞기' }).click()
  await expect(page.getByText('0/?')).toBeVisible()
})

test('shared result links reopen the same result instead of placeholders or defaults', async ({ page, context }) => {
  await installClipboardStub(page)
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByLabel('주 알고리즘').selectOption('tim')
  await page.getByRole('button', { name: '설정' }).click()

  const settingsDialog = page.getByRole('dialog', { name: '설정' })
  const stripSlider = settingsDialog.getByRole('slider', { name: '조각 개수' })
  const speedSlider = settingsDialog.getByRole('slider', { name: '속도' })

  await stripSlider.focus()
  await stripSlider.press('Home')
  await speedSlider.focus()
  await speedSlider.press('Home')
  await settingsDialog.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: '조각내고 섞기' }).click()
  await page.getByRole('button', { name: '정렬 시작' }).click()

  const resultDialog = page.getByRole('dialog', { name: '정렬 완료!' })
  await expect(resultDialog).toBeVisible({ timeout: 15_000 })
  await expect(resultDialog).toContainText('Tim Sort로 8개의 조각을 정렬했습니다.')
  await expect(resultDialog).not.toContainText('{algorithm}')
  await expect(resultDialog).not.toContainText('{count}')

  await page.getByRole('button', { name: '링크 복사' }).click()

  const sharedUrl = await page.evaluate(() => ((window as PageWindow).__copiedText ?? ''))
  expect(sharedUrl).toContain('algo=tim')
  expect(sharedUrl).toContain('source=preset')

  const sharedPage = await context.newPage()
  await sharedPage.goto(sharedUrl)

  const sharedDialog = sharedPage.getByRole('dialog', { name: '정렬 완료!' })
  await expect(sharedDialog).toBeVisible()
  await expect(sharedDialog).toContainText('Tim Sort로 8개의 조각을 정렬했습니다.')
  await expect(sharedPage.getByLabel('주 알고리즘')).toHaveValue('tim')
})

test('compare mode never offers or keeps the same algorithm on both sides', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByRole('button', { name: '비교 모드' }).click()

  const primarySelect = page.getByLabel('주 알고리즘')
  const compareSelect = page.getByLabel('비교 알고리즘')

  await expect(compareSelect.locator('option[value="quick"]')).toHaveCount(0)

  await primarySelect.selectOption('bubble')

  await expect(compareSelect).not.toHaveValue('bubble')
  await expect(compareSelect.locator('option[value="bubble"]')).toHaveCount(0)
})

test('starting after a step jump continues from the selected step', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByRole('button', { name: '설정' }).click()

  const settingsDialog = page.getByRole('dialog', { name: '설정' })
  const stripSlider = settingsDialog.getByRole('slider', { name: '조각 개수' })
  const speedSlider = settingsDialog.getByRole('slider', { name: '속도' })

  await stripSlider.focus()
  await stripSlider.press('Home')
  await speedSlider.focus()
  await speedSlider.press('End')
  await settingsDialog.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: '조각내고 섞기' }).click()

  const scrubber = page.locator('.step-scrubber-input')
  await scrubber.focus()
  await scrubber.press('ArrowRight')
  await scrubber.press('ArrowRight')
  await scrubber.press('ArrowRight')

  await expect(page.locator('.step-scrubber-value')).toContainText('4 /')

  const progressValue = page.locator('.status-info .status-value').first()
  await expect(progressValue).toContainText('4/')

  await page.getByRole('button', { name: '정렬 시작' }).click()

  await page.waitForTimeout(20)
  await expect(progressValue).toContainText('4/')

  await expect.poll(async () => {
    const text = await progressValue.textContent()
    return Number.parseInt(text?.split('/')[0] ?? '0', 10)
  }).toBeGreaterThan(4)
})

test('compare mode result shows counts for both algorithms', async ({ page }) => {
  await page.goto('/')
  await dismissTutorialIfNeeded(page)

  await page.getByRole('button', { name: '비교 모드' }).click()
  await page.getByLabel('주 알고리즘').selectOption('quick')
  await page.getByLabel('비교 알고리즘').selectOption('bubble')
  await page.getByRole('button', { name: '설정' }).click()

  const settingsDialog = page.getByRole('dialog', { name: '설정' })
  const stripSlider = settingsDialog.getByRole('slider', { name: '조각 개수' })
  const speedSlider = settingsDialog.getByRole('slider', { name: '속도' })

  await stripSlider.focus()
  await stripSlider.press('Home')
  await speedSlider.focus()
  await speedSlider.press('Home')
  await settingsDialog.getByRole('button', { name: '닫기' }).click()

  await page.getByRole('button', { name: '조각내고 섞기' }).click()
  await expect(page.locator('.status-info')).toContainText('Quick Sort:')
  await expect(page.locator('.status-info')).toContainText('Bubble Sort:')
  await expect(page.locator('.compare-status-card')).toHaveCount(2)
  await expect(page.locator('.compare-status-card').nth(0)).toContainText('Progress')
  await expect(page.locator('.compare-status-card').nth(1)).toContainText('Progress')
  await page.getByRole('button', { name: '정렬 시작' }).click()

  const resultDialog = page.getByRole('dialog', { name: '정렬 완료!' })
  await expect(resultDialog).toBeVisible({ timeout: 15_000 })
  await expect(resultDialog.getByText('기준 알고리즘')).toBeVisible()
  await expect(resultDialog.getByText('비교 알고리즘')).toBeVisible()
  await expect(resultDialog.locator('.compare-result-name').nth(0)).toHaveText('Quick Sort')
  await expect(resultDialog.locator('.compare-result-name').nth(1)).toHaveText('Bubble Sort')
})

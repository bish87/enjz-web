import { mkdir } from 'node:fs/promises'

import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = '/tmp/enjz-shots'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()

const errors = []
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() === 'error') {
    errors.push(`console: ${message.text()}`)
  }
})

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  console.log(`shot - ${name}`)
}

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('h1')
console.log('home title:', (await page.locator('h1').first().innerText()).replace(/\n/g, ' '))
await shot('01-home')

await page.getByRole('link', { name: 'Browse services' }).first().click()
await page.waitForURL('**/providers')
await page.waitForTimeout(500)
console.log('providers heading:', await page.locator('h1').innerText())
await shot('02-providers')

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.locator('#phone').fill(process.env.ADMIN_PHONE.replace(/^\+249/, ''))
await page.locator('#password').fill(process.env.ADMIN_PASSWORD)
await page.locator('button[type=submit]').click()
await page.waitForURL('**/admin', { timeout: 15000 })
await page.waitForTimeout(800)
console.log('admin heading:', await page.locator('h1').innerText())
await shot('03-admin')

for (const [path, name] of [
  ['/admin/providers', '04-admin-providers'],
  ['/admin/categories', '05-admin-categories'],
  ['/admin/areas', '06-admin-areas'],
  ['/profile', '07-profile'],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  console.log(`${path} heading:`, await page.locator('h1').first().innerText())
  await shot(name)
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Language' }).click()
await page.waitForTimeout(1200)
const dir = await page.evaluate(() => document.documentElement.dir)
const lang = await page.evaluate(() => document.documentElement.lang)
console.log('direction after toggle:', dir, lang)
if (dir !== 'rtl') {
  errors.push('expected rtl direction after switching to Arabic')
}
await shot('08-home-arabic')

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
mobile.on('pageerror', (error) => errors.push(`mobile pageerror: ${error.message}`))
await mobile.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await mobile.waitForSelector('h1')
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth
)
console.log('mobile horizontal overflow (px):', overflow)
if (overflow > 1) {
  errors.push(`horizontal overflow on mobile: ${overflow}px`)
}
await mobile.screenshot({ path: `${OUT}/09-home-mobile.png`, fullPage: true })

await browser.close()

if (errors.length) {
  console.log('\nERRORS:')
  for (const error of errors) {
    console.log('-', error)
  }
  process.exitCode = 1
} else {
  console.log('\nSMOKE TEST PASSED - no console/page errors')
}

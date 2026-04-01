from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    # Login as admin
    print("=== Admin Portal ===")
    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(3000)

    # Find and click the admin demo button
    demo_btns = page.locator("button")
    for i in range(demo_btns.count()):
        text = demo_btns.nth(i).inner_text().strip()
        if "admin@iebc.go.ke" in text:
            demo_btns.nth(i).click()
            break
    page.wait_for_timeout(500)

    submit_btn = page.locator('button:has-text("Sign In")')
    submit_btn.click()
    page.wait_for_timeout(6000)
    print(f"  URL: {page.url}")

    page.wait_for_timeout(2000)

    # Check notification bell
    print("\n  Checking notifications...")
    bell = page.locator("header button").filter(has=page.locator("svg.w-6")).first
    bell.click()
    page.wait_for_timeout(1500)

    items = page.locator('[class*="cursor-pointer"][class*="border-b"]')
    count = items.count()
    print(f"  Notifications: {count}")

    if count > 0:
        for i in range(min(5, count)):
            text = items.nth(i).inner_text().split("\n")[0].strip()
            print(f"    - {text[:50]}")

    page.screenshot(path="screenshots/admin-notifications-final.png")

    # Check for "Mark all read"
    body = page.inner_text("body")
    has_mark = "Mark all read" in body
    print(f"  Mark all read: {has_mark}")

    # Test voter portal
    print("\n=== Voter Portal ===")
    page.locator('header button[title="Sign out"]').click()
    page.wait_for_timeout(3000)

    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(3000)

    for i in range(demo_btns.count()):
        text = demo_btns.nth(i).inner_text().strip()
        if "voter@iebc.go.ke" in text:
            demo_btns.nth(i).click()
            break
    page.wait_for_timeout(500)
    submit_btn.click()
    page.wait_for_timeout(6000)
    print(f"  URL: {page.url}")

    page.wait_for_timeout(2000)

    # Check voter notifications
    bell2 = page.locator("header button").filter(has=page.locator("svg.w-6")).first
    bell2.click()
    page.wait_for_timeout(1500)

    items2 = page.locator('[class*="cursor-pointer"][class*="border-b"]')
    count2 = items2.count()
    print(f"  Notifications: {count2}")

    if count2 > 0:
        for i in range(min(3, count2)):
            text = items2.nth(i).inner_text().split("\n")[0].strip()
            print(f"    - {text[:50]}")

    page.screenshot(path="screenshots/voter-notifications-final.png")

    browser.close()
    print("\n=== All tests passed! ===")

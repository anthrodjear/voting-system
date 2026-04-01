from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    # Go to admin login and clear storage
    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.evaluate("localStorage.clear()")
    page.wait_for_timeout(500)

    # Login as admin
    print("1. Login as admin")
    page.locator('button:has-text("admin@iebc.go.ke")').click()
    page.wait_for_timeout(500)
    page.locator('button[type="submit"]').click()
    page.wait_for_timeout(6000)
    print(f"   URL: {page.url}")

    # Force reload to ensure fresh state
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(3000)

    # Check localStorage
    stored = page.evaluate('localStorage.getItem("iebc-notifications")')
    if stored:
        import json

        data = json.loads(stored)
        notif_count = len(data.get("state", {}).get("notifications", []))
        print(f"   Stored notifications: {notif_count}")
    else:
        print("   No stored notifications")

    # Click bell
    print("2. Open notifications")
    header = page.locator("header")
    bell = header.locator("button").first
    bell.click()
    page.wait_for_timeout(1500)

    # Check dropdown
    items = page.locator('[class*="cursor-pointer"][class*="border-b"]')
    count = items.count()
    print(f"   Dropdown items: {count}")

    body = page.inner_text("body")
    has_mark = "Mark all read" in body
    print(f"   Mark all read: {has_mark}")

    if count > 0:
        for i in range(min(5, count)):
            text = items.nth(i).inner_text().split("\n")[0].strip()
            print(f"     - {text[:50]}")

    page.screenshot(path="screenshots/admin-notif-final.png")

    browser.close()
    print("Done!")

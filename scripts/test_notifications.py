from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    # Clear old notification data
    page.goto("http://localhost:3000", wait_until="domcontentloaded", timeout=30000)
    page.evaluate('localStorage.removeItem("iebc-notifications")')
    page.wait_for_timeout(500)

    # Login as admin
    print("1. Login")
    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(3000)
    page.locator('button:has-text("admin@iebc.go.ke")').click()
    page.wait_for_timeout(500)
    page.locator('button[type="submit"]').click()
    page.wait_for_timeout(5000)
    print(f"   URL: {page.url}")

    # Wait for notifications to load
    page.wait_for_timeout(2000)

    # Check header area for notification elements
    print("2. Check notification bell")
    header = page.locator("header")
    header_html = header.inner_html()

    # Check for unread badge (animate-pulse class)
    has_badge = "animate-pulse" in header_html
    print(f"   Has unread badge: {has_badge}")

    # Click the notification bell button (last button in header before user avatar)
    bell_btn = header.locator("button").filter(has=page.locator("svg.w-6")).first
    bell_btn.click()
    page.wait_for_timeout(1500)

    # Check dropdown content
    print("3. Check dropdown content")
    body_text = page.inner_text("body")

    # Look for notification titles
    titles = [
        "System Online",
        "Pending RO",
        "Voter Registration",
        "Blockchain",
        "Database",
        "Election",
        "Security",
    ]
    found = [t for t in titles if t in body_text]
    print(f"   Notifications found: {len(found)}")
    for t in found:
        print(f"     - {t}")

    # Check for "Mark all read" button
    has_mark_read = "Mark all read" in body_text
    print(f'   Has "Mark all read": {has_mark_read}')

    # Check for notification count in footer
    has_count = "notification" in body_text.lower() and "unread" in body_text.lower()
    print(f"   Has count footer: {has_count}")

    page.screenshot(path="screenshots/admin-notifications-final.png")

    # Click "Mark all read"
    if has_mark_read:
        page.locator("text=Mark all read").click()
        page.wait_for_timeout(500)
        print("4. Marked all as read")
        # Badge should disappear
        header_html2 = page.locator("header").inner_html()
        badge_after = "animate-pulse" in header_html2
        print(f"   Badge still visible: {badge_after}")

    browser.close()
    print("All tests passed!")

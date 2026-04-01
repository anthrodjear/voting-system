from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    errors = []
    page.on(
        "console", lambda msg: errors.append(msg.text) if msg.type == "error" else None
    )

    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(4000)
    page.screenshot(path="screenshots/debug-login.png")

    # Check for demo buttons
    btns = page.locator("button")
    count = btns.count()
    print(f"Buttons on page: {count}")

    for i in range(count):
        text = btns.nth(i).inner_text().strip()
        if text and len(text) > 5:
            print(f"  [{i}] {text[:60]}")

    # Check for errors
    if errors:
        print(f"Console errors: {errors[:3]}")

    browser.close()

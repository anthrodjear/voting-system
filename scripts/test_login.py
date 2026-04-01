from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    errors = []
    api_calls = []
    page.on(
        "console", lambda msg: errors.append(msg.text) if msg.type == "error" else None
    )
    page.on(
        "request",
        lambda req: (
            api_calls.append(f"{req.method} {req.url}") if "auth" in req.url else None
        ),
    )

    print("Test: Login with demo account auto-fill")
    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(3000)

    # Check demo account buttons exist
    voter_btn = page.locator('button:has-text("voter@iebc.go.ke")')
    print(f"  Voter demo button visible: {voter_btn.is_visible()}")

    # Click voter demo account to auto-fill
    voter_btn.click()
    page.wait_for_timeout(500)

    # Verify form is filled
    email_val = page.locator('input[type="email"]').input_value()
    pass_val = page.locator('input[type="password"]').input_value()
    print(f"  Email filled: {email_val}")
    print(f"  Password filled: {'*' * len(pass_val) if pass_val else 'EMPTY'}")

    page.screenshot(path="screenshots/login-autofilled.png")

    # Submit the form
    page.locator('button[type="submit"]').click()
    page.wait_for_timeout(5000)

    print(f"  API calls: {api_calls}")
    print(f"  Current URL: {page.url}")

    # Check for errors
    login_errors = [
        e for e in errors if "401" in e or "Invalid" in e or "error" in e.lower()
    ]
    if login_errors:
        print(f"  Errors: {login_errors[:3]}")
    else:
        print("  No login errors!")

    page.screenshot(path="screenshots/login-result.png")

    browser.close()
    print("Done!")

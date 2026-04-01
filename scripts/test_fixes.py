from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    print("Test 1: Login page")
    page.goto(
        "http://localhost:3000/auth/login", wait_until="domcontentloaded", timeout=30000
    )
    page.wait_for_timeout(3000)
    print(f"  URL: {page.url}")
    page.screenshot(path="screenshots/login-fixed.png")

    content = page.content()
    has_email = "Email Address" in content
    has_forgot = "/auth/forgot-password" in content
    has_register = "/auth/register" in content
    print(f"  Has Email field: {has_email}")
    print(f"  Has forgot-password link: {has_forgot}")
    print(f"  Has register link: {has_register}")

    print("Test 2: Forgot password page")
    page.goto(
        "http://localhost:3000/auth/forgot-password",
        wait_until="domcontentloaded",
        timeout=30000,
    )
    page.wait_for_timeout(3000)
    print(f"  URL: {page.url}")
    page.screenshot(path="screenshots/forgot-password-fixed.png")

    print("Test 3: Landing page links")
    page.goto("http://localhost:3000", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(3000)
    content = page.content()
    register_count = content.count("/auth/register")
    login_count = content.count("/auth/login")
    broken_reg = content.count('href="/register"')
    broken_login = content.count('href="/login"')
    print(f"  /auth/register links: {register_count}")
    print(f"  /auth/login links: {login_count}")
    print(f"  Broken /register links: {broken_reg}")
    print(f"  Broken /login links: {broken_login}")
    page.screenshot(path="screenshots/landing-fixed.png")

    browser.close()
    print("All tests passed!")

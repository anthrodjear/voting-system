from playwright.sync_api import sync_playwright
import os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    # Use system Edge browser - no download needed
    browser = p.chromium.launch(channel="msedge", headless=True)

    # Test 1: Frontend landing page
    print("Test 1: Frontend landing page (http://localhost:3000)")
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto("http://localhost:3000", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshots/frontend-landing.png", full_page=True)
    title = page.title()
    print(f"  Title: {title}")

    body_text = page.inner_text("body")
    has_voting = any(
        word in body_text.lower()
        for word in ["vote", "voting", "iebc", "election", "register", "login"]
    )
    print(f"  Has voting content: {has_voting}")
    print(f"  Body preview: {body_text[:150].strip()}...")

    # Test 2: Backend API health
    print("\nTest 2: Backend API health (http://localhost:3001/v1/health)")
    api_page = browser.new_page()
    api_page.goto("http://localhost:3001/v1/health", timeout=10000)
    api_content = api_page.inner_text("body")
    print(f"  Response: {api_content[:200]}")
    api_ok = '"healthy"' in api_content or '"success":true' in api_content
    print(f"  Status: {'PASS' if api_ok else 'FAIL'}")

    # Test 3: Swagger docs
    print("\nTest 3: Swagger docs (http://localhost:3001/docs)")
    docs_page = browser.new_page(viewport={"width": 1280, "height": 720})
    docs_page.goto("http://localhost:3001/docs", timeout=30000)
    docs_page.wait_for_load_state("networkidle")
    docs_page.screenshot(path="screenshots/swagger-docs.png", full_page=True)
    docs_title = docs_page.title()
    print(f"  Title: {docs_title}")
    has_swagger = "swagger" in docs_title.lower() or "api" in docs_title.lower()
    print(f"  Status: {'PASS' if has_swagger else 'CHECK MANUALLY'}")

    # Test 4: Auth page
    print("\nTest 4: Auth page (http://localhost:3000/auth)")
    auth_page = browser.new_page(viewport={"width": 1280, "height": 720})
    auth_page.goto("http://localhost:3000/auth", timeout=30000)
    auth_page.wait_for_load_state("networkidle")
    auth_page.screenshot(path="screenshots/frontend-auth.png", full_page=True)
    print(f"  Title: {auth_page.title()}")

    # Test 5: RabbitMQ Management
    print("\nTest 5: RabbitMQ Management (http://localhost:15672)")
    rabbit_page = browser.new_page(viewport={"width": 1280, "height": 720})
    rabbit_page.goto("http://localhost:15672", timeout=10000)
    rabbit_page.screenshot(path="screenshots/rabbitmq-management.png", full_page=True)
    rabbit_title = rabbit_page.title()
    print(f"  Title: {rabbit_title}")
    has_rabbit = (
        "rabbitmq" in rabbit_title.lower()
        or "login" in rabbit_page.inner_text("body").lower()
    )
    print(f"  Status: {'PASS' if has_rabbit else 'FAIL'}")

    browser.close()
    print("\n========================================")
    print("  ALL TESTS COMPLETED")
    print("  Screenshots saved to screenshots/")
    print("========================================")

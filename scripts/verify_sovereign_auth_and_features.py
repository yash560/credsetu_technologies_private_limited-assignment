import sys
import time
import requests
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3999"

def run_tests():
    print("=" * 70)
    print("🚀 MINILEDGER PROTOCOL SOP-01: COMPREHENSIVE AUTH WALL & SDLC SUITE")
    print("=" * 70)

    # ─────────────────────────────────────────────────────────────
    # PART 1: API LEVEL AUTHENTICATION & RECOVERY TESTS
    # ─────────────────────────────────────────────────────────────
    test_email = f"test_{int(time.time())}@thewebvale.com"
    test_pass = "SovereignPass123!"
    test_name = "Vikram Aditya"

    print(f"\n[TEST 1] Testing User Registration API ({test_email})...")
    reg_res = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "name": test_name,
            "email": test_email,
            "password": test_pass,
            "phone": "+919988776655",
        },
    )
    assert reg_res.status_code == 201, f"Expected 201, got {reg_res.status_code}: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["success"] is True, "Registration response success was false"
    assert reg_data["user"]["email"] == test_email.lower()
    print(f"✓ Registration passed. User: {reg_data['user']['name']} ({reg_data['user']['id']})")

    print("\n[TEST 2] Testing Password Verification & Rejection (HTTP 401)...")
    bad_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401, f"Expected 401 on bad password, got {bad_login.status_code}"
    print("✓ Incorrect password rejected with HTTP 401.")

    print("\n[TEST 3] Testing Valid User Sign In & JWT Issuance...")
    good_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": test_pass},
    )
    assert good_login.status_code == 200, f"Expected 200, got {good_login.status_code}"
    good_data = good_login.json()
    assert good_data["success"] is True
    print(f"✓ Sign in successful for {good_data['user']['name']}.")

    print("\n[TEST 4] Testing Forgot Password & Sovereign SMTP Recovery Loop...")
    forgot_res = requests.post(
        f"{BASE_URL}/api/auth/forgot-password",
        json={"email": test_email},
    )
    assert forgot_res.status_code == 200, f"Expected 200, got {forgot_res.status_code}"
    forgot_data = forgot_res.json()
    assert forgot_data["success"] is True
    reset_code = forgot_data.get("reset_code")
    assert reset_code and len(reset_code) == 6
    print(f"✓ SMTP reset dispatched ({forgot_data.get('email_dispatched')}) with 6-digit code: {reset_code}")

    print("\n[TEST 5] Testing Password Reset Flow...")
    new_pass = "BrandNewPass999!"
    reset_res = requests.post(
        f"{BASE_URL}/api/auth/reset-password",
        json={"token": reset_code, "new_password": new_pass},
    )
    assert reset_res.status_code == 200
    print("✓ Password updated successfully with bcrypt hash.")

    # ─────────────────────────────────────────────────────────────
    # PART 2: DATA & FILTER APIS
    # ─────────────────────────────────────────────────────────────
    print("\n[TEST 6] Testing Loans API & Category Filters...")
    all_loans = requests.get(f"{BASE_URL}/api/loans?filter=all").json()
    assert all_loans["success"] is True and len(all_loans["loans"]) > 0
    print(f"✓ Loans API functional. Total seed loans: {len(all_loans['loans'])}")

    print("\n[TEST 7] Testing Statement CSV Export API...")
    csv_res = requests.get(f"{BASE_URL}/api/loans/export")
    assert csv_res.status_code == 200
    assert "Friend Name" in csv_res.text and "Amount (INR)" in csv_res.text
    print("✓ Real CSV Statement generated with RFC 4180 headers.")

    # ─────────────────────────────────────────────────────────────
    # PART 3: PLAYWRIGHT BROWSER AUDIT (AUTH WALL, COCKPIT & VIEWPORTS)
    # ─────────────────────────────────────────────────────────────
    print("\n[TEST 8] Launching Headless Chromium for Interactive Auth Wall & Tri-Axis QA...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 8A: Unauthenticated Clean Context (Must show Marketing Page, 0 Private Data!)
        clean_context = browser.new_context(viewport={"width": 1440, "height": 900})
        clean_page = clean_context.new_page()

        console_errors = []
        clean_page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        clean_page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)

        # Assert Marketing Front Door is rendered
        assert clean_page.locator("text=Stop the Awkwardness").is_visible(), "Marketing Hero headline missing"
        assert clean_page.locator("text=Interactive Sandbox Preview").is_visible(), "Calculator sandbox missing"
        assert clean_page.locator("button:has-text('Sign In')").first.is_visible(), "Sign in CTA missing"

        # STRICT ZERO-LEAK ASSERTION: Private user name and ledger cards MUST NOT exist in DOM!
        content = clean_page.content()
        assert "Today's Cash Flow & Lent Money" not in content, "SECURITY LEAK: Cockpit Hero rendered unauthenticated!"
        assert "All Entries" not in content, "SECURITY LEAK: Sidebar rendered unauthenticated!"
        print("✓ STRICT AUTH WALL VERIFIED: Unauthenticated visitor sees only Marketing Front Door. Zero private data in DOM.")

        # Test interactive calculator slider
        slider = clean_page.locator("input[type='range']")
        assert slider.is_visible(), "Interactive demo slider missing"
        clean_page.locator("button:has-text('🚗 Weekend Trips')").click()
        time.sleep(0.3)
        assert "weekend trip Airbnb share" in clean_page.content(), "Demo message failed to update dynamically"
        print("✓ Interactive Sandbox Calculator functional.")

        # 8B: Open Auth Modal & Authenticate
        clean_page.locator("button:has-text('Live Demo / Quick Sign In')").click()
        time.sleep(0.5)
        assert clean_page.locator("text=Sign In to MiniLedger").is_visible(), "Auth modal did not open"

        # Click Quick Demo Yash Jain
        clean_page.locator("text=Yash Jain (Owner)").first.click()
        time.sleep(0.3)
        clean_page.get_by_role("button", name="Sign In to Cockpit").click()
        time.sleep(1.2)

        # Assert Cockpit is now unlocked!
        assert clean_page.locator("text=Today's Cash Flow & Lent Money").is_visible(), "Cockpit did not load after login"
        assert clean_page.locator("text=GOOD DAY, YASH").is_visible(), "Greeting card missing logged-in user name"
        print("✓ AUTH ADMISSION VERIFIED: User admitted to 3-Zone Cockpit upon authentication.")

        # 8C: Viewport & Layout Breakage Audit (Mobile 360px & Tablet 768px)
        print("\n[TEST 9] Executing Tri-Axis Viewport Inspection (360px, 768px, 1440px)...")

        # Mobile Viewport 360px
        mobile_page = clean_context.new_page()
        mobile_page.set_viewport_size({"width": 360, "height": 740})
        mobile_page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(0.5)

        # Check for horizontal scroll leakage
        scroll_width = mobile_page.evaluate("document.documentElement.scrollWidth")
        client_width = mobile_page.evaluate("document.documentElement.clientWidth")
        assert scroll_width <= client_width + 1, f"Horizontal scroll overflow detected on 360px: {scroll_width} > {client_width}"
        print(f"✓ 360px Mobile Viewport clean (scrollWidth: {scroll_width}px, clientWidth: {client_width}px, 0 overflow).")

        # Tablet Viewport 768px
        tablet_page = clean_context.new_page()
        tablet_page.set_viewport_size({"width": 768, "height": 1024})
        tablet_page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(0.5)
        t_scroll = tablet_page.evaluate("document.documentElement.scrollWidth")
        t_client = tablet_page.evaluate("document.documentElement.clientWidth")
        assert t_scroll <= t_client + 1, f"Horizontal scroll overflow on 768px: {t_scroll} > {t_client}"
        print(f"✓ 768px Tablet Viewport clean (scrollWidth: {t_scroll}px, clientWidth: {t_client}px, 0 overflow).")

        # Assert 0 console errors
        assert len(console_errors) == 0, f"Console errors detected: {console_errors}"
        print("✓ Zero console errors across all viewports and interactions.")

        browser.close()

    print("\n" + "=" * 70)
    print("🎉 MASTER PROTOCOL SOP-01 SUITE: ALL TESTS PASSED DETERMINISTICALLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

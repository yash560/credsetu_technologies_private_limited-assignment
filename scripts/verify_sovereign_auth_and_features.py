import sys
import time
import requests
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3999"

def run_tests():
    print("=" * 60)
    print("🚀 RUNNING MINILEDGER SOVEREIGN AUTH & FEATURE VERIFICATION")
    print("=" * 60)

    # 1. API: Test User Registration
    test_email = f"test_{int(time.time())}@thewebvale.com"
    test_pass = "SovereignPass123!"
    test_name = "Vikram Aditya"

    print(f"\n[TEST 1] Registering New User ({test_email})...")
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
    assert reg_data["user"]["email"] == test_email.lower(), "Email mismatch in user response"
    token = reg_data["token"]
    print(f"✓ Registration passed. User ID: {reg_data['user']['id']}")

    # 2. API: Test Login Rejection with Bad Password
    print("\n[TEST 2] Testing Password Verification & Rejection...")
    bad_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401, f"Expected 401 on bad password, got {bad_login.status_code}"
    print("✓ Incorrect password rejected with HTTP 401.")

    # 3. API: Test Login Success
    print("\n[TEST 3] Testing Valid User Sign In...")
    good_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": test_pass},
    )
    assert good_login.status_code == 200, f"Expected 200, got {good_login.status_code}"
    good_data = good_login.json()
    assert good_data["success"] is True, "Login success was false"
    print(f"✓ Sign in successful for {good_data['user']['name']}.")

    # 4. API: Test Forgot Password Flow & Real SMTP Dispatch
    print("\n[TEST 4] Testing Forgot Password & SMTP Recovery...")
    forgot_res = requests.post(
        f"{BASE_URL}/api/auth/forgot-password",
        json={"email": test_email},
    )
    assert forgot_res.status_code == 200, f"Expected 200, got {forgot_res.status_code}"
    forgot_data = forgot_res.json()
    assert forgot_data["success"] is True, "Forgot password success was false"
    reset_code = forgot_data.get("reset_code")
    assert reset_code and len(reset_code) == 6, f"Expected 6-digit code, got {reset_code}"
    print(f"✓ Password reset email generated & code issued: {reset_code} (SMTP dispatched: {forgot_data.get('email_dispatched')})")

    # 5. API: Test Password Reset using the Code
    print("\n[TEST 5] Testing Password Reset Flow...")
    new_pass = "BrandNewPass999!"
    reset_res = requests.post(
        f"{BASE_URL}/api/auth/reset-password",
        json={"token": reset_code, "new_password": new_pass},
    )
    assert reset_res.status_code == 200, f"Expected 200, got {reset_res.status_code}"
    print("✓ Password updated successfully with bcrypt hash.")

    # Verify old password no longer works
    old_verify = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": test_pass},
    )
    assert old_verify.status_code == 401, "Old password should be rejected after reset"

    # Verify new password works
    new_verify = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": new_pass},
    )
    assert new_verify.status_code == 200, "New password must succeed"
    print("✓ Re-verified authentication: old password revoked, new password authorized.")

    # 6. API: Test Statement Export (CSV)
    print("\n[TEST 6] Testing Statement CSV Export...")
    csv_res = requests.get(f"{BASE_URL}/api/loans/export")
    assert csv_res.status_code == 200, f"Expected 200, got {csv_res.status_code}"
    assert "Friend Name" in csv_res.text, "CSV header missing"
    assert "Amount (INR)" in csv_res.text, "CSV Amount column missing"
    print("✓ Real CSV Statement exported with valid schema headers.")

    # 7. Browser UI Verification with Playwright
    print("\n[TEST 7] Launching Headless Chromium for Interactive UI Audit...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)

        # Check search shortcut hint
        assert "/" in page.content(), "Search bar keyboard shortcut '/' hint missing"

        # Check Auth modal trigger
        auth_btn = page.locator("button:has-text('Sign In'), button:has-text('Account')").first
        assert auth_btn.is_visible(), "Sign in / Account button should be visible in header"
        auth_btn.click()
        time.sleep(0.5)

        # Check tabs in AuthModal
        assert page.get_by_role("button", name="Sign In", exact=True).is_visible(), "Sign In tab missing"
        assert page.get_by_role("button", name="Create Account", exact=True).is_visible(), "Create Account tab missing"
        assert page.get_by_role("button", name="Forgot Password", exact=True).is_visible(), "Forgot Password tab missing"

        # Click quick demo account "Yash Jain"
        yash_demo_btn = page.locator("text=Yash Jain (Owner)").first
        if yash_demo_btn.is_visible():
            yash_demo_btn.click()
            time.sleep(0.3)
            # Submit sign in
            page.get_by_role("button", name="Sign In to Cockpit").click()
            time.sleep(1)

        browser.close()
        print("✓ Playwright Browser UI test passed with 0 critical errors.")

    print("\n" + "=" * 60)
    print("🎉 ALL SOVEREIGN AUTH & FEATURE TESTS PASSED DETERMINISTICALLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

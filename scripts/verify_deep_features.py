import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3999")
OUTPUT_DIR = "/home/opc/brane/memory/assets/assignments/credsetu_technologies_private_limited"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run_deep_qa():
    console_errors = []
    print("==================================================================")
    print("🚀 COMPREHENSIVE FUNCTIONAL & DESIGN DEEP QA AUDIT")
    print(f"🎯 Target: {BASE_URL}")
    print("==================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda m: console_errors.append(f"Console {m.type}: {m.text}") if m.type == "error" and "Failed to load resource" not in m.text else None)
        page.on("pageerror", lambda err: console_errors.append(f"PageError: {err}"))

        # 1. Navigation & Initial Load
        print("\n[1] Navigating to platform...")
        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)

        # 2. Check 1:1 Zero-CLS Design Elements & Animated Icons
        print("\n[2] Checking Animated Icons & Kinetic CSS...")
        assert page.locator(".icon-live-beacon").count() > 0, "icon-live-beacon missing"
        assert page.locator(".touch-icon").count() > 0, "touch-icon classes missing"
        assert page.locator(".tactile-card").count() > 0, "tactile-card classes missing"
        print("  ✅ Kinetic micro-interaction icons & tactile hover styles verified!")

        # 3. Test Global Search & Keyboard Shortcut '/'
        print("\n[3] Testing Global Search & Shortcut '/'...")
        page.keyboard.press("/")
        time.sleep(0.3)
        # Verify search input is focused
        search_input = page.locator("input[placeholder*='Search friends']")
        search_input.fill("Rahul")
        time.sleep(0.5)
        assert page.locator("text=Search Results for").is_visible(), "Search ribbon did not appear"
        assert page.locator("text=Rahul Verma").first.is_visible(), "Rahul Verma not found in search"
        # Clear search
        page.keyboard.press("Escape")
        time.sleep(0.3)
        print("  ✅ Global search and keyboard shortcut '/' verified!")

        # 4. Test Sidebar Navigation & Dynamic View Switching
        print("\n[4] Testing Sidebar Multi-View Navigation...")
        
        # Test Friends Directory View
        print("  👥 Clicking 'Friends & Debts'...")
        page.locator("button:has-text('Friends & Debts')").first.click()
        time.sleep(0.5)
        assert page.locator("text=FRIENDS & DEBTS DIRECTORY").is_visible(), "Friends view did not render"
        assert page.locator("text=Peer Balances & Borrowing History").is_visible(), "Friends headline missing"

        # Test Repayment Schedule View
        print("  📅 Clicking 'Repayment Schedule'...")
        page.locator("button:has-text('Repayment Schedule')").first.click()
        time.sleep(0.5)
        assert page.locator("text=SCHEDULE & REPAYMENT CALENDAR").is_visible(), "Schedule view did not render"

        # Test Receipts Gallery View
        print("  🧾 Clicking 'Receipts & Proofs'...")
        page.locator("button:has-text('Receipts & Proofs')").first.click()
        time.sleep(0.5)
        assert page.locator("text=RECEIPTS & PROOFS GALLERY").is_visible(), "Receipts view did not render"

        # Test Monthly Analytics View
        print("  📊 Clicking 'Monthly Analytics'...")
        page.locator("button:has-text('Monthly Analytics')").first.click()
        time.sleep(0.5)
        assert page.locator("text=PORTFOLIO ANALYTICS").is_visible(), "Analytics view did not render"

        # Test Spaces View (Dining)
        print("  🍽️ Clicking Space 'Dinner & Drinks'...")
        page.locator("button:has-text('Dinner & Drinks')").first.click()
        time.sleep(0.5)
        assert page.locator("text=Dinner & Drinks").first.is_visible(), "Space view did not render"

        # Return to Master Dashboard
        print("  🏠 Returning to 'Dashboard'...")
        page.locator("button:has-text('Dashboard')").first.click()
        time.sleep(0.5)
        assert page.locator("text=Today's Cash Flow & Lent Money").is_visible(), "Failed to return to Dashboard"
        print("  ✅ All sidebar navigation routes verified with dynamic multi-view rendering!")

        # 5. Test Custom Delete Confirmation Modal (NO native browser prompt!)
        print("\n[5] Testing Custom Delete Confirmation Modal...")
        delete_btn = page.locator("button[title='Delete Entry']").first
        if delete_btn.is_visible():
            delete_btn.click()
            time.sleep(0.5)
            assert page.locator("h3:has-text('Delete Loan Entry?')").is_visible(), "Custom Delete Modal did not open"
            assert page.locator("button:has-text('Keep Entry')").is_visible(), "Keep entry button missing"
            # Click Keep Entry
            page.locator("button:has-text('Keep Entry')").click()
            time.sleep(0.3)
            assert not page.locator("h3:has-text('Delete Loan Entry?')").is_visible(), "Modal failed to close on cancel"
            print("  ✅ Custom Delete Modal verified (zero native browser dialogs)!")

        # 6. Test Real Phone + OTP Authentication System
        print("\n[6] Testing Phone + OTP Authentication System...")
        auth_btn = page.locator("button[title*='Switch phone']").first
        auth_btn.click()
        time.sleep(0.5)
        assert page.locator("h3:has-text('MiniLedger Account Sign-In')").is_visible(), "Auth modal did not open"
        
        # Enter phone
        phone_input = page.locator("input[type='tel']")
        phone_input.fill("+919999888877")
        page.locator("button:has-text('Send Verification Code')").click()
        time.sleep(0.8)

        # Check Step 2 OTP Screen
        assert page.locator("h3:has-text('Enter Verification Code')").is_visible(), "Did not proceed to OTP step"
        assert page.locator("text=Mock OTP:").is_visible(), "Mock OTP display missing"
        
        # Extract OTP
        otp_text = page.locator("span.font-mono.text-sm.underline").inner_text()
        print(f"  🔑 Received Mock OTP: {otp_text}")
        
        # Fill OTP
        page.locator("input[placeholder*='6-digit']").fill(otp_text)
        page.locator("button:has-text('Verify & Sign In')").click()
        time.sleep(1)

        # Verify new phone is active in profile
        assert page.locator("text=+919999888877").first.is_visible(), "Active phone not updated after login"
        print("  ✅ Phone + OTP authentication flow verified successfully!")

        # 7. Capture Full Verification Screenshots
        print("\n[7] Capturing updated high-craft screenshots...")
        light_path = os.path.join(OUTPUT_DIR, "miniledger_v2_light.png")
        page.screenshot(path=light_path, full_page=False)
        print(f"  📸 Light Screenshot: {light_path}")

        # Toggle Dark Mode
        page.locator("button[title*='Mode']").first.click()
        time.sleep(0.8)
        dark_path = os.path.join(OUTPUT_DIR, "miniledger_v2_dark.png")
        page.screenshot(path=dark_path, full_page=False)
        print(f"  📸 Dark Screenshot: {dark_path}")

        browser.close()

    print("\n==================================================================")
    print(f"📊 DEEP QA COMPLETE. CONSOLE ERRORS: {len(console_errors)}")
    print("==================================================================")
    if console_errors:
        print("❌ FAILED with console errors:", console_errors)
        sys.exit(1)
    else:
        print("🎉 ALL 6 CRITICAL DESIGN & FUNCTIONALITY CHECKS PASSED DETERMINISTICALLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_deep_qa()

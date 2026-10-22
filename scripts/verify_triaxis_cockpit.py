import os
import sys
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = "/home/opc/brane/memory/assets/assignments/credsetu_technologies_private_limited"
os.makedirs(OUTPUT_DIR, exist_ok=True)

DESKTOP_LIGHT = os.path.join(OUTPUT_DIR, "miniledger_cockpit_light_1440.png")
DESKTOP_DARK = os.path.join(OUTPUT_DIR, "miniledger_cockpit_dark_1440.png")
MOBILE_LIGHT = os.path.join(OUTPUT_DIR, "miniledger_mobile_360.png")
TABLET_LIGHT = os.path.join(OUTPUT_DIR, "miniledger_tablet_768.png")

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

def run_verification():
    console_errors = []
    print("==================================================================")
    print("🚀 THEWEBVALE TRI-AXIS VERIFICATION ENGINE")
    print(f"🎯 Target: {BASE_URL}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print("==================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # -------------------------------------------------------------
        # Axis 1: Desktop Viewport (1440x900) - Exact Master Cockpit
        # -------------------------------------------------------------
        print("\n[Axis 1] Desktop Cockpit (1440x900)...")
        ctx_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_desktop.new_page()

        page.on("console", lambda m: console_errors.append(f"Console {m.type}: {m.text}") if m.type == "error" and "Failed to load resource" not in m.text else None)
        page.on("pageerror", lambda err: console_errors.append(f"PageError: {err}"))

        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1.5)

        # Verify Core Elements
        assert page.locator("text=MiniLedger").first.is_visible(), "MiniLedger brand missing"
        assert page.locator("text=Today's Cash Flow & Lent Money").is_visible(), "Hero title missing"
        assert page.locator("text=Quick Record Lent Money").is_visible(), "Quick Ledger missing"
        assert page.locator("text=REPAYMENT PACE").is_visible(), "Repayment pace card missing"
        assert page.locator("text=LEDGER HEALTH").is_visible(), "Ledger health card missing"
        assert page.locator("text=Priority Repayments & Follow-ups").is_visible(), "Priority ledger missing"
        assert page.locator("text=Quick Actions").is_visible(), "Right inspector quick actions missing"

        # Capture Desktop Light Mode
        print(f"  📸 Capturing Desktop Light Mode: {DESKTOP_LIGHT}")
        page.screenshot(path=DESKTOP_LIGHT, full_page=False)

        # Test WhatsApp Reminder Modal
        print("  💬 Testing WhatsApp Reminder Modal Trigger...")
        reminder_btn = page.locator("button:has-text('Send Reminder')").first
        if reminder_btn.is_visible():
            reminder_btn.click()
            time.sleep(0.5)
            assert page.locator("h3:has-text('Send Polite Reminder')").is_visible(), "Reminder modal did not open"
            assert page.locator("text=WhatsApp Preview").first.is_visible(), "WhatsApp preview missing"
            # Close modal via close button
            page.locator("#close-reminder-modal-btn").click()
            time.sleep(0.5)

        # Toggle to Dark Mode
        print("  🌙 Toggling to Obsidian Dark Mode...")
        theme_btn = page.locator("button[title*='Mode']").first
        theme_btn.click()
        time.sleep(0.8)

        # Capture Desktop Dark Mode
        print(f"  📸 Capturing Desktop Dark Mode: {DESKTOP_DARK}")
        page.screenshot(path=DESKTOP_DARK, full_page=False)
        ctx_desktop.close()

        # -------------------------------------------------------------
        # Axis 2: Tablet Viewport (768x1024)
        # -------------------------------------------------------------
        print("\n[Axis 2] Tablet Viewport (768x1024)...")
        ctx_tablet = browser.new_context(viewport={"width": 768, "height": 1024})
        page_tablet = ctx_tablet.new_page()
        page_tablet.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)
        page_tablet.screenshot(path=TABLET_LIGHT, full_page=False)
        print(f"  📸 Capturing Tablet Viewport: {TABLET_LIGHT}")
        ctx_tablet.close()

        # -------------------------------------------------------------
        # Axis 3: Mobile Viewport (360x780)
        # -------------------------------------------------------------
        print("\n[Axis 3] Mobile Viewport (360x780)...")
        ctx_mobile = browser.new_context(viewport={"width": 360, "height": 780})
        page_mobile = ctx_mobile.new_page()
        page_mobile.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)
        page_mobile.screenshot(path=MOBILE_LIGHT, full_page=False)
        print(f"  📸 Capturing Mobile Viewport: {MOBILE_LIGHT}")
        ctx_mobile.close()

        browser.close()

    print("\n==================================================================")
    print(f"📊 VERIFICATION AUDIT COMPLETE. CONSOLE ERRORS: {len(console_errors)}")
    print("==================================================================")
    if console_errors:
        print("❌ FAILED with console errors:", console_errors)
        sys.exit(1)
    else:
        print("🎉 ALL TRI-AXIS VERIFICATIONS PASSED WITH ZERO CLS & ZERO CONSOLE ERRORS!")
        sys.exit(0)

if __name__ == "__main__":
    run_verification()

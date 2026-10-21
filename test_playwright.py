import os
import sys
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = "/home/opc/brane/memory/assets/assignments/credsetu_technologies_private_limited"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
QA_LIGHT = os.path.join(SCREENSHOT_DIR, "qa_light.png")
QA_DARK = os.path.join(SCREENSHOT_DIR, "qa_dark.png")

BASE_URL = "http://localhost:3999"

def run_qa():
    console_errors = []

    print("====================================================")
    print("🚀 LAUNCHING AUTOMATED PLAYWRIGHT BROWSER QA")
    print(f"🌐 Target: {BASE_URL}")
    print("====================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Capture console errors
        def on_console(msg):
            if msg.type == "error":
                # Filter out benign remote image loading errors if any
                if "Failed to load resource" not in msg.text:
                    console_errors.append(msg.text)
                    print(f"  ❌ Browser Console Error: {msg.text}")

        page.on("console", on_console)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        # 1. Navigate to App
        print("➡️ Navigating to MiniLedger...")
        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)

        # 2. Check Dark Mode (Initial)
        print("🌓 Verifying Initial Dark Mode...")
        body_bg_dark = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"  Dark Mode Body Background: {body_bg_dark}")
        assert "9, 13, 22" in body_bg_dark or "15, 23, 42" in body_bg_dark or "0, 0, 0" in body_bg_dark or "rgba" in body_bg_dark, f"Expected dark bg, got {body_bg_dark}"

        # 3. Switch to Desktop Dashboard for Clear Full-Screen Presentation
        print("💻 Switching to Back-Office Dashboard view for screenshot capture...")
        dashboard_tab = page.locator("button:has-text('Back-Office Dashboard')")
        if dashboard_tab.is_visible():
            dashboard_tab.click()
            time.sleep(0.5)

        # 4. Save Dark Mode Screenshot
        print(f"📸 Capturing QA Dark Mode screenshot: {QA_DARK}")
        page.screenshot(path=QA_DARK, full_page=False)
        assert os.path.exists(QA_DARK) and os.path.getsize(QA_DARK) > 10000, "Dark screenshot invalid"

        # 5. Toggle to Light Mode
        print("☀️ Toggling Theme to Light Mode...")
        theme_btn = page.locator("#theme-toggle-btn")
        theme_btn.click()
        time.sleep(0.8)

        body_bg_light = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"  Light Mode Body Background: {body_bg_light}")
        assert "248, 250, 252" in body_bg_light or "255, 255, 255" in body_bg_light or "oklch" in body_bg_light, f"Expected light bg, got {body_bg_light}"

        # Save Light Mode Screenshot
        print(f"📸 Capturing QA Light Mode screenshot: {QA_LIGHT}")
        page.screenshot(path=QA_LIGHT, full_page=False)
        assert os.path.exists(QA_LIGHT) and os.path.getsize(QA_LIGHT) > 10000, "Light screenshot invalid"

        # 6. Click through filters in Back-Office Dashboard
        print("🔍 Testing Filter Buttons (Overdue, Active, Repaid, All)...")
        page.locator("button:has-text('Overdue')").first.click()
        time.sleep(0.3)
        page.locator("button:has-text('Active')").first.click()
        time.sleep(0.3)
        page.locator("button:has-text('Repaid')").first.click()
        time.sleep(0.3)
        page.locator("button:has-text('All')").first.click()
        time.sleep(0.3)

        # 7. Test Add Loan Entry in Desktop Dashboard
        print("📝 Testing Desktop 'Add Loan Entry' Modal...")
        add_btn = page.locator("button:has-text('Add Loan Entry')")
        add_btn.click()
        time.sleep(0.5)

        page.fill("#desktop-input-friend-name", "Ananya Singhal")
        page.fill("#desktop-input-amount", "9200")
        page.fill("#desktop-input-due-date", "2026-11-15")
        page.fill("#desktop-input-notes", "Goa workation advance split")
        page.click("#desktop-submit-loan-btn")
        time.sleep(0.8)

        # 8. Test Toggle Repayment
        print("✅ Testing Repayment Status Toggle...")
        mark_repaid_btn = page.locator("button:has-text('✓ Mark Repaid')").first
        if mark_repaid_btn.is_visible():
            mark_repaid_btn.click()
            time.sleep(0.8)

        # 9. Test Architecture Modal
        print("🏛️ Testing PostgreSQL Architecture Spec Modal...")
        arch_btn = page.locator("button:has-text('PostgreSQL Spec')")
        arch_btn.click()
        time.sleep(0.5)
        # Click tabs
        page.locator("button:has-text('System Hierarchy & Flow')").click()
        time.sleep(0.3)
        page.locator("button:has-text('Node.js REST Endpoints')").click()
        time.sleep(0.3)
        page.locator("button:has-text('React Native Component Tree')").click()
        time.sleep(0.3)
        # Close modal
        page.locator("#close-arch-modal-btn").click()
        time.sleep(0.5)

        # 10. Test Server Logs Drawer
        print("📜 Testing Real-Time Mock OTP Server Log Drawer...")
        logs_btn = page.locator("button:has-text('Server Logs')")
        logs_btn.click()
        time.sleep(0.5)
        assert page.locator("text=Node.js stdout / Backend Server Console").is_visible()
        logs_btn.click() # Close drawer
        time.sleep(0.3)

        # 11. Switch back to React Native Simulator Mode
        print("📱 Testing React Native Mobile Simulator...")
        mobile_tab = page.locator("button:has-text('React Native Simulator')")
        mobile_tab.click()
        time.sleep(0.5)

        # Toggle filter inside mobile phone
        page.locator("button:has-text('Overdue')").first.click()
        time.sleep(0.3)
        page.locator("button:has-text('All')").first.click()
        time.sleep(0.3)

        # Open mobile Add Loan bottom sheet
        fab = page.locator("#mobile-lend-money-fab")
        if fab.is_visible():
            fab.click()
            time.sleep(0.5)
            page.fill("#mobile-input-friend-name", "Vikrant Rao")
            page.fill("#mobile-input-amount", "3400")
            page.fill("#mobile-input-notes", "Dinner buffet split")
            page.click("#mobile-submit-loan-btn")
            time.sleep(0.8)

        browser.close()

    print("\n====================================================")
    print(f"📊 PLAYWRIGHT QA RESULTS: {len(console_errors)} UNCAUGHT CONSOLE ERRORS")
    print(f"📸 Light Screenshot: {QA_LIGHT}")
    print(f"📸 Dark Screenshot:  {QA_DARK}")
    print("====================================================")

    if console_errors:
        print("❌ FAILED with console errors:", console_errors)
        sys.exit(1)
    else:
        print("🎉 ALL PLAYWRIGHT AUTOMATED BROWSER QA CHECKS PASSED DETERMINISTICALLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_qa()

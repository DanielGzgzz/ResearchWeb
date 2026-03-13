from playwright.sync_api import sync_playwright

def test_geon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local server
        page.goto("http://localhost:8000")

        # Wait a bit for landing screen to load
        page.wait_for_timeout(1000)

        # Screenshot Landing Screen
        page.screenshot(path="/home/jules/verification/landing.png")

        # Click enter
        page.click("text=Enter Simulation")

        # Wait for transition
        page.wait_for_timeout(2000)

        # Screenshot the main UI and tooltip
        page.screenshot(path="/home/jules/verification/ui_tour.png")

        browser.close()

if __name__ == "__main__":
    test_geon()

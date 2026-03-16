from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 800, "height": 800}) # Square ratio close to image

        # Go to local server
        page.goto('http://localhost:8000')

        # Wait for WebGL to render
        time.sleep(3)

        # Take screenshot
        page.screenshot(path='/home/jules/verification/grid.png')
        print("Screenshot saved to /home/jules/verification/grid.png")

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('/home/jules/verification', exist_ok=True)
    take_screenshot()

from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type} {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        page.goto("http://localhost:8000")
        page.wait_for_timeout(3000)
        browser.close()

run()

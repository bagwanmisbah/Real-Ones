import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# --- CONFIGURATION UPDATE ---
TARGET_URL = "http://localhost:5173"

options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    print("--- RUNNING TELEPORT BOT (React Version) ---")
    driver.get(TARGET_URL)
    time.sleep(2)

    # 1. INSTANT FILL (Using querySelector since we have no IDs)
    print("Teleporting text into inputs...")
    driver.execute_script("""
        document.querySelector("input[placeholder='Enter Name as per Aadhaar']").value = 'Teleport Bot';
        document.querySelector("input[placeholder='XXXX XXXX XXXX']").value = '1234 5678 9012';
    """)
    
    # 2. INSTANT CLICK (No Mouse Move)
    print("Clicking button via JS...")
    driver.execute_script("""
        document.querySelector("button[type='submit']").click();
    """)

    # 3. VERDICT
    time.sleep(2)
    print("\nCHECK YOUR APP.PY TERMINAL NOW! Should be 100% BOT")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    time.sleep(5)
    driver.quit()
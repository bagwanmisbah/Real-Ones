import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# CONFIG
FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
TARGET_URL = f"file:///{FILE_PATH}"

options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    print("--- RUNNING TELEPORT BOT ---")
    driver.get(TARGET_URL)
    time.sleep(1)

    # 1. INSTANT FILL
    print("Teleporting text into inputs...")
    driver.execute_script("document.getElementById('aadhar').value = '123456789012';")
    driver.execute_script("document.getElementById('otp').value = '123456';")
    
    # 2. INSTANT CLICK (No Mouse Move)
    print("Clicking button via JS...")
    driver.execute_script("document.getElementById('loginBtn').click();")

    # 3. VERDICT
    time.sleep(2)
    print("\nCHECK YOUR APP.PY TERMINAL NOW!")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    time.sleep(5)
    driver.quit()
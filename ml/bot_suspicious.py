# Created to test Fallback Captcha Route
# This file is created to simulate a situation where the bot types the input fields slowly, but still moves in a linear fashion
# This helps achives confidence in the suspicious threshold (30-70)

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# TARGET_URL = "http://localhost:5173"
TARGET_URL = "http://localhost:5173"

options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def force_mouse_event(driver, x, y):
    """Visualizes the bot's path"""
    driver.execute_script(f"""
        var evt = new MouseEvent('mousemove', {{
            clientX: {x},
            clientY: {y},
            bubbles: true
        }});
        document.dispatchEvent(evt);
        
        var dot = document.getElementById('bot_ghost_cursor');
        if(!dot) {{
            dot = document.createElement('div');
            dot.id = 'bot_ghost_cursor';
            dot.style.cssText = 'position:fixed;width:15px;height:15px;background:orange;border-radius:50%;z-index:9999;pointer-events:none;';
            document.body.appendChild(dot);
        }}
        dot.style.left = '{x}px';
        dot.style.top = '{y}px';
    """)

def slow_type(element, text):
    """
    HUMAN TRAIT: Types slowly with random delays.
    This lowers the 'Bot Confidence' score significantly.
    """
    for char in text:
        element.send_keys(char)
        # Sleep between 50ms and 150ms (Very Human)
        time.sleep(random.uniform(0.05, 0.15))

try:
    print("--- RUNNING SUSPICIOUS BOT (The Hybrid) ---")
    print("Strategy: Human Typing + Bot Movement = Confused Model")
    
    driver.get(TARGET_URL)
    time.sleep(2)

    # 1. FIND ELEMENTS
    name_input = driver.find_element(By.XPATH, "//input[@placeholder='Enter Name as per Aadhaar']")
    aadhar_input = driver.find_element(By.XPATH, "//input[@placeholder='XXXX XXXX XXXX']")
    btn = driver.find_element(By.XPATH, "//button[@type='submit']")

    # 2. HUMAN BEHAVIOR: Slow Typing
    print("Typing slowly (Human signal)...")
    slow_type(name_input, "Suspicious Guy")
    slow_type(aadhar_input, "111122223333")

    # 3. BOT BEHAVIOR: Perfect Straight Line Movement
    print("Moving mouse perfectly straight (Bot signal)...")
    
    start_rect = aadhar_input.rect
    end_rect = btn.rect
    
    start_x = start_rect['x'] + 20
    start_y = start_rect['y'] + 20
    end_x = end_rect['x'] + 50
    end_y = end_rect['y'] + 20

    steps = 40
    for i in range(steps + 1):
        t = i / steps
        # Linear Interpolation (Perfect Line)
        curr_x = start_x + (end_x - start_x) * t
        curr_y = start_y + (end_y - start_y) * t
        
        force_mouse_event(driver, curr_x, curr_y)
        
        # Constant speed (Bot signal)
        time.sleep(0.02)

    # 4. Click
    btn.click()
    
    print("\n--- TEST COMPLETE ---")
    print("Look at the Popup: It should be YELLOW (Suspicious)")
    print("Because typing was Human (0%) but Path was Bot (100%)")
    
    time.sleep(10) # Keep open to see the redirect

except Exception as e:
    print(f"Error: {e}")
finally:
    driver.quit()
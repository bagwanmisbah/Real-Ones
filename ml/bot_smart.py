import time
import os
import math
import random
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

def force_mouse_event(driver, x, y):
    driver.execute_script(f"""
        var evt = new MouseEvent('mousemove', {{ clientX: {x}, clientY: {y}, bubbles: true }});
        document.dispatchEvent(evt);
        var dot = document.getElementById('bot_ghost_cursor');
        if(!dot) {{
            dot = document.createElement('div');
            dot.id = 'bot_ghost_cursor';
            dot.style.cssText = 'position:fixed;width:15px;height:15px;background:blue;border-radius:50%;z-index:9999;pointer-events:none;';
            document.body.appendChild(dot);
        }}
        dot.style.left = '{x}px';
        dot.style.top = '{y}px';
    """)

try:
    print("--- RUNNING SMART BOT (MIMIC) ---")
    driver.get(TARGET_URL)
    time.sleep(1)

    driver.find_element(By.ID, "aadhar").send_keys("123456789012")
    driver.find_element(By.ID, "otp").send_keys("123456")

    start_el = driver.find_element(By.ID, "otp")
    end_el = driver.find_element(By.ID, "loginBtn")
    
    start_x = start_el.rect['x']
    start_y = start_el.rect['y']
    end_x = end_el.rect['x']
    end_y = end_el.rect['y']
    
    print("Mimicking Human Path...")
    
    # 3. EXECUTE CURVED PATH WITH NOISE
    steps = 80
    for i in range(steps + 1):
        t = i / steps
        
        # Add a Curve (Sine wave)
        curve_offset = 50 * math.sin(t * math.pi) 
        
        # Linear Base
        base_x = start_x + (end_x - start_x) * t
        base_y = start_y + (end_y - start_y) * t
        
        # Add Curve + Random Jitter (The "Human" Shake)
        curr_x = base_x + (random.uniform(-2, 2)) 
        curr_y = base_y + curve_offset + (random.uniform(-2, 2))
        
        force_mouse_event(driver, curr_x, curr_y)
        time.sleep(0.02) # Slow human speed

    end_el.click()
    
    time.sleep(2)
    print("\nCHECK YOUR APP.PY TERMINAL!")

except Exception as e:
    import math # Import here just in case
    print(f"Error: {e}")
finally:
    time.sleep(5)
    driver.quit()
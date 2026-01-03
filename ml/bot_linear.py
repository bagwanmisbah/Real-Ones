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

def force_mouse_event(driver, x, y):
    """Forces the browser to believe the mouse is here"""
    driver.execute_script(f"""
        var evt = new MouseEvent('mousemove', {{
            clientX: {x},
            clientY: {y},
            bubbles: true
        }});
        document.dispatchEvent(evt);
        
        // Move the visual red dot too
        var dot = document.getElementById('bot_ghost_cursor');
        if(!dot) {{
            dot = document.createElement('div');
            dot.id = 'bot_ghost_cursor';
            dot.style.cssText = 'position:fixed;width:15px;height:15px;background:red;border-radius:50%;z-index:9999;pointer-events:none;';
            document.body.appendChild(dot);
        }}
        dot.style.left = '{x}px';
        dot.style.top = '{y}px';
    """)

try:
    print("--- RUNNING LINEAR BOT ---")
    driver.get(TARGET_URL)
    time.sleep(1)

    # 1. Fill Inputs
    driver.find_element(By.ID, "aadhar").send_keys("123456789012")
    driver.find_element(By.ID, "otp").send_keys("123456")

    # 2. Calculate Perfect Line
    start_el = driver.find_element(By.ID, "otp")
    end_el = driver.find_element(By.ID, "loginBtn")
    
    start_rect = start_el.rect
    end_rect = end_el.rect
    
    start_x = start_rect['x'] + 10
    start_y = start_rect['y'] + 10
    end_x = end_rect['x'] + 50
    end_y = end_rect['y'] + 20
    
    print("Sliding in a perfect line...")
    
    # 3. EXECUTE SLIDE (50 Steps)
    steps = 50
    for i in range(steps + 1):
        t = i / steps
        # Linear Interpolation (The Math of a Robot)
        curr_x = start_x + (end_x - start_x) * t
        curr_y = start_y + (end_y - start_y) * t
        
        force_mouse_event(driver, curr_x, curr_y)
        time.sleep(0.01) # 10ms delay (Fast but detectable)

    # 4. Click
    end_el.click()
    
    time.sleep(2)
    print("\nCHECK YOUR APP.PY TERMINAL! Look for 'Efficiency: 1.0'")

except Exception as e:
    print(f"Error: {e}")
finally:
    time.sleep(5)
    driver.quit()
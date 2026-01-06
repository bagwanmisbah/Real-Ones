import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# --- CONFIGURATION UPDATE ---
# TARGET_URL = "http://localhost:5173"  # Standard Vite Port
TARGET_URL = "http://localhost:5173" 

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
    print("--- RUNNING LINEAR BOT (React Version) ---")
    driver.get(TARGET_URL)
    time.sleep(2) # Wait for React to load

    # 1. Fill Inputs (Using XPath because React code has no IDs)
    # Field 1: Name
    driver.find_element(By.XPATH, "//input[@placeholder='Enter Name as per Aadhaar']").send_keys("Bot User")
    
    # Field 2: Aadhar (The code will auto-format this)
    driver.find_element(By.XPATH, "//input[@placeholder='XXXX XXXX XXXX']").send_keys("123456789012")

    # 2. Calculate Perfect Line
    # We move from the Aadhar Input (closest to button) to the Button
    start_el = driver.find_element(By.XPATH, "//input[@placeholder='XXXX XXXX XXXX']")
    end_el = driver.find_element(By.XPATH, "//button[@type='submit']")
    
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
        time.sleep(0.01) # 10ms delay

    # 4. Click
    end_el.click()
    
    time.sleep(5)
    print("\nCHECK YOUR APP.PY TERMINAL! Look for 'Efficiency: 1.0'")

except Exception as e:
    print(f"Error: {e}")
finally:
    time.sleep(2)
    driver.quit()
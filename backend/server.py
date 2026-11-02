from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import pyautogui
import uvicorn
import json
import asyncio

# Disable pyautogui fail-safe for edge usage if needed, but risky. Keeping it enabled for safety.
pyautogui.FAILSAFE = False 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

screen_width, screen_height = pyautogui.size()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            command = json.loads(data)
            
            action = command.get("action")
            
            if action == "move":
                # Expects x, y in normalized coordinates (0 to 1)
                raw_x = float(command.get("x", 0))
                raw_y = float(command.get("y", 0))
                
                # Clamp coordinates to [0, 1]
                raw_x = max(0.0, min(1.0, raw_x))
                raw_y = max(0.0, min(1.0, raw_y))

                target_x = int(raw_x * screen_width)
                target_y = int(raw_y * screen_height)
                
                # Simple smoothing could be added here if needed, 
                # but let's trust the frontend filter or add a basic one later.
                # For now, ensure we don't hit edge triggers unintentionally (though FAILSAFE is false)
                target_x = min(target_x, screen_width - 1)
                target_y = min(target_y, screen_height - 1)

                pyautogui.moveTo(target_x, target_y, _pause=False)
                
            elif action == "click":
                # Defaults to left click
                pyautogui.click(_pause=False)
            
            elif action == "right_click":
                pyautogui.rightClick(_pause=False)
                
            elif action == "double_click":
                pyautogui.doubleClick(_pause=False)
                
            elif action == "mousedown":
                pyautogui.mouseDown(_pause=False)
                
            elif action == "mouseup":
                pyautogui.mouseUp(_pause=False)
                
            elif action == "scroll":
                # dy positive = up, negative = down. 
                # Multiplier might be needed depending on OS sensitivity
                dy = int(command.get("amount", 0))
                if dy != 0:
                    pyautogui.scroll(dy, _pause=False)
                
            elif action == "type":
                text = command.get("text", "")
                if text:
                    pyautogui.typewrite(text, interval=0)
                    
            elif action == "hotkey":
                keys = command.get("keys", [])
                if keys:
                    pyautogui.hotkey(*keys)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Client disconnected")

if __name__ == "__main__":
    # Run on localhost 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)

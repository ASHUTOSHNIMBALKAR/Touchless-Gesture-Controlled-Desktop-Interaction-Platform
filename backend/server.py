from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import pyautogui, uvicorn, json

pyautogui.FAILSAFE = True
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
screen_width, screen_height = pyautogui.size()

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            command = __import__('json').loads(data)
            action = command.get('action')
            if action == 'move':
                x = float(command.get('x', 0)) * screen_width
                y = float(command.get('y', 0)) * screen_height
                pyautogui.moveTo(int(x), int(y), _pause=False)
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)

import os
import sys
import uvicorn

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("Starting Kafedra Monitoring Axborot Tizimi Backend Server...")
    print("API Documentation available at: http://127.0.0.1:8000/api/v1/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

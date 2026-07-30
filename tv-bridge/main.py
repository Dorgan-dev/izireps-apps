import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import remote
from config import config

app = FastAPI(title="izireps TV Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(remote.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    config.init_app()
    uvicorn.run(
        "main:app", 
        host=config.HOST, 
        port=config.PORT, 
        reload=False
    )

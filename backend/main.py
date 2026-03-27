from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import requests, clusters

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Afet Koordinasyon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(requests.router)
app.include_router(clusters.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Afet Koordinasyon API çalışıyor"}

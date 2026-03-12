from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Afet Koordinasyon API çalışıyor"}

@app.post("/talep-gonder", response_model=schemas.AfetzedeTalepResponse)
def create_talep(talep: schemas.AfetzedeTalepCreate, db: Session = Depends(get_db)):
    db_talep = models.AfetzedeTalep(**talep.dict())
    db.add(db_talep)
    db.commit()
    db.refresh(db_talep)
    return db_talep

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from adapters.factory import get_adapter
from services.ip_resolver import resolver
from config import config

router = APIRouter()

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != config.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

class TvRequest(BaseModel):
    mac: str
    brand: str
    key: str = None
    action: str = None

def get_tv_adapter(mac: str, brand: str):
    ip = resolver.resolve(mac)
    if not ip:
        raise HTTPException(status_code=404, detail="TV IP not found in network. Ensure TV is connected.")
    try:
        return get_adapter(brand, mac, ip)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/send-key")
async def send_key(req: TvRequest, _: None = Depends(verify_api_key)):
    if not req.key:
        raise HTTPException(status_code=400, detail="Key is required")
        
    adapter = get_tv_adapter(req.mac, req.brand)
    try:
        return adapter.send_key(req.key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send key: {e}")

@router.post("/power")
async def power(req: TvRequest, _: None = Depends(verify_api_key)):
    if not req.action:
        raise HTTPException(status_code=400, detail="Action (ON/OFF) is required")
        
    adapter = get_tv_adapter(req.mac, req.brand)
    try:
        if req.action.upper() == "ON":
            return adapter.power_on()
        elif req.action.upper() == "OFF":
            return adapter.power_off()
        else:
            raise HTTPException(status_code=400, detail="Action must be ON or OFF")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to change power: {e}")

@router.get("/status/{brand}/{mac}")
async def status(brand: str, mac: str, _: None = Depends(verify_api_key)):
    adapter = get_tv_adapter(mac, brand)
    try:
        return adapter.get_status()
    except Exception as e:
        return {"online": False, "error": str(e)}

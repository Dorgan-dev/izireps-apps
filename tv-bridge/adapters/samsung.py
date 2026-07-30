import os
import time
from samsungtvws import SamsungTVWS
from wakeonlan import send_magic_packet
from config import config
from adapters.base import BaseTvAdapter

class SamsungAdapter(BaseTvAdapter):
    def __init__(self, mac: str, ip: str):
        self.mac = mac
        self.ip = ip
        self.token_file = os.path.join(config.TOKENS_DIR, f"{mac.replace(':', '_')}.token")
        # Port 8002 = port yang sama digunakan oleh samsungtv CLI (terenkripsi TLS)
        self.tv = SamsungTVWS(host=self.ip, port=8002, token_file=self.token_file, name="SamsungTvRemoteCli")

    def power_on(self):
        # Gunakan Wake-on-LAN karena TV mati tidak merespons WebSocket
        send_magic_packet(self.mac)
        return {"status": "ok", "message": "WoL packet sent"}

    def power_off(self):
        self.send_key("KEY_POWER")
        return {"status": "ok", "message": "Power off command sent"}

    def send_key(self, key: str):
        # Buka koneksi, jika popup belum diterima TV akan raise exception di sini
        self.tv.open()
        # Kirim perintah
        try:
            self.tv.send_key(key)
        except AttributeError:
            # Fallback untuk versi library lama
            self.tv.remote.control(key)
        return {"status": "ok", "message": f"Key {key} sent"}
    
    def get_status(self) -> dict:
        try:
            info = self.tv.rest_device_info()
            if info:
                return {"online": True, "info": info}
            return {"online": False}
        except Exception:
            return {"online": False}
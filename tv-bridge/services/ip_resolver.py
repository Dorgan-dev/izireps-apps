import subprocess
import time

class IpResolver:
    """Resolve MAC address ke IP menggunakan ARP table OS."""
    
    def __init__(self, cache_ttl=300):
        self._cache = {}  # {mac: (ip, timestamp)}
        self._ttl = cache_ttl
    
    def resolve(self, mac_address: str) -> str | None:
        if not mac_address:
            return None
            
        mac_address = mac_address.lower()
        
        # 1. Cek cache
        if mac_address in self._cache:
            ip, ts = self._cache[mac_address]
            if time.time() - ts < self._ttl:
                return ip
        
        # 2. Baca ARP table dari OS
        try:
            # Command works on Linux/Armbian
            result = subprocess.run(['ip', 'neigh'], capture_output=True, text=True, timeout=5)
            for line in result.stdout.splitlines():
                if mac_address in line.lower():
                    ip = line.split()[0]
                    self._cache[mac_address] = (ip, time.time())
                    return ip
        except Exception as e:
            print(f"Error reading ARP table (Linux): {e}")

        # 3. Fallback untuk Windows (jika testing di local Windows)
        try:
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=5)
            for line in result.stdout.splitlines():
                if mac_address.replace(':', '-') in line.lower():
                    parts = line.split()
                    if len(parts) >= 2:
                        ip = parts[0]
                        self._cache[mac_address] = (ip, time.time())
                        return ip
        except Exception as e:
            print(f"Error reading ARP table (Windows): {e}")

        # 4. (Optional) Ping subnet to refresh ARP table could go here
        
        return None

# Singleton instance
resolver = IpResolver()

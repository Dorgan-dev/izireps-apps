from abc import ABC, abstractmethod

class BaseTvAdapter(ABC):
    """Interface yang WAJIB diimplementasi setiap brand adapter."""
    
    @abstractmethod
    def power_on(self): ...
    
    @abstractmethod
    def power_off(self): ...
    
    @abstractmethod  
    def send_key(self, key: str): ...
    
    @abstractmethod
    def get_status(self) -> dict: ...

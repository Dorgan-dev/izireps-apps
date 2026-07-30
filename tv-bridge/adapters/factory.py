from adapters.samsung import SamsungAdapter

def get_adapter(brand: str, mac: str, ip: str):
    brand = brand.lower()
    if "samsung" in brand:
        return SamsungAdapter(mac, ip)
    # Future brands can be added here
    # elif brand == "lg":
    #     return LgAdapter(mac, ip)
    else:
        raise ValueError(f"Brand {brand} is not supported yet")

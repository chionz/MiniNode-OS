from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from mnemonic import Mnemonic
from cryptography.fernet import Fernet
import secrets
import os
from typing import Optional
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins
from web3 import Web3  # optional but recommended for checksum address

wallet = APIRouter(prefix="/wallet", tags=["Authentication"])

# --- WARNING: Key management ---
# In production, store this key in a KMS (AWS KMS, GCP KMS, Azure Key Vault) or HSM.
# Do NOT hardcode in source. This example uses an env var for demonstration.
FERNET_KEY = os.environ.get("FERNET_KEY")  # base64 urlsafe key, e.g. Fernet.generate_key().decode()
if not FERNET_KEY:
    # For local dev only. In production this must come from secure key store.
    FERNET_KEY = Fernet.generate_key().decode()
fernet = Fernet(FERNET_KEY.encode())

mnemo = Mnemonic("english")


class GenerateRequest(BaseModel):
    strength_bits: Optional[int] = 128  # 128 -> 12 words, 256 -> 24 words
    passphrase: Optional[str] = ""      # optional BIP39 passphrase (user input)
    index: int = Field(0, ge=0, description="Address index (derivation child index)")


class GenerateResponse(BaseModel):
    mnemonic: str            # the phrase (show once)
    seed_hex: str            # hex of seed derived from mnemonic + passphrase
    evm_address: str     # the derived EVM (Ethereum) address
    index: int
    mnemonic_id: str         # server-side id for optional encrypted storage (if used)


# In-memory store ONLY for demo. Replace with persistent DB in production.
# If you store, only store encrypted_blob — never plaintext mnemonic.
encrypted_store = {}

@wallet.post("/generate", response_model=GenerateResponse)
def generate_mnemonic(req: GenerateRequest):
    # Validate strength
    if req.strength_bits not in (128, 160, 192, 224, 256):
        raise HTTPException(status_code=400, detail="Invalid strength. Use 128..256 in 32 increments.")

    # Generate mnemonic (BIP-39)
    mnemonic = mnemo.generate(strength=req.strength_bits)

    # Convert to seed (binary) using passphrase (BIP-39 to seed)
    seed_bytes = mnemo.to_seed(mnemonic, passphrase=req.passphrase)
    seed_hex = seed_bytes.hex()

    # Create encrypted blob for optional storage (if you must store server-side)
    # Blob contains mnemonic and passphrase (encrypted)
    payload = {
        "mnemonic": mnemonic,
        "passphrase": req.passphrase
    }
    # Serialize safely — here we join with a separator; in prod use JSON + authenticated encryption
    blob = f"{mnemonic}||{req.passphrase}".encode()
    encrypted = fernet.encrypt(blob)  # returns bytes

    # Store encrypted blob in DB (demo uses in-memory dict)
    # IMPORTANT: if you store, access controls must be strict; prefer not to store.
    mnemonic_id = secrets.token_urlsafe(16)
    encrypted_store[mnemonic_id] = encrypted

    # Derive Ethereum (BIP44 coin 60) first address or index provided
    bip44_ctx = Bip44.FromSeed(seed_bytes, Bip44Coins.ETHEREUM)
    addr_ctx = bip44_ctx.Purpose().Coin().Account(0).Change(0).AddressIndex(req.index)
    address = addr_ctx.PublicKey().ToAddress()  # returns standard hex address (lowercase)

    # Convert to EIP-55 checksum address for nicer display
    try:
        checksum_address = Web3.toChecksumAddress(address)
    except Exception:
        checksum_address = address

    # IMPORTANT: Do not log mnemonic or seed in real apps
    return GenerateResponse(mnemonic=mnemonic, 
                            seed_hex=seed_hex, 
                            mnemonic_id=mnemonic_id,
                            evm_address=checksum_address, 
                            index=req.index)
                            


@wallet.post("/reveal/{mnemonic_id}")
def reveal_mnemonic(mnemonic_id: str):
    """
    Demonstration only: decrypts and returns stored mnemonic.
    In production you will likely NEVER expose an endpoint like this.
    """
    encrypted = encrypted_store.get(mnemonic_id)
    if not encrypted:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        blob = fernet.decrypt(encrypted).decode()
        mnemonic, passphrase = blob.split("||", 1)
        return {"mnemonic": mnemonic, "passphrase": passphrase}
    except Exception:
        raise HTTPException(status_code=500, detail="Decryption failed")


WALLET_MNEMONIC="radar sight champion property clutch tower blush hobby moral public grant danger"


from bip_utils import (
    Bip39MnemonicGenerator,
    Bip39SeedGenerator,
    Bip44,
    Bip44Coins,
    Bip44Changes,
)

# Generate mnemonic
mnemonic = Bip39MnemonicGenerator().FromWordsNumber(12)
print("Mnemonic:", mnemonic)

# Create seed and master key
seed_bytes = Bip39SeedGenerator(WALLET_MNEMONIC).Generate()
bip44_master = Bip44.FromSeed(seed_bytes, Bip44Coins.ETHEREUM)

def derive_addresses(bip44_master, count=5, account_idx=0):
    addresses = []
    for i in range(count):
        addr = (
            bip44_master
            .Purpose()
            .Coin()
            .Account(account_idx)
            .Change(Bip44Changes.CHAIN_EXT)  # 👈 fixed line
            .AddressIndex(i)
        )
        addresses.append({
            "index": i,
            "path": f"m/44'/60'/{account_idx}'/0/{i}",
            "address": addr.PublicKey().ToAddress(),
        })
    return addresses

for a in derive_addresses(bip44_master):
    print(a)

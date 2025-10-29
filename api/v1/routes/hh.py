# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins
from web3 import Web3  # optional but recommended for checksum address

app = FastAPI(title="Mnemonic -> EVM Address")

mnemo = Mnemonic("english")

class GenerateReq(BaseModel):
    strength_bits: int = Field(128, description="128 -> 12 words, 256 -> 24 words")
    passphrase: str = Field("", description="Optional BIP39 passphrase")
    index: int = Field(0, ge=0, description="Address index (derivation child index)")

class GenerateResp(BaseModel):
    mnemonic: str        # show once (optional)
    evm_address: str     # the derived EVM (Ethereum) address
    index: int

@app.post("/generate", response_model=GenerateResp)
def generate_and_get_address(req: GenerateReq):
    # Validate strength
    if req.strength_bits not in (128, 160, 192, 224, 256):
        raise HTTPException(status_code=400, detail="Invalid strength. Use 128,160,192,224,256")

    # Generate mnemonic (BIP-39)
    mnemonic = mnemo.generate(strength=req.strength_bits)

    # Derive seed bytes (BIP-39 seed)
    seed = Bip39SeedGenerator(mnemonic).Generate(req.passphrase)

    # Derive Ethereum (BIP44 coin 60) first address or index provided
    bip44_ctx = Bip44.FromSeed(seed, Bip44Coins.ETHEREUM)
    addr_ctx = bip44_ctx.Purpose().Coin().Account(0).Change(0).AddressIndex(req.index)
    address = addr_ctx.PublicKey().ToAddress()  # returns standard hex address (lowercase)

    # Convert to EIP-55 checksum address for nicer display
    try:
        checksum_address = Web3.toChecksumAddress(address)
    except Exception:
        checksum_address = address

    # IMPORTANT: remove mnemonic from response in prod if you do not want the server to see/store it
    return GenerateResp(mnemonic=mnemonic, evm_address=checksum_address, index=req.index)


# Alternative safe endpoint: derive address from a mnemonic supplied by client (server never stores it)
class DeriveReq(BaseModel):
    mnemonic: str
    passphrase: str = ""
    index: int = 0

class DeriveResp(BaseModel):
    evm_address: str
    index: int

@app.post("/derive", response_model=DeriveResp)
def derive_address(req: DeriveReq):
    # Validate words roughly
    if not mnemo.check(req.mnemonic):
        raise HTTPException(status_code=400, detail="Invalid mnemonic")

    seed = Bip39SeedGenerator(req.mnemonic).Generate(req.passphrase)
    bip44_ctx = Bip44.FromSeed(seed, Bip44Coins.ETHEREUM)
    addr_ctx = bip44_ctx.Purpose().Coin().Account(0).Change(0).AddressIndex(req.index)
    address = addr_ctx.PublicKey().ToAddress()
    try:
        checksum_address = Web3.toChecksumAddress(address)
    except Exception:
        checksum_address = address
    return DeriveResp(evm_address=checksum_address, index=req.index)

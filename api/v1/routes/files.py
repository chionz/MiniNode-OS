from greenfield_sdk import Client

client = Client(
    chain_id=5600,  # testnet chain id
    grpc_endpoint="https://gnfd-testnet-fullnode-tendermint.bnbchain.org",
    private_key="YOUR_APP_PRIVATE_KEY"
)

# Create a bucket (only once per project)
bucket_name = "minios-files"
client.bucket.create(bucket_name)

""" files data models
"""

from sqlalchemy import Column, String, ForeignKey
from api.v1.models.base_model import BaseTableModel
from api.db.database import Base


class Files(BaseTableModel):
    __tablename__ = "files"

    owner_wallet = Column(
        String, ForeignKey("users.wallet_address"), unique=True, nullable=False
    )
    storage_provider = Column(String, nullable=True)
    storage_account = Column(String, nullable=True)
    bucket_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    status = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    file_size = Column(String, nullable=True)
    file_cid = Column(String, nullable=True)
    file_name = Column(String, nullable=False)

    
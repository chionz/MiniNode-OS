""" tracking data models
"""

from sqlalchemy import Column, String, Float
from api.v1.models.base_model import BaseTableModel
from api.db.database import Base


class Tracking(BaseTableModel):
    __tablename__ = "tracking"

    tracking_number = Column(String, unique=True, nullable=False)
    name_of_package = Column(String, nullable=False)
    delivery_destination = Column(String, nullable=False)
    dispatch_location = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    product_picture = Column(String, nullable=True)

    
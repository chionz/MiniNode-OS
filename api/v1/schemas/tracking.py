import re
from datetime import datetime
from typing import Optional, Union, List

from pydantic import BaseModel, EmailStr, field_validator, ConfigDict, Field


class TrackingBase(BaseModel):
    """Base schema for users"""
    
    tracking_number: str
    name_of_package: str
    delivery_destination: str
    dispatch_location: str
    price: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

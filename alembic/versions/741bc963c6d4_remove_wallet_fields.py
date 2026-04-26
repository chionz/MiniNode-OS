"""remove_wallet_fields

Revision ID: 741bc963c6d4
Revises: 7cf3ccb0c518
Create Date: 2026-04-27 00:33:14.665821

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '741bc963c6d4'
down_revision: Union[str, None] = '7cf3ccb0c518'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop wallet_address and nonce columns from users table
    op.drop_column('users', 'wallet_address')
    op.drop_column('users', 'nonce')


def downgrade() -> None:
    # Add back wallet_address and nonce columns to users table
    op.add_column('users', sa.Column('wallet_address', sa.String(), nullable=True))
    op.add_column('users', sa.Column('nonce', sa.String(), nullable=False))
    # Add unique constraint back if needed
    op.create_unique_constraint('uq_users_wallet_address', 'users', ['wallet_address'])

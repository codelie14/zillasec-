""""add_perimeter_affiliate_to_file_data"

Revision ID: 8f34f8cbd255
Revises: 13a331e4b3cb
Create Date: 2025-07-02 19:55:12.461456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f34f8cbd255'
down_revision: Union[str, Sequence[str], None] = '13a331e4b3cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('file_data', sa.Column('perimeter', sa.String(255), nullable=True))
    op.add_column('file_data', sa.Column('affiliate', sa.String(255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('file_data', 'affiliate')
    op.drop_column('file_data', 'perimeter')

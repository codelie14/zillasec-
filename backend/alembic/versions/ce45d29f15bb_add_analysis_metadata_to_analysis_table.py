""""add_analysis_metadata_to_analysis_table"

Revision ID: ce45d29f15bb
Revises: cc67bcaecca5
Create Date: 2025-07-16 21:20:45.250812

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce45d29f15bb'
down_revision: Union[str, Sequence[str], None] = 'cc67bcaecca5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('analyses', sa.Column('analysis_metadata', sa.JSON(), nullable=True))
    op.add_column('analyses', sa.Column('analysis_result', sa.JSON(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('analyses', 'analysis_result')
    op.drop_column('analyses', 'analysis_metadata')
    # ### end Alembic commands ###

""""create_gnocdata_table"

Revision ID: cc67bcaecca5
Revises: 8f34f8cbd255
Create Date: 2025-07-12 00:21:17.209846

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'cc67bcaecca5'
down_revision: Union[str, Sequence[str], None] = '8f34f8cbd255'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('gnocdata',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cuid', sa.String(length=10), nullable=False),
    sa.Column('id_huawei', sa.String(length=20), nullable=True),
    sa.Column('nom', sa.String(length=50), nullable=True),
    sa.Column('prenom', sa.String(length=50), nullable=True),
    sa.Column('mail_huawei', sa.String(length=100), nullable=True),
    sa.Column('mail_orange', sa.String(length=100), nullable=True),
    sa.Column('telephone', sa.String(length=20), nullable=True),
    sa.Column('perimeter', sa.String(length=20), nullable=True),
    sa.Column('affiliate', sa.String(length=10), nullable=True),
    sa.Column('statut', sa.String(length=10), nullable=True),
    sa.Column('cluster', sa.String(length=10), nullable=True),
    sa.Column('domaine', sa.String(length=20), nullable=True),
    sa.Column('plateforme', sa.String(length=20), nullable=True),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gnocdata_cuid'), 'gnocdata', ['cuid'], unique=True)
    op.create_index(op.f('ix_gnocdata_id'), 'gnocdata', ['id'], unique=False)
    op.drop_column('analyses', 'confidence')
    op.drop_column('analyses', 'risks')
    op.drop_column('analyses', 'anomalies')
    op.drop_column('analyses', 'risk_score')
    op.drop_column('analyses', 'summary')
    op.drop_column('analyses', 'recommendations')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('analyses', sa.Column('recommendations', mysql.LONGTEXT(charset='utf8mb4', collation='utf8mb4_bin'), nullable=True))
    op.add_column('analyses', sa.Column('summary', mysql.VARCHAR(length=255), nullable=True))
    op.add_column('analyses', sa.Column('risk_score', mysql.FLOAT(), nullable=True))
    op.add_column('analyses', sa.Column('anomalies', mysql.LONGTEXT(charset='utf8mb4', collation='utf8mb4_bin'), nullable=True))
    op.add_column('analyses', sa.Column('risks', mysql.LONGTEXT(charset='utf8mb4', collation='utf8mb4_bin'), nullable=True))
    op.add_column('analyses', sa.Column('confidence', mysql.FLOAT(), nullable=True))
    op.drop_index(op.f('ix_gnocdata_id'), table_name='gnocdata')
    op.drop_index(op.f('ix_gnocdata_cuid'), table_name='gnocdata')
    op.drop_table('gnocdata')
    # ### end Alembic commands ###

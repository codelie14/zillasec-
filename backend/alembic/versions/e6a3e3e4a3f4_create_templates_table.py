"""Create templates table

Revision ID: e6a3e3e4a3f4
Revises: 6697fc79e0a0
Create Date: 2024-07-01 00:36:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6a3e3e4a3f4'
down_revision = '6697fc79e0a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('templates',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(255), nullable=True),
    sa.Column('description', sa.String(255), nullable=True),
    sa.Column('category', sa.String(255), nullable=True),
    sa.Column('type', sa.String(255), nullable=True),
    sa.Column('content', sa.String(255), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('last_used', sa.DateTime(), nullable=True),
    sa.Column('usage_count', sa.Integer(), nullable=True),
    sa.Column('is_default', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_templates_id'), 'templates', ['id'], unique=False)
    op.create_index(op.f('ix_templates_name'), 'templates', ['name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_templates_name'), table_name='templates')
    op.drop_index(op.f('ix_templates_id'), table_name='templates')
    op.drop_table('templates')
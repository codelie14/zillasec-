"""Create conversations table

Revision ID: d3a5b6c7e8f9
Revises: e6a3e3e4a3f4
Create Date: 2024-07-01 00:48:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd3a5b6c7e8f9'
down_revision = 'e6a3e3e4a3f4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('conversations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('question', sa.String(), nullable=True),
    sa.Column('answer', sa.String(), nullable=True),
    sa.Column('context', sa.String(), nullable=True),
    sa.Column('file_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
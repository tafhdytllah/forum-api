exports.up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    comment_id: { type: 'VARCHAR(50)', notNull: true, references: 'comments(id)', onDelete: 'CASCADE' },
    is_deleted: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: "TEXT", notNull: true},
    updated_at: { type: "TEXT", notNull: true},
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_comment_likes');
};
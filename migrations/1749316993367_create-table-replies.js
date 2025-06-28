exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    comment_id: { type: 'VARCHAR(50)', notNull: true, references: 'comments(id)', onDelete: 'CASCADE' },
    content: { type: 'TEXT', notNull: true },
    date: { type: 'TEXT', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE', },
    is_deleted: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: "TEXT", notNull: true},
    updated_at: { type: "TEXT", notNull: true},
  });
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    thread_id: { type: 'VARCHAR(50)', notNull: true, references: 'threads(id)', onDelete: 'CASCADE' },
    content: { type: 'TEXT', notNull: true },
    date: { type: 'TEXT', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE', },
    is_deleted: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: "TEXT", notNull: true},
    updated_at: { type: "TEXT", notNull: true},
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
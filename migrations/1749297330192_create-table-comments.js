exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    thread_id: { type: 'VARCHAR(50)', notNull: true, references: 'threads(id)', onDelete: 'CASCADE' },
    content: { type: 'TEXT', notNull: true },
    date: { type: 'TIMESTAMP', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE', },
    is_deleted: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: "TIMESTAMP", notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
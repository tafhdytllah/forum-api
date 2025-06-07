exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    body: { type: 'TEXT', notNull: true },
    date: { type: 'TIMESTAMP', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: { type: "TIMESTAMP", notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: "TIMESTAMP", notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('threads');
};
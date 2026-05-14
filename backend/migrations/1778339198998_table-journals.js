/* eslint-disable camelcase */
export const up = (pgm) => {
  pgm.createTable('journals', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
      notNull: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(30)',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('journals');
};

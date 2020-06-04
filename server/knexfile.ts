import path from 'path';

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'src', 'Database', 'database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'Database', 'Migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'Database', 'Seeds')
    },
    useNullAsDefault: true
};
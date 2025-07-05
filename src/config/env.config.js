
const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    db: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
    }
}

export default config
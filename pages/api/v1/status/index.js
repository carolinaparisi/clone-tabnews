import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseName = process.env.POSTGRES_DB;
  const usedConn = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
    values: [databaseName],
  });
  const maxConn = await database.query(`SHOW max_connections;`);
  const databaseVers = await database.query(`SHOW server_version;`);

  const usedConnections = usedConn.rows[0].count;
  const maxConnections = maxConn.rows[0].max_connections;
  const databaseVersion = databaseVers.rows[0].server_version;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: parseInt(maxConnections),
        opened_connections: usedConnections,
      },
    },
  });
}

export default status;

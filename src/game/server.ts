import { createPostgresTableStore, type TableStore } from "./table-store";

let tableStore: TableStore | undefined;

export function getTableStore(): TableStore {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured before tables can be hosted");
  }

  tableStore ??= createPostgresTableStore(databaseUrl);
  return tableStore;
}

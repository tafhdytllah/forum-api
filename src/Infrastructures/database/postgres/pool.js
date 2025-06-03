/* istanbul ignore file */
import { Pool } from "pg";
import { config } from "../../../Commons/config";

export const pool = new Pool(config.database);


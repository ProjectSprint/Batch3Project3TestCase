import { Config } from "./config.js";

export type Scenario<K, T> = (
	config: Config,
	tags: Record<string, string>,
	info: K,
) => T;
export type Scenarios = Record<string, Scenario<T>>;

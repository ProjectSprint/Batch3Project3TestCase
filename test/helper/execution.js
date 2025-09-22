import { sleep } from "k6";
/**
 * @template {any[]} A
 * @template R
 * @param {(...args: A) => R} fn - function to run
 * @param {A} args - arguments to pass into fn
 * @param {number} count - how many times to run
 * @param {number} sleepSec - how much sleep each run
 * @returns {R[]} array of fn results
 */
export function runMultiplier(fn, args, count, sleepSec) {
	const results = [];
	for (let i = 0; i < count; i++) {
		results.push(fn.apply(null, args));
		if (sleepSec) sleep(sleepSec);
	}
	return results;
}

/**
 * @template {any[]} A
 * @template R
 * @param {(...args: A) => R} fn - function to run
 * @param {A} args - arguments to pass into fn
 * @param {number} weight - probability (0 to 1) of running
 * @returns {R | null} result of fn or null if not run
 */
export function runWeighted(fn, args, weight) {
	if (Math.random() < weight) {
		return fn.apply(null, args);
	}
	return null;
}

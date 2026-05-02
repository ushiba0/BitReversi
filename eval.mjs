import {
	import_weight,
} from "./bitreversi/pkg/bitreversi.js";


/// Fetches and loads the evaluation weight data into the application.
///
/// This function performs the following operations:
/// 1. Fetches the weight data file (`weight_data.txt`).
/// 2. Converts the response into a text string.
/// 3. Invokes import_weight() to initialize the weights in memory.
export const loadWeightData = async () => {
	const path_to_weight_data = "./weight_data.txt";
	console.time("FETCH_WEIGHT_DATA");
	const response = await fetch(path_to_weight_data);
	if (!response.ok) {
		throw `Failed to fetch ${path_to_weight_data}`;
	}
	console.timeEnd("FETCH_WEIGHT_DATA");

	console.time("LOAD_WEIGHT_DATA");
	const weight_data_str = await response.text();

	import_weight(weight_data_str);
	console.timeEnd("LOAD_WEIGHT_DATA");
};

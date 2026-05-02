import { 
	export_weight_data_wrapper,
	load_weight_data_wrapper,
	} from "./bitreversi-wasm/pkg/bitreversi_wasm.js";


export const loadWeightData = async () => {
	const path_to_eval_data = "./eval_data.bin";
	const response = await fetch(path_to_eval_data);
	if(!response.ok) {
		throw `Failed to load ${path_to_eval_data}`;
	}
	const blob = await response.blob();
	const str = await blob.text();
	console.debug("Fetched weight data.");
	load_weight_data_wrapper(str);
	console.debug("Loaded weight data.");
};


export const exportWeightDataAsBlob = () => {
	const data_str = export_weight_data_wrapper();
	const blob = new Blob([data_str]);
	return blob;
};


window.exportweight = () =>{
	return exportWeightDataAsBlob();
};
window.loadweight = () =>{
	return loadWeightData();
};
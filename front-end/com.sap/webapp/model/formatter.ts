export default {
	formatValue: (value: string) => {
		return value?.toUpperCase();
	},
	formatDate : (value : string) => {
		const date = new Date(value);
		const year = date.getFullYear()
		const month = String(date.getMonth()+1).padStart(2,"0");
		const dt = String(date.getDate()).padStart(2,"0");
		return `${year}-${month}-${dt}`;
	}
};

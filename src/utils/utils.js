export default {
	hexDecode: (hex) => {
		let str = '';
		for (let n = 0; n < hex.length; n += 2) {
			str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
		}
		return str;
	},

	convertRealmResultsToArray: (results) => {
		let array=[];

		Object.keys(results).forEach((key)=> {
			console.log('result: ', results[key]);
			array.push(results[key]);
		});

		return array;
	}
}
import fs from 'react-native-fs';
import moment from 'moment';

import { FILE_SAVE_PATH } from '../constants';

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
	},

	writeToFile: (jsonObject, file_tag) => {
		if (!file_tag) file_tag ='file';
		
		let filename = moment(jsonObject.time).format('YYYY-MM-DD-HH') + '_' + file_tag + '.txt';
		let dirpath = fs.ExternalDirectoryPath + FILE_SAVE_PATH;
		let filepath = dirpath + filename;
		console.log(filepath);
		let writeString = JSON.stringify(jsonObject) + '\r\n';
		console.log(writeString);

		fs.mkdir(dirpath);
		fs.exists(filepath)
			.then((exists)=> {
				if (exists) {
					fs.appendFile(filepath, writeString)
						.then(()=> {
							console.log('success appending');
						})
						.catch((err)=>{
							console.log('failure: ', err);
						});					
				}
				else {
						fs.writeFile(filepath, writeString)
							.then(()=> {
								console.log('success writing');
							})
							.catch((err)=>{
								console.log('failure: ', err);
							});		
				}
			});
	}
}
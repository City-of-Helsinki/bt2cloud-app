import fs from 'react-native-fs';
import moment from 'moment';
import { zip } from 'react-native-zip-archive';
import FetchBlob from 'react-native-fetch-blob';

import { 
	FILE_SENT_SAVE_PATH,
	FILE_UNSENT_SAVE_PATH,
} from '../constants';

export default {
	hexDecode: (hex) => {
		let str = '';
		for (let n = 0; n < hex.length; n += 2) {
			str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
		}
		return str;
	},

	byteToText: (byteArray) => {
		let str='';
		byteArray.forEach((byte)=> {
			str += String.fromCharCode(byte);
		});		

		return str;
	},

	convertRealmResultsToArray: (results) => {
		let array=[];

		Object.keys(results).forEach((key)=> {
			array.push(results[key]);
		});

		return array;
	},

	writeToFile: (jsonObject, file_tag) => {
		if (!file_tag) file_tag ='file';
		
		let filename = moment(jsonObject.time).format('YYYY-MM-DD-HH') + '_' + file_tag + '.txt';
		let dirpath = fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH;
		let filepath = dirpath + filename;
		let writeString = JSON.stringify(jsonObject) + '\r\n';

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
	},

	createZip: () => {
		return new Promise((resolve, reject) => {
			let filename = moment(new Date()).format('YYYY-MM-DD-HH_mm_ss') + '.zip';
			let sourcePath = fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH;
			let targetPath = fs.ExternalDirectoryPath + '/' + filename;
			zip(sourcePath, targetPath)
				.then((path) => {
					let data = {filename, path}
					resolve(data);
				})
				.catch((err) => {
					reject(err);
				});
		});
	},

	httpRequest: (request) => {
		return new Promise((resolve, reject) => {
			let { type, url, headers, filename, path, metadata } = request;
			console.log(path);
			FetchBlob.fetch(type, url, headers, 
				[
					{ name: 'bt2cloud-logfile', filename: filename, type: 'archive/zip', data: FetchBlob.wrap(path)},
					{ name: 'metadata', data: JSON.stringify(metadata)},
				])
				.then((res) => {
					resolve(res.text());
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
}
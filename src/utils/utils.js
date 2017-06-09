import fs from 'react-native-fs';
import moment from 'moment';
import { zip } from 'react-native-zip-archive';
import FetchBlob from 'react-native-fetch-blob';
import { 
	FILE_SENT_SAVE_PATH,
	FILE_UNSENT_SAVE_PATH,
  FILESYSTEM_WRITING,
  FILESYSTEM_WRITING_DONE,	
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

	writeToFile: (store, jsonObject, file_tag) => {
		if (!file_tag) file_tag ='file';
		
		let filename = moment(jsonObject.time).format('YYYY-MM-DD-HH') + '_' + file_tag + '.txt';
		let dirpath = fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH;
		let filepath = dirpath + filename;
		let writeString = JSON.stringify(jsonObject) + '\r\n';

		fs.mkdir(dirpath)
			.then(()=>{
				fs.exists(filepath)
					.then((exists)=> {
						if (exists) {
							store.dispatch({type: FILESYSTEM_WRITING});
							fs.appendFile(filepath, writeString)
								.then(()=> {
									store.dispatch({type: FILESYSTEM_WRITING_DONE});
								})
								.catch((err)=>{
									store.dispatch({type: FILESYSTEM_WRITING_DONE});
									console.log('failure: ', err);
								});					
						}
						else {
							store.dispatch({type: FILESYSTEM_WRITING_DONE});
							fs.writeFile(filepath, writeString)
								.then(()=> {
									store.dispatch({type: FILESYSTEM_WRITING_DONE});
								})
								.catch((err)=>{
									store.dispatch({type: FILESYSTEM_WRITING_DONE});
									console.log('failure: ', err);
								});		
						}
					});
			});

	},

	createZip: (store) => {
		return new Promise((resolve, reject) => {
			let filename = moment(new Date()).format('YYYY-MM-DD-HH_mm_ss') + '.zip';
			let sourcePath = fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH;
			let targetPath = fs.ExternalDirectoryPath + '/' + filename;
			let waiting = false;
			while (store.getState().filesystem.writing) {
				if (!waiting) {
					waiting = true;
					console.log ('waiting for file write to finish...');
				}
			}
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

	getUnsentZips: () => {
		return new Promise((resolve, reject) => {
			fs.readdir(fs.ExternalDirectoryPath)
				.then((filenames)=> {
					resolve(filenames.filter(f=>f.substr(f.length-4) === '.zip').reverse());
				})
				.catch((err)=> {
					reject ([]);
				});			
		});
	},

	moveToSentFolder: (filename) => {
		return new Promise((resolve, reject) => {
			let sourcePath = fs.ExternalDirectoryPath + '/' + filename;
			console.log(sourcePath);
			let targetFolder = fs.ExternalDirectoryPath + FILE_SENT_SAVE_PATH;
			fs.mkdir(targetFolder)
				.then(()=>{
					let targetPath = targetFolder + filename;	
					FetchBlob.fs.mv(sourcePath, targetPath)
						.then(()=>{
							resolve();
						})
						.catch((err)=>{
							reject(err);
						});		
				});
						
		});
	},

	httpRequest: (request) => {
		return new Promise((resolve, reject) => {
			let { type, url, headers, filename, metadata } = request;
			let path = fs.ExternalDirectoryPath + '/' + filename;
			console.log(path);
			url = url.replace(/(^\w+:|^)\/\//, ''); // remove protocols if user entered them
			FetchBlob.fetch(type, url, headers, 
				[
					{ name: 'file', filename: filename, type: 'archive/zip', data: FetchBlob.wrap(path)},
					{ name: 'metadata', data: JSON.stringify(metadata)},
				])
				.then((res) =>{
					if (res.respInfo.status === 200 || res.respInfo.status === 201) resolve(res.text());
					else reject (res.text());
				})
				.catch((err) => {
					reject(err);
				});
		});
	},

	deleteUnsentFolder: () => {
		fs.readdir(fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH)
			.then((filenames)=>{
				filenames.forEach(f=>{
					FetchBlob.fs.unlink(fs.ExternalDirectoryPath + FILE_UNSENT_SAVE_PATH + '/' + f);
				});
			});
	}
}
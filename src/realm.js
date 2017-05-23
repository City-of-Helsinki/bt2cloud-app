import Realm from 'realm';

const DeviceSchema = {
	name: 'Device',
	primaryKey: 'id',
	properties: {
		name: {type: 'string', optional: true},
		id: 'string',
		favorite: {type: 'bool', default: false},
	}
};

const DataSchema = {
	name: 'Data',
	properties: {
		deviceID: 'string',
		service: 'string',
		characteristic: 'string',
		hex: 'string',
		ascii: 'string',
		time: 'date',
	}
};

const SettingsSchema = {
	name: 'Settings',
	primaryKey: 'name',
	properties: {
		name: 'string',
		flushToDiskInterval: {type: 'int', default: 50},
		saveGPSInterval: {type: 'int', default: 30},
	},
};

let realm = new Realm({
	schema: [DeviceSchema, DataSchema, SettingsSchema],
});

realm.write(()=>{
	realm.create('Settings', {
		name: 'settings',
	}, true);
});

export default realm;
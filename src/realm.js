import Realm from 'realm';

const DeviceSchema = {
	name: 'Device',
	primaryKey: 'id',
	properties: {
		name: {type: 'string', optional: true},
		id: 'string',
		favorite: {type: 'bool', default: false},
		autoConnect: {type: 'bool', default: false},
		autoNotify: {type: 'bool', default: false},
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

const BackendSchema = {
	name: 'Backend',
	primaryKey: 'name',
	properties: {
		name: 'string',
		protocol: 'string',
		url: 'string',
	},
};

const SettingsSchema = {
	name: 'Settings',
	primaryKey: 'name',
	properties: {
		name: 'string',
		flushToDiskInterval: {type: 'int', default: 50},
		saveGPSInterval: {type: 'int', default: 30},
		activeBackend: {type: 'Backend', optional: true},	
	},
};

// schemaVersion 1 added autoConnect/autoNotify to DeviceSchema
// schemaVersion 2 added BackendSchema
// schemaVersion 3 added activeBackend to SettingsSchema

let realm = new Realm({
	schema: [DeviceSchema, DataSchema, SettingsSchema, BackendSchema],
	schemaVersion: 3,
});

realm.write(()=>{
	realm.create('Settings', {
		name: 'settings',
	}, true);
});

export default realm;
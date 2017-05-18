import Realm from 'realm';

const DeviceSchema = {
	name: 'Device',
	primaryKey: 'id',
	properties: {
		name: 'string',
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

let realm = new Realm({schema: [DeviceSchema, DataSchema]});

export default realm;
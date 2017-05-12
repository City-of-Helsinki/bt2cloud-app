import bleReducer from '../src/reducers/bleReducer';
import * as types from '../src/constants';


describe('BLE_START reducer', () => {
	
	test('should return updated state with correct started and startError values', () => {			
		const initialState = {
			started: false,
			startError: null,
			otherValue: 'whatever'
		};

		expect(
			bleReducer(initialState, {type: types.BLE_START, started: true, error: null}))
				.toEqual({started: true, startError: null, otherValue: 'whatever'});
		expect(
			bleReducer(initialState, {type: types.BLE_START, started: false, error: 'error'}))
				.toEqual({started: false, startError: 'error', otherValue: 'whatever'});				
	});

});

describe('BLE_SCAN_START', () => {
	
	test('should return updated state with correct scanning and scanError values', () => {			
		const initialState = {
			scanning: 'whatever',
			scanError: 'whatever',
			otherValue: 'whatever',
		};

		expect(
			bleReducer(initialState, {type: types.BLE_SCAN_START, scanning: true, error: null}))
				.toEqual({scanning: true, scanError: null, otherValue: 'whatever'});
		expect(
			bleReducer(initialState, {type: types.BLE_SCAN_START, scanning: false, error: 'error'}))
				.toEqual({scanning: false, scanError: 'error', otherValue: 'whatever'});				
	});

});

describe('BLE_SCAN_ENDED', () => {
	
	test('should always return updated state with scanning: false', () => {			
		const initialState = {
			scanning: 'whatever',
			otherValue: 'whatever',
		};

		expect(
			bleReducer(initialState, {type: types.BLE_SCAN_ENDED}))
				.toEqual({scanning: false, otherValue: 'whatever'});			
	});

});

describe('BLE_UPDATE_AVAILABLE_PERIPHERALS', () => {
	
	test('should always return updated state with fresh array of peripherals', () => {			
		const initialState = {
			peripherals: 'whatever',
			otherValue: 'whatever',
		};

		expect(
			bleReducer(initialState, {type: types.BLE_UPDATE_AVAILABLE_PERIPHERALS, peripherals:[1,2,3]}))
				.toEqual({peripherals: [1,2,3], otherValue: 'whatever'});			
	});

});

describe('BLE_UPDATE_CONNECTED_PERIPHERALS', () => {
	
	test('should always return updated state with fresh array of connectedPeripherals', () => {			
		const initialState = {
			peripherals: 'whatever',
			connectedPeripherals: 'whatever',
			otherValue: 'whatever',
		};

		expect(
			bleReducer(initialState, {type: types.BLE_UPDATE_CONNECTED_PERIPHERALS, peripherals:[1,2,3]}))
				.toEqual({peripherals: 'whatever', connectedPeripherals: [1,2,3], otherValue: 'whatever'});			
	});
});

describe('BLE_UPDATE_PERIPHERALS_WITH_SERVICES', () => {
	
	test('should push peripheral to peripheralsWithServices ONLY IF its ID is not already there', () => {			
		const initialState = {
			peripheralsWithServices: [
				{name: 'foo', id: 'a1'}
			],
			connectError: 'whatever'
		};

		const newDevice = {name: 'bar', id: 'a2'}; 
		const oldDevice = {name: 'baz', id: 'a1'}; // id matches existing item in array

		// Connect Error should also always be set to null when successfully updated

		expect(
			bleReducer(initialState, {
				type: types.BLE_UPDATE_PERIPHERALS_WITH_SERVICES, 
				device: newDevice
			}))
				.toEqual({
					peripheralsWithServices: [
						{name: 'foo', id: 'a1'},
						{name: 'bar', id: 'a2'},
					],
					connectError: null
				});	

		expect(
			bleReducer(initialState, {
				type: types.BLE_UPDATE_PERIPHERALS_WITH_SERVICES, 
				device: oldDevice
			}))
				.toEqual({...initialState, connectError: null});
	});	

});
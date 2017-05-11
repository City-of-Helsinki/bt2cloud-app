import * as actions from '../src/actions/actions';
import * as types from '../src/constants';

describe('bleStartResult', () => {
	
	test('should create a BLE_START action with started=true when BLE manager starts up', () => {			
		const actionSuccess = {
			type: types.BLE_START,
			started: true,
			error: undefined
		};
		expect(actions.bleStartResult()).toEqual(actionSuccess);
	});
	
	test('should create a BLE_START action with started=false when BLE manager fails to start ', () => {			
		error = new Error('oops');
		const actionFailure = {
			type: types.BLE_START,
			started: false,
			error: error,
		}
		expect(actions.bleStartResult(error)).toEqual(actionFailure);
	});

});
import BackgroundJob from 'react-native-background-job';
import store from './store';

import { SETTINGS_SET_BACKGROUND_MODE } from './constants';

const backgroundJob = {
	jobKey: 'keepAlive',
	job: () => console.log('Running in background...'),
};
const backgroundSchedule = {
	jobKey: 'keepAlive',
	timeout: 100,
	persist: false,
	alwaysRunning: true,
	notificationTitle: 'BT2Cloud',
	notificationText: 'Background mode is on (disable from settings)',
};

export default {

	enable: () => {
		BackgroundJob.getAll({callback: jobs => {
			console.log('running jobs: ' + jobs.length);
			if (jobs.length === 0) {
				BackgroundJob.register(backgroundJob);
				BackgroundJob.schedule(backgroundSchedule);
				store.dispatch({type: SETTINGS_SET_BACKGROUND_MODE, on: true});			
			}
		}});
	},

	disable: () => {
		BackgroundJob.getAll({callback: jobs => {
			console.log('running jobs: ' + jobs.length);
			if (jobs.length !== 0) {
				BackgroundJob.cancel({jobKey: 'keepAlive'});
				store.dispatch({type: SETTINGS_SET_BACKGROUND_MODE, on: false});			
			}
		}});
	},
}

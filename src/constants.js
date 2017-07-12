
// ACTION NAMES

//BLE
export const BLE_START = 'BLE_START';
export const BLE_STARTING = 'BLE_STARTING';
export const BLE_SCAN_START = 'BLE_SCAN_START';
export const BLE_SCAN_STARTING = 'BLE_SCAN_STARTING';
export const BLE_SCAN_ENDED = 'BLE_SCAN_ENDED';

export const BLE_CONNECTING = 'BLE_CONNECTING';
export const BLE_CONNECT_ERROR = 'BLE_CONNECT_ERROR';

export const BLE_UPDATE_CONNECTED_PERIPHERALS = 'BLE_UPDATE_CONNECTED_PERIPHERALS';
export const BLE_UPDATE_AVAILABLE_PERIPHERALS = 'BLE_UPDATE_AVAILABLE_PERIPHERALS';
export const BLE_UPDATE_KNOWN_PERIPHERALS = 'BLE_UPDATE_KNOWN_PERIPHERALS';

export const BLE_READ = 'BLE_READ';
export const BLE_READ_ERROR = 'BLE_READ_ERROR';
export const BLE_APPEND_READ_HISTORY = 'BLE_APPEND_READ_HISTORY';

export const BLE_NOTIFY = 'BLE_NOTIFY';
export const BLE_NOTIFY_STOP = 'BLE_NOTIFY_STOP';
export const BLE_NOTIFY_STARTED = 'BLE_NOTIFY_STARTED';
export const BLE_NOTIFY_STOPPED = 'BLE_NOTIFY_STOPPED';
export const BLE_NOTIFY_ERROR = 'BLE_NOTIFY_ERROR';
export const BLE_AUTONOTIFY_STARTING = 'BLE_AUTONOTIFY_STARTING';
export const BLE_AUTONOTIFY_STARTED = 'BLE_AUTONOTIFY_STARTED';

export const BLE_FAVORITE_ADD = 'BLE_FAVORITE_ADD';
export const BLE_FAVORITE_REMOVE = 'BLE_FAVORITE_REMOVE';

//SETTINGS
export const SETTINGS_CHANGE_FLUSH_TO_DISK = 'SETTINGS_CHANGE_FLUSH_TO_DISK';
export const SETTINGS_CHANGE_GPS_INTERVAL = 'SETTINGS_CHANGE_GPS_INTERVAL';
export const SETTINGS_SET_DEVICE_INFO = 'SETTINGS_SET_DEVICE_INFO';
export const SETTINGS_REFRESH = 'SETTINGS_REFRESH';
export const SETTINGS_SET_BACKGROUND_MODE = 'SETTINGS_SET_BACKGROUND_MODE';

//FILESYSTEM OPERATIONS
export const FILESYSTEM_WRITING = 'FILESYSTEM_WRITING';
export const FILESYSTEM_WRITING_DONE = 'FILESYSTEM_WRITING_DONE';
export const FILESYSTEM_UPLOADING = 'FILESYSTEM_UPLOADING';
export const FILESYSTEM_UPLOADING_DONE = 'FILESYSTEM_UPLOADING_DONE';

// OTHER CONSTANTS
export const FILE_UNSENT_SAVE_PATH = '/unsent/';
export const FILE_SENT_SAVE_PATH = '/sent/';
export const FILE_TAG_DATA = 'data_log';
export const FILE_TAG_GPS = 'gps_log';
export const GPS_OPTIONS = {
	enableHighAccuracy: true,
	timeout: 50000,
	maximumAge: 0,
	distanceFilter: 1,
};
export const SECONDARY_LOCATION_OPTIONS = {
	enableHighAccuracy: false,
	timeout: 50000,
	maximumAge: 0,
};

// https://www.bluetooth.com/specifications/assigned-numbers/service-discovery
export const BLUETOOTH_BASE_UUID = '00000000-0000-1000-8000-00805F9B34FB';

// https://www.bluetooth.com/specifications/gatt/services
export const GATT_SERVICES = [
	{ uuid: '1811', description: 'Alert Notification Service' },
	{ uuid: '1815', description: 'Automation IO' },
	{ uuid: '180F', description: 'Battery Service' },
	{ uuid: '1810', description: 'Blood Pressure' },
	{ uuid: '181B', description: 'Body Composition' },
	{ uuid: '181E', description: 'Bond Management' },
	{ uuid: '181F', description: 'Continuous Glucose Monitoring' },
	{ uuid: '1805', description: 'Current Time Service' },
	{ uuid: '1818', description: 'Cycling Power' },
	{ uuid: '1816', description: 'Cycling Speed and Cadence' },
	{ uuid: '180A', description: 'Device Information' },
	{ uuid: '181A', description: 'Environmental Sensing' },
	{ uuid: '1826', description: 'Fitness Machine' },
	{ uuid: '1800', description: 'Generic Access' },
	{ uuid: '1801', description: 'Generic Attribute' },
	{ uuid: '1808', description: 'Glucose' },
	{ uuid: '1809', description: 'Health Thermometer' },
	{ uuid: '180D', description: 'Heart Rate' },
	{ uuid: '1823', description: 'HTTP Proxy' },
	{ uuid: '1812', description: 'Human Interface Device' },
	{ uuid: '1802', description: 'Immediate Alert' },
	{ uuid: '1821', description: 'Indoor Positioning' },
	{ uuid: '1820', description: 'Internet Protocol Support' },
	{ uuid: '1803', description: 'Link Loss' },
	{ uuid: '1819', description: 'Location and Navigation' },
	{ uuid: '1807', description: 'Next DST Change Service' },
	{ uuid: '1825', description: 'Object Transfer' },
	{ uuid: '180E', description: 'Phone Alert Status Service' },
	{ uuid: '1822', description: 'Pulse Oximeter' },
	{ uuid: '1806', description: 'Reference Time Update Service' },
	{ uuid: '1814', description: 'Running Speed and Cadence' },
	{ uuid: '1813', description: 'Scan Parameters' },
	{ uuid: '1824', description: 'Transport Discovery' },
	{ uuid: '1804', description: 'Tx Power' },
	{ uuid: '181C', description: 'User Data' },
	{ uuid: '181D', description: 'Weight Scale' },
];

const getVar = name => process.env[name] || ''

console.log(`
SENTRY_CONFIG='${getVar('SENTRY_CONFIG')}'
CLARIFAI_API_KEY='${getVar('CLARIFAI')}'
TEST_BGG_USR='${getVar('TEST_BGG_USR')}'
TEST_BGG_PWD='${getVar('TEST_BGG_PWD')}'
BETA_USERS='${getVar('BETA_USERS')}'
PREVIEW_ID='2'
PREVIEW_SHORT_NAME="Preview"
PREVIEW_MAP="no"
EVENT_ID="
`)

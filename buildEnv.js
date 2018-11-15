const getVar = name => process.env[name] || ''

console.log(`
SENTRY_CONFIG='${getVar('SENTRY_CONFIG')}'
CLARIFAI_API_KEY='${getVar('CLARIFAI')}'
TEST_BGG_USR='${getVar('TEST_BGG_USR')}'
TEST_BGG_PWD='${getVar('TEST_BGG_PWD')}'
`)

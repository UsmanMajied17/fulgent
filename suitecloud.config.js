const SuiteCloudJestUnitTestRunner = require('@oracle/suitecloud-unit-testing/services/SuiteCloudJestUnitTestRunner');
const fs = require('fs');

module.exports = {
	defaultProjectFolder: 'src',
	commands: {
		"project:deploy": {
      projectFolder: 'dist',
      async beforeExecuting(args) {
				// await SuiteCloudJestUnitTestRunner.run({
        //   // Jest configuration options.
        // });
      const dir = `${this.projectFolder}/Objects`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        console.log('Project Validation Started!');
        return args;
      },
		},
		"file:upload": {
      projectFolder: 'dist',
      async beforeExecuting(args) {
				// await SuiteCloudJestUnitTestRunner.run({
        //   // Jest configuration options.
        // });
      const dir = `${this.projectFolder}/Objects`;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        console.log('Project Validation Started!');
        return args;
      },
		},
	},
};

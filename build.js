const execSync = require("child_process").execSync;
execSync(`react-scripts build`);
execSync(`rm -Rf ./functions/build`);
execSync(`mkdir ./functions/build`);
execSync(`cp -r ./build/index.html ./functions/build/index.html`); // used by injectMeta

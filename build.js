const execSync = require("child_process").execSync;
execSync(`set NODE_OPTIONS=--openssl-legacy-provider && set HTTPS=true && react-app-rewired build`);
execSync(`rm -Rf ./functions/build`);
execSync(`mkdir ./functions/build`);
execSync(`cp -r ./build/index.html ./functions/build/index.html`); // used by injectMeta

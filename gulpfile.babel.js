import { src, dest, parallel, series, watch, lastRun, task } from 'gulp';
import babel from 'gulp-babel';
import zip from 'gulp-zip';
import debug from 'gulp-debug';
import header from 'gulp-header';
import del from 'del';
import minimist from 'minimist';

import { headerText, scripts, destZip } from './gulp/config';

var transpilationOptions = {
  string: 'mode',
  default: { mode: false }
};

var options = minimist(process.argv.slice(2), transpilationOptions);


// export const cleanBuild = () => del(scripts.src.cleanBuildFiles);
export const cleanBuild = () =>
  del([scripts.dest]);


/**
 * @function cleanDocFolder
 * @description Delete Unified Connector Documentation Directory.
 * @returns { boolean } Confirmation Directory is deleted.
 */
export const cleanDocFolder = () =>
  del([scripts.docPath]);

/**
 * Transpile ES6 files
 *
 * @param cb
 */
const transpileES6 = async (cb) => {
  console.log('transpilationOptions', options);
  if(options.mode === 'notranspile') {
    return copyJSFiles();
  } else {
    return src(scripts.src.js, { since: lastRun(transpileES6) })
    .pipe(debug({ title: 'Transpile ES6 to ES5' }))
    .pipe(
      babel({
        presets: [['@babel/preset-env', {
          modules: false, targets: {
            node: true
          }
        }]]
      }))
    .pipe(header(headerText))
    .pipe(dest(scripts.dest))
  }
};

const copyJSFiles = () =>
  src(scripts.src.js, { since: lastRun(copyJSFiles) }).pipe(dest(scripts.dest));

const copyObjectFiles = () =>
  src(scripts.src.xml, { since: lastRun(copyObjectFiles) }).pipe(dest(scripts.dest));

const copyJSONFiles = () =>
  src(scripts.src.json, { since: lastRun(copyJSONFiles) }).pipe(dest(scripts.dest));

const copyHTMLFiles = () =>
  src(scripts.src.html, { since: lastRun(copyHTMLFiles) }).pipe(dest(scripts.dest));

const copyCSSFile = () =>
  src(scripts.src.css, { since: lastRun(copyCSSFile) }).pipe(dest(scripts.dest));

  const copyImages = () =>
  src(scripts.src.images, { since: lastRun(copyImages) }).pipe(dest(scripts.dest));


export const audit = task('console.log(Project Started)')

/**
 * Create Dist zip
 */
export const createDistZip = () =>
  src(destZip.src, { since: lastRun(createDistZip) })
    .pipe(debug({ title: 'Create dist.zip' }))
    .pipe(zip(destZip.main))
    .pipe(dest(destZip.dest));

/**
 * Build
 */
const build = series(cleanBuild, parallel(transpileES6, copyObjectFiles, copyJSONFiles, copyHTMLFiles, copyCSSFile, copyImages));

/**
 * Build and create build zip
 */
export const buildZip = series(build);
// export const buildZip = deployProjToNetSuite;

export const buildDeploy = series(buildZip)
/**
 * Build and watch files incrementally
 */
const watchFiles = () => {
  build();
  watch(scripts.src.js, transpileES6);
  watch(scripts.src.objects, { ignoreInitial: false }, copyObjectFiles);
};

export { watchFiles as watch };

export default buildZip;

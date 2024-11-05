import { promises as fs } from "fs";
import { parseStringPromise } from "xml2js";
import { sourcePath } from "./config.js";


/**
 * Parse files path
 *
 * @param {*} files
 */
const parseFilesPath = (files) => {

  const [, fileCabinet = '', suiteScripts = ''] = files?.[0].path?.[0]?.split('/');
  return [fileCabinet, suiteScripts].join('/');

};

/**
 * Parse Suitecloud cli project file deploy.xml to get paths
 *
 * @param cb
 */
export const parseDeployXML = async (cb) => {
  try {
    const xml = await fs.readFile(`${sourcePath}/deploy.xml`);
    const { deploy: { files = [] } = {} } = await parseStringPromise(xml);
    return parseFilesPath(files);
  } catch (error) {
    cb(error);
  }

};


/**
 * Parse Suitecloud cli project file manifest.xml to get Project name
 *
 * @param cb
 */
export const parsemanifestXML = async (cb) => {
  try {
    const xml = await fs.readFile(`${sourcePath}/manifest.xml`);
    const { manifest: { projectname = [] } = {} } = await parseStringPromise(xml);
    if (projectname?.[0]) {
      return projectname[0];
    }
    throw new Error('projectname required in manifest.xml');


  } catch (error) {
    cb(error);
  }
};

/**
 * Generate project document path
 *
 * @param {*} cb
 */
export const generateProjectDeploumentPath = async (cb) => {
  try {
    const fileCabinetPath = await parseDeployXML(cb);
    const projectName = await parsemanifestXML(cb);
    return `${fileCabinetPath}/${projectName}/`;
  } catch (error) {
    cb(error);
  }
};

import { generateProjectDeploumentPath } from './ns_files_path_utils';

/**
 * Header intellectual property text for the all files
 */
export const headerText = [
  '/**',
  '* This code is the sole intellectual property of Dynamics Teck',
  '*/',
  '',
].join('\n');

/**
 * Source folder path
 */
export const baseUrl = '.';
export const sourcePath = `${baseUrl}/src/`;
export const sourcePathObjects = `${sourcePath}**/Objects`;
export const sourcePathInstallPreferences = `${sourcePath}**/InstallationPreferences`;
export const sourcePathTranslations = `${sourcePath}**/Translations`;
export const sourcePathWebsiteHosting = `${sourcePath}**/Web Site Hosting Files`;

/**
 * Destination folder path
 */
export const destinationPath = `${baseUrl}/dist/`;

/**
 * @function destinationPath
 * @description Construct dist zip path. Full destination path
 * @returns {string} zip destination path
 * @author Imran Khan
 */
export const destinationPathFull = async () => {
  return `${destinationPath}`;
};

/**
 * Scripts path
 */
export const scripts = {
  src: {
    js: [`${sourcePath}**/*.js`, `!${sourcePath}**/frontend/`],
    xml: [`${sourcePath}**/*.xml`],
    html: [`${sourcePath}**/*.html`],
    css: [`${sourcePath}**/*.css`],
    images: [`${sourcePath}**/*.png`,`${sourcePath}**/*.ico`],
    json: [`${sourcePath}**/*.json`],
    objects: [`${sourcePathObjects}**/*.xml`],
    installation_preferences: [`${sourcePathInstallPreferences}**/*.xml`],
    translations: [`${sourcePathTranslations}**/*`],
    website_hosting: [`${sourcePathWebsiteHosting}**/*`],
    cleanBuildFiles: [
      `${destinationPath}**/*.js`,
      `${destinationPath}**/*.xml`,
      `${destinationPath}**/*.zip`,
      `!${destinationPath}/project.json`,
    ],
  },
  dest: destinationPath,
};

/**
 * Dist zip path
 */
const destZipPath = destinationPath;

/**
 * Dist zip
 */
export const destZip = {
  src: [`${destZipPath}**`],
  dest: destZipPath,
  main: 'dist.zip',
};

import createHtmlElement from 'create-html-element';
import * as fs from 'fs';
import path from 'path';
import { Attributes } from 'stringify-attributes';
import { ILomCompiler } from './interfaces/LomCompiler.interface';
import { Zone } from './lom.schema';
import { LomModel } from './LomModel';
import './LomPath';

/**
 * @description Main class to compile the LOM data.
 *
 * @export
 * @class LomCompiler
 */
export class LomCompiler implements ILomCompiler {
   /**
    * @description Base directory from which the source files will be
    * fetched and the resulting compilation files will be generated. By default, it takes as value
    * the directory of the file where it is called.
    *
    * @private
    * @type {string}
    */
   private readonly _baseDirectory: string;

   /**
    * @description Origin of one or more files with LOM data.
    *
    * @private
    * @type {string[]}
    */
   private readonly _sourceFiles: string[] = [];

   /**
    * @description Folder where to save the files resulting from the compilation.
    *
    * @private
    * @type {string}
    */
   private _outputDirectory: string;

   /**
    * @description A new instance of LomCompiler.
    *
    * @param {string} [baseDir='.'] Defines the base directory from which the source files will be
    * fetched and the resulting compilation files will be generated. By default, it takes as value
    * the directory of the file where it is called.
    *
    * If the `outputDir` function is not called, a `build` folder will be created inside the base
    * directory to store the compilation result.
    */
   public constructor(baseDir = '.') {
      const isValidDirectory = fs.existsSync(baseDir) && fs.lstatSync(baseDir).isDirectory();

      if (!isValidDirectory) throw new Error(`${baseDir} is not a valid directory.`);

      this._baseDirectory = fs.realpathSync(baseDir);
      this._outputDirectory = path.resolve(this._baseDirectory, 'build');
   }

   public source(...sourceFiles: string[]): LomCompiler {
      sourceFiles.forEach((filePath) => {
         const realFilePath = fs.realpathSync(path.resolve(this._baseDirectory, filePath));
         const isFilePathIsDirectory = fs.lstatSync(realFilePath).isDirectory();

         if (isFilePathIsDirectory) {
            this._sourceFiles.push(
               ...fs
                  .readdirSync(realFilePath)
                  .filter((file) => file.endsWith('.json'))
                  .map((json) => fs.realpathSync(path.resolve(realFilePath, json)))
            );
         } else {
            this._sourceFiles.push(realFilePath);
         }
      });

      return this;
   }

   public outputDir(outputDir: string): LomCompiler {
      this._outputDirectory = path.resolve(this._baseDirectory, outputDir);
      return this;
   }

   private _mapZone(lom: Zone, lomArray: Zone[], level = 0): void {
      if (lom.children && lom.children.length > 0)
         lom.children.forEach((child) => this._mapZone(child, lomArray, level + 1));

      // eslint-disable-next-line no-param-reassign
      lom.level = level;

      lomArray.push(lom);
   }

   private _mapZoneHTML(lomArray: Zone[], lomPath: string): string {
      const htmlArray: string[] = [];
      lomArray.forEach((lom) => {
         htmlArray.push(this._buildZoneDiv(lom, lomPath));
      });
      return htmlArray.join('\n');
   }

   public compile(): void {
      this._sourceFiles.forEach((file) => {
         const lomModel = JSON.parse(fs.readFileSync(file, 'utf8')) as LomModel;
         const rootPath = lomModel.rootPath.rooted();

         Object.keys(lomModel.loms).forEach((subPath) => {
            const lom = lomModel.loms[subPath];
            const lomPath = path.posix.join(rootPath, subPath.unRooted());
            const lomDir = path.resolve(this._outputDirectory, lomPath.unRooted());

            fs.mkdirSync(lomDir, { recursive: true });

            const lomArray: Zone[] = [];
            this._mapZone(lom, lomArray);
            // lomArray.sort((a, b) => a.bounds.width - b.bounds.width);

            const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="utf-8">
                        <title>LOM at ${lomPath}</title>
                      </head>
                      <body style="overflow-x:hidden;">
                        ${this._mapZoneHTML(lomArray, lomPath)}
                      </body>
                    </html>
                `.replace(/^\s{10,20}/gm, '');

            fs.writeFileSync(`${lomDir}/index.html`, html, 'utf8');
         });
      });
   }

   /**
    * @description Builds the HTML content for the page body
    *
    * @private
    *
    * @param {Zone} zone Base object from which to build the HTML element
    * @param {string} lomPath Site's page name
    * @param {string} [indent='\n                        '] Indentation distance for the HTML
    *
    * @returns {string} The HTML string
    */
   // eslint-disable-next-line class-methods-use-this
   private _buildZoneDiv(zone: Zone, lomPath: string): string {
      const b = zone.bounds;

      let css = `position:absolute; left:${b.x}px; top:${b.y}px; width:${b.width}px; height:${b.height}px;`;
      css += ` border:${zone.style?.border || '1px solid black'};`;
      css += ` background:${zone.style?.background || 'white'};`;
      css += ` z-index:${zone.link ? 999999 : zone.level};`;

      const attributes: Attributes = { style: css };

      if (zone.link) {
         const href = path.posix.isAbsolute(zone.link)
            ? path.posix.relative(lomPath, zone.link)
            : zone.link;

         attributes.style += ' cursor: pointer;';

         const hrefPath = `'${zone.link === '/' || lomPath === '/' ? '' : '../'}${
            href || '.'
         }/index.html'`;

         attributes.onclick = `javascript:location.href=${hrefPath}`;
      }

      return createHtmlElement({
         name: 'div',
         // html: content,
         attributes,
      });
   }
}

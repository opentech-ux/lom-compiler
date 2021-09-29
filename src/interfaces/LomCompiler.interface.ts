import { LomCompiler } from '../LomCompiler';

export interface ILomCompiler {
   /**
    * @description Defines the origin of one or more files with LOM data. If the string is a path,
    * it will overwrite the base path defined in the constructor. Otherwise it will take into
    * account the base directory to find the file.
    *
    * @param {...string[]} sourceFiles Name or path of one or more JSON files with LOM data.
    *
    * @returns {LomCompiler} The current instance of LomCompiler
    */
   source(...sourceFiles: string[]): LomCompiler;

   /**
    * @description Defines the folder where to save the files resulting from the compilation. If it
    * is a directory path, it will overwrite the base path defined in the constructor. Otherwise a
    * folder will be created relative to the base path.
    *
    * If this function is not called, a `build` folder will be created inside the base
    * directory to store the compilation result.
    *
    * @param {string} outputDir Name or path of the output folder.
    *
    * @returns {LomCompiler} The current instance of LomCompiler
    */
   outputDir(outputDir: string): LomCompiler;

   /**
    * @description Compiles each file with defined LOM data into a set of HTML files for interactivity
    */
   compile(): void;
}

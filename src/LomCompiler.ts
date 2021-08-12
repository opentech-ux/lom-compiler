import path from "path";
import * as fs from "fs";
import {LomModel} from "./LomModel";

/** Main class for LOM compiler backend. */
export class LomCompiler {

    private readonly _basedir: string
    private readonly _sourceFiles: string[] = []
    private _outputDir: string

    public constructor(basedir: string = ".") {
        this._basedir = fs.realpathSync(basedir)
        if (!fs.lstatSync(this._basedir).isDirectory()) throw `${basedir} is not a valid directory`
        this._outputDir = path.resolve(this._basedir, "build")
    }

    public source(...sourceFiles: string[]): LomCompiler {
        sourceFiles.forEach(file => {
            file = fs.realpathSync(path.resolve(this._basedir, file))
            if (fs.lstatSync(file).isDirectory()) {
                this._sourceFiles.push(...fs.readdirSync(file).filter(f => f.endsWith(".json")))
            } else {
                this._sourceFiles.push(file)
            }
        })
        return this
    }

    public outputDir(outputDir: string): LomCompiler {
        this._outputDir = path.resolve(this._basedir, outputDir)
        return this
    }

    public compile(): void {
        this._sourceFiles.forEach(file => {
            const lomModel = JSON.parse(fs.readFileSync(file, "utf8")) as LomModel
            const rootPath = lomModel.rootPath.startsWith('/') ? lomModel.rootPath.substr(1) : lomModel.rootPath
            Object.keys(lomModel.loms).forEach(subPath => {
                const lom = lomModel.loms[subPath]
                const lomPath = path.resolve(rootPath, subPath.startsWith('/') ? subPath.substr(1) : subPath)
                const lomDir = path.resolve(this._outputDir, lomPath)
                fs.mkdirSync(lomDir, {recursive: true})

                // TODO generate HTML content
                const html = `
                  <!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="utf-8">
                        <title>LOM at ${lomPath}</title>
                      </head>
                      <body>
                        <!-- page content -->
                        <p>LOM zone ID: ${lom.zoneId}</p>
                      </body>
                    </html>
                `.replace(/\s+/, ' ')

                fs.writeFileSync(`${lomDir}/index.html`, html, "utf8");
            })
        })
    }
}

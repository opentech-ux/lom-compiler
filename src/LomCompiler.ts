import path from "path";
import * as fs from "fs";
import {LomModel} from "./LomModel";
import {Zone} from "../build/generated-src/lom.schema";
import './LomPath'
import stringifyAttributes = require('stringify-attributes');

const createHtmlElement = require('create-html-element');

/** Main class for LOM compiler backend. */
export class LomCompiler {

    private readonly _basedir: string
    private readonly _sourceFiles: string[] = []
    private _outputDir: string

    public constructor(basedir: string = ".") {
        if (!fs.existsSync(basedir) || !fs.lstatSync(basedir).isDirectory())
            throw new Error(`${basedir} is not a valid directory`)
        this._basedir = fs.realpathSync(basedir)
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

        function buildZoneDiv(zone: Zone, lomPath: string, indent: string = "\n                        "): string {
            const b = zone.bounds
            const subIndent = indent + '  '

            let css = `position:absolute; left:${b.x}px; top:${b.y}px; width:${b.width}px; height:${b.height}px;`
            css += ` border:${zone.style?.border || "1px solid black"};`
            css += ` background:${zone.style?.background || "white"};`

            let content = zone.children?.map(sub => buildZoneDiv(sub, lomPath, subIndent))?.join(subIndent)
            content = content ? (subIndent + content + indent) : ""

            const attributes = {style: css} as stringifyAttributes.Attributes

            if (zone.link) {
                const href = path.posix.isAbsolute(zone.link) ? path.posix.relative(lomPath, zone.link) : zone.link
                attributes.style += " cursor: pointer;"
                attributes.onclick = `javascript:location.href='${href || '.'}/index.html'`
            }

            return createHtmlElement({name: "div", html: content, attributes: attributes})
        }

        this._sourceFiles.forEach(file => {
            const lomModel = JSON.parse(fs.readFileSync(file, "utf8")) as LomModel
            const rootPath = lomModel.rootPath.rooted()
            Object.keys(lomModel.loms).forEach(subPath => {
                const lom = lomModel.loms[subPath]
                const lomPath = path.posix.join(rootPath, subPath.unRooted())
                const lomDir = path.resolve(this._outputDir, lomPath.unRooted())
                fs.mkdirSync(lomDir, {recursive: true})

                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="utf-8">
                        <title>LOM at ${lomPath}</title>
                      </head>
                      <body>
                        ${buildZoneDiv(lom, lomPath)}
                      </body>
                    </html>
                `.replace(/^\s{10,20}/gm, '')

                fs.writeFileSync(`${lomDir}/index.html`, html, "utf8");
            })
        })
    }
}

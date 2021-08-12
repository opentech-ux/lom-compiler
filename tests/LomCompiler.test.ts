import {LomCompiler} from "../src/LomCompiler"

const chai = require('chai')
const chaiFiles = require('chai-files')
chai.use(chaiFiles)

const expect = chai.expect;
const file = chaiFiles.file;
const dir = chaiFiles.dir;

describe('LOM compiler tests', () => {

    it('should fail on non existent basedir', () => {
        const invalidBasedir = "non/existent/path"
        expect(() => new LomCompiler(invalidBasedir)).to.throw(`${invalidBasedir} is not a valid directory`)
    })

    it('should fail on non directory basedir', () => {
        const invalidBasedir = "package.json"
        expect(() => new LomCompiler(invalidBasedir)).to.throw(`${invalidBasedir} is not a valid directory`)
    })

    it('should generate some HTML files', () => {
        const outputDir = "build/test-output/basic-lom"
        new LomCompiler()
            .source("tests/resources/basic-lom/basic.lom.json")
            .outputDir(outputDir)
            .compile()

        expect(file(`${outputDir}/index.html`)).to.exist
        expect(file(`${outputDir}/otherPage/index.html`)).to.exist
    })
})

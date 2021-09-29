import { LomCompiler } from '../src/LomCompiler';

const chai = require('chai');
const chaiFiles = require('chai-files');

chai.use(chaiFiles);

const expect = chai.expect;
const file = chaiFiles.file;

const BASE_DIR = 'build/test-output';

describe('LOM compiler tests', () => {
   it('Should fail on non existent BaseDir', () => {
      const invalidBaseDir = 'non/existent/path';

      expect(() => new LomCompiler(invalidBaseDir)).to.throw(
         `${invalidBaseDir} is not a valid directory.`
      );
   });

   it('Should fail on non directory BaseDir', () => {
      const invalidBaseDir = 'package.json';

      expect(() => new LomCompiler(invalidBaseDir)).to.throw(
         `${invalidBaseDir} is not a valid directory.`
      );
   });

   it('Should generate some HTML files (without BaseDir)', () => {
      const folderName = 'basic-lom';

      new LomCompiler()
         .source('tests/resources/basic-lom/basic.lom.json')
         .outputDir(`${BASE_DIR}/${folderName}`)
         .compile();

      expect(file(`${BASE_DIR}/${folderName}/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/otherPage/index.html`)).to.exist;
   });

   it('Should generate some HTML files (with BaseDir)', () => {
      const folderName = 'script-lom';

      new LomCompiler(BASE_DIR)
         .source('../../tests/resources/script-lom/script.lom.json')
         .outputDir(folderName)
         .compile();

      expect(file(`${BASE_DIR}/${folderName}/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/about/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/contact/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/index/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/location/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/price/index.html`)).to.exist;
   });

   it('Should generate some HTML files (with multiple json files)', () => {
      const folderName = 'multi-lom';

      new LomCompiler(BASE_DIR)
         .source('../../tests/resources/multi-lom')
         .outputDir(folderName)
         .compile();

      expect(file(`${BASE_DIR}/${folderName}/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/about/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/contact/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/index/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/location/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/price/index.html`)).to.exist;
      expect(file(`${BASE_DIR}/${folderName}/otherPage/index.html`)).to.exist;
   });
});

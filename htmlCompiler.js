const { TemplateMerger } = require( './TemplateMerger' );
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {
  CompileHtml( ihtmlParser, html, rootElement = null ){
    let htmlContent = "<ihtml>" + html.replace( /<template/g, "<jsdom-template" ).replace( /<\/template>/g, "</jsdom-template>" ) + "</ihtml>";
    let dom = new JSDOM(htmlContent);
    let $ = require('jquery')(dom.window);
    let templateElement = $( rootElement ? "ihtml > " + rootElement : "ihtml" );

    let templateMerger = new TemplateMerger( templateElement, $ );
    let templatePoint = templateMerger;

    for( let i = 0; i < ihtmlParser.buildProcess.length; i++ ){
      let nextStep = ihtmlParser.buildProcess[i];
      
      try{
        templatePoint = templatePoint[nextStep.method].apply( templatePoint, nextStep.args || [] );
      }
      catch( ex ){
      	console.log( ex );
      	console.log( "NextStep", nextStep );
      }
    }

    return templateMerger.Compile().replace( /<jsdom-template/g, "<template" ).replace( /<\/jsdom-template>/g, "</template>" );
  }
}
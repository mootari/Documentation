'use strict';

// import {UrlMapping} from "../../../typedoc/src/lib/output/models/UrlMapping";
// import {RendererEvent} from "../../../typedoc/src/lib/output/events";
// import {ProjectReflection} from "../../../typedoc/src/lib/models/reflections/project";

const td = require('typedoc');
const RendererEvent = td.RendererEvent;

class Renderer extends td.Renderer {
  render(project, collection) {

    const output = new RendererEvent(RendererEvent.BEGIN);
    output.outputDirectory = outputDirectory;
    output.project = project;
    output.settings = this.application.options.getRawValues();
    output.urls = this.theme.getUrls(project);

    // const bar = new ProgressBar('Rendering [:bar] :percent', {
    //   total: output.urls.length,
    //   width: 40
    // });

    this.trigger(output);
    if (!output.isDefaultPrevented) {
      output.urls.forEach((mapping) => {
        this.renderDocument(output.createPageEvent(mapping));
        bar.tick();
      });

      // this.trigger(RendererEvent.END, output);
    }
  }
}

module.exports = Renderer;

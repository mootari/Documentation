---
ID_PAGE: 25314
PG_TITLE: FilesInput
PG_VERSION: 2.1
TAGS:
    - Files
---
## Description

class [FilesInput](/classes/3.0/FilesInput)



## Constructor

## new [FilesInput](/classes/3.0/FilesInput)(p_engine, p_scene, p_canvas, p_sceneLoadedCallback, p_progressCallback, p_additionnalRenderLoopLogicCallback, p_textureLoadingCallback, p_startingProcessingFilesCallback)



#### Parameters
 | Name | Type | Description
---|---|---|---
 | p_engine | [Engine](/classes/3.0/Engine) |      @param p_engine
 | p_scene | [Scene](/classes/3.0/Scene) |      @param p_scene
 | p_canvas | HTMLCanvasElement |      @param p_canvas
 | p_sceneLoadedCallback | any |      @param p_sceneLoadedCallback
 | p_progressCallback | any |      @param p_progressCallback
 | p_additionnalRenderLoopLogicCallback | any |      @param p_additionnalRenderLoopLogicCallback
 | p_textureLoadingCallback | any |      @param p_textureLoadingCallback
## Members

### static FilesToLoad : File[]

The array that holds the vnd.ms-dds files to load

## Methods

### monitorElementForDragNDrop(p_elementToMonitor) &rarr; void



#### Parameters
 | Name | Type | Description
---|---|---|---
 | p_elementToMonitor | HTMLElement |      It could be the rendering canvas or whatever element on the page

### loadFiles(event) &rarr; void



#### Parameters
 | Name | Type | Description
---|---|---|---
 | event | any |      

### reload() &rarr; void



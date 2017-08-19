/// <reference path="Core.ts" />

function VueFormFormatter(element:Element,schema:Schema,path:string):Element{
  if(element.nodeName=="INPUT" || element.nodeName=="TEXTAREA"){
    path = path.replace(/[/]/g,'.');
    let model:string = element.getAttribute("name");
    element.setAttribute("v-model",path+model);
  }
  return element;
}

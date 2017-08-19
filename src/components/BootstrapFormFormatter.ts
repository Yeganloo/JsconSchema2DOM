/// <reference path="Core.ts" />

function BootstrapFormFormatter(element:Element,schema:Schema):Element{
  switch(element.nodeName){
    case "DIV":
    case "FIELDSET":
      if(element.className){
        element.className += " form-group";
      }else{
        element.className = "form-group";
      }
    break;
    case "INPUT":
    case "TEXTAREA":
      if(element.className){
        element.className += " form-control";
      }else{
        element.className = "form-control";
      }
    break;
  }
  return element;
}

//Schems definition
interface Schema{
  $id:string;
  $schema:string;
  $ref:string;
  title:string;
  description:string
  default:any;
  maximum:number;
  exclusiveMaximum:number;
  minimum:number;
  exclusiveMinimum:number;
  maxLength:number;
  minLength:number;
  pattern:string;
  additionalItems:Schema;
  items:Schema|Array<Schema>;
  maxItems:number;
  minItems:number;
  uniqueItems:boolean;
  contains:Schema;
  maxProperties:number;
  minProperties:number;
  additionalProperties:Schema;
  definitions:{[id:string]:Schema};
  properties:{[id:string]:Schema};
  patternProperties:{[id:string]:Schema};
  dependencies:{[id:string]:Schema|Array<string>}
  propertyNames:Schema;
  const:object;
  enum:{
    [id:string]:number|string;
    [index:number]:number|string;
  };
  enumNames:Array<string>;
  type:string|Array<string>;
  typeName:string;
  required:Array<string>|null;
  format:string;
  allOf:Array<Schema>;
  anyOf:Array<Schema>;
  oneOf:Array<Schema>;
  not:Schema;

  [id:string]:any;
}

//Dom Handlers interface
interface SchemaHandler{
  Signiture:Schema;
  Handler:Function;
}

interface Form{
  Action:string;
  Method:string;
}

//Settings class
class JsonSchema2DomSetting{
  Handlers:Array<SchemaHandler>=[];
  FormName:string;
  IdPrefix:string = "";
  FormDefinition:Form=null;
  onElementCreated:Array<Function>=[];
}

//Main Class
class JsonSchema2Dom {
  Settings:JsonSchema2DomSetting;
  constructor(formName:string,settings:JsonSchema2DomSetting){
    formName = formName || "form";
    if(settings != null){
      this.Settings = settings;
    }else{
      this.Settings = new JsonSchema2DomSetting();
    }
    this.Settings.FormName = formName;

  }

  //Object Default Processor
  ObjectProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean,path:string):Element{
    let el:Element;
    schema.required = schema.required || [];
    schema.title = schema.title || name || schema.typeName;
    el = document.createElement("fieldset");
    if(schema.title!=null){
      let lg:Element = document.createElement("legend");
      lg.textContent = schema.title;
      el.appendChild(lg);
    }
    if(schema.properties!= null){
      //TODO async process
      for(let prop in schema.properties){
        el.appendChild(self.GetHandler(self,schema.properties[prop])(self,prop,schema.properties[prop],schema.required.indexOf(prop) != -1,path+name+"/"));
      }
    }
    for(var i=0;i< self.Settings.onElementCreated.length;i++){
      el = self.Settings.onElementCreated[i](el,schema,path);
    }
    return el;
  }


  InputProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean,path:string):Element{
    let row:Element = document.createElement("div");
    let inp:Element = document.createElement("input");;
    let title:Element;
    //TODO OneOf and Checkboxes and Radio
    if(schema.enum != null){
      inp = document.createElement("select");
      if(schema.enumNames){
        for(let en=0;en< schema.enumNames.length;en++){
          var op= document.createElement("option");
          op.value = schema.enum[en].toString();
          op.textContent = schema.enumNames[en];
          inp.appendChild(op);
        }
      }else{
        for(let en in schema.enum){
          var op= document.createElement("option");
          op.value = schema.enum[en].toString();
          inp.appendChild(op);
        }
      }
    }else if(schema.format != null){
      schema.format = schema.format=="date-time"?"datetime-local":schema.format;
      inp.setAttribute("type",schema.format);
      switch(schema.format){
        case "button":
        case "submit":
        case "reset":
          inp.setAttribute("value",schema.title);
        break;
        case "image":
          inp.setAttribute("value",schema.title);
          if(schema.src != null){
            inp.setAttribute("src",schema.src);
          }
        break;
        default:
          switch(schema.type){
            case "file":
              if((schema.maximum != null && schema.maximum!=1) || (schema.maxItems!= null && schema.maxItems!=1)){
                inp.setAttribute("multiple","multiple");
              }
            break;
            case "password":
              if(schema.minLength!=null){
                inp.setAttribute("minLength",schema.minLength.toString());
              }
            break;
            case "text":
              if(schema.maxLength!=null){
                if(schema.maxLength >= 100){
                  inp.remove();
                  inp = document.createElement("textarea");
                }
                inp.setAttribute("maxLength",schema.maxLength.toString());
              }
            break;
            case "number":
            case "range":
            case "date":
            case "datetime-local":
            case "month":
            case "time":
            case "week":
              if(schema.maximum != null){
                inp.setAttribute("maximum",schema.maximum.toString());
              }
              if(schema.minimum != null){
                inp.setAttribute("minimum",schema.minimum.toString());
              }
            break;
          }
        break;
      }
    }else{
      switch(schema.type){
        case "boolean":
          inp.setAttribute("type","checkbox");
        break;
        case "integer":
        case "number":
          inp.setAttribute("type","number");
          if(schema.maximum != null){
            inp.setAttribute("maximum",schema.maximum.toString());
          }
          if(schema.minimum != null){
            inp.setAttribute("minimum",schema.minimum.toString());
          }
        break;
        case "null":
        case "object":
          throw "Internal Error. Invalid handler is called!";

        default:
          inp.setAttribute("type","text");
        break;
      }
    }
    if(schema.title != null){
      title = document.createElement("label");
      title.textContent = schema.title;
      title.setAttribute("for",self.Settings.IdPrefix + name);
      row.appendChild(title);
    }
    inp.setAttribute("id",self.Settings.IdPrefix + name);
    inp.setAttribute("name",name);
    if(required){
      inp.setAttribute("required","");
    }
    if(schema.pattern!=null){
      inp.setAttribute("pattern",schema.pattern);
    }
    if(schema.description!=null){
      inp.setAttribute("title",schema.description);
    }

    row.appendChild(inp);
    for(var i=0;i< self.Settings.onElementCreated.length;i++){
      row = self.Settings.onElementCreated[i](row,schema,path);
      inp = self.Settings.onElementCreated[i](inp,schema,path);
      if(title)
        title = self.Settings.onElementCreated[i](title,schema,path);
    }
    return row;
  }

  //Determine handler of a Schema
  GetHandler(self:JsonSchema2Dom,schema:Schema):Function{
    if(this.Settings.Handlers.length>0){
      //TODO Check Signiture to find DOM creator
    }else{
      //TODO OneOf and enum move to here???
      if(schema.format!=null){
        return self.InputProcessor;
      }else{
        switch(schema.type){
          case "object":
            return self.ObjectProcessor;
          default:
            return self.InputProcessor;
        }
      }
    }
    return self.ObjectProcessor;
  }

  Parse(schema:Schema):Element{
    let path:string = "";
    let Container:Element = this.GetHandler(this,schema)(this,this.Settings.FormName,schema,false,path);
    var def = this.Settings.FormDefinition;
    if(def!=null){
      let frm = document.createElement("form");
      frm.appendChild(Container);
      frm.setAttribute("action",def.Action);
      frm.setAttribute("method",def.Method);
      frm.setAttribute("name",this.Settings.FormName);
      frm.setAttribute("id",this.Settings.IdPrefix + this.Settings.FormName);
      for(let ev=0;ev< this.Settings.onElementCreated.length;ev++){
        frm = this.Settings.onElementCreated[ev](frm,schema,path);
      }
      Container = frm;
    }
    return Container;
  }


}

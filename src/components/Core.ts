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
  enum:Array<string|number|{[id:string]:any}>;
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

//Settings class
class JsonSchema2DomSetting{
  Handlers:Array<SchemaHandler>=[];
  IdPrefix:string = "";
  CreateForm:boolean=false;
}

//Main Class
class JsonSchema2Dom {
  Settings:JsonSchema2DomSetting;
  constructor(settings:JsonSchema2DomSetting){
    if(settings != null){
      this.Settings = settings;
    }else{
      this.Settings = new JsonSchema2DomSetting();
    }
  }

  //Object Default Processor
  ObjectProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean):Element{
    let el:Element;
    schema.title = schema.title || name || schema.typeName;
    if(schema.title!=null){
      el = document.createElement("fieldset");
      let lg:Element = document.createElement("legend");
      lg.textContent = schema.title;
      el.appendChild(lg);
    }else{
      el = document.createElement("div");
    }
    if(schema.properties!= null){
      //TODO async process
      for(let prop in schema.properties){
        el.appendChild(self.GetHandler(self,schema.properties[prop])(self,prop,schema.properties[prop],schema.required.indexOf(name) != -1));
      }
    }
    return el;
  }

  //Determine handler of a Schema
  GetHandler(self:JsonSchema2Dom,schema:Schema):Function{
    if(this.Settings.Handlers.length>0){
      //TODO Check Signiture to find DOM creator
    }else{
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

  //
  InputProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean):Element{
    let el:Element;
    el = document.createElement("input");
    if(schema.format){
      el.setAttribute("type",schema.format);
      switch(schema.format){
        case "button":
        case "submit":
        case "reset":
          el.setAttribute("value",schema.title);
        break;
        case "image":
          el.setAttribute("value",schema.title);
          if(schema.src != null){
            el.setAttribute("src",schema.src);
          }
        break;
        default:
          switch(schema.type){
            case "file":
              if((schema.maximum != null && schema.maximum!=1) || (schema.maxItems!= null && schema.maxItems!=1)){
                el.setAttribute("multiple","multiple");
              }
            break;
            case "password":
              if(schema.minLength!=null){
                el.setAttribute("minLength",schema.minLength.toString());
              }
            break;
            case "text":
              if(schema.maxLength!=null){
                if(schema.maxLength >= 100){
                  el = document.createElement("textarea");
                }
                el.setAttribute("maxLength",schema.maxLength.toString());
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
                el.setAttribute("maximum",schema.maximum.toString());
              }
              if(schema.minimum != null){
                el.setAttribute("minimum",schema.minimum.toString());
              }
            break;
          }
          if(schema.title != null){
            var lb = document.createElement("label");
            lb.textContent = schema.title;
            lb.appendChild(el);
            el = lb;
          }
        break;
      }
    }
    el.setAttribute("id",self.Settings.IdPrefix + name);
    el.setAttribute("name",name);
    if(required){
      el.setAttribute("required","");
    }
    if(schema.pattern!=null){
      el.setAttribute("pattern",schema.pattern);
    }
    if(schema.description!=null){
      el.setAttribute("title",schema.description);
    }
    return el;
  }

  Parse(schema:Schema):Element{
    let Container:Element = this.GetHandler(this,schema)(this,null,schema,false);
    return Container;
  }


}

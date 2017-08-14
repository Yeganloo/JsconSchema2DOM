class Setting{
  Handlers:{[id:string]:Function}={};
  constructor(handlers:{[id:string]:Function}){
    this.Handlers["title"] = function(title:string){
        if(title != null){
        var container = document.createElement("fieldset");
        var lg = document.createElement("legend");
        lg.textContent = title;
        container.appendChild(lg);
        return container;
      }
    }

    if(handlers != null)
      for(var id in handlers){
        this.Handlers[id] = handlers[id];
      }
  }
}

class Schema{

  title:string;
  description:string
  default:object;
  properties:{[id:string]:object};

}

class JsonSchema2Dom {
  Settings:Setting;
  constructor(settings:Setting){
    if(settings != null){
      this.Settings = settings;
    }else{
      this.Settings = new Setting(null);
    }

  }

  Parse(schema:Schema){
    var Container = this.Settings.Handlers["title"](schema.title);
    return Container;
  }


}

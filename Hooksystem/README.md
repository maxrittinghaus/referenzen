# Hook-System 
Das Hook-System (ab jetzt HS) bietet eine Kommunikationsplattform mit der das System mit Modulen und Module mit anderen Modulen kommunizieren können.

## Aufbau

Ein Hook-Event ist im Endeffekt eine Klasse welche bestimmte Informationen beinhaltet. Die das System mit Modulen oder Module untereinander teilen wollen.

Ein Hook-Event kann (wenn gewünscht) veränderbar sein. Heißt, dass das System ein Hook-Event in die Pipeline schicken kann und Module die Werte des Hook-Events verändern können. Nachdem das Hook-Event die Pipeline durchlaufen hat kann das System die Werte abfragen und benutzen. Somit können Module Live für z.B. bestimmte Situationen Werte im System verändern.

**Beispiel**
```js
export class ExampleEvent extends BaseEvent {
    constructor(rwVal: string) {
        super();
        this.rwValue = rwVal;
    }
}
```

## Listener

Ein Modul kann eine Listener-Methode für ein bestimmtes Hook-Event hinterlegen. Diese Methode wird jedes Mal aufgerufen, wenn das entsprechende Hook-Event in die Pipeline geschickt wird.

```js
getHookManager().hook(MainEvents.EXAMPLE_EVENT, (event) => {
    event.rwValue = "Hello World!";
}, HookPriority.HIGHEST);
```
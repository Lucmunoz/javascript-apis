let myChart // variable que recibirá al chart creado.

const $moneyAmountInputBox = document.getElementById("input-box");      // Referencia a caja de texto donde el usuario ingresará el monto en pesos chilenos
const $moneyTypeSelectBox = document.getElementById("money-select");    // Referencia a elemento Select donde el usuario seleccionará la moneda a convertir

const $convertButton = document.getElementById("button");               // Referencia a boton el cual gatilla la consulta, cálculo y renderización de datos
$convertButton.addEventListener("click", function(){                    // mediante la función "getValueAndProcess" asociada al evento "click"
    buttonPress($moneyTypeSelectBox.value);
});

const $convertedAmountText = document.getElementById("result");         // Referencia a texto en el DOM que se modificará para mostrar el valor resultado (convertido)

/*  El tag <canvas> define un área de bitmap dentro del HTML. Esto permite a apis poder dibujar graficos en esta área.
    Definimos una referecia al canvas con $chart. el ID del canvas es "myChart".
    
    Por otra parte, par poder dibujar en el canvas, necesitamos definir un objeto de contexto 2d (2D context object) el cual debe ser entregado como argumento, al
    momento de crear un nuevo chart:

            myChart = new Chart(ctx, config);
                                 ↑

    Así, el elemento <canvas> referenciado por $chart tiene un metodo llamado "getContext()" el cual se utiliza para obtener el contexto de renderizado, sus propiedades
    y sus funciones. Al trabajar con gráficas en 2D se debe indicar que es este el tipo de contexto. Esto se hace ingresando el parámetro '2D'.
*/

const $chart = document.getElementById("myChart");                      
let ctx = document.getElementById("myChart").getContext('2d');


/**********************************************/
/*********** DEFINICIÓ DE FUNCIONES ***********/
/**********************************************/

/*  Funcion encargada de comunicarse con la api mediante el metodo fecth. Utilizamos el await para esperar la respuesta de manera forzada. Esto pues javascript
    ejecuta el código de manera lineal y sin esta palabra, no se esperarían los resultados y el valor de response sería "respuesta pendiente"
    
    Al utilizar la palabra await debemos indicar que la función en donde se invoca esta palabra, es del tipo asincronica (async).
                      ⬇
    const getData = async(currency)=>{...}
    
    Utilizando el método json(), obtendremos el siguiente objeto. Desde donde SOLO nos interesa el arreglo "serie"

    {
    "version": "1.7.0",
    "autor": "mindicador.cl",
    "codigo": "dolar",
    "nombre": "Dólar observado",
    "unidad_medida": "Pesos",
    "serie": [
        {
            "fecha": "2024-02-14T03:00:00.000Z",
            "valor": 971.56
        },
        ..., // <- son 31 argumentos dado que al utilizar la URL del tipo: "https://mindicador.cl/api/{tipo_indicador}" la api devuelve los valores del último mes (31 días).
        {
            "fecha": "2024-01-03T03:00:00.000Z",
            "valor": 880.92
        }
            ]
   }    

    Entonces al declarar la linea "const {serie} = await res.json();" deconstruimos el objeto y extraemos directamente el arreglo serie y lo retornamos. La sintaxis
    para deconstruir un objeto es: " const {identificador} = objeto; ", donde identificador es el nombre de la propiedad a extraer o acceder del objeto. Luego de 
    deconstruir el objeto, la variable identificador contiene el valor de dicha propiedad del objeto.

    Lo anterior, es algo simiar a la siguiente expresión "const identificador = objeto.identificador".

    Cuando la función finaliza, se retorna el valor de este arreglo.
*/

const getData = async(currency)=>{

        const response = await fetch("https://mindicador.cl/api/"+currency+"/");
        const {serie} = await response.json();
        return serie
}

/*  Función gatillada por el evento click de botton "convertir" del DOM. Esta función recibe como parámetro la variable $moneyTypeSelectBox.value que contiene
    la referencia y el valor del tipo de divisa activa en el cuadro de selección al momento de presionar el boton. Este valor es requerido para luego conformar
    la URL de llamada a la API.

    Nuevamente, como la función getData realiza un fetch "esperado" por el await, aca, nuevamente tenemos que considerar la palabra reservada await (para esperar
    la data) y por ende, tambien agregar la palabra async a la función.

    En este bloque es donde hacemos un try catch para manejar posibles errores de funcionamiento de la API. En caso de detectar un error, mediante el catch se
    muestra un error en el DOM como sugiere el desafío.

    Si no hay errores y se recibe una respuesta, la ejecución de la función continúa. Se recibe el arreglo "serie" en la variable data y esta, se envía como 
    parámetro al llamar la función "convertAndShowCurrency()" Encargada de convertir el monto ingresado por el usuario (en pesos chilenos) a la divisa elegida para
    luego mostrar el resultado en pantalla.

*/
const buttonPress = async (currency) => {

    try{
        const data = await getData (currency)

        convertAndShowCurrency(data)
    }
    catch{
        alert("Estimado usuario, por favor intente nuevamente mas tarde.");
        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.classList.add("alert");
        $convertedAmountText.innerHTML =  "Base de datos no disponible. Porfavor intente nuevamente mas tarde.";
    }
}

/*  Función encargada de convertir el monto ingresado por el usuario (en pesos chilenos) a la divisa elegida para luego mostrar el resultado en pantalla. Hacia el final de esta
    función, se invoca a la función createChart encargada de crear el gráfico según exige el desafío.

    En primer lugar, se consulta el valor de la moneda ingresado por el usuario. En pesos Chilenos. Si este valor no es valido o se preciona el boton con el cuadro vacío, se
    hace un check simple y se emite una alerta, solicitando se corrija el monto ingresado.

    Por otra parte, como ya se mencionó, esta función recibe como parámetro "data" el arreglo "serie", parte del objeto que devuelve la API Mindicador.cl. Este arreglo contiene
    la información de los últimos 30 o 31 días para la divisa consultada y su ordenamiento es del dato mas reciente al dato mas antiguo. Por tanto, el indice [0] contiene el 
    valor vigente de la divisa consultada. 

    Obteniendo este valor, se raeliza el cálculo para transformar el monto al a nueva divisa y se proyecta en pantalla haciendo uso del metodo innerHTML.

    Finalmente, llamamos a la función createChart para crear el grafico según solicita el desafío. Esta función recibe como parámetros dos valores. Por una parte, el tipo de
    divisa seleccionado en el elemento select al momento de presionar el boton y por otra parte, el arreglo data que contiene los datos historicos de la divisa seleccionada.

*/

const convertAndShowCurrency = (data) =>{

    let valorIngresado = parseInt($moneyAmountInputBox.value);

    if(isNaN(valorIngresado)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.");
        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.classList.add("alert");
        $convertedAmountText.innerHTML =  "Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.";
        return;
      }

    let valorDivisa = data[0].valor;

    valorResultado = parseFloat(valorIngresado/valorDivisa).toFixed(3); 

    $convertedAmountText.classList.remove('alert'); // Con el metodo classlit.remove buscamos si existe la clase "alert" y la removemos. (Esta clase se inyecta ante un error)
    $convertedAmountText.innerHTML =  "Resultado: " + valorResultado;

    createChart($moneyTypeSelectBox.value, data);
}


const createChart = (currency, data) => {

/*  Funcion encargada de procesar los datos entregados por la api "mi indicador" y renderizar un grafico de líneas e inyectarlo en el DOM.

    Recordar que el parámetro "data" es un arreglo de objetos, 30 en particular ya que eso es lo que de vuelve la api. Cada objeto se 
    compone de 2 elementos: fecha y valor por tanto, lo primero es separar ambos tipos de datos ya que las fechas actuarán como etiquetas
    (eje X) del gráfico y los valores serán desplegados en el eje Y
    
    Haciendo uso de un map, se recorre el arreglo de objetos para extraer las fechas. En cada iteración, se ejecutará una función que retornará
    el valor de fecha de cada objeto no sin antes haberlo "trasnformado" (haciendo uso del split). Esto por que el formto de fecha del objeto
    es: "2024-02-12T03:00:00.000Z" y lo que nos interesa es unicamente la fecha en formato aaaa-mm-dd.

    El map devuelve entonces un arreglo con las fechas en el formato deseado.*/

    const fechasTemp = data.map((dato) => {
        const fecha = dato.fecha.split("T")[0];
        return fecha;
    });

/*  Se procede de la misma manera para extraer los valores asociados a cada fecha. haciendo uso del metodo Number y parsefloat se toman datos 
    numericos en punto flotante.*/

    const valoresTemp = data.map((dato) => {
        const valor = dato.valor;
        return Number(parseFloat(valor).toFixed(3));
    });

/*  Se aplica el metodo "reverse" puesto que la api ordena los datos desde el mas nuevo al mas antiguo, lo que no se entiende claramente 
    en un grafico, donde los datos van desde el mas antiguo al mas nuevo. Por otra parte, según solicita el desafío, se aprovecha la 
    instancia para tomar solo los primeros 10 datos de fechas y valores desde el arreglo original.

    Así, los valores a graficar serán "labels" y "values".*/

    const labels = fechasTemp.splice(0,10).reverse();
    const values = valoresTemp.splice(0,10).reverse();

/*  Para poder crear un grafico tenemos que utilizar el metodo "new Chart" el cual recibe dos parámetros:

    - El contexto de renderizado, sus propiedades y sus funciones. Esto se obtiene haciendo uso del metodo getContext('2d') a la tag
    <canvas> del DOM. Al trabajar con gráficas en 2D se debe indicar que es este el tipo de contexto. Esto se hace ingresando el parámetro '2D'.*/

    ctx = document.getElementById("myChart").getContext('2d');
   
    const datasets = [
        {
            label: "Valor "+ currency +" - 10 últimos días",         //Titulo del grafico
            data: values                                            // Valores (puntos), eje Y
        }
    ];

/*  Como segundo parámetro, se debe entregar un objeto que contendrá información de configuración del tipo de grafico y la data a renderizar.*/

    const chartData = {labels, datasets}                    // Labels corresponde a arreglo de fechas (eje X). Datasets corresponde a arreglo que contiene el titulo 
                                                            // del grafico y valores (puntos) del eje Y.

    const config = {                                        // Objeto de configuración
        type: "line",                                       // se indica el tipo de grafico y la información (data) para renderizar el gráfico.
        data: chartData
    };

/*  Antes de crear el grafico, revisamos si ya existe una instancia creada y si existe, se elimina mediante el metodo destroy(). Esto porque al momento en que 
    querramos renderizar un nuevo grafico, al cambiar de tipo de moneda, el plugin indicará un error que hace mención a que la instancia previamente creada debe
    ser destruida antes de crear un nuevo grafico:

    Error: Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID 'myChart' can be reused.

    Por tanto, si myChart es True, quiere decir que ya existe una instancia creada y la destruye para luego proceder a crear una nueva instancia asociada a la 
    variable myChart.*/

    if(myChart){
        myChart.destroy();
    }
    
    $chart.classList.add("white-background");
    myChart = new Chart(ctx, config);
}


    

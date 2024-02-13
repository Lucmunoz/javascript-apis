let myChart
let valorDivisa=0;


/*  Definiciónd e referencias a elementos del DOM y asociación de funciónes a eventos según corresponda */
const $moneyAmountInputBox = document.getElementById("input-box");      // Referencia a caja de texto donde el usuario ingresará el monto en pesos chilenos
const $moneyTypeSelectBox = document.getElementById("money-select");    // Referencia a elemento Select donde el usuario seleccionará la moneda a convertir
$moneyTypeSelectBox.addEventListener("change", function(){              //      Se asocia función "getDataAndCreateChart" al evento change para que cuando el 
    getDataAndCreateChart(this.value)                                   //      usuario seleccione un tipo de moneda, se actualice el grafico histórico.
});

const $convertButton = document.getElementById("button");               // Referencia a boton el cual gatilla la consulta, cálculo y renderización de datos
$convertButton.addEventListener("click", function(){                    // mediante la función "getValueAndProcess" asociada al evento "click"
    getValueAndProcess($moneyTypeSelectBox.value);
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


/*Al momento de cargar la página, el selector de moneda mostrará por defecto la divisa "dolar". Así se definió el elemento select en el HTML. A partir de esto, llamamos
a la función encargada de mostrar el gráfico histórico para esta divisa.  */
getDataAndCreateChart($moneyTypeSelectBox.value)

/**********************************************/
/*********** DEFINICIÓ DE FUNCIONES ***********/
/**********************************************/


async function getValueAndProcess(divisa) {

    /*  Función llamada al momento de presionar el boton "convertir". Esta función recibe como parámetro el valor del elemento select (divisa) seleccionado al momento
        de hacer click */ 

    try {
        const res = await fetch("https://mindicador.cl/api/"+divisa+"/");

            /*  A continuación, accederemos a los datos utilizando el metodo .json(). Podemos ejecutar la siguiente líne de codigo:
            
                const data = await res.json(); //(1)
                console.log(data)

                Podrémos ver entonces que el json devuelve un objeto con la siguiente estructura

                {
                    "version": "1.7.0",
                    "autor": "mindicador.cl",
                    "codigo": "dolar",
                    "nombre": "Dólar observado",
                    "unidad_medida": "Pesos",
                    "serie": [
                        {
                            "fecha": "2024-02-13T03:00:00.000Z",
                            "valor": 972.22
                        },
                        
                        ... // son 31 elementos por la forma en la que hicimos el fetch. Al utilizar una URL que indique el tipo de divisa, la api devuelve los daltos del último mes (últimos 31 días)
                        
                        {
                            "fecha": "2024-01-02T03:00:00.000Z",
                            "valor": 877.12
                        }
                    ]
                }

                Del objeto anterior, lo único que nos interesa es el arreglo de objetos "serie" y particularmente, el primer elemento (indice [0]) ya que este corresponde al último valor vigente (valor al día)
                de la divisa seleccionada por el usuario. 

                Así, para obtener este arreglo, podemos ejecutar la siguiente línea de codigo.
                */

            const {serie} = await res.json();
            
            /*  Luego de lo anterior, ya no tendríamos como resultado un objeto tan grande y con datos que no nos interesan sino que obtenemos directamente el arreglo series (que es un ARREGLO de OBJETOS)

            [
                {
                    "fecha": "2024-02-13T03:00:00.000Z",
                    "valor": 972.22
                },
                
                ...,

                {
                    "fecha": "2024-01-02T03:00:00.000Z",
                    "valor": 877.12
                }
            ]

            A partir de lo anterior, y dado que el cálculo de conversión de moneda debe hacerse con el valor vigente de la moneda seleccionada, tenemos que obtener el valor del elemento "valor" del primer 
            objeto yaque los objetos se ordenan {mas reciente,....,mas antiguo}. Esto lo hacemos con la siguiente línea de codigo.*/

            valorDivisa= Number(parseFloat(serie[0].valor)); 
         
            /*  Si hacemos un console.log del valor de la variable "valorDivisa" obtendríamos directamente el valor de la divisa para la última fecha entregada por la api. En el caso del dolar, al 13 de febrero
            obtendríamos en pantalla "972.22" 

            Luego de obtener este valor, llamamos a la función encargada de hacer la conversión.
            */
                   
        convertData(valorDivisa);

    } 
    catch (error) {
        /*  Sihay un error en la llamada, se muestra un cuadro de adevertencia, se "vacía" el input, se vuelve a escribir el placeholder y se modifica el texto 
        que muestra el resultado con "..." */

        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.innerHTML  = 'Error al intentar obtenr información de divisas. Intente mas tarde';
        $convertedAmountText.className = 'alert';
        alert("Error. Api mindicador.cl caída");
    }

    finally{
            //console.log(data)
    }
}


function convertData(divisa){

    /*  Función encargada de realizar el cálculo de conversión desde el monto en pesos chilenos a la divisa seleccionada por el usuario.
    
        En primer lugar, se toma el valor de moneda chilena ingresado por el usuario. El elemento input se habilitó como tipo "number" por lo que no admite texto salvo 
        el punto. Realizamos un chequeo simple para corroborar que el valor ingresado es valido. En caso que el valor ingresado sea invalido, se "vacía" el input, se 
        vuelve a escribir el placeholder y se modifica el texto que muestra el resultado con "..." y se pone fin a la ejecución de la función.*/

    let valorTemp = parseInt($moneyAmountInputBox.value);

    if(isNaN(valorTemp)) {

        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.innerHTML  = 'Ingrese un Valor numérico, reintente.';
        $convertedAmountText.className = 'alert';
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.");
        return;
      }

    /*  Si el valor es válido, se realiza el calculo de conversión el cual se inyecta al HTML */
    valorTemp = parseFloat(valorTemp/divisa).toFixed(3); 
    $convertedAmountText.className = '';
    $convertedAmountText.innerHTML =  "Resultado: " +valorTemp;
}


async function getDataAndCreateChart(tipo){  

    /*  Función cuya ejecución se encuentra asociada al evento change del elemento select en donde el usuario elige el tipo de moneda a convertir. Al momento en
        que el usuario elige una nueva opción se invoca esta función y se entrega como parametro el tipo de moneda seleccionada.
        
        con fetch realizamos una peteición a la API mindicador. Este método devuelve una promesa y para gestionarla, utilizaremos await. Con este metodo, se detiene
        la ejecución del código y no continua. Asociado al await, tenemos que agregar la palabra reservada "async" antes de la palabra function

        con await esperamos a que se complete la solicitud de manera forzada.
        
        */

    try {
        const res = await fetch("https://mindicador.cl/api/"+tipo+"/");
        
        /*  Al hacer un fetch con el URL indicando el tipo de divisa, json devuelve objeto el cual contiene un arreglo de objetos llamado "serie" que contiene
            información de la divisa para los ultimos 30 días. Cada objeto tiene 2 elementos: "fecha" y "valor". Ambos datos son de interes para poder renderizar
            un gráfico fecha v/s valor por lo que extraemos este arreglo desde el objeto*/

        const {serie} = await res.json();        
        createChart(serie); // Función encargada de crear el gráfico. Se entrega como parámetro el arreglo "serie"
    }
    catch (error) {
        alert("Error. Api caída");
    }
}

function createChart(datos){
    
    /*  Funcion encargada de procesar los datos entregados por la api "mi indicador", renderizar un grafico de líneas e inyectarlo en el DOM.
   
        Recordar que el parámtro "datos" es un arreglo de objetos, 30 en particular ya que eso es lo que de vuelve la api. Cada objeto se compone de 
        2 elementos: fecha y valor por tanto, lo primero es separar ambos tipos de datos ya que las fechas actuarán como etiquetas (eje X) del gráfico y 
        los valores serán desplegados en el eje Y
        
        Haciendo uso de un map, se recorre el arreglo de objetos. En cada iteración, se ejecutará una función que retornará el valor de fecha de cada objeto
        no sin antes haberlo "adaptado" (haciendo uso del split). Esto por que el formto de fecha del objeto es: "2024-02-12T03:00:00.000Z" y lo que nos
        interesa es unicamente la fecha en formato aaaa-mm-dd.

        El map devuelve entonces un arreglo con las fechas en el formato deseado.
     */

    const labelsTemp = datos.map((dato) => {
        const fecha = dato.fecha.split("T")[0];
        return fecha;
    });

    /*  Como se indicó anteriormente, la api devuelve un arreglo con datos de los últimos 30 días de los cuales, solo nos interesan  los últimos 10 según exige
    el desafío. Por esta razon es que se definió un arreglo temporal "labelsTemp" desde donde se extraerán los 10 primeros elementos hacia el arreglo definitivo 
    
    Se aplica ademas el metodo "reverse" puesto que la api ordena los datos desde el mas nuevo al mas antiguo, lo que no se entiende claramente en un grafico,
    donde los datos van desde el mas antiguo al mas nuevo*/

    labels = labelsTemp.splice(0,10).reverse();

    /*  Algo simiar ocurre con los valores de cada objeto del arreglo. Se recorre el arreglo con los 30 datos de fehca y valor mediante un map desde donde se obtiene
        un arreglo "valuesTemp" que contendrá unicamente la data de valores de la moneda. Luego se extraén los 10 primeros datos y se invierte su orden.
        
        haciendo uso del metodo Number y parsefloat se toman datos numericos en punto flotante.*/

    const valuesTemp = datos.map((dato) => {
        const valor = dato.valor;
        return Number(parseFloat(valor).toFixed(3));
    });
    const values = valuesTemp.splice(0,10).reverse();

    /*  Para poder crear un grafico tenemos que utilizar el metodo "new Chart" el cual recibe dos parámetros:

        - El contexto de renderizado, sus propiedades y sus funciones. Esto se obtiene haciendo uso del metodo getContext('2d') a la tag <canvas> del DOM. 
        Al trabajar con gráficas en 2D se debe indicar que es este el tipo de contexto. Esto se hace ingresando el parámetro '2D'.*/

    ctx = document.getElementById("myChart").getContext('2d');

    /*  Como segundo parámetro, se debe entregar un objeto que contendrá información de configuración del tipo de grafico y la data a renderizar.*/

    const datasets = [
        {
            label: "Valor dolar - 10 últimos días",         //Titulo del grafico
            data: values,                                    // Valores (puntos), eje Y
        }
    ];

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

        Por tanto, si myChart es True, quiere decir que ya existe una instancia creada y la destruye para luego proceder a crear una nueva instancia asociaa a la 
        variable myChart.
     */

    if(myChart){
        myChart.destroy();
        
    }
     
    myChart = new Chart(ctx, config);

}


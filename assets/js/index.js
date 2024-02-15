let myChart

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


const getData = async(currency)=>{

        const response = await fetch("https://mindicador.cl/api/"+currency+"/");
        const {serie} = await response.json();
        return serie
}

/* */
const buttonPress = async (currency) => {

    try{
        const data = await getData (currency)

        convertAndShowCurrency(data)
    }
    catch{
        alert("error")
    }
}

const convertAndShowCurrency = (data) =>{

    let valorIngresado = parseInt($moneyAmountInputBox.value);
    let valorDivisa = data[0].valor;


    if(isNaN(valorIngresado)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.");
        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.innerHTML =  "...";
        return;
      }

    valorResultado = parseFloat(valorIngresado/valorDivisa).toFixed(3); 
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

    Por tanto, si myChart es True, quiere decir que ya existe una instancia creada y la destruye para luego proceder a crear una nueva instancia asociaa a la 
    variable myChart.*/

    if(myChart){
        myChart.destroy();
    }
    
    $chart.classList.add("white-background");
    myChart = new Chart(ctx, config);
}


    

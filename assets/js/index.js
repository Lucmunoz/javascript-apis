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
        ..., // <- son 31 argumentos dado que al utilizar la URL indicando el tipo de divisa, la api devuelve los datos del último mes.
        {
            "fecha": "2024-01-03T03:00:00.000Z",
            "valor": 880.92
        }
            ]
   }    

    Entonces al declarar la linea "const {serie} = await res.json();" deconstruimos el objeto y extraemos directamente el arreglo serie y lo retornamos. La sintaxis
    para deconstruir un objeto es: " const {identificador} = objeto; ", donde identificado es el nombre de la propiedad a extraer o acceder del objeto. Luego de 
    deconstruir la variable identificador, contiene el valor de dicha propiedad.

    Lo anterior, es algo simiar a la siguiente expresión "const identificador = objeto.identificador".
*/

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

    const fechasTemp = data.map((dato) => {
        const fecha = dato.fecha.split("T")[0];
        return fecha;
    });

    const valoresTemp = data.map((dato) => {
        const valor = dato.valor;
        return Number(parseFloat(valor).toFixed(3));
    });

    const labels = fechasTemp.splice(0,10).reverse();
    const values = valoresTemp.splice(0,10).reverse();

    ctx = document.getElementById("myChart").getContext('2d');
   
    const datasets = [
        {
            label: "Valor "+ currency +" - 10 últimos días",         //Titulo del grafico
            data: values                                    // Valores (puntos), eje Y
        }
    ];

    const chartData = {labels, datasets}                    // Labels corresponde a arreglo de fechas (eje X). Datasets corresponde a arreglo que contiene el titulo 
                                                            // del grafico y valores (puntos) del eje Y.

    const config = {                                        // Objeto de configuración
        type: "line",                                       // se indica el tipo de grafico y la información (data) para renderizar el gráfico.
        data: chartData
    };
  
    if(myChart){
        myChart.destroy();
    }
    
    $chart.classList.add("white-background");
    myChart = new Chart(ctx, config);
}


    

let valorDolar = 0;
let valorUf = 0;
let valorEuro = 0;
let valorBitcoin = 0;
let myChart

const $moneyAmountInputBox = document.getElementById("input-box");
const $moneyTypeSelectBox = document.getElementById("money-select");

$moneyTypeSelectBox.addEventListener("change", function(){
    getDataAndCreateChart(this.value)
});

const $convertButton = document.getElementById("button");
$convertButton.addEventListener("click", getValueAndProcess);
const $convertedAmountText = document.getElementById("result");
const $chart = document.getElementById("myChart");
let ctx = document.getElementById("myChart").getContext('2d');

getDataAndCreateChart($moneyTypeSelectBox.value)

async function getDataAndCreateChart(tipo){  
    try {
        const res = await fetch("https://mindicador.cl/api/"+tipo+"/");
        const datos = await res.json();


        createChart(datos);
    }
    catch (error) {
        alert("Error. Api caída");
    }
}



async function createChart(datos){

    const labelsTemp = datos.serie.map((dato) => {
        const fecha = dato.fecha.split("T")[0];
        return fecha;
    });

    labels = labelsTemp.splice(0,10).reverse();
    //console.log (labels)

    const valuesTemp = datos.serie.map((dato) => {
        const magnitud = dato.valor;
        return Number(magnitud);
    });

    const values = valuesTemp.splice(0,10).reverse();
    //console.log (values)

    const datasets = [
            {
                label: "Valor dolar - 10 últimos días",
                borderColor: "rgb(255, 99, 132)",
                data: values
            }
        ];

    const chartData = {labels, datasets }

    const config = {
        type: "line",
        data: chartData
    };

    if(myChart){
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, config);
}



//window.addEventListener("load",renderGrafica);

async function getMoneyIndicators() {
    try {

        const res = await fetch("https://mindicador.cl/api/")
        const data = await res.json();

        valorDolar = parseFloat(data.dolar.valor);
        valorEuro = parseFloat(data.euro.valor);
        valorUf = parseFloat(data.uf.valor);
        valorBitcoin =parseFloat(data.bitcoin.valor);

        convertData();
    } 
    catch (error) {
        alert("Error. Api caída");
        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.innerHTML =  "..."; 

    }
}

function convertData(){

let valorTemp = parseInt($moneyAmountInputBox.value);

      if(isNaN(valorTemp)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.");
        $moneyAmountInputBox.value="";
        $moneyAmountInputBox.placeholder = "monto en pesos chilenos (CLP)";
        $convertedAmountText.innerHTML =  "...";
        return;
      }

    let tipoMoneda = $moneyTypeSelectBox.value

    if(tipoMoneda==="dolar"){
        valorTemp = parseFloat(valorTemp/valorDolar).toFixed(3);
    }
    else if (tipoMoneda==="euro"){
        valorTemp = parseFloat(valorTemp/valorEuro).toFixed(3);
    }
    else if(tipoMoneda==="uf"){
        valorTemp = parseFloat(valorTemp/valorUf).toFixed(3);
    }
    else if(tipoMoneda==="bitcoin"){
        valorTemp = parseFloat(valorTemp/valorBitcoin).toFixed(3);
    }
    $convertedAmountText.innerHTML =  valorTemp;

}



function getValueAndProcess (){
    getMoneyIndicators();
}


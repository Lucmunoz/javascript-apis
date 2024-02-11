let valorDolar = 0;
let valorUf = 0;
let valorEuro = 0;
let valorBitcoin = 0;
let apiStatus


const $inputBox = document.getElementById("input-box");
const $selectBox = document.getElementById("money-select");
const $Button = document.getElementById("button");
$Button.addEventListener("click", getValueAndProcess);
const $resultText = document.getElementById("result");
const $chart = document.getElementById("myChart");



window.addEventListener("load",renderGrafica);


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
        $inputBox.value="";
        $inputBox.placeholder = "monto en pesos chilenos (CLP)";
        $resultText.innerHTML =  "..."; 

    }
}

function convertData(){

let valorTemp = parseInt($inputBox.value);

      if(isNaN(valorTemp)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice letras ni puntos.");
        $inputBox.value="";
        $inputBox.placeholder = "monto en pesos chilenos (CLP)";
        $resultText.innerHTML =  "...";
        return;
      }

    let tipoMoneda = $selectBox.value

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
    $resultText.innerHTML =  valorTemp;

}



function getValueAndProcess (){

    getMoneyIndicators();

}

async function getAndCreateDataToChart() {
    const res = await fetch("https://mindicador.cl/api/dolar/");
    const datos = await res.json();

    console.log (datos)
    const labelsTemp = datos.serie.map((dato) => {
        const fecha = dato.fecha.split("T")[0];
        return fecha;
    });

    labels = labelsTemp.splice(0,10).reverse();

    console.log (labels)
   
    const dataTemp = datos.serie.map((dato) => {
    const magnitud = dato.valor;
    return Number(magnitud);
    });

    data=dataTemp.splice(0,10).reverse();


    console.log (data)

    
    const datasets = [
    {
    label: "Valor histórico dolar - 10 últimos días",
    borderColor: "rgb(255, 99, 132)",
    data
    }
    ];

    return { labels, datasets };
}





async function renderGrafica() {

const data = await getAndCreateDataToChart();

const config = {
type: "line",
data
};


myChart.style.backgroundColor = "white";
new Chart(myChart, config);
}
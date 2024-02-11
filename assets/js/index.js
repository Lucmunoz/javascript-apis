let valorDolar = 0;
let valorUf = 0;
let valorEuro = 0;
let valorBitcoin = 0;

const $inputBox = document.getElementById("input-box");
const $selectBox = document.getElementById("money-select");
const $Button = document.getElementById("button");
$Button.addEventListener("click", processData);
const $result = document.getElementById("result");

async function getMoneyData() {
    try {
        const res = await fetch("https://mindicador.cl/api/")
        const data = await res.json();
        console.log(data);

        valorDolar = parseFloat(data.dolar.valor);
        valorEuro = parseFloat(data.euro.valor);
        valorUf = parseFloat(data.uf.valor);
        valorBitcoin =parseFloat(data.bitcoin.valor);

    } 
    catch (error) {
        alert(error.message);
    }
}

getMoneyData();

function processData (){

    let valorTemp = parseInt($inputBox.value);

      if(isNaN(valorTemp)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice puntos.");
        $inputBox.value="";
        $inputBox.placeholder = "monto en pesos chilenos (CLP)";
        return;
      }

    let tipoMoneda = $selectBox.value
    console.log (tipoMoneda)

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
    $result.innerHTML =  valorTemp;
}

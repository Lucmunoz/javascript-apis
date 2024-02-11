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
        const res = await fetch("https://mindicador.cl/ap/")
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
        $result.innerHTML =  "...";
    }
}



function processData (){

    console.log(getMoneyData())
    getMoneyData();

}


function convertData(){

let valorTemp = parseInt($inputBox.value);

      if(isNaN(valorTemp)) {
        alert("Porfavor, debe ingresar un valor numerico válido. No utilice puntos.");
        $inputBox.value="";
        $inputBox.placeholder = "monto en pesos chilenos (CLP)";
        $result.innerHTML =  "...";
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
    $result.innerHTML =  valorTemp;

}

/*https://dev.to/devcrafter91/elegant-way-to-check-if-a-promise-is-pending-577g */
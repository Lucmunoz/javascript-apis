

async function getAndCreateDataToChart() {
const res = await
fetch("https://mindicador.cl/api/dolar/");
const sismos = await res.json();

console.log (sismos)
const labels = sismos.serie.map((sismo) => {
return sismo.fecha;
});

console.log (labels)

const data = sismos.serie.map((sismo) => {
const magnitud = sismo.valor;
return Number(magnitud);
});

console.log (data)

const datasets = [
{
label: "Sismo",
borderColor: "rgb(255, 99, 132)",
data
}
];

console.log(typeof(datasets[0].data[0]))

return { labels, datasets };
}

async function renderGrafica() {
const data = await getAndCreateDataToChart();
console.log(data)

const config = {
type: "line",
data
};

const myChart = document.getElementById("myChart");
myChart.style.backgroundColor = "white";
new Chart(myChart, config);
}

renderGrafica();




/*
{
    "fechas": [
        "2024-02-09",
        "2024-02-08",
        "2024-02-07",
        "2024-02-06",
        "2024-02-05",
        "2024-02-02",
        "2024-02-01",
        "2024-01-31",
        "2024-01-30",
        "2024-01-29"
    ],
    "datasets": [
        {
            "label": "Valor",
            "borderColor": "rgb(255, 99, 132)",
            "valores": [
                957.86,
                947.9,
                949.81,
                955.73,
                943.84,
                936.01,
                932.26,
                932.66,
                927.63,
                916.16
            ]
        }
    ]
}






----
{
    "labels": [
        "2024-02-11 12:36:17",
        "2024-02-11 12:19:43",
        "2024-02-11 11:34:08",
        "2024-02-11 09:59:05",
        "2024-02-11 08:38:32",
        "2024-02-11 08:27:22",
        "2024-02-11 05:17:00",
        "2024-02-11 05:07:25",
        "2024-02-11 03:09:43",
        "2024-02-11 02:18:51",
        "2024-02-11 02:05:55",
        "2024-02-10 23:48:48",
        "2024-02-10 23:24:53",
        "2024-02-10 22:07:41",
        "2024-02-10 21:54:47"
    ],
    "datasets": [
        {
            "label": "Sismo",
            "borderColor": "rgb(255, 99, 132)",
            "data": [
                3.2,
                3.1,
                2.7,
                2.5,
                2.8,
                2.6,
                3,
                2.7,
                2.9,
                4.1,
                2.6,
                3,
                2.7,
                2.5,
                2.7
            ]
        }
    ]
}


 */
Chart.register(ChartDataLabels);
const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};
const chartColors = CHART_COLORS;
const colors = [chartColors.red, chartColors.orange, chartColors.yellow, chartColors.green, chartColors.blue];
const cache = new Map();
let width, height, gradient;


pie_day = document.querySelectorAll('.description_pie_day li');
labels_data_pie_day = [];
data_pie_day = [];
let counter_pie_day = 0;
let bg_pie_day = ["#046240", "#ffa500", "#0175c3", "#cf0940", "#01c3bd", "#012bc3"]
for (let object of pie_day) {
  let label = object.querySelector('.name_li').innerText;
  let data = Number(object.querySelector('.number_li').innerText);
  if (data !== 0) {
    labels_data_pie_day.push(label);
    data_pie_day.push(data);
  } else {
    bg_pie_day.splice(counter_pie_day, 1);
  }
  counter_pie_day++;
}

pie_month = document.querySelectorAll('.description_pie_month li');
labels_data_pie_month = [];
data_pie_month = [];
let counter_pie_month = 0;
let bg_pie_month = ["#046240", "#ffa500", "#0175c3", "#cf0940", "#01c3bd", "#012bc3"]
for (let object of pie_month) {
  let label = object.querySelector('.name_li').innerText;
  let data = Number(object.querySelector('.number_li').innerText);
  if (data !== 0) {
    labels_data_pie_month.push(label);
    data_pie_month.push(data);
  } else {
    bg_pie_month.splice(counter_pie_month, 1);
  }
  counter_pie_month++;
}

let config_linear_days = {
  labels: labels_linear_days,
  datasets: [{
    label: 'Количество визитов',
    data: data_linear_days,
    backgroundColor: [CHART_COLORS.yellow],
    tension: .4,
    fill: true,
    pointRadius: 0,
    pointHitRadius: 20,
  }],
};

let config_linear_months = {
  labels: labels_linear_months,
  datasets: [{
    label: 'Количество нажатий',
    data: data_linear_months,
    backgroundColor: [CHART_COLORS.yellow],
    tension: .4,
    fill: true,
    pointRadius: 0,
    pointHitRadius: 20,
  }],
};

let linear_days_obj = document.querySelector('#linearChartDays');
let lineChartDays = new Chart(linear_days_obj, {
  type: 'line',
  data: config_linear_days,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: false
    },
  }
});

let linear_months_obj = document.querySelector('#linearChartMonths');
let lineChartMonths = new Chart(linear_months_obj, {
  type: 'line',
  data: config_linear_months,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: false
    },
  }
});
linear_months_obj.style.display = 'none';




let data_day = [{
  labels: labels_data_pie_day,
  data: data_pie_day,
  backgroundColor: ["#046240", "#ffa500", "#0175c3", "#cf0940", "#01c3bd", "#012bc3"],
  borderColor: "#fff",
  offset: 7,
  hoverOffset: 12,
}];

let options = {
  tooltips: {
    enabled: true
  },
  plugins: {
    datalabels: {
      formatter: (value, ctx) => {
        let datasets = ctx.chart.data.datasets;
        if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
          let sum = datasets[0].data.reduce((a, b) => a + b, 0);
          let percentage = Math.round((value / sum) * 100) + '%';
          return percentage;
        } else {
          return percentage;
        }
      },
      color: '#fff',
    }
  },
  responsive: true,
};
let day_circle_obj = document.getElementById("circleChartDay").getContext('2d');
let CircleChartDay = new Chart(day_circle_obj, {
  type: 'pie',
  data: {
    datasets: data_day
  },
  options: options
});




let data_month = [{
  labels: labels_data_pie_month,
  data: data_pie_month,
  backgroundColor: ["#046240", "#ffa500", "#0175c3", "#cf0940", "#01c3bd", "#012bc3"],
  borderColor: "#fff",
  offset: 7,
  hoverOffset: 12,
}];
let month_circle_obj = document.getElementById("circleChartMonth").getContext('2d');
let CircleChartMonth = new Chart(month_circle_obj, {
  type: 'pie',
  data: {
    datasets: data_month
  },
  options: options
});
document.getElementById("circleChartMonth").style.display = 'none';


let select_linear_chart = document.querySelector('.full_chart_header select');
let number_click_months = document.querySelector('.number_click_months');
let number_click_days = document.querySelector('.number_click_days');
select_linear_chart.addEventListener('change', () => {
  if (select_linear_chart.value === 'month') {
    linear_days_obj.style.display = 'none';
    linear_months_obj.style.display = 'block';

    number_click_months.style.display = 'inline';
    number_click_days.style.display = 'none';
  } else {
    linear_days_obj.style.display = 'block';
    linear_months_obj.style.display = 'none';

    number_click_months.style.display = 'none';
    number_click_days.style.display = 'inline';
  }
});


let no_data_block = document.querySelector('.no-data');
let circle_obj_day_base = document.getElementById("circleChartDay");
no_data_block.style.display = 'none';

let all_zero_days = true
for (let i of data_pie_day) {
  if (i !== 0) {
    all_zero_days = false
  }
}
if (all_zero_days) {
  circle_obj_day_base.style.display = 'none';
  no_data_block.style.display = 'flex';
}



let circle_obj_month_base = document.getElementById("circleChartMonth");
let description_pie_day = document.querySelector('.description_pie_day');
let description_pie_month = document.querySelector('.description_pie_month');
let select_circle_chart = document.querySelector('.pie_chat_header select');
select_circle_chart.addEventListener('change', () => {
  if (select_circle_chart.value === 'month') {
    circle_obj_day_base.style.display = 'none';
    description_pie_day.style.display = 'none';

    circle_obj_month_base.style.display = 'block';
    description_pie_month.style.display = 'flex';
    no_data_block.style.display = 'none';

    let all_zero = true
    for (let i of data_pie_month) {
      if (i !== 0) {
        all_zero = false
      }
    }
    if (all_zero) {
      circle_obj_month_base.style.display = 'none';
      no_data_block.style.display = 'flex';
    }
  } else {
    circle_obj_day_base.style.display = 'block';
    description_pie_day.style.display = 'flex';

    circle_obj_month_base.style.display = 'none';
    description_pie_month.style.display = 'none';
    no_data_block.style.display = 'none';

    let all_zero = true
    for (let i of data_pie_day) {
      if (i !== 0) {
        all_zero = false
      }
    }
    if (all_zero) {
      circle_obj_day_base.style.display = 'none';
      no_data_block.style.display = 'flex';
    }
  }
});




// Responsive


let d_pie = '270px';
if (window.innerWidth <= 1700 && window.innerWidth > 1500) {
  d_pie = '200px';
} else if (window.innerWidth <= 1500 && window.innerWidth > 1200) {
  d_pie = '160px';
} else if (window.innerWidth <= 1000 && window.innerWidth > 800) {
  d_pie = '200px';
}

CircleChartDay.canvas.parentNode.style.height = d_pie;
CircleChartDay.canvas.parentNode.style.width = d_pie;

CircleChartMonth.canvas.parentNode.style.height = d_pie;
CircleChartMonth.canvas.parentNode.style.width = d_pie;

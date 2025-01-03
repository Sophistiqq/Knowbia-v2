// Fetch data from API and return it as an object, which will be used in the chart component.

// Data for the chart



export const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255, 99, 132, 1)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      data: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      label: 'My Second dataset',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      data: [28, 48, 40, 19, 86, 27, 90]
    }
  ]
}

export const options = {
  responsive: true,
  maintainAspectRatio: true,
  onResize: function (chart: any) {
    chart.resize(700, 600)
  },
  plugins: {
    legend: {
      labels: {
        color: 'white'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'white'
      }
    },
    y: {
      ticks: {
        color: 'white'
      }
    }
  }
}

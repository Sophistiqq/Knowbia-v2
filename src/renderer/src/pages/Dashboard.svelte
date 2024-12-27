<script>
  import { Line } from 'svelte-chartjs'
  import { data, options } from '../utils/chart-data'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)
</script>

<div class="container">
  <h2>Dashboard</h2>
  <div class="line-chart">
    <Line {data} {options} />
  </div>
</div>

<style lang="scss">
  .container {
    width: 100%;
    margin: 0 auto;
    padding-right: 15px;
    h2 {
      margin-block: 1rem;
    }
  }
  .line-chart {
    height: max-content;
    width: max-content;
    padding: 1rem;
    border: var(--border);
    background-color: var(--background);
  }
</style>


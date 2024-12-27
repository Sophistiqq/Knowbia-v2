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
  <div class="overview">
    <div class="card">
      <h3>Users</h3>
      <p>100</p>
    </div>
    <div class="card">
      <h3>Users</h3>
      <p>100</p>
    </div>
    <div class="card">
      <h3>Users</h3>
      <p>100</p>
    </div>
    <div class="card">
      <h3>Users</h3>
      <p>100</p>
    </div>
  </div>
  <div class="charts">
    <div class="chart">
      <h3>Scores</h3>
      <Line {data} {options} />
    </div>
    <div class="chart">
      <h3>Scores</h3>
      <Line {data} {options} />
    </div>
  </div>
</div>

<style lang="scss">
  .overview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-block: 1rem;
    .card {
      flex: 1;
      padding: 1rem;
      border: var(--border);
      background-color: var(--background);
      h3 {
        border-bottom: var(--border);
        padding-bottom: 0.5rem;
      }
    }
  }
  .container {
    width: 100%;
    padding-right: 2rem;
    h2 {
      align-self: flex-start;
      margin-block: 1.25rem;
    }
  }
  .charts {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  @media (width > 1080px) {
    .container {
      padding: 0;
      margin-inline: auto;
    }
    .charts {
      flex-direction: row;
    }
  }
  .chart {
    width: 100%;
    padding: 1rem;
    border: var(--border);
    width: max-content;
    background-color: var(--background);
    h3 {
      border-bottom: var(--border);
      padding-bottom: 0.5rem;
    }
  }
</style>

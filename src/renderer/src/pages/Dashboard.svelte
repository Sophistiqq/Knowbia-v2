<script lang="ts">
  import { Line, Bar } from 'svelte-chartjs'
  import { options } from '../utils/chart-data'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    BarElement,
    LinearScale,
    PointElement,
    CategoryScale
  } from 'chart.js'
  import { onMount } from 'svelte'
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    BarElement,
    LinearScale,
    PointElement,
    CategoryScale
  )
  let tab = 'line'

  function switchTab(selectedTab: string) {
    tab = selectedTab
  }

  onMount(() => {
    fetchData()
    fetchAverageOverTime()
    fetchAssessmentScores()
  })
  let averageOverTime: any = {
    labels: [],
    values: [],
    datasets: [
      {
        label: 'Average Score',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }
  type dashboardData = {
    savedAssessments: any
    students: any
    ongoingAssessments: any
    completedAssessments: any
    topPerformers: any
  }

  let dashboardData: dashboardData = {
    savedAssessments: 0,
    students: 0,
    ongoingAssessments: 0,
    completedAssessments: 0,
    topPerformers: []
  }

  async function fetchData() {
    const res = await fetch('http://localhost:3000/page/dashboard')
    const data = await res.json()
    dashboardData = data
    console.table(dashboardData.topPerformers)
  }

  async function fetchAverageOverTime() {
    const response = await fetch('http://localhost:3000/api/scores/average-over-time')
    const data = await response.json()
    averageOverTime.labels = data.labels
    averageOverTime.datasets[0].data = data.values
    console.log(averageOverTime)
  }

  let assessmentScores: any = {
    labels: [],
    values: [],
    datasets: [
      {
        label: 'Assessment Scores',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  async function fetchAssessmentScores() {
    const response = await fetch('http://localhost:3000/api/scores/distribution')
    const data = await response.json()
    assessmentScores.labels = data.labels
    assessmentScores.datasets[0].data = data.values
  }
</script>

<div class="container">
  <h2>Dashboard</h2>
  <div class="overview">
    <div class="card">
      <h3>Students</h3>
      <p>{dashboardData.students}</p>
    </div>
    <div class="card">
      <h3>Saved Assessments</h3>
      <p>{dashboardData.savedAssessments}</p>
    </div>
    <div class="card">
      <h3>Ongoing Assessments</h3>
      <p>{dashboardData.ongoingAssessments}</p>
    </div>
    <div class="card">
      <h3>Completed Assessments</h3>
      <p>{dashboardData.completedAssessments}</p>
    </div>
  </div>
  <div class="tabs">
    <button on:click={() => switchTab('line')} class:active={tab === 'line'}>Line Chart</button>
    <button on:click={() => switchTab('bar')} class:active={tab === 'bar'}>Bar Chart</button>
  </div>
  <div class="charts">
    {#if tab === 'line'}
      <div class="chart">
        <h3>Assessment Progress</h3>
        <Line data={averageOverTime} {options} />
      </div>
    {/if}
    {#if tab === 'bar'}
      <div class="chart">
        <h3>Assessment Progress</h3>
        <Bar data={assessmentScores} {options} />
      </div>
    {/if}
  </div>
  <div class="top-performers">
    <h3>Top Performers</h3>
    <table class="students">
      <thead>
        <tr class="headers">
          <th>Rank</th>
          <th>Student Number</th>
          <th>Student Name</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {#each dashboardData.topPerformers as student, index}
          <tr class="student">
            <td>#{index + 1}</td>
            <td>{student.student_number}</td>
            <td>{student.student_name}</td>
            <td class="points">{student.total_points}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style lang="scss">
  .overview {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 1rem;
    margin-block: 1rem;
    .card {
      flex: 1;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: var(--border);
      background-color: var(--background);
      p {
        font-size: 1.3m;
        font-weight: bold;
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
  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    button {
      padding: 0.5rem 1rem;
      margin: 0 0.5rem;
      border: none;
      background-color: var(--background);
      cursor: pointer;
      &.active {
        font-weight: bold;
        border-bottom: 2px solid var(--primary);
      }
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
      padding-inline: 5%;
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

  .top-performers {
    margin-block: 1rem;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    background-color: var(--background);
    border: var(--border);
    h3 {
      align-self: flex-start;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .students {
      width: 100%;
      border-collapse: collapse;
      .headers {
        background-color: var(--background);
      }
      th,
      td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: var(--border);
      }
      th {
        font-weight: bold;
      }
    }
  }
</style>

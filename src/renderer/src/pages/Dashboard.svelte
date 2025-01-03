<script lang="ts">
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
  import { onMount } from 'svelte'
  ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)
  onMount(() => {
    fetchData()
  })

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
  <div class="charts">
    <div class="chart">
      <h3>Scores</h3>
      <Line {data} {options} />
    </div>
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
        background-color: var(--primary);
        color: var(--on-primary);
      }
      .student {
        &:nth-child(even) {
          background-color: var(--surface);
        }
      }
      th,
      td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: var(--border);
        font-size: 1rem;
        font-weight: normal;
      }
      th {
        font-weight: bold;
      }
    }
  }
</style>

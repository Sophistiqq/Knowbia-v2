<script lang="ts">
  import { onMount } from 'svelte'
  import { toast } from '../utils/Toast'

  onMount(() => {
    getData()
  })
  let onGoingAssessments = []
  let restrictedStudents = []

  async function getData() {
    const res = await fetch('http://localhost:3000/page/manage-assessments')
    const data = await res.json()
    if (data.status === 'success') {
      onGoingAssessments = data.onGoingAssessments
      restrictedStudents = data.restrictedStudents
      console.table(onGoingAssessments)
    } else {
      toast(data.message, 2000, data.status)
    }
  }
</script>

<main>
  <div class="container">
    <h2>Manage Assessments</h2>
    <!-- This is where the assessments are managed, ongoing assessments, restricted students, for each section, there are controls on the assessments, in ongoing there should be a stop button, on restricted should be unrestrict button -->

    <!-- Ongoing Assessments -->
    {#if onGoingAssessments.length === 0}
      <h3>No ongoing assessments</h3>
      <div class="separator"></div>
    {:else}
      <h3>Ongoing Assessments</h3>
      <div class="section-wrapper">
        {#each onGoingAssessments as assessment}
          <div class="section">
            <div class="details">
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
            </div>
            <button>Stop</button>
          </div>
          <div class="separator"></div>
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }
  @media (width > 1080px) {
    main {
      padding: 0;
    }
    .container {
      padding: 0;
      margin-inline: 10%;
    }
  }
  .container {
    padding-block: 1.25rem;
  }
  .separator {
    width: 100%;
    height: 1px;
    border: var(--border);
    opacity: 0.5;
  }
  .section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  button {
    padding: 0.75rem 2rem;
    background-color: var(--background);
    border: var(--border);
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    &:hover {
      background-color: var(--hover);
    }
  }
</style>

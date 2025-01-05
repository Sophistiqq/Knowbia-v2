<script lang="ts">
  import { onMount } from 'svelte'
  import { toast } from '../utils/Toast'
  onMount(() => {
    getData()
    getSavedList()
  })
  let toggles = {}
  let onGoingAssessments = []
  let restrictedStudents = []
  let assessmentsList = []
  async function getData() {
    const res = await fetch('http://localhost:3000/page/manage-assessments')
    const data = await res.json()
    if (data.status === 'success') {
      onGoingAssessments = data.onGoingAssessments
      restrictedStudents = data.restrictedStudents
    } else {
      toast(data.message, 2000, data.status)
    }
  }
  async function getSavedList() {
    const res = await fetch('http://localhost:3000/assessments/list')
    assessmentsList = await res.json()
  }
  function showDetails(index: any) {
    toggles[index] = !toggles[index]
  }
  let modal = false
  let selectedAssessment: any
  function showModal(assessment: any) {
    selectedAssessment = assessment
    modal = true
  }

  async function deleteAssessment(index: any) {
    const res = await fetch(`http://localhost:3000/assessments/delete/${index}`)
    const data = await res.json()
    getSavedList()
    modal = false
    toast(data.message, 2000, data.status)
  }

  async function stopAssessment(assessment: any) {
    const res = await fetch('http://localhost:3000/control/stop-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assessment)
    })
    const data = await res.json()
    getData()
    modal_stop = false
    toast(data.message, 2000, data.status)
  }

  async function unrestrict(id: any) {
    console.log(id)
    const res = await fetch(`http://localhost:3000/control/unrestrict/${id}`, {
      method: 'POST'
    })
    const data = await res.json()
    getData()
    toast(data.message, 2000, data.status)
  }

  let modal_stop = false

  // Keyboard shortcuts enter to press the yes button
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (modal) {
        deleteAssessment(selectedAssessment.id)
      } else if (modal_stop) {
        stopAssessment(selectedAssessment)
      }
    }
  })
</script>

<main>
  <div class="container">
    <h2>Manage Assessments</h2>

    <!-- Ongoing Assessments -->
    {#if onGoingAssessments.length !== 0}
      <h3>Ongoing Assessments</h3>
      <div class="section-wrapper">
        {#each onGoingAssessments as assessment}
          <div class="section">
            <button class="details">
              <div class="detail">
                <h3>{assessment.title}</h3>
                <p>{assessment.description || 'No description'}</p>
                <p>{assessment.section}</p>
              </div>
            </button>
            <button
              class="btns"
              on:click={() => {
                selectedAssessment = assessment
                modal_stop = true
              }}>Stop</button
            >
          </div>
        {/each}
      </div>
    {/if}

    {#if assessmentsList.length !== 0}
      <h3>Saved Assessments</h3>
      <div class="section-wrapper">
        {#each assessmentsList as assessment, index}
          <div class="section">
            <button class="details" on:click={() => showDetails(index)}>
              <div class="detail">
                <h3>{assessment.title}</h3>
                <p>{assessment.description || 'No description'}</p>
                {#if toggles[index]}
                  <p>Time Limit: {assessment.time_limit}</p>
                  <p>Shuffle Questions: {assessment.shuffle_questions === 0 ? 'No' : 'Yes'}</p>
                {/if}
              </div>
            </button>
            <button class="delete btns" on:click={() => showModal(assessment)}>Delete</button>
          </div>
        {/each}
      </div>
    {/if}

    {#if restrictedStudents.length !== 0}
      <h3>Restricted Students</h3>
      <div class="section-wrapper">
        {#each restrictedStudents as student}
          <div class="section">
            <button class="details">
              <div class="detail">
                <h3>{student.student_number}</h3>
                <p><b>{student.student_name}</b></p>
                <p>{student.reason.toUpperCase()}</p>
              </div>
            </button>
            <button class="btns" on:click={() => unrestrict(student.student_number)}
              >Unrestrict</button
            >
          </div>
        {/each}
      </div>
    {/if}
  </div>
</main>

{#if modal}
  <div class="modal">
    <div class="modal-content">
      <h2>Are you sure you want to Delete the Assessment? {selectedAssessment.title}</h2>
      <button on:click={() => deleteAssessment(selectedAssessment.id)}>Yes</button>
      <button on:click={() => (modal = false)}>No</button>
    </div>
  </div>
{/if}

{#if modal_stop}
  <div class="modal">
    <div class="modal-content">
      <h2>Are you sure you want to Stop the Assessment? {selectedAssessment.title}</h2>
      <button on:click={() => stopAssessment(selectedAssessment)}>Yes</button>
      <button on:click={() => (modal_stop = false)}>No</button>
    </div>
  </div>
{/if}

<style lang="scss">
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
      margin-inline: 5%;
    }
  }
  .container {
    padding-block: 1.25rem;
    margin-right: 2rem;
    h2 {
      margin-bottom: 2rem;
    }
  }
  button {
    padding: 0.75rem 2rem;
    background-color: var(--background);
    border: var(--border);
    cursor: pointer;
    transition: background-color 0.3s;
    &:hover {
      background-color: var(--hover);
    }
  }
  .modal {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(5px);
    border: 1px solid red;
    display: grid;
    place-items: center;
    .modal-content {
      border: var(--border);
      background: var(--background);
      width: 700px;
      text-align: center;
      padding: 2rem;
      h2 {
        margin-bottom: 1rem;
      }
    }
  }

  .section-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-block: 1rem;
    background-color: var(--background);
    border-inline: var(--border);
    padding-right: 1rem;
    .section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .details {
        border: none;
        background-color: transparent;
        .detail {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 0.25rem;
          border: none;
        }
      }
      .btns {
        border: none;
        background-color: transparent;
        width: 10rem;
        &:hover {
          background-color: var(--hover);
        }
      }
    }
  }
</style>

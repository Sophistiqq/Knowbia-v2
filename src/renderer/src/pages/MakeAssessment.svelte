<script lang="ts">
  import { Restart_alt, Remove_red_eye, Save } from 'svelte-google-materialdesign-icons'
  import { toast } from '../utils/Toast'
  import { fly } from 'svelte/transition'

  type Assessment = {
    id: number
    title: string
    description: string
    time_limit: number
    questions: any[]
    answers: any[]
  }
  let assessment: Assessment = {
    id: 0,
    title: 'Untitled Assessment',
    description: 'No description',
    time_limit: 60,
    questions: [],
    answers: []
  }
  function resetAssessment() {
    assessment = {
      id: 0,
      title: 'Untitled Assessment',
      description: 'No description',
      time_limit: 60,
      questions: [],
      answers: []
    }
    resetConfirmation = false
    toast('Assessment reset', '2000', 'success')
  }
  let resetConfirmation = false
  let preview = true
  $: open = preview ? 'open' : ''
  // if the screen is too small show a toast
  $: if (window.innerWidth < 768) {
    preview = false
    toast('Preview is disabled on small screens', '2000', 'info')
  }

  // Textarea auto resize
  let descriptionTextarea: HTMLTextAreaElement
  function adjustTextareaHeight() {
    if (descriptionTextarea) {
      descriptionTextarea.style.height = 'auto'
      descriptionTextarea.style.height = `${descriptionTextarea.scrollHeight}px`
    }
  }
</script>

<main>
  <nav class="nav">
    <h1>Create an Assessment</h1>
    <div class="button-group">
      <button><b>Distribute</b></button>
      <button><Save variation="filled" /></button>
      <button on:click={() => (resetConfirmation = !resetConfirmation)}
        ><Restart_alt variation="filled" /></button
      >
      <button
        on:click={() => {
          preview = !preview
          console.log(open)
        }}><Remove_red_eye variation="filled" /></button
      >
    </div>
  </nav>
  <div class="container">
    <div class="assessment-header">
      <h3>Assessment Headers</h3>
      <div class="input-group">
        <input type="text" placeholder="Assessment Title" bind:value={assessment.title} />
        <textarea
          placeholder="Assessment Description"
          bind:value={assessment.description}
          bind:this={descriptionTextarea}
          on:input={adjustTextareaHeight}
        ></textarea>
        <input
          type="number"
          placeholder="Time Limit (minutes)"
          bind:value={assessment.time_limit}
        />
      </div>
    </div>

    <div class="preview-container {open}">
      <h3>Preview</h3>
      <div class="p-assessment-header">
        <h3>{assessment.title}</h3>
        <div class="separator"></div>
        <p>{@html assessment.description.replace(/\n/g, '<br>')}</p>
        <div class="separator"></div>
        <p>Duration: {assessment.time_limit || 0} minutes</p>
      </div>
    </div>
  </div>
</main>

{#if resetConfirmation}
  <div class="modal" transition:fly>
    <div class="modal-content">
      <h3>Reset Assessment</h3>
      <p>Are you sure you want to reset the assessment?</p>
      <div class="button-group">
        <button on:click={resetAssessment}>Yes</button>
        <button on:click={() => (resetConfirmation = false)}>No</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    justify-content: space-between;
    align-items: flex-start;
  }
  .separator {
    height: 2px;
    width: 100%;
    background: var(--hover);
    margin: 0.5rem 0;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: 2.5rem;
    border-bottom: var(--border);
    backdrop-filter: blur(10px);
    height: 4rem;
    .button-group {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      button {
        padding: 0.5rem 1rem;
        border: var(--border);
        border-radius: 5px;
        background: var(--background);
        cursor: pointer;
        &:hover {
          background: var(--hover);
        }
      }
    }
  }
  main {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin-right: 1rem;
  }

  .assessment-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
  .input-group {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input {
    width: 100%;
    padding: 10px;
    border: var(--border);
    border-radius: 5px;
    background: var(--background);
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: var(--border);
    border-radius: 5px;
    background: var(--background);
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    backdrop-filter: blur(10px);
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  .modal-content {
    width: 30rem;
    padding: 2rem;
    background: var(--background);
    border-radius: 5px;
    border: var(--border);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .button-group {
      display: flex;
      justify-content: center;
      gap: 1rem;

      button {
        padding: 1rem 2rem;
        border-radius: 5px;
        border: var(--border);
        background: var(--background);
        cursor: pointer;
        &:hover {
          background: var(--hover);
        }
      }
    }
  }

  .preview-container {
    width: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: width 0.3s;
    h3 {
      margin-bottom: 0.5rem;
    }
    .p-assessment-header {
      padding: 1rem;
      border: var(--border);
      border-radius: 5px;
      background: var(--background);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      h3 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }
    }
  }
  .open {
    width: 100%;
  }

  // if the screen is big, the preview should be the size of a mobile phone
  @media (min-width: 768px) {
    .open {
      width: 30rem;
    }
  }
  @media (max-width: 768px) {
    .preview-container,
    .open {
      width: 0;
    }
  }
</style>

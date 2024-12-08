<!-- AssessmentPreview.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  export let assessment: {
    title: string
    description: string
    time_limit: number
    questions: any[]
    answers: any[]
  }
  onMount(() => {
    console.table(assessment.questions)
  })
</script>

<div class="p-assessment-header">
  <h3>{assessment.title}</h3>
  <div class="separator"></div>
  <p>{@html assessment.description.replace(/\n/g, '<br>')}</p>
  <div class="separator"></div>
  <p>Duration: {assessment.time_limit} minutes</p>
</div>

<h3>Questions</h3>
<br />

<style lang="scss">
  .separator {
    height: 2px;
    width: 100%;
    background: var(--hover);
    margin: 0.5rem 0;
  }

  .p-assessment-header {
    width: 100%;
    word-wrap: normal;
    padding: 1rem;
    margin-top: 0.5rem;
    border: var(--border);
    border-radius: 5px;
    background: var(--background);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
  }
</style>

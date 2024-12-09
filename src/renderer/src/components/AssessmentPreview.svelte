<script lang="ts">
  import { slide } from 'svelte/transition'

  // Define an enum for question types to make the code more type-safe
  type QuestionType =
    | 'short_answer'
    | 'paragraph'
    | 'multiple_choice'
    | 'checkbox'
    | 'dropdown'
    | 'file_upload'
    | 'date'
    | 'time'
    | 'radio'

  // Define a type for the question to improve type checking
  type Question = {
    id: string
    question: string
    type: QuestionType
    options?: string[]
    required?: boolean
    correctAnswer?: string | string[]
  }
  export let assessment: {
    title: string
    description: string
    time_limit: number
    questions: Question[]
    answers: any[]
  }
</script>

<div class="p-assessment-header">
  <h3>{assessment.title}</h3>
  <div class="separator"></div>
  <p>{@html assessment.description.replace(/\n/g, '<br>')}</p>
  <div class="separator"></div>
  <p>Duration: {assessment.time_limit} minutes</p>
</div>

<h3 id="q">Questions</h3>

<div class="p-questions">
  {#each assessment.questions as question, index}
    <div class="preview-question" transition:slide={{ axis: 'y' }}>
      <div class="question-header">
        <span class="question-number">{index + 1}.</span>
        <span class="question-text">{question.question}</span>
        {#if question.required}
          <span class="required-marker">*</span>
        {/if}
      </div>

      <div class="question-input">
        {#if question.type === 'short_answer'}
          <input type="text" placeholder="Your answer" class="preview-input" />
        {:else if question.type === 'paragraph'}
          <textarea placeholder="Your answer" class="preview-textarea"></textarea>
        {:else if question.type === 'multiple_choice' || question.type === 'radio'}
          {#each question.options || [] as option, optIndex}
            <div class="preview-option">
              <input
                type="radio"
                id="q{question.id}-option{optIndex}"
                name="q{question.id}"
                value={option}
              />
              <label for="q{question.id}-option{optIndex}">{option}</label>
            </div>
          {/each}
        {:else if question.type === 'checkbox'}
          {#each question.options || [] as option, optIndex}
            <div class="preview-option">
              <input type="checkbox" id="q{question.id}-option{optIndex}" value={option} />
              <label for="q{question.id}-option{optIndex}">{option}</label>
            </div>
          {/each}
        {:else if question.type === 'dropdown'}
          <select class="preview-select">
            {#each question.options || [] as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        {:else if question.type === 'date'}
          <input type="date" class="preview-input" />
        {:else if question.type === 'time'}
          <input type="time" class="preview-input" />
        {:else if question.type === 'file_upload'}
          <input type="file" class="preview-file" />
        {/if}
      </div>
    </div>
  {/each}
</div>

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

  textarea,
  select,
  option,
  input {
    border: var(--border);
    outline: none;
    border-radius: 0.2rem;
    padding: 0.75rem;
    width: 100%;
    background: var(--background);
  }
  input[type='radio'],
  input[type='checkbox'] {
    width: fit-content;
  }
  #q {
    margin-block: 1rem;
  }

  .p-questions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .preview-question {
    border: var(--border);
    border-radius: 5px;
    padding: 1rem;
    background: var(--background);
  }

  .question-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.5rem;

    .question-number {
      font-weight: bold;
    }

    .required-marker {
      color: red;
      margin-left: 0.25rem;
    }
  }

  .question-input {
    margin-top: 0.5rem;

    .preview-input,
    .preview-textarea,
    .preview-select,
    .preview-file {
      width: 100%;
      padding: 0.5rem;
      border: var(--border);
      border-radius: 5px;
      margin-top: 0.5rem;
    }

    .preview-textarea {
      min-height: 100px;
    }

    .preview-option {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;

      input {
        margin-right: 0.5rem;
      }
    }
  }
</style>

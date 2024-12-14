<script lang="ts">
  import { slide } from 'svelte/transition'

  // Define a type for the question to improve type checking
  type Question = {
    id: number
    question: string
    type: 'multiple_choice' | 'short_answer' | 'true_false' | 'ranking' | 'essay' | 'linear_scale'
    options?: string[]
    correctAnswers?: any[]
    required: boolean
    points: number
    shuffleOptions: boolean
    category?: string
    hint?: string
    media?: string | null
    showMediaUpload?: boolean
    // Linear Scale specific properties
    linearScaleStart?: number
    linearScaleEnd?: number
    linearScaleStep?: number
  }
  export let assessment: {
    title: string
    description: string
    time_limit: number
    shuffle_questions: boolean
    questions: Question[]
  }
</script>

<div class="p-assessment-header">
  <h3>{assessment.title || 'Untitled Assessment'}</h3>
  <div class="separator"></div>
  <p>{@html assessment.description.replace(/\n/g, '<br>') || 'No Description'}</p>
  <div class="separator"></div>
  <p>Duration: {assessment.time_limit} minutes</p>
</div>

<h3 id="q">Questions</h3>

<div class="p-questions">
  {#each assessment.questions as question, index}
    <div class="preview-question" transition:slide={{ axis: 'y' }}>
      <div class="question-header">
        <span class="question-number">{index + 1}.</span>
        <span class="question-text"
          >{question.question !== '' ? question.question : 'Blank Question'}
        </span>
        {#if question.required}
          <span class="required-marker">*</span>
        {/if}
      </div>

      <div class="question-input">
        {#if question.type === 'short_answer'}
          <input type="text" placeholder="Your answer" class="preview-input" />
        {:else if question.type === 'essay'}
          <textarea placeholder="Your answer" class="preview-textarea"></textarea>
        {:else if question.type === 'multiple_choice'}
          {#each question.options || [] as option, optIndex}
            <div class="preview-option">
              <input
                type="radio"
                id="q{question.id}-option{optIndex}"
                name="q{question.id}"
                value={option}
              />
              <label for="q{question.id}-option{optIndex}"
                >{option !== '' ? option : `Option ${optIndex + 1}`}</label
              >
            </div>
          {/each}
        {:else if question.type === 'true_false'}
          <div class="preview-option">
            <input type="radio" id="q{question.id}-true" name="q{question.id}" value="true" />
            <label for="q{question.id}-true">True</label>
          </div>
          <div class="preview-option">
            <input type="radio" id="q{question.id}-false" name="q{question.id}" value="false" />
            <label for="q{question.id}-false">False</label>
          </div>
        {:else if question.type === 'ranking'}
          {#each question.options || [] as _option, optIndex}
            <div class="preview-option">
              <span>{optIndex + 1}.</span>
              <input type="text" placeholder="Option" class="preview-input" />
            </div>
          {/each}
        {:else if question.type === 'linear_scale'}
          <input type="range" min="0" max="10" step="1" />
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
</style>

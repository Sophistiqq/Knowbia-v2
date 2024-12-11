<script lang="ts">
  import { toast } from '../utils/Toast'
  import { fly, slide } from 'svelte/transition'

  // Types
  type Assessment = {
    title: string
    description: string
    time_limit: number
    questions: Question[]
  }

  type Question = {
    id: string
    question: string
    type: 'multiple_choice' | 'short_answer' | 'true_false'
    options?: string[]
    correctAnswers?: string[]
    required: boolean
    points: number
    shuffleOptions: boolean
    category?: string
    hint?: string
    media?: string | null
    showMediaUpload?: boolean
  }

  // Initial State
  let assessment: Assessment = {
    title: 'Untitled Assessment',
    description: '',
    time_limit: 60,
    questions: []
  }

  // UI State
  let resetConfirmation = false
  let preview = true
  let descriptionTextarea: HTMLTextAreaElement

  // Utility Functions
  function adjustTextareaHeight() {
    if (descriptionTextarea) {
      descriptionTextarea.style.height = 'auto'
      descriptionTextarea.style.height = `${descriptionTextarea.scrollHeight}px`
    }
  }

  // Question Management
  function addQuestion() {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: '',
      type: 'multiple_choice',
      required: false,
      points: 1,
      shuffleOptions: false,
      options: [''],
      correctAnswers: [],
      showMediaUpload: false
    }
    assessment.questions = [...assessment.questions, newQuestion]
  }

  function duplicateQuestion(question: Question, index: number) {
    const duplicatedQuestion = structuredClone(question)
    duplicatedQuestion.id = crypto.randomUUID()
    assessment.questions = [
      ...assessment.questions.slice(0, index + 1),
      duplicatedQuestion,
      ...assessment.questions.slice(index + 1)
    ]
  }

  function deleteQuestion(index: number) {
    assessment.questions = assessment.questions.filter((_, i) => i !== index)

    // Ensure at least one question exists
    if (assessment.questions.length === 0) {
      addQuestion()
    }
  }

  // Question Type Specific Handlers
  function addQuestionOption(question: Question) {
    if (question.type === 'multiple_choice') {
      question.options = [...(question.options || []), '']
      assessment = { ...assessment }
    }
  }

  function removeQuestionOption(question: Question, optionIndex: number) {
    if (question.type === 'multiple_choice') {
      question.options = question.options?.filter((_, index) => index !== optionIndex) || []
      assessment = { ...assessment }
    }
  }

  // Media Upload (Simulated)
  async function handleMediaUpload(event: Event, question: Question) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      try {
        // Simulated upload - in real scenario, use FormData and actual upload
        const reader = new FileReader()
        reader.onload = (e) => {
          question.media = e.target?.result as string
          toast('Media uploaded successfully', '2000', 'success')
        }
        reader.readAsDataURL(file)
      } catch (error) {
        toast('Media upload failed', '2000', 'error')
      }
    }
  }

  // Save Assessment
  async function saveAssessment() {
    // Validation
    if (!assessment.title.trim()) {
      toast('Please enter an assessment title', '2000', 'error')
      return
    }

    if (assessment.questions.length === 0) {
      toast('Please add at least one question', '2000', 'error')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/assessments/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessment)
      })

      const data = await response.json()
      toast(data.message, '2000', data.status)
    } catch (err) {
      console.error(err)
      toast('Failed to save assessment', '2000', 'error')
    }
  }

  // Reset Assessment
  function resetAssessment() {
    assessment = {
      title: 'Untitled Assessment',
      description: '',
      time_limit: 60,
      questions: []
    }
    addQuestion()
    resetConfirmation = false
    toast('Assessment reset', '2000', 'success')
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveAssessment()
    }
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault()
      preview = !preview
    }
  })

  // Initialize with one question
  $: if (assessment.questions.length === 0) {
    addQuestion()
  }
</script>

<main>
  <nav class="nav">
    <h1>Create an Assessment</h1>
    <div class="button-group">
      <button title="Save Assessment" on:click={saveAssessment}>Save</button>
      <button on:click={() => (resetConfirmation = !resetConfirmation)} title="Reset Assessment">
        Reset
      </button>
      <button title="Toggle Preview" on:click={() => (preview = !preview)}> Preview </button>
    </div>
  </nav>

  <div class="container">
    <div class="assessment-details">
      <section class="assessment-header">
        <input type="text" placeholder="Assessment Title" bind:value={assessment.title} required />
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
          min="1"
        />
      </section>

      <section class="questions-section">
        <h3>Questions</h3>

        {#each assessment.questions as question, index (question.id)}
          <div class="question-card" transition:slide={{ axis: 'y' }}>
            <textarea placeholder="Enter question text" bind:value={question.question} required
            ></textarea>

            <div class="question-type-points">
              <select bind:value={question.type} class="question-type">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="true_false">True/False</option>
              </select>
              <input
                type="number"
                placeholder="Points"
                bind:value={question.points}
                min="1"
                class="points-input"
              />
            </div>

            <div class="checkbox-group">
              <label>
                <input type="checkbox" bind:checked={question.required} />
                <p>Required</p>
              </label>
              <label>
                <input type="checkbox" bind:checked={question.shuffleOptions} />
                <p>Shuffle</p>
              </label>
            </div>

            {#if question.type === 'multiple_choice'}
              <div class="options-section">
                {#each question.options || [] as option, optIndex}
                  <div class="option-input" transition:slide={{ axis: 'y' }}>
                    <input
                      type="checkbox"
                      checked={question.correctAnswers?.includes(option)}
                      on:change={() => {
                        if (question.correctAnswers?.includes(option)) {
                          question.correctAnswers = question.correctAnswers.filter(
                            (a) => a !== option
                          )
                        } else {
                          question.correctAnswers = [...(question.correctAnswers || []), option]
                        }
                      }}
                    />
                    <input
                      type="text"
                      bind:value={question.options[optIndex]}
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <button on:click={() => removeQuestionOption(question, optIndex)}>
                      Remove
                    </button>
                  </div>
                {/each}
                <button on:click={() => addQuestionOption(question)}> Add Option </button>
              </div>
            {/if}

            <div class="media-upload-section">
              <button
                class="toggle-media-upload"
                on:click={() => (question.showMediaUpload = !question.showMediaUpload)}
              >
                {question.showMediaUpload ? 'Hide' : 'Add'} Media
              </button>

              {#if question.showMediaUpload}
                <div class="media-input-container">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    on:change={(e) => handleMediaUpload(e, question)}
                  />
                </div>
              {/if}

              {#if question.media}
                <img src={question.media} alt="Uploaded media" class="media-preview" />
              {/if}
            </div>

            <div class="question-action-buttons">
              <button on:click={addQuestion} class="add-question-btn"> Add Question </button>

              <button on:click={() => duplicateQuestion(question, index)}> Duplicate </button>
              <button on:click={() => deleteQuestion(index)}> Delete </button>
            </div>
          </div>
        {/each}
      </section>
    </div>

    {#if preview}
      <div class="preview-container" transition:slide={{ axis: 'x' }}>
        <h3>Preview</h3>
        <pre>{JSON.stringify(assessment, null, 2)}</pre>
      </div>
    {/if}
  </div>

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
</main>

<style lang="scss">
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .container {
    display: flex;
    gap: 1rem;
  }

  .assessment-details {
    flex: 1;
  }

  .question-card {
    border: var(--border);
    background: var(--background);
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 5px;
  }

  .question-type-points {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;

    .question-type {
      flex: 1;
    }

    .points-input {
      width: 100px;
    }
  }

  .checkbox-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    label {
      display: flex;
      justify-content: flex-start;
      gap: 0.5rem;
      input {
        margin: 0;
      }
    }
  }

  .options-section {
    margin-top: 0.5rem;
    button {
      margin-top: 0.5rem;
    }
  }

  .option-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    input[type='checkbox'] {
      margin: auto;
    }
    input[type='text'] {
      width: auto;
      margin: auto;
    }
    button {
      margin: auto;
    }
  }

  .preview-container {
    flex: 1;
    border: 1px solid #ddd;
    padding: 1rem;
    max-height: 600px;
    overflow-y: auto;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 5px;
    text-align: center;
  }

  .media-preview {
    max-width: 200px;
    margin-top: 0.5rem;
  }

  .media-upload-section {
    margin: 0.5rem 0;
  }

  .toggle-media-upload {
    margin-bottom: 0.5rem;
  }

  .question-action-buttons {
    display: flex;
    margin-top: 0.5rem;
    justify-content: space-between;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    background: var(--background);
    border: var(--border);
  }

  input[type='file'] {
    background: var(--background);
  }

  input[type='file']::-webkit-file-upload-button {
    background: var(--background);
    border: var(--border);
    color: var(--text);
    padding: 0.2rem 0.5rem;
    cursor: pointer;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background: var(--background);
    border: var(--border);
  }
</style>

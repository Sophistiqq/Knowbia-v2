<script lang="ts">
  import { Refresh, Remove_red_eye } from 'svelte-google-materialdesign-icons'
  import { toast } from '../utils/Toast'
  import { fly, slide } from 'svelte/transition'
  import AssessmentPreview from '../components/AssessmentPreview.svelte'

  // Types
  type Assessment = {
    title: string
    description: string
    time_limit: number
    section: string
    shuffle_questions: boolean
    questions: Question[]
  }

  // Update the Question type to include more specific properties for different question types
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

  // Update the initial state and add methods to handle specific question types

  // Linear Scale Handler
  function setupLinearScale(question: Question) {
    // Set default values if not already defined
    question.linearScaleStart = question.linearScaleStart || 1
    question.linearScaleEnd = question.linearScaleEnd || 5
    question.linearScaleStep = question.linearScaleStep || 1

    // Ensure start is less than end
    if (question.linearScaleStart >= question.linearScaleEnd) {
      question.linearScaleStart = 1
      question.linearScaleEnd = 5
    }

    // Initialize correct answers array with the midpoint
    const midpoint = Math.floor((question.linearScaleStart + question.linearScaleEnd) / 2)
    question.correctAnswers = [midpoint]
  }

  // Ranking Question Validation and Setup
  function setupRankingQuestion(question: Question) {
    // Ensure unique ranks
    if (question.type === 'ranking') {
      // Convert correctAnswers to numbers
      question.correctAnswers = question.correctAnswers?.map(Number) || []

      // Check for unique ranks
      const uniqueRanks = new Set(question.correctAnswers)
      if (uniqueRanks.size !== question.correctAnswers.length) {
        toast('Ranks must be unique and consecutive starting from 1', '2000', 'warning')
      }
    }
  }

  // Update type-specific handlers to include validation and setup
  function updateQuestionType(question: Question, newType: Question['type']) {
    // Reset type-specific properties
    delete question.linearScaleStart
    delete question.linearScaleEnd
    delete question.linearScaleStep

    // Reset options and correct answers based on type
    question.options = []
    question.correctAnswers = []

    // Update question type
    question.type = newType
  }

  // Initial State
  let assessment: Assessment = {
    title: 'Untitled Assessment',
    description: '',
    time_limit: 60,
    shuffle_questions: false,
    section: '',
    questions: []
  }

  // UI State
  let resetConfirmation = false
  let preview = false
  $: showPreview = preview ? 'show' : ''
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
      id: Math.max(...assessment.questions.map((q) => q.id), 0) + 1,
      question: '',
      type: 'short_answer',
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
    duplicatedQuestion.id = Math.max(...assessment.questions.map((q) => q.id), 0) + 1
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
    if (question.type === 'multiple_choice' || question.type === 'ranking') {
      question.options = [...(question.options || []), '']
      if (question.type === 'ranking') {
        question.correctAnswers = question.correctAnswers?.map((_, i) => i + 1) || []
      }
      assessment = { ...assessment }
    }
  }

  function removeQuestionOption(question: Question, optionIndex: number) {
    if (question.type === 'multiple_choice' || question.type === 'ranking') {
      question.options = question.options?.filter((_, index) => index !== optionIndex) || []
      if (question.type === 'ranking') {
        question.correctAnswers = question.correctAnswers?.map((_, i) => i + 1) || []
      }
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
    console.log(assessment)
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
      section: '',
      shuffle_questions: false,
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

  function distributeAssessment() {
    // Distribute the assessment to Students
    console.log('Distributing Assessment', assessment)

    fetch('http://localhost:3000/assessments/distribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assessment)
    })
      .then((response) => response.json())
      .then((data) => {
        toast(data.message, '2000', data.status)
      })
      .catch((error) => {
        console.error(error)
        toast('Failed to distribute assessment', '2000', 'error')
      })
  }

  // export as JSON
  function exportAsJSON() {
    const data = JSON.stringify(assessment, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // export as exportAsPDF
  function exportAsPDF() {
    const data = JSON.stringify(assessment, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment.title}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  function loadFromJsonFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const content = e.target?.result as string
          try {
            const data = JSON.parse(content)
            assessment = data
            toast('Assessment loaded successfully', '2000', 'success')
          } catch (error) {
            console.error(error)
            toast('Failed to load assessment', '2000', 'error')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  let showDropdown = false
  $: ExportDropdownClass = showDropdown ? 'show-dropdown' : ''

  let showLoadDropdown = false
  $: LoadDropdownClass = showLoadDropdown ? 'show-dropdown' : ''

  let showListOfSaved = false

  // ----- For loading saved assessments from the database -----

  let listOfSavedAssessments = []

  function loadSavedAssessment() {
    fetch('http://localhost:3000/assessments/list')
      .then((response) => response.json())
      .then((data) => {
        listOfSavedAssessments = data
        showListOfSaved = true
        console.log(data)
      })
      .catch((error) => {
        console.error(error)
        toast('Failed to load saved assessments', '2000', 'error')
      })
  }

  // ----- For loading saved assessments from the database using the SavedList by id -----
  function loadSavedAssessmentById(id: any) {
    fetch(`http://localhost:3000/assessments/get/${id}`)
      .then((response) => response.json())
      .then((data) => {
        assessment = data
        assessment.questions = JSON.parse(data.questions)
        assessment.shuffle_questions = data.shuffle_questions ? true : false
        showListOfSaved = false
        toast('Assessment loaded successfully', '2000', 'success')
      })
      .catch((error) => {
        console.error(error)
        toast('Failed to load assessment', '2000', 'error')
      })
  }
</script>

<main>
  <nav class="nav">
    <h1>Create an Assessment</h1>
    <div class="button-group">
      <button
        title="Distribute the Assessment to Students"
        on:click={() => {
          distributeAssessment()
        }}>Distribute</button
      >
      <div class="export-dropdown-container">
        <button on:click={() => (showDropdown = !showDropdown)}>Export</button>
        <div class="dropdown-content {ExportDropdownClass}">
          <button title="Export the assessment as a JSON file" on:click={exportAsJSON}
            >Export as JSON</button
          >
          <button title="Currently Disabled" on:click={exportAsPDF} disabled>Export as PDF</button>
        </div>
      </div>

      <button title="Save Assessment" on:click={saveAssessment}>Save</button>
      <div class="load-dropdown-container">
        <button on:click={() => (showLoadDropdown = !showLoadDropdown)}>Load</button>
        <div class="dropdown-content {LoadDropdownClass}">
          <button title="Load Assessment from JSON file" on:click={loadFromJsonFile}
            >Load from JSON</button
          >
          <button
            title="Load Assessment from the Database"
            on:click={() => {
              showListOfSaved = true
              loadSavedAssessment()
            }}>Load from Database</button
          >
        </div>
      </div>
      <button on:click={() => (resetConfirmation = !resetConfirmation)} title="Reset Assessment">
        <Refresh size="20" />
      </button>
      <button title="Toggle Preview" on:click={() => (preview = !preview)}
        ><Remove_red_eye size="20" /></button
      >
    </div>
  </nav>

  <div class="container">
    <div class="assessment-wrapper">
      <div class="assessment-details">
        <h3>Assessment Details</h3>
        <section class="assessment-header">
          <input
            type="text"
            placeholder="Assessment Title"
            bind:value={assessment.title}
            required
          />
          <textarea
            placeholder="Assessment Description"
            bind:value={assessment.description}
            bind:this={descriptionTextarea}
            on:input={adjustTextareaHeight}
          ></textarea>
          <input
            type="text"
            id="section-field"
            placeholder="Section"
            bind:value={assessment.section}
            required
          />
          <div class="header-options">
            <div class="time-limit-wrapper">
              <label for="time_limit">Time Limit: </label>
              <input
                type="number"
                placeholder="Time Limit (minutes)"
                bind:value={assessment.time_limit}
                min="1"
              />
            </div>
            <div class="shuffle-wrapper">
              <label for="shuffleQuestions">Shuffle Questions</label>
              <input
                id="shuffleQuestions"
                type="checkbox"
                bind:checked={assessment.shuffle_questions}
              />
            </div>
          </div>
        </section>

        <section class="questions-section">
          <h3>Questions</h3>
          {#each assessment.questions as question, index (question.id)}
            <div class="question-card" transition:slide={{ axis: 'y' }}>
              <textarea placeholder="Enter question text" bind:value={question.question} required
              ></textarea>

              <div class="checkbox-group">
                <label>
                  <input type="checkbox" bind:checked={question.required} />
                  <p>Required</p>
                </label>
                <label>
                  <input type="checkbox" bind:checked={question.shuffleOptions} />
                  <p>Shuffle Options</p>
                </label>
              </div>
              <div class="question-type-points">
                <select
                  bind:value={question.type}
                  class="question-type"
                  on:change={() => updateQuestionType(question, question.type)}
                >
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                  <option value="true_false">True/False</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="ranking">Ranking</option>
                  <option value="linear_scale">Linear Scale</option>
                </select>
                <input
                  type="number"
                  placeholder="Points"
                  bind:value={question.points}
                  min="1"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  class="points-input"
                />
              </div>

              {#if question.type === 'short_answer'}
                <input
                  type="text"
                  placeholder="Correct Answer"
                  bind:value={question.correctAnswers[0]}
                />
              {/if}

              {#if question.type === 'true_false'}
                <div class="checkbox-group">
                  <label>
                    <input
                      type="radio"
                      name={`true_false_${question.id}`}
                      value="true"
                      bind:group={question.correctAnswers}
                    />
                    <p>True</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`true_false_${question.id}`}
                      value="false"
                      bind:group={question.correctAnswers}
                    />
                    <p>False</p>
                  </label>
                </div>
              {/if}

              {#if question.type === 'multiple_choice'}
                <div class="options-section">
                  {#each question.options || [] as _option, optIndex}
                    <div class="option-input" transition:slide={{ axis: 'y' }}>
                      <input
                        type="checkbox"
                        checked={question.correctAnswers?.includes(optIndex)}
                        on:change={() => {
                          if (question.correctAnswers?.includes(optIndex)) {
                            question.correctAnswers = question.correctAnswers.filter(
                              (a) => a !== optIndex
                            )
                          } else {
                            question.correctAnswers = [...(question.correctAnswers || []), optIndex]
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

              {#if question.type === 'essay'}
                <textarea
                  placeholder="Enter essay text"
                  bind:value={question.correctAnswers[0]}
                  required
                ></textarea>
              {/if}

              {#if question.type === 'ranking'}
                <div class="options-section">
                  {#each question.options || [] as _option, optIndex}
                    <div class="option-input" transition:slide={{ axis: 'y' }}>
                      <input
                        type="text"
                        bind:value={question.options[optIndex]}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <input
                        type="number"
                        bind:value={question.correctAnswers[optIndex]}
                        placeholder="Rank"
                        min="1"
                        max={(question.options || []).length}
                        on:change={() => {
                          question.correctAnswers =
                            question.correctAnswers?.map((_, i) => i + 1) || []
                          setupRankingQuestion(question)
                        }}
                      />
                      <button on:click={() => removeQuestionOption(question, optIndex)}>
                        Remove
                      </button>
                    </div>
                  {/each}
                  <button on:click={() => addQuestionOption(question)}> Add Option </button>
                </div>
              {/if}

              {#if question.type === 'linear_scale'}
                <div class="options-section">
                  <div class="linear-scale-inputs">
                    <label>
                      Start:
                      <input
                        type="number"
                        bind:value={question.linearScaleStart}
                        min="0"
                        max={question.linearScaleEnd || 10}
                        on:change={() => setupLinearScale(question)}
                      />
                    </label>
                    <label>
                      End:
                      <input
                        type="number"
                        bind:value={question.linearScaleEnd}
                        min={(question.linearScaleStart || 0) + 1}
                        max="10"
                        on:change={() => setupLinearScale(question)}
                      />
                    </label>
                    <label>
                      Step:
                      <input type="number" bind:value={question.linearScaleStep} min="1" max="5" />
                    </label>
                  </div>
                  <div class="correct-answer-selection">
                    <label for="linear-scale-answer">Correct Answer:</label>
                    <select
                      id="linear-scale-answer"
                      bind:value={question.correctAnswers[0]}
                      class="linear-scale-answer"
                    >
                      {#each Array.from({ length: (question.linearScaleEnd || 5) - (question.linearScaleStart || 1) + 1 }, (_, i) => (question.linearScaleStart || 1) + i) as value}
                        <option>{value}</option>
                      {/each}
                    </select>
                  </div>
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
                  <div class="media-input-container" transition:slide={{ axis: 'y' }}>
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
    </div>
    <div class="preview-container {showPreview}">
      <h3>Preview</h3>
      <pre>{JSON.stringify(assessment, null, 2)}</pre>
      <AssessmentPreview {assessment} />
    </div>
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

  {#if showListOfSaved}
    <div class="modal" transition:fly>
      <div class="modal-content">
        <h3>Load Assessment</h3>
        <p>Choose an assessment to load</p>
        <div class="saved-assessments">
          {#each listOfSavedAssessments as savedAssessment}
            <div class="saved-assessment">
              <button
                on:click={() => {
                  loadSavedAssessmentById(savedAssessment.id)
                  console.log(savedAssessment.id)
                }}
              >
                <h4>{savedAssessment.title}</h4>
                <p>
                  {savedAssessment.description.slice(0, 100)}{savedAssessment.description.length >
                  100
                    ? '...'
                    : ''}
                </p>
              </button>
            </div>
          {/each}
        </div>
        <div class="button-group">
          <button on:click={() => (showListOfSaved = false)}>Close</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style lang="scss">
  .saved-assessments {
    display: flex;
    flex-direction: column;
    width: 50vw;
  }

  .saved-assessment {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    list-style: none;
  }

  .saved-assessment button {
    width: 100%;
    background: var(--background);
    border: var(--border);
    text-align: left;
    background: none;
    cursor: pointer;
    padding: 0.5rem 1rem;
  }

  .saved-assessment h4 {
    margin: 0;
    font-size: 1.2rem;
  }

  .saved-assessment p {
    margin: 0.5rem 0;
  }
  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    gap: 1rem;
    padding-right: 1rem;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-top: 1rem;
    z-index: 20;
    .button-group {
      display: flex;
      gap: 0.5rem;
    }
  }

  .container {
    display: flex;
    gap: 1rem;
  }

  .assessment-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  @media (width > 1080px) {
    .nav,
    .container {
      margin-inline: 10%;
    }
  }

  .assessment-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .assessment-header {
    border: var(--border);
    background: var(--background);
    padding: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    input[type='text'],
    textarea {
      width: 100%;
      padding: 0.5rem;
      background: var(--background);
      border: var(--border);
      margin-bottom: 0.5rem;
    }
  }
  .questions-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-options {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
  }

  .shuffle-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
  }

  .time-limit-wrapper {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    input {
      width: 5ch;
      border: none;
      background: transparent;
      border-bottom: 1px solid var(--border-color);
    }
  }

  .question-card {
    border: var(--border);
    background: var(--background);
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .question-type-points {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;

    .question-type {
      flex: 1;
    }

    .points-input {
      width: 6ch;
    }
  }

  .checkbox-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
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
    button {
      margin-top: 0.5rem;
    }
  }

  .option-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.2rem;

    & > * {
      width: 3rem;
    }

    input[type='text'] {
      width: 100%;
    }
    button {
      margin: 0 0.2rem;
      padding: 0.5rem 1rem;
      width: auto;
    }
  }

  .preview-container {
    background: var(--background);
    width: 0;
    overflow: hidden;
    white-space: nowrap;
    border: none;
    transition:
      width 0.5s,
      padding 0.5s;
  }
  .show {
    border: var(--border);
    width: 100%;
    padding: 1rem;
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
    backdrop-filter: blur(5px);
    z-index: 100;
  }

  .modal-content {
    background: var(--background);
    border: var(--border);
    padding: 2rem;
    border-radius: 5px;
    text-align: center;

    button {
      margin: 0 0.5rem;
      margin-top: 1rem;
      transition: background 0.2s;
      &:hover {
        background: var(--hover);
      }
    }
  }

  .media-preview {
    max-width: 200px;
    margin-top: 0.5rem;
  }

  .media-upload-section {
    margin: 0.5rem 0;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex-direction: column;

    input[type='file'] {
      padding: 0.5rem;
    }
  }

  .question-action-buttons {
    display: flex;
    border-top: 1px solid var(--border-color);
    padding-top: 0.5rem;
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

    &:hover {
      background: var(--hover);
    }
  }

  /* Option and Select Styling */
  select {
    appearance: none;
    padding: 0.5rem;
    background: var(--background);
    border: var(--border);
    cursor: pointer;
  }
  option {
    background: var(--background-solid);
    font-size: 1rem;
    color: var(--text);
  }

  .linear-scale-inputs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  #section-field {
    width: fit-content;
  }

  .export-dropdown-container {
    position: relative;
    display: flex;
    align-items: center;
    button {
      padding: 1rem;
      cursor: pointer;
      background: var(--background);
      border: var(--border);
      &:hover {
        background: var(--hover);
      }
    }
  }

  .dropdown-content {
    position: absolute;
    height: 0;
    overflow: hidden;
    white-space: nowrap;
    top: 110%;
    right: 0;
    transition: height 0.2s;
  }

  .show-dropdown {
    height: 100%;
    background: var(--background);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .load-dropdown-container {
    position: relative;
    display: flex;
    align-items: center;
    button {
      padding: 1rem;
      cursor: pointer;
      background: var(--background);
      border: var(--border);
      &:hover {
        background: var(--hover);
      }
    }
  }
</style>

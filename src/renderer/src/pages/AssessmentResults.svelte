<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { toast } from '../utils/Toast'
  import { fly } from 'svelte/transition'
  import { checkSudo, confirmSudo } from '../utils/Sudo'
  import { Close } from 'svelte-google-materialdesign-icons'
  type Assessments = Array<{
    id: number
    title: string
    description: string
    section: string
    shuffle_questions: boolean
    time_limit: number
    questions: QuestionType[]
  }>

  type Student = {
    student_number: string
    first_name: string
    last_name: string
    email: string
    section: string
  }

  type QuestionType = {
    id: number
    question: string
    type: 'multiple_choice' | 'short_answer' | 'true_false' | 'ranking' | 'essay' | 'linear_scale'
    options?: string[]
    correctAnswers?: any
    required: boolean
    points: number
    shuffleOptions: boolean
    category?: string
    hint?: string
    media?: string | null
    showMediaUpload?: boolean
    linearScaleStart?: number
    linearScaleEnd?: number
    linearScaleStep?: number
  }

  type QuestionAndAnswers = {
    questions: any
    answers: any
    assessment_id: number
    first_name: string
    last_name: string
    student_number: string
  }
  //  db.run("CREATE TABLE IF NOT EXISTS assessment_results (assessment_id INTEGER, student_number TEXT, assessment TEXT, answers TEXT, time_taken INTEGER, total_points INTEGER, mistakes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  type Results = {
    assessment_id: number
    student_number: string
    assessment: string
    answers: string
    time_taken: number
    total_points: number
    mistakes: string
    created_at: string
  }
  let sudo = false
  let sudoPassword = ''
  let pendingAction: (() => void) | undefined
  let sudoTimeout: NodeJS.Timeout

  function requireSudo(action: () => void) {
    if (checkSudo()) {
      action()
    } else {
      sudo = true // Show sudo modal
      pendingAction = action // Store the action to execute after sudo confirmation
    }
  }

  async function submitSudo() {
    const res = await confirmSudo(sudoPassword)
    if (res.status === 'success') {
      sudo = false
      sudoPassword = ''
      if (pendingAction) {
        pendingAction()
        pendingAction = undefined
      }
    }
    toast(res.message, 2000, res.status)
  }

  onMount(async () => {
    await fetchAssessments()
    sudoTimeout = setInterval(() => {
      if (!checkSudo()) {
        toast('Sudo mode expired. Please authenticate again.', 2000, 'error')
      }
    }, 60000)
  })
  onDestroy(() => {
    if (sudoTimeout) {
      clearInterval(sudoTimeout)
    }
  })

  let assessments: Assessments = []
  let students: Student[] = []
  let results: Results[] = []
  let questions_and_answers: QuestionAndAnswers[] = []
  async function fetchAssessments() {
    const res = await fetch('http://localhost:3000/page/assessment-results')
    const data = await res.json()
    assessments = data.assessments.map((a: any) => ({
      ...a,
      questions: JSON.parse(a.questions)
    }))
    questions_and_answers = data.questions_and_answers.map((qa: any) => ({
      ...qa,
      questions: JSON.parse(qa.questions),
      answers: JSON.parse(qa.answers)
    }))
    students = data.students
    results = data.results
    console.log('RESULTS', results)
    console.log('ASSESSMENTS', assessments)
    // for testing apply the first assessment to the selectedAssessment
    //selectedAssessment = assessments[0]
    // for testing apply the first question to the selectedQuestion
    //selectedQuestion = assessments[0].questions[0]
  }
  let selectedAssessment: Assessments[0]
  let selectedQuestion: QuestionType

  function prevent(e: Event) {
    e.preventDefault()
  }
</script>

<main>
  <div class="container">
    <h2>Assessment Results</h2>
    {#if !assessments.length}
      <p>No assessments available</p>
    {:else}
      {#if !selectedAssessment}
        <h3>Select an Assessment</h3>
        <div class="assessments-wrapper">
          {#each assessments as assessment}
            <button
              class="assessment"
              on:click={() => requireSudo(() => (selectedAssessment = assessment))}
            >
              <h3>{assessment.title}</h3>
              <p>
                {assessment.description.length > 30
                  ? assessment.description.substring(0, 30) + '...'
                  : assessment.description}
              </p>
              <p>Section: {assessment.section}</p>
              <p>Time Limit: {assessment.time_limit} minutes</p>
            </button>
          {/each}
        </div>
      {/if}
      {#if selectedAssessment}
        <button
          id="back"
          on:click={() => {
            selectedAssessment = null
            selectedQuestion = null
          }}>&#8636; Back to Selection</button
        >
        <div class="assessment-header">
          <h3>Assessment: {selectedAssessment.title}</h3>
          <p>{selectedAssessment.description}</p>
          <p>Section: {selectedAssessment.section}</p>
          <p>Time Limit: {selectedAssessment.time_limit} minutes</p>
          <p>
            Total Points: {selectedAssessment.questions.reduce((acc, q) => acc + q.points, 0)}
          </p>
        </div>
        <br />
        {#if !selectedQuestion}
          <h3>Questions</h3>
          <!-- Display the Questions -->
          <h4>Select a question to view responses</h4>
          {#each selectedAssessment.questions as question, i}
            <button class="questions" on:click={() => (selectedQuestion = question)}>
              <h4>Q{i + 1}</h4>
              <div class="question-details">
                <p>{question.question || 'No Text'}</p>
                <p>
                  Type: {question.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p>Points: {question.points}</p>
              </div>
            </button>
          {/each}
        {/if}

        {#if selectedQuestion}
          <button id="back" on:click={() => (selectedQuestion = null)}
            >&#8636; Back to Questions</button
          >
          <div class="question-details-wrapper">
            <h3>Question: {selectedQuestion.question}</h3>
            <div class="question-meta">
              <p>
                Type: {selectedQuestion.type
                  .replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p>Points: {selectedQuestion.points}</p>
              <p>Category: {selectedQuestion.category}</p>
              <p>Required: {selectedQuestion.required ? 'Yes' : 'No'}</p>
              <p>Selected Question ID: {selectedQuestion.id}</p>
            </div>
          </div>
          <br />
          <h4>Responses</h4>
          <div class="responses-list">
            {#each questions_and_answers as qa}
              {#if qa.assessment_id === selectedAssessment.id}
                {#each qa.questions as q, index}
                  {#if q.id === selectedQuestion.id}
                    <div class="responses-wrapper">
                      <p>
                        {qa.first_name}
                        {qa.last_name} ({qa.student_number})
                      </p>
                      <p>{q.question}</p>
                      <p>
                        Answer: {selectedQuestion.type === 'multiple_choice'
                          ? selectedQuestion.options[qa.answers[index]]
                          : qa.answers[index]}
                      </p>
                    </div>
                  {/if}
                {/each}
              {/if}
            {/each}
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</main>

{#if sudo}
  <div class="modal" transition:fly>
    <div class="modal-content">
      <button class="close" on:click={() => (sudo = false)}><Close /></button>
      <h2>Sudo Mode</h2>
      <p>Enter the password to enable sudo mode</p>
      <form on:submit={prevent}>
        <div class="input-field">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" bind:value={sudoPassword} />
        </div>
      </form>
      <div class="buttons-wrapper">
        <button on:click={submitSudo}>Enable</button>
      </div>
    </div>
  </div>
{/if}

{#if sudo}
  <div class="modal" transition:fly>
    <div class="modal-content">
      <button class="close" on:click={() => (sudo = false)}><Close /></button>
      <h2>Sudo Mode</h2>
      <p>Enter the password to enable sudo mode</p>
      <form on:submit={prevent}>
        <div class="input-field">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" bind:value={sudoPassword} />
        </div>
      </form>
      <div class="buttons-wrapper">
        <button on:click={submitSudo}>Enable</button>
      </div>
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
    h3 {
      margin-bottom: 1rem;
    }
  }
  .assessments-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    .assessment {
      padding: 1rem;
      border: var(--border);
      background-color: var(--background);
      cursor: pointer;
      &:hover {
        background-color: var(--hover);
      }
      h3 {
        margin-bottom: 0.5rem;
      }
      p {
        margin-bottom: 0.5rem;
      }
    }
  }
  #back {
    margin-bottom: 1rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: var(--primary);
    &:hover {
      text-decoration: underline;
    }
  }
  .assessment-header {
    padding: 1rem;
    border: var(--border);
    background-color: var(--background);
    h3 {
      margin-bottom: 0.5rem;
    }
    p {
      margin-bottom: 0.5rem;
    }
  }
  .questions {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 1rem;
    text-align: left;
    width: 100%;
    border-left: var(--border);
    &:hover {
      background-color: var(--hover);
    }
    h4 {
      margin-right: 1rem;
    }
    .question-details {
      p:first-child {
        font-weight: bold;
        margin-bottom: 0.2rem;
      }
      p:nth-child(2) {
        font-style: italic;
      }
      p:last-child {
        font-size: 0.9rem;
      }
    }
  }

  .question-details-wrapper {
    padding: 1rem;
    border: var(--border);
    background-color: var(--background);
    h3 {
      margin-bottom: 0.5rem;
    }
    .question-meta {
      p {
        margin-bottom: 0.5rem;
      }
    }
  }
  .responses-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    .responses-wrapper {
      padding: 1rem;
      border: var(--border);
      background-color: var(--background);
      p:first-child {
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
    }
  }

  // Modal
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    z-index: 100;
  }
  .modal-content {
    background-color: var(--background);
    padding: 2rem;
    position: relative;
    width: 90%;
    max-width: 600px;
    border: 1px solid var(--hover);
  }
  .close {
    position: absolute;
    top: 5%;
    right: 2.5%;
    background: none;
    border: none;
    cursor: pointer;
  }
  form {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .input-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    label {
      font-weight: bold;
      font-size: 0.8rem;
    }
    input {
      padding: 0.5rem;
      border: var(--border);
      background-color: var(--background);
    }
  }

  button {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
    color: var(--text);
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
    &:active {
      background-color: var(--active);
      transform: scale(0.95);
    }
  }
</style>

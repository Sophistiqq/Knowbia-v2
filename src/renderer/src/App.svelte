<script lang="ts">
  import { slide } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { toast } from './utils/Toast'
  import CustomDropdown from './components/CustomDropdown.svelte'
  import Main from './pages/Main.svelte'
  // Security questions
  const securityQuestions = [
    'What was the name of your first pet?',
    'In what city were you born?',
    "What is your mother's maiden name?",
    "What was your childhood best friend's name?",
    'What was the model of your first car?'
  ]

  let steps = 0
  let loading = true

  onMount(() => {
    checkSetup()
  })

  async function checkSetup() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const status = localStorage.getItem('setup')
      if (status === 'done') {
        steps = 5
      } else {
        steps = 0
      }
    } catch (error) {
      toast('Error checking setup', 3000, 'error')
    } finally {
      loading = false
    }
  }

  function nextStep() {
    if (steps === 1) {
      if (!validateName(userInfo.first_name)) {
        errors.first_name = 'First name is required'
        toast(errors.first_name, 3000, 'error')
        return
      } else {
        errors.first_name = ''
      }
      if (!validateName(userInfo.last_name)) {
        errors.last_name = 'Last name is required'
        toast(errors.last_name, 3000, 'error')
        return
      } else {
        errors.last_name = ''
      }
    } else if (steps === 2) {
      if (!validatePassword(userInfo.sudo_password)) {
        errors.sudo_password = 'Password must be at least 6 characters'
        toast(errors.sudo_password, 3000, 'error')
        return
      } else {
        errors.sudo_password = ''
      }
    } else if (steps === 3) {
      if (!userInfo.security_question) {
        errors.security_question = 'Please select a security question'
        toast(errors.security_question, 3000, 'error')
        return
      }
      if (!validateAnswer(userInfo.security_answer)) {
        errors.security_answer = 'Security answer must be at least 3 characters'
        toast(errors.security_answer, 3000, 'error')
        return
      } else {
        errors.security_answer = ''
      }
    }
    steps++
    if (steps === 4) {
      localStorage.setItem('setup', 'done')
    }
    if (steps === 5) {
      // Save user info to local storage and redirect to main page
      localStorage.setItem('user_info', JSON.stringify(userInfo))
    }
  }

  function previousStep() {
    steps--
  }

  // User info processes
  let userInfo = {
    first_name: '',
    last_name: '',
    sudo_password: '',
    security_question: '',
    security_answer: ''
  }

  // Input validation
  function validateName(name: string) {
    return name.trim().length > 0
  }

  function validatePassword(password: string) {
    return password.trim().length >= 6
  }

  function validateAnswer(answer: string) {
    return answer.trim().length >= 3
  }

  let errors = {
    first_name: '',
    last_name: '',
    sudo_password: '',
    security_question: '',
    security_answer: ''
  }

  // Dropdown handling
  function handleQuestionSelect(event: CustomEvent<string>) {
    userInfo.security_question = event.detail
  }
</script>

{#if loading}
  <div class="steps-container loading">
    <div class="spinner"></div>
    <p>Loading setup...</p>
  </div>
{:else}
  {#if steps === 0}
    <div class="steps-container" transition:slide={{ axis: 'x', duration: 300 }}>
      <h1>Welcome to Knowbia</h1>
      <h5>Let's get you started real quick</h5>
      <button on:click={nextStep}>Next</button>
    </div>
  {/if}
  {#if steps === 1}
    <div class="steps-container" transition:slide={{ axis: 'x', delay: 300 }}>
      <div class="form-container">
        <h1>Step 1</h1>
        <h4>Tell me about yourself</h4>
        <input type="text" placeholder="First Name" bind:value={userInfo.first_name} />
        <input type="text" placeholder="Last Name" bind:value={userInfo.last_name} />
        <button on:click={nextStep}>Next</button>
      </div>
    </div>
  {/if}
  {#if steps === 2}
    <div class="steps-container" transition:slide={{ axis: 'x', delay: 500 }}>
      <div class="form-container">
        <h1>Step 2</h1>
        <h4>Set your Password</h4>
        <input type="password" placeholder="Password" bind:value={userInfo.sudo_password} />
        <div class="buttons-wrapper">
          <button on:click={previousStep}>Back</button>
          <button on:click={nextStep}>Next</button>
        </div>
      </div>
    </div>
  {/if}
  {#if steps === 3}
    <div class="steps-container" transition:slide={{ axis: 'x', delay: 500 }}>
      <div class="form-container security_question">
        <h1>Step 3</h1>
        <h4>Security Question</h4>
        <CustomDropdown
          options={securityQuestions}
          placeholder="Select a security question"
          on:select={handleQuestionSelect}
        />
        <input
          type="text"
          placeholder="Your security answer"
          bind:value={userInfo.security_answer}
        />
        <div class="buttons-wrapper">
          <button on:click={previousStep}>Back</button>
          <button on:click={nextStep}>Next</button>
        </div>
      </div>
    </div>
  {/if}
  {#if steps === 4}
    <div class="steps-container">
      <h1>Setup Completed</h1>
      <h5>Thank you for setting up Knowbia</h5>
      <button on:click={nextStep}>Start</button>
    </div>
  {/if}
  {#if steps === 5}
    <Main />
  {/if}
{/if}

<style lang="scss">
  .steps-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    line-height: 1.5;
    font-size: 1.5rem;
    white-space: nowrap;

    &.loading {
      gap: 1rem;
    }
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #09f;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background-color: transparent;
    border: none;
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
    transition: background-color 0.3s;
    &:hover {
      background-color: var(--background);
    }
  }

  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    input {
      padding: 0.5rem 1rem;
      font-size: 1.3rem;
      border: var(--border);
      background-color: var(--background);
      text-align: center;
    }
  }

  .buttons-wrapper {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
</style>

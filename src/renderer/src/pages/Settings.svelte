<script lang="ts">
  import { onMount } from 'svelte'

  type UserInfo = {
    first_name: string
    last_name: string
    sudo_password: string
    security_question: string
    security_answer: string
  }

  type FormType = 'edit' | 'password'
  type FormStep = 'initial' | 'verify' | 'form'

  let userInfo: UserInfo = {
    first_name: '',
    last_name: '',
    sudo_password: '',
    security_question: '',
    security_answer: ''
  }

  let currentStep: FormStep = 'initial'
  let currentForm: FormType = 'edit'
  let modalOpen = false
  let verificationAnswer = ''
  let verificationError = ''
  let newPassword = ''
  let confirmPassword = ''
  let passwordError = ''

  onMount(() => {
    const user_info = localStorage.getItem('user_info')
    if (user_info) {
      userInfo = JSON.parse(user_info)
      userInfo.sudo_password = ''
    }
  })

  function verifySecurityAnswer() {
    const storedInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
    if (verificationAnswer.toLowerCase() === storedInfo.security_answer.toLowerCase()) {
      currentStep = 'form'
      verificationError = ''
    } else {
      verificationError = 'Incorrect answer. Please try again.'
    }
  }

  function saveInfo(event: Event) {
    event.preventDefault()
    localStorage.setItem('user_info', JSON.stringify(userInfo))
    closeModal()
  }

  function changePassword(event: Event) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      passwordError = 'Passwords do not match'
      return
    }
    if (newPassword.length < 6) {
      passwordError = 'Password must be at least 6 characters long'
      return
    }

    userInfo.sudo_password = newPassword
    localStorage.setItem('user_info', JSON.stringify(userInfo))
    closeModal()
  }

  function openModal(type: FormType) {
    currentForm = type
    currentStep = type === 'password' ? 'verify' : 'form'
    modalOpen = true
    resetFormStates()
  }

  function closeModal() {
    modalOpen = false
    currentStep = 'initial'
    resetFormStates()
  }

  function resetFormStates() {
    verificationAnswer = ''
    verificationError = ''
    newPassword = ''
    confirmPassword = ''
    passwordError = ''
  }
</script>

<div class="container">
  <h2>Settings</h2>
  <h3>User Info</h3>
  <div class="info-container">
    <p><b>Name:</b> {userInfo.first_name} {userInfo.last_name}</p>
  </div>
  <div class="button-group">
    <button on:click={() => openModal('edit')}>Edit Info</button>
    <button on:click={() => openModal('password')}>Change Password</button>
  </div>
</div>

{#if modalOpen}
  <div class="modal-overlay">
    <div class="modal-container">
      {#if currentStep === 'verify'}
        <div class="modal-header">
          <h2>Security Verification</h2>
          <button class="close-button" on:click={closeModal}>×</button>
        </div>
        <div class="form-content">
          <p><b>Security Question:</b> {userInfo.security_question}</p>
          <label for="security_answer">Your Answer:</label>
          <input
            type="text"
            id="security_answer"
            bind:value={verificationAnswer}
            class:error={verificationError}
          />
          {#if verificationError}
            <p class="error-message">{verificationError}</p>
          {/if}
          <button on:click={verifySecurityAnswer}>Verify</button>
        </div>
      {:else if currentStep === 'form'}
        {#if currentForm === 'edit'}
          <form on:submit|preventDefault={saveInfo}>
            <div class="modal-header">
              <h2>Edit User Info</h2>
              <button type="button" class="close-button" on:click={closeModal}>×</button>
            </div>
            <div class="form-content">
              <label for="first_name">First Name:</label>
              <input type="text" id="first_name" bind:value={userInfo.first_name} required />

              <label for="last_name">Last Name:</label>
              <input type="text" id="last_name" bind:value={userInfo.last_name} required />

              <button type="submit">Save Changes</button>
            </div>
          </form>
        {:else}
          <form on:submit|preventDefault={changePassword}>
            <div class="modal-header">
              <h2>Change Password</h2>
              <button type="button" class="close-button" on:click={closeModal}>×</button>
            </div>
            <div class="form-content">
              <label for="new_password">New Password:</label>
              <input
                type="password"
                id="new_password"
                bind:value={newPassword}
                required
                minlength="6"
              />

              <label for="confirm_password">Confirm Password:</label>
              <input
                type="password"
                id="confirm_password"
                bind:value={confirmPassword}
                required
                class:error={passwordError}
              />

              {#if passwordError}
                <p class="error-message">{passwordError}</p>
              {/if}

              <button type="submit">Change Password</button>
            </div>
          </form>
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;
    gap: 0.3rem;
    border: var(--border);
    background: var(--background);
    width: 500px;

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    button {
      flex: 1;
      background: var(--background);
      border: var(--border);
      padding: 0.5rem;
      cursor: pointer;

      &:hover {
        background: var(--background-hover);
      }
    }

    .info-container {
      margin-top: 1rem;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-container {
    width: 500px;
    background: var(--background-solid);
    border: var(--border);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: var(--border);

    h2 {
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;

      &:hover {
        color: var(--text-hover);
      }
    }
  }

  .form-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    label {
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border: var(--border);
      background: var(--background);

      &.error {
        border-color: #ff4444;
      }
    }

    .error-message {
      color: #ff4444;
      margin: 0;
    }

    button {
      margin-top: 0.5rem;
      background: var(--background);
      border: var(--border);
      padding: 0.5rem;
      cursor: pointer;

      &:hover {
        background: var(--background-hover);
      }
    }
  }
</style>

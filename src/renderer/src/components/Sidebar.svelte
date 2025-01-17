<script lang="ts">
  import SettingsModal from '../pages/Settings.svelte'
  import { onMount } from 'svelte'
  import { onDestroy } from 'svelte'
  import {
    Keyboard_arrow_right,
    Keyboard_arrow_left,
    Settings,
    Create,
    Dashboard,
    Manage_accounts,
    Monitor_heart,
    Menu_book
  } from 'svelte-google-materialdesign-icons'
  let showMenu = localStorage.getItem('showMenu') || 'nav-active'
  let screenWidth = window.innerWidth
  let hidden = showMenu === 'nav-active' ? '' : 'hidden'

  onMount(() => {
    showMenu = localStorage.getItem('showMenu') || ''
  })

  const handleResize = () => {
    screenWidth = window.innerWidth
  }

  window.addEventListener('resize', handleResize)

  onDestroy(() => {
    window.removeEventListener('resize', handleResize)
  })

  function toggleMenu() {
    showMenu = showMenu === '' ? 'nav-active' : ''
    hidden = hidden === '' ? 'hidden' : ''
    localStorage.setItem('showMenu', showMenu)
  }
  export let navigateTo: (page: string) => void
  const user = JSON.parse(localStorage.getItem('user_info'))

  // Keyboard shortcuts to toggle the menu, ctrl + n, and the buttons to navigate to the different pages, ctrl + number
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
      toggleMenu()
    }
    if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
      const page = [
        'Dashboard',
        'MakeAssessment',
        'ManageAssessments',
        'ManageStudents',
        'AssessmentResults'
      ][parseInt(e.key) - 1]
      navigateTo(page)
    }
  })
  let modalSettings = false
  function openSettings() {
    modalSettings = true
  }
  document.onkeydown = (e) => {
    if (e.key === 'Escape') {
      modalSettings = false
    }
  }

  document.onclick = (e) => {
    if (e.target === document.querySelector('.modal')) {
      modalSettings = false
    }
  }
</script>

{#if screenWidth > 1080}
  <nav class="nav {showMenu} icons-only">
    <div class="menu-header">
      <h3>Menu</h3>
      <p>Hello, {user.first_name}</p>
    </div>
    <div class="separator"></div>

    <div class="nav-buttons">
      <button class="btn" on:click={() => navigateTo('Dashboard')}>
        <Dashboard size="32" variation="filled" /> <span>Dashboard</span>
      </button>
      <button class="btn" on:click={() => navigateTo('MakeAssessment')}>
        <Create size="32" variation="filled" /> <span>Make Assessment</span>
      </button>
      <button class="btn" on:click={() => navigateTo('ManageAssessments')}>
        <Monitor_heart size="32" variation="filled" /> <span>Manage Assessments</span>
      </button>
      <button class="btn" on:click={() => navigateTo('AssessmentResults')}>
        <Menu_book size="32" variation="filled" /> <span>Assessment Results</span>
      </button>
      <button class="btn" on:click={() => navigateTo('ManageStudents')}>
        <Manage_accounts size="32" variation="filled" /> <span>Manage Students</span>
      </button>
      <button class="btn" on:click={() => openSettings()}>
        <Settings size="32" variation="filled" /> <span>Settings</span>
      </button>
    </div>
  </nav>
{:else}
  <nav class="nav {showMenu}">
    <div class="nav-buttons">
      <button class="btn" on:click={() => navigateTo('Dashboard')}>
        <Dashboard size="32" variation="filled" />
      </button>
      <button class="btn" on:click={() => navigateTo('MakeAssessment')}>
        <Create size="32" variation="filled" />
      </button>
      <button class="btn" on:click={() => navigateTo('ManageAssessments')}>
        <Monitor_heart size="32" variation="filled" />
      </button>
      <button class="btn" on:click={() => navigateTo('AssessmentResults')}>
        <Menu_book size="32" variation="filled" />
      </button>
      <button class="btn" on:click={() => navigateTo('ManageStudents')}>
        <Manage_accounts size="32" variation="filled" />
      </button>
      <button class="btn" on:click={() => openSettings()}>
        <Settings size="32" variation="filled" />
      </button>
    </div>
  </nav>
{/if}

<button class="menu-btn {hidden}" title="Dashboard" on:click={() => toggleMenu()}>
  {#if showMenu === 'nav-active'}
    <Keyboard_arrow_left size="50" />
  {:else}
    <Keyboard_arrow_right size="50" />
  {/if}
</button>

{#if modalSettings}
  <div class="modal">
    <SettingsModal />
  </div>
{/if}

<style lang="scss">
  .separator {
    height: 1px;
    width: 100%;
    border-top: 1px solid var(--hover);
  }
  .nav {
    display: flex;
    width: 0;
    white-space: nowrap;
    overflow: hidden;
    height: 100svh;
    background-color: var(--background);
    box-shadow: 0 0 1rem 0 rgba(150, 150, 150, 0.1);
    float: left;
    flex-direction: column;
    position: relative;
    border-right: 2px solid rgba(150, 150, 150, 0.1);
    max-width: 15vw;
    .menu-header {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-bottom: 1rem;
      h3 {
        font-size: 2rem;
        padding: 1rem;
        font-weight: bold;
        color: var(--text);
      }
      p {
        font-size: 1.3rem;
        padding: 1rem;
        color: var(--text);
        font-weight: bold;
      }
    }
  }
  .nav-active {
    width: 30vw;
    white-space: nowrap;
  }

  @media (max-width: 1080px) {
    .nav-buttons:first-child {
      margin-top: 5rem;
    }
    .nav-active {
      width: min(75px, 75px);
      max-width: 75px;
    }
  }
  .menu-btn {
    float: left;
    height: 100vh;
    display: grid;
    place-items: center;
    background: transparent;
    cursor: pointer;
    z-index: 100;
    white-space: nowrap;
    overflow: hidden;
    border: none;
    z-index: 50;
  }
  .hidden {
    left: -10rem;
  }
  .nav-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 1rem;
    & .btn {
      display: flex;
      padding: 2rem 1rem;
      align-items: center;
      font-size: 1rem;
      font-weight: bold;
      gap: 1rem;
      width: 100%;
      height: 3rem;
      background-color: var(--background);
      color: var(--text);
      border: none;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--hover);
      }
    }
  }
  .modal {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  export let options: string[] = []
  export let placeholder: string = 'Select an option'

  let isOpen = false
  let selectedOption: string | null = null

  const dispatch = createEventDispatcher()

  function toggleDropdown() {
    isOpen = !isOpen
  }

  function selectOption(option: string) {
    selectedOption = option
    isOpen = false
    dispatch('select', option)
  }

  // Close dropdown when clicking outside
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.dropdown-container')) {
      isOpen = false
    }
  }

  // Add event listener when component is mounted
  import { onMount, onDestroy } from 'svelte'

  onMount(() => {
    document.addEventListener('click', handleOutsideClick)
  })

  onDestroy(() => {
    document.removeEventListener('click', handleOutsideClick)
  })
</script>

<div class="dropdown-container">
  <button class="dropdown-header" on:click={toggleDropdown}>
    <span>{selectedOption || placeholder}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="dropdown-icon {isOpen ? 'rotate' : ''}"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>

  {#if isOpen}
    <ul class="dropdown-list" transition:slide={{ duration: 200 }}>
      {#each options as option}
        <button on:click={() => selectOption(option)} class:selected={option === selectedOption}>
          {option}
        </button>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  .dropdown-container {
    position: relative;
    width: 100%;
  }

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border: var(--border);
    border-radius: 0.2rem;
    cursor: pointer;
    width: 100%;
    background-color: var(--background);
    overflow: hidden;
    font-size: 1rem;
  }

  .dropdown-icon {
    transition: transform 0.2s ease;
  }

  .dropdown-icon.rotate {
    transform: rotate(180deg);
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 250px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: var(--background);
    border: var(--border);
    border-top: none;
    border-radius: 0 0 0.2rem 0.2rem;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .dropdown-list button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    backdrop-filter: blur(20px);
    background-color: var(--background);
    outline: none;
    border: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.selected {
      background-color: rgba(0, 0, 0, 0.1);
      font-weight: bold;
    }
  }
</style>

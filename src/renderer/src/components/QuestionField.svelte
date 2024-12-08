<script lang="ts">
  import {
    Add_box,
    Delete,
    Content_copy,
    Arrow_drop_down
  } from 'svelte-google-materialdesign-icons'
  import { slide } from 'svelte/transition'

  export let question: {
    id: string
    question: string
    type: string
    options?: string[]
    required?: boolean
    correctAnswer?: string | string[]
  }

  export let questionTypes = [
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'linear_scale', label: 'Linear Scale' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'paragraph', label: 'Paragraph' }
  ]

  export let onDelete: () => void = () => {}
  export let onDuplicate: (q: typeof question) => void = () => {}
  export let onAdd: () => void = () => {}

  let isOpen = false
  let correctAnswer: string | string[] = question.type === 'checkbox' ? [] : ''

  function toggleDropdown() {
    isOpen = !isOpen
  }

  function selectType(type: string) {
    // Reset options based on type
    if (['multiple_choice', 'checkbox', 'dropdown', 'radio'].includes(type)) {
      question.options = ['']
      correctAnswer = type === 'checkbox' ? [] : ''
    } else {
      question.options = undefined
      correctAnswer = ''
    }

    question.type = type
    isOpen = false
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const dropdown = event.target as HTMLElement
    if (!dropdown.closest('.custom-select')) {
      isOpen = false
    }
  }

  // Add a new option for multiple choice, checkbox, dropdown, radio
  function addOption() {
    if (!question.options) return
    question.options = [...question.options, '']
  }

  // Remove an option
  function removeOption(index: number) {
    if (!question.options || question.options.length <= 1) return
    question.options = question.options.filter((_, i) => i !== index)
  }

  // Handle correct answer change
  function handleCorrectAnswerChange(index: number) {
    if (!question.options) return

    if (question.type === 'radio') {
      correctAnswer = question.options[index] || ''
    } else if (question.type === 'checkbox') {
      const currentCorrectAnswers = correctAnswer as string[]
      const optionText = question.options[index] || ''

      if (currentCorrectAnswers.includes(optionText)) {
        correctAnswer = currentCorrectAnswers.filter((ans) => ans !== optionText)
      } else {
        correctAnswer = [...currentCorrectAnswers, optionText]
      }
    }
    question.correctAnswer = correctAnswer
  }
</script>

<svelte:window on:click={handleClickOutside} />

<main transition:slide={{ axis: 'y' }}>
  <div class="question-container">
    <div class="question-header">
      <h4>Question</h4>
      <input type="text" class="question" bind:value={question.question} placeholder="Question" />
    </div>

    <div class="question-body">
      <button class="custom-select" on:click|stopPropagation={toggleDropdown}>
        <div class="selected-option">
          {questionTypes.find((t) => t.value === question.type)?.label || 'Select Type'}
          <Arrow_drop_down />
        </div>
        {#if isOpen}
          <div class="options-list">
            {#each questionTypes as type}
              <button
                class="option"
                class:selected={question.type === type.value}
                on:click={() => selectType(type.value)}
              >
                {type.label}
              </button>
            {/each}
          </div>
        {/if}
      </button>
    </div>

    <div class="answers">
      {#if question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown' || question.type === 'radio'}
        {#if question.options}
          {#each question.options as option, index}
            <div class="option-input-group">
              <!-- Correct answer toggle -->
              {#if question.type === 'radio'}
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option === correctAnswer}
                  on:change={() => handleCorrectAnswerChange(index)}
                />
              {:else if question.type === 'checkbox'}
                <input
                  type="checkbox"
                  checked={Array.isArray(correctAnswer) && correctAnswer.includes(option)}
                  on:change={() => handleCorrectAnswerChange(index)}
                />
              {/if}

              <!-- Option input -->
              <input type="text" bind:value={question.options[index]} placeholder="Option" />

              <!-- Remove option button (if more than one option) -->
              {#if (question.options?.length || 0) > 1}
                <button on:click={() => removeOption(index)} class="remove-option"> ✖ </button>
              {/if}
            </div>
          {/each}

          <!-- Add Option Button -->
          <button on:click={addOption} class="add-option-btn"> Add Option </button>
        {/if}
      {/if}

      <!-- Inputs for other question types -->
      {#if question.type === 'short_answer'}
        <input type="text" bind:value={question.correctAnswer} placeholder="Correct Answer" />
      {/if}

      {#if question.type === 'linear_scale'}
        <input type="number" bind:value={question.correctAnswer} placeholder="Correct Answer" />
      {/if}

      {#if question.type === 'date'}
        <input type="date" bind:value={question.correctAnswer} />
      {/if}

      {#if question.type === 'paragraph'}
        <textarea bind:value={question.correctAnswer} placeholder="Correct Answer"></textarea>
      {/if}

      {#if question.type === 'file_upload'}
        <input type="file" />
      {/if}
    </div>
  </div>

  <div class="question-controls">
    <button on:click={() => onDuplicate(question)} title="Duplicate">
      <Content_copy />
    </button>
    <button on:click={onDelete} title="Delete">
      <Delete />
    </button>
    <button on:click={onAdd} title="Add New">
      <Add_box />
    </button>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    gap: 0.3rem;
    justify-content: space-between;
    position: relative;
  }
  .question-container {
    border-radius: 0.2rem;
    padding: 0.75rem;
    width: 100%;
    background: var(--background);
    border: var(--border);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }
  .question-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    float: right;
    margin-top: 1rem;
    button {
      background: var(--background);
      border: var(--border);
      border-radius: 0.2rem;
      outline: none;
      cursor: pointer;
      padding: 0.5rem;
      &:hover {
        background: var(--hover);
      }
    }
  }
  .custom-select {
    position: relative;
    width: 100%;
    cursor: pointer;
    background: var(--background);
    border: var(--border);
    outline: none;
    border-radius: 0.2rem;
  }
  .selected-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0.2rem;
    padding: 0.5rem;
  }
  .options-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    background: var(--background-solid);
    border: var(--border);
    border-top: none;
    border-radius: 0 0 0.2rem 0.2rem;
    overflow-y: auto;
  }
  .option {
    padding: 0.5rem;
    width: 100%;
    text-align: left;
    background: var(--background);
    outline: none;
    border: none;
    cursor: pointer;
    &:hover {
      background: var(--hover);
    }
    &.selected {
      background: var(--hover);
      font-weight: bold;
    }
  }
  .question-header {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }
  input {
    border: var(--border);
    outline: none;
    border-radius: 0.2rem;
    padding: 0.75rem;
    width: 100%;
    background: var(--background);
  }
  .option-input-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    & input[type='radio'],
    & input[type='checkbox'],
    & input[type='file'] {
      width: fit-content;
    }
  }

  .remove-option {
    background: none;
    border: none;
    color: red;
    cursor: pointer;
  }
</style>

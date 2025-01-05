<script lang="ts">
  import {
    Add_box,
    Delete,
    Content_copy,
    Arrow_drop_down,
    Close
  } from 'svelte-google-materialdesign-icons'
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
    allowOther?: boolean
    correctAnswer?: string | string[]
  }

  // Centralized question type definitions
  export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'radio', label: 'Radio' }
  ]

  // Props with improved type annotations
  export let question: Question
  export let onDelete: () => void = () => {}
  export let onDuplicate: (q: Question) => void = () => {}
  export let onAdd: () => void = () => {}

  // Reactive state management
  let isOpen = false
  let localCorrectAnswer: string | string[] = initializeCorrectAnswer()

  // Initialize correct answer based on question type
  function initializeCorrectAnswer(): string | string[] {
    const multiSelectTypes = ['checkbox', 'multiple_choice']
    return multiSelectTypes.includes(question.type) ? [] : ''
  }

  // Reset question properties when type changes
  function resetQuestionProperties(newType: QuestionType) {
    // Reset options for types that require them
    const typesWithOptions = ['multiple_choice', 'checkbox', 'dropdown', 'radio']

    if (typesWithOptions.includes(newType)) {
      question.options = ['']
      // Reset other-related properties when changing type
      question.allowOther = false
    } else {
      question.options = undefined
      question.allowOther = undefined
    }

    // Reset correct answer
    localCorrectAnswer = initializeCorrectAnswer()
    question.correctAnswer = localCorrectAnswer
  }

  // Toggle dropdown visibility
  function toggleDropdown() {
    isOpen = !isOpen
  }

  // Select and reset question type
  function selectType(type: QuestionType) {
    question.type = type
    resetQuestionProperties(type)
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.custom-select')) {
      isOpen = false
    }
  }

  // Add a new option for question types with options
  function addOption() {
    if (!question.options) return
    question.options = [...question.options, '']
  }

  // Remove an option
  function removeOption(index: number) {
    if (!question.options || question.options.length <= 1) return
    question.options = question.options.filter((_, i) => i !== index)
  }

  // Handle correct answer changes for different question types
  function handleCorrectAnswerChange(index: number) {
    if (!question.options) return

    switch (question.type) {
      case 'radio':
      case 'multiple_choice':
      case 'dropdown':
        localCorrectAnswer = question.options[index] || ''
        break
      case 'checkbox':
        const currentCorrectAnswers = localCorrectAnswer as string[]
        const optionText = question.options[index] || ''

        localCorrectAnswer = currentCorrectAnswers.includes(optionText)
          ? currentCorrectAnswers.filter((ans) => ans !== optionText)
          : [...currentCorrectAnswers, optionText]
        break
    }

    // Update the question's correct answer
    question.correctAnswer = localCorrectAnswer
  }

  // Toggle required status
  function toggleRequired() {
    question.required = !question.required
  }

  // Toggle allow other option
  function toggleAllowOther() {
    // Only for types with options
    const typesWithOptions = ['multiple_choice', 'checkbox', 'dropdown', 'radio']
    if (typesWithOptions.includes(question.type)) {
      question.allowOther = !question.allowOther
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<main transition:slide={{ axis: 'y' }}>
  <div class="question-container">
    <!-- Question Header -->
    <div class="question-header">
      <input
        type="text"
        class="question"
        bind:value={question.question}
        placeholder="Enter your question"
      />

      <!-- Required and Other Options -->
      <div class="question-options">
        <label class="option-toggle">
          <input type="checkbox" checked={question.required || false} on:change={toggleRequired} />
          Required
        </label>

        {#if ['multiple_choice', 'checkbox', 'dropdown', 'radio'].includes(question.type)}
          <label class="option-toggle">
            <input
              type="checkbox"
              checked={question.allowOther || false}
              on:change={toggleAllowOther}
            />
            Allow Other
          </label>
        {/if}
      </div>
    </div>

    <!-- Question Type Dropdown -->
    <div class="question-body">
      <button class="custom-select" on:click|stopPropagation={toggleDropdown}>
        <div class="selected-option">
          {QUESTION_TYPES.find((t) => t.value === question.type)?.label || 'Select Type'}
          <Arrow_drop_down />
        </div>
        {#if isOpen}
          <div class="options-list">
            {#each QUESTION_TYPES as type}
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

    <!-- Dynamic Answers Section -->
    <div class="answers">
      <!-- Options for types with multiple choices -->
      {#if ['multiple_choice', 'checkbox', 'dropdown', 'radio'].includes(question.type)}
        {#if question.options}
          {#each question.options as option, index}
            <div class="option-input-group" transition:slide={{ axis: 'y', duration: 200 }}>
              <!-- Correct answer toggle -->
              {#if question.type === 'multiple_choice' || question.type === 'radio' || question.type === 'dropdown'}
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option === localCorrectAnswer}
                  on:change={() => handleCorrectAnswerChange(index)}
                />
              {:else if question.type === 'checkbox'}
                <input
                  type="checkbox"
                  checked={Array.isArray(localCorrectAnswer) && localCorrectAnswer.includes(option)}
                  on:change={() => handleCorrectAnswerChange(index)}
                />
              {/if}

              <!-- Option input -->
              <input type="text" bind:value={question.options[index]} placeholder="Option" />

              <!-- Remove option button -->
              {#if (question.options?.length || 0) > 1}
                <button on:click={() => removeOption(index)} class="remove-option"
                  ><Close size="16" />
                </button>
              {/if}
            </div>
          {/each}

          <!-- Add Option Button -->
          <button on:click={addOption} class="add-option-btn"> Add Option </button>
          <!-- Other Option -->
        {/if}
      {/if}

      <!-- Rest of the existing input types remain the same -->
      {#if question.type === 'time'}
        <input type="time" bind:value={question.correctAnswer} />
      {/if}

      {#if question.type === 'short_answer'}
        <input type="text" bind:value={question.correctAnswer} placeholder="Correct Answer" />
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

  <!-- Question Controls -->
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
    padding: 1rem;
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
  }
  .selected-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  textarea,
  input {
    border: var(--border);
    outline: none;
    padding: 0.75rem;
    width: 100%;
    background: var(--background);
  }
  .option-input-group {
    display: flex;
    align-items: center;
    gap: 1rem 0.5rem;
    margin-bottom: 0.5rem;
    & input[type='radio'],
    & input[type='checkbox'] {
      width: fit-content;
    }
  }

  .remove-option {
    background: none;
    cursor: pointer;
    outline: none;
    border: var(--border);
    padding: 0.3rem;
    display: grid;
    place-items: center;
    &:hover {
      background: var(--hover);
    }
  }

  .question-options {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .option-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    input[type='checkbox'] {
      width: fit-content;
      margin: 0;
    }
  }
  .add-option-btn {
    background: var(--background);
    border: var(--border);
    padding: 0.5rem;
    cursor: pointer;
    width: 100%;
    outline: none;
    &:hover {
      background: var(--hover);
    }
  }
</style>

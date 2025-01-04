<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Close } from 'svelte-google-materialdesign-icons'
  import { fly } from 'svelte/transition'
  import { toast } from '../utils/Toast'
  import { checkSudo, confirmSudo } from '../utils/Sudo'
  // Manage Students Page, where the teacher can manage the students
  type student = {
    student_number: string
    first_name: string
    last_name: string
    email: string
    password: string
    section: string
  }
  // Array of Students
  let students: student[] = []

  let searchTerm = ''
  let rowsPerPage = 10
  let filteredStudents: student[] = []
  let dropdownOpen = false

  function selectRowsPerPage(value: number) {
    rowsPerPage = value
    dropdownOpen = false
    filterStudents()
  }
  let sortOrder: { [key in keyof student]?: 'asc' | 'desc' } = {}

  function filterStudents() {
    filteredStudents = students.filter(
      (student) =>
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  function sortTable(column: keyof student) {
    if (sortOrder[column] === 'asc') {
      sortOrder[column] = 'desc'
      filteredStudents = [...filteredStudents].sort((a, b) => {
        if (a[column] < b[column]) return 1
        if (a[column] > b[column]) return -1
        return 0
      })
    } else {
      sortOrder[column] = 'asc'
      filteredStudents = [...filteredStudents].sort((a, b) => {
        if (a[column] < b[column]) return -1
        if (a[column] > b[column]) return 1
        return 0
      })
    }
  }

  async function fetchStudents() {
    const res = await fetch('http://localhost:3000/page/manage-students')
    students = await res.json()
    console.table(students)
    filterStudents()
  }

  onMount(() => {
    fetchStudents()
    sudoTimeout = setInterval(() => {
      if (!checkSudo() && modal) {
        modal = false
        toast('Sudo mode expired. Please authenticate again.', 2000, 'error')
      }
    }, 60000)
  })
  // Clean up on component destruction
  onDestroy(() => {
    if (sudoTimeout) {
      clearInterval(sudoTimeout)
    }
  })
  let sudo = false

  let modal = false

  // esc key to close the modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal = false
    }
  })

  let studentData = {
    student_number: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    section: ''
  }

  async function submitRegister() {
    requireSudo(async () => {
      if (
        studentData.student_number === '' ||
        studentData.first_name === '' ||
        studentData.last_name === '' ||
        studentData.email === '' ||
        studentData.password === '' ||
        studentData.section === ''
      ) {
        toast('Please fill up all fields', 2000, 'error')
        return
      }

      const res = await fetch('http://localhost:3000/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })
      const data = await res.json()

      toast(data.message, 2000, data.status)
      fetchStudents()
      modal = false
    })
  }
  async function submitEdit() {
    requireSudo(async () => {
      if (
        studentData.student_number === '' ||
        studentData.first_name === '' ||
        studentData.last_name === '' ||
        studentData.email === '' ||
        studentData.section === ''
      ) {
        toast('Please fill up all fields', 'error')
        return
      }

      const res = await fetch('http://localhost:3000/students/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })
      const data = await res.json()

      toast(data.message, 2000, data.status)
      fetchStudents()
      modal = false
    })
  }

  let modalType = ''
  function requireSudo(action: () => void) {
    if (checkSudo()) {
      action()
    } else {
      sudo = true // Show sudo modal
      pendingAction = action // Store the action to execute after sudo confirmation
    }
  }

  function openModal(type: 'add' | 'edit', student?: student) {
    requireSudo(() => {
      modal = true
      if (type === 'add') {
        modalType = 'add'
        studentData = {
          student_number: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          section: ''
        }
      } else {
        modalType = 'edit'
        studentData = { ...student }
        studentData.password = ''
      }
    })
  }

  async function submitDelete() {
    requireSudo(async () => {
      const res = await fetch('http://localhost:3000/students/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })
      const data = await res.json()

      toast(data.message, 2000, data.status)
      fetchStudents()
      modal = false
      deleteConfirmation = false
    })
  }

  let deleteConfirmation = false

  // Sudo Mode

  let sudoPassword = ''
  let pendingAction: (() => void) | undefined
  let sudoTimeout: NodeJS.Timeout
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

  function prevent(e: Event) {
    e.preventDefault()
  }
</script>

<main>
  <div class="container">
    <h2>Manage Students</h2>
    <div class="controls-wrapper">
      <input
        type="text"
        placeholder="Search..."
        bind:value={searchTerm}
        on:input={filterStudents}
      />
      <div class="dropdown">
        <button class="dropdown-button" on:click={() => (dropdownOpen = !dropdownOpen)}>
          {rowsPerPage} rows
        </button>
        {#if dropdownOpen}
          <div class="dropdown-content">
            <button type="button" on:click={() => selectRowsPerPage(10)}>10 rows</button>
            <button type="button" on:click={() => selectRowsPerPage(50)}>50 rows</button>
            <button type="button" on:click={() => selectRowsPerPage(100)}>100 rows</button>
          </div>
        {/if}
      </div>
      <button class="refresh-btn" on:click={fetchStudents}> Refresh </button>
      <button class="add-student" on:click={() => openModal('add')} title="Register a Student"
        >Add</button
      >
    </div>
    <table>
      <thead>
        <tr>
          <th on:click={() => sortTable('student_number')}>Student Number</th>
          <th on:click={() => sortTable('first_name')}>First Name</th>
          <th on:click={() => sortTable('last_name')}>Last Name</th>
          <th on:click={() => sortTable('email')}>Email</th>
          <th on:click={() => sortTable('section')}>Section</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredStudents.slice(0, rowsPerPage) as student}
          <tr on:click={() => openModal('edit', student)}>
            <td>{student.student_number}</td>
            <td>{student.first_name}</td>
            <td>{student.last_name}</td>
            <td>{student.email}</td>
            <td>{student.section}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>

{#if modal}
  <div class="modal" transition:fly>
    <div class="modal-content">
      <button class="close" on:click={() => (modal = !modal)}><Close /></button>
      <h2>{modalType === 'add' ? 'Register Student' : 'Edit Student'}</h2>
      <form>
        <div class="input-field">
          <label for="student_number">Student Number</label>
          <input
            type="text"
            id="student_number"
            name="student_number"
            bind:value={studentData.student_number}
            placeholder="e.g. 21-00564"
          />
        </div>
        <div class="input-field">
          <label for="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            bind:value={studentData.first_name}
            placeholder="e.g. Juan"
          />
        </div>
        <div class="input-field">
          <label for="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            bind:value={studentData.last_name}
            placeholder="e.g. Dela Paz"
          />
        </div>
        <div class="input-field">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            bind:value={studentData.email}
            placeholder="e.g. example@gmail.com"
          />
        </div>
        <div class="input-field">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            bind:value={studentData.password}
            placeholder={modalType === 'add' ? 'e.g. password123' : 'Enter new password'}
          />
        </div>
        <div class="input-field">
          <label for="section">Section</label>
          <input
            type="text"
            id="section"
            name="section"
            bind:value={studentData.section}
            placeholder="e.g. 4B"
          />
        </div>
      </form>

      <div class="buttons-wrapper">
        {#if modalType === 'add'}
          <button on:click={submitRegister}>Register</button>
        {:else}
          <button on:click={() => (deleteConfirmation = true)}>Delete</button>
          <button on:click={submitEdit}>Update</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if deleteConfirmation}
  <div class="modal" transition:fly>
    <div class="modal-content">
      <button class="close" on:click={() => (deleteConfirmation = !deleteConfirmation)}
        ><Close /></button
      >
      <h2>Delete Student</h2>
      <p>Are you sure you want to delete this student?</p>
      <div class="buttons-wrapper">
        <button on:click={submitDelete}>Yes</button>
        <button on:click={() => (deleteConfirmation = false)}>No</button>
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
  }

  table {
    width: 100%;
    border-collapse: collapse;
    th {
      background-color: var(--background);
      color: var(--text);
      font-weight: bold;
      cursor: pointer;
      &:hover {
        background-color: var(--hover);
      }
    }
    th,
    td {
      padding: 0.5rem;
      border: 1px solid var(--hover);
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    tr:nth-child(even) {
      background-color: var(--hover);
    }
  }

  input {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
  }
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-button {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
    color: var(--text);
    cursor: pointer;
  }

  .dropdown-content {
    display: block;
    position: absolute;
    background-color: var(--background-solid);
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown-content button {
    color: var(--text);
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    width: 100%;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
  }

  .dropdown-content button:hover {
    background-color: var(--hover);
  }
  .refresh-btn {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
    color: var(--text);
    cursor: pointer;
  }

  .controls-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--hover);
  }
  .add-student {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
    color: var(--text);
    cursor: pointer;
    margin-left: auto;
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
  }
  .modal-content {
    background-color: var(--background);
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem 0 rgba(150, 150, 150, 0.1);
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
  }

  button {
    padding: 0.5rem;
    border: var(--border);
    background-color: var(--background);
    color: var(--text);
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
      background-color: var(--active);
      transform: scale(0.95);
    }
  }

  .buttons-wrapper {
    display: flex;
    margin-top: 1rem;
    gap: 1rem;
  }
</style>

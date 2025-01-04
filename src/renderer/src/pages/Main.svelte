<script lang="ts">
  import { writable } from 'svelte/store'
  import SideBar from '../components/Sidebar.svelte'

  // Import all page components
  import Dashboard from './Dashboard.svelte'
  import MakeAssessment from './MakeAssessment.svelte'
  import ManageAssessments from './ManageAssessments.svelte'
  import ManageStudents from './ManageStudents.svelte'
  import AssessmentResults from './AssessmentResults.svelte'
  // Define page configuration
  const pages = {
    Dashboard,
    MakeAssessment,
    ManageAssessments,
    ManageStudents,
    AssessmentResults
  }

  // Create a store for current page
  const currentPage = writable('Dashboard')

  // Navigation function
  function navigateTo(page: string) {
    if (Object.keys(pages).includes(page)) {
      currentPage.set(page)
    } else {
      console.error(`Page ${page} not found`)
    }
  }
</script>

<main>
  <SideBar {navigateTo} />
  <!-- Dynamic component rendering -->
  <svelte:component this={pages[$currentPage]} />
</main>

<style>
  main {
    display: flex;
  }
</style>

<main>
  <div class="container">
    <h2>Assessment Results</h2>
  </div>
</main>

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
</style>
